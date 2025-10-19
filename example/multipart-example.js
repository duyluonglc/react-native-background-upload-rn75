import Upload from 'react-native-background-upload';

// Example: Multipart file upload with additional form fields
const uploadFileWithMultipart = async (filePath) => {
  const options = {
    url: 'https://httpbin.org/post', // Test endpoint
    path: filePath,
    method: 'POST',
    type: 'multipart',
    field: 'file', // Form field name for the file
    parameters: {
      'user_id': '12345',
      'description': 'Uploaded via React Native Background Upload',
      'category': 'photos'
    },
    headers: {
      'Authorization': 'Bearer your-auth-token'
    },
    android: {
      notificationChannel: 'upload-channel',
      notificationId: 'multipart-upload',
      notificationTitle: 'Uploading file...',
      notificationTitleNoWifi: 'Waiting for Wifi...',
      notificationTitleNoInternet: 'Waiting for Internet...'
    }
  };

  try {
    const uploadId = await Upload.startUpload(options);
    console.log('Multipart upload started with ID:', uploadId);

    // Add event listeners
    Upload.addListener('progress', uploadId, (data) => {
      console.log(`Upload progress: ${data.progress}%`);
    });

    Upload.addListener('error', uploadId, (data) => {
      console.error('Upload error:', data.error);
    });

    Upload.addListener('completed', uploadId, (data) => {
      console.log('Upload completed!');
      console.log('Response code:', data.responseCode);
      console.log('Response body:', data.responseBody);
    });

    Upload.addListener('cancelled', uploadId, (data) => {
      console.log('Upload cancelled');
    });

    return uploadId;
  } catch (error) {
    console.error('Failed to start upload:', error);
    throw error;
  }
};

// Example: Raw file upload (existing functionality)
const uploadFileRaw = async (filePath) => {
  const options = {
    url: 'https://httpbin.org/post',
    path: filePath,
    method: 'POST',
    type: 'raw', // This is the default
    headers: {
      'content-type': 'application/octet-stream',
      'Authorization': 'Bearer your-auth-token'
    },
    android: {
      notificationChannel: 'upload-channel',
      notificationId: 'raw-upload',
      notificationTitle: 'Uploading file...',
      notificationTitleNoWifi: 'Waiting for Wifi...',
      notificationTitleNoInternet: 'Waiting for Internet...'
    }
  };

  try {
    const uploadId = await Upload.startUpload(options);
    console.log('Raw upload started with ID:', uploadId);
    return uploadId;
  } catch (error) {
    console.error('Failed to start upload:', error);
    throw error;
  }
};

export { uploadFileWithMultipart, uploadFileRaw };