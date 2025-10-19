package com.vydia.RNUploader

import kotlinx.coroutines.suspendCancellableCoroutine
import okhttp3.*
import okhttp3.Headers.Companion.toHeaders
import okhttp3.RequestBody.Companion.asRequestBody
import okhttp3.RequestBody.Companion.toRequestBody
import okhttp3.MediaType.Companion.toMediaType
import okio.Buffer
import okio.BufferedSink
import okio.ForwardingSink
import okio.buffer
import java.io.File
import java.io.IOException
import java.util.UUID
import kotlin.coroutines.resumeWithException

// Throttling interval of progress reports
private const val PROGRESS_INTERVAL = 500 // milliseconds


// make an upload request using okhttp
suspend fun okhttpUpload(
  client: OkHttpClient,
  upload: Upload,
  file: File,
  onProgress: (Long) -> Unit
) =
  suspendCancellableCoroutine<Response> { continuation ->
    val requestBody = if (upload.type == "multipart") {
      createMultipartBody(upload, file)
    } else {
      file.asRequestBody()
    }
    
    var lastProgressReport = 0L
    fun throttled(): Boolean {
      val now = System.currentTimeMillis()
      if (now - lastProgressReport < PROGRESS_INTERVAL) return true
      lastProgressReport = now
      return false
    }

    val request = Request.Builder()
      .url(upload.url)
      .headers(upload.headers.toHeaders())
      .method(upload.method, withProgressListener(requestBody) { progress ->
        if (!throttled()) onProgress(progress)
      })
      .build()

    val call = client.newCall(request)
    continuation.invokeOnCancellation { call.cancel() }
    call.enqueue(object : Callback {
      override fun onFailure(call: Call, e: IOException) =
        continuation.resumeWithException(e)

      override fun onResponse(call: Call, response: Response) =
        continuation.resumeWith(Result.success(response))
    })
  }

// create multipart request body
private fun createMultipartBody(upload: Upload, file: File): RequestBody {
  val boundary = UUID.randomUUID().toString()
  val builder = MultipartBody.Builder(boundary)
    .setType(MultipartBody.FORM)
  
  // Add parameters
  upload.parameters.forEach { (key, value) ->
    builder.addFormDataPart(key, value)
  }
  
  // Add file
  val fieldName = upload.field ?: "file"
  val mediaType = guessMimeType(file.name)
  builder.addFormDataPart(
    fieldName,
    file.name,
    file.asRequestBody(mediaType.toMediaType())
  )
  
  return builder.build()
}

// guess MIME type from file extension
private fun guessMimeType(fileName: String): String {
  return when (fileName.substringAfterLast('.', "").lowercase()) {
    "jpg", "jpeg" -> "image/jpeg"
    "png" -> "image/png"
    "gif" -> "image/gif"
    "pdf" -> "application/pdf"
    "txt" -> "text/plain"
    "json" -> "application/json"
    "xml" -> "application/xml"
    "mp4" -> "video/mp4"
    "mp3" -> "audio/mpeg"
    else -> "application/octet-stream"
  }
}

// create a request body that allows us to listen to progress.
// okhttp has no built-in way of reporting progress
private fun withProgressListener(
  body: RequestBody,
  onProgress: (Long) -> Unit
) = object : RequestBody() {
  override fun contentType() = body.contentType()
  override fun contentLength() = body.contentLength()
  override fun writeTo(sink: BufferedSink) {
    val countingSink = object : ForwardingSink(sink) {
      var bytesWritten = 0L

      override fun write(source: Buffer, byteCount: Long) {
        super.write(source, byteCount)
        bytesWritten += byteCount
        onProgress(bytesWritten)
      }
    }

    val bufferedSink = countingSink.buffer()
    body.writeTo(bufferedSink)
    bufferedSink.flush()
  }
}