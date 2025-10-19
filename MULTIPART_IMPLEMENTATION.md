# Multipart Upload Implementation

This document summarizes the changes made to add multipart upload support to react-native-background-upload.

## Overview

The library now supports both `raw` and `multipart` upload types:
- **Raw uploads**: Direct file upload (existing functionality)
- **Multipart uploads**: Form-data uploads with additional parameters (new functionality)

## Changes Made

### 1. TypeScript Types (`src/types.ts`)

**Added:**
- `MultipartUploadOptions` type with `field` and `parameters` properties
- Updated `UploadOptions` to support both `RawUploadOptions` and `MultipartUploadOptions`

**Before:**
```typescript
type RawUploadOptions = {
  type: 'raw';
};

// TODO support this to replace netq
// type MultipartUploadOptions = { ... };
```

**After:**
```typescript
type RawUploadOptions = {
  type: 'raw';
};

type MultipartUploadOptions = {
  type: 'multipart';
  field: string;
  parameters?: {
    [index: string]: string;
  };
};
```

### 2. Android Implementation

#### Upload Model (`android/.../Upload.kt`)

**Added fields:**
- `type: String` - Upload type ('raw' or 'multipart')
- `field: String?` - Form field name for the file (required for multipart)
- `parameters: Map<String, String>` - Additional form fields

#### Upload Utils (`android/.../UploadUtils.kt`)

**Added functions:**
- `createMultipartBody()` - Creates OkHttp MultipartBody for form-data uploads
- `guessMimeType()` - Determines MIME type from file extension
- Updated `okhttpUpload()` to handle both raw and multipart uploads

#### Uploader Module (`android/.../UploaderModule.kt`)

**Added validation:**
- Validates that multipart uploads have required `field` parameter

### 3. iOS Implementation

**Already supported!** The iOS implementation already had multipart upload support using `NSURLSession` with multipart form data.

### 4. Documentation Updates (`README.md`)

**Updated:**
- Removed "🚧 COMING SOON" notice from multipart section
- Added comprehensive multipart upload example with parameters
- Updated API documentation table with examples
- Added proper usage instructions

## Usage Examples

### Multipart Upload
```javascript
const options = {
  url: 'https://myservice.com/upload',
  path: 'file://path/to/file.jpg',
  method: 'POST',
  type: 'multipart',
  field: 'uploaded_file',
  parameters: {
    'user_id': '12345',
    'description': 'My uploaded file'
  },
  headers: {
    'Authorization': 'Bearer token'
  },
  android: {
    notificationChannel: 'upload-channel',
    notificationId: 'upload-progress',
    notificationTitle: 'Uploading...',
    notificationTitleNoWifi: 'Waiting for Wifi...',
    notificationTitleNoInternet: 'Waiting for Internet...'
  }
};

Upload.startUpload(options)
  .then(uploadId => console.log('Upload started:', uploadId))
  .catch(err => console.error('Upload failed:', err));
```

### Raw Upload (Existing)
```javascript
const options = {
  url: 'https://myservice.com/upload',
  path: 'file://path/to/file.jpg',
  method: 'POST',
  type: 'raw', // or omit (default)
  headers: {
    'content-type': 'application/octet-stream'
  },
  android: { /* ... */ }
};
```

## Technical Details

### Android Multipart Implementation

The Android implementation uses OkHttp's `MultipartBody.Builder` to create form-data requests:

1. **Form Parameters**: Added as `addFormDataPart(key, value)`
2. **File Upload**: Added as `addFormDataPart(fieldName, fileName, fileRequestBody)`
3. **MIME Type Detection**: Automatic detection based on file extension
4. **Progress Tracking**: Maintains existing progress reporting functionality

### Validation

- **Required Fields**: `field` parameter is required when `type: 'multipart'`
- **Type Safety**: TypeScript ensures correct option combinations
- **Runtime Validation**: Android validates required fields at runtime

### Backward Compatibility

- **Default Behavior**: `type: 'raw'` is the default, maintaining existing behavior
- **Existing Code**: No changes required for existing raw uploads
- **API Consistency**: Same event system and progress reporting for both types

## Testing

Created validation scripts and examples:
- `validate-types.js` - Validates TypeScript type definitions
- `example/multipart-example.js` - Comprehensive usage examples
- `__tests__/multipart.test.ts` - Type validation tests

## Files Modified

1. `src/types.ts` - Added multipart types
2. `lib/types.d.ts` - Updated compiled type definitions
3. `android/.../Upload.kt` - Added multipart fields
4. `android/.../UploadUtils.kt` - Added multipart upload logic
5. `android/.../UploaderModule.kt` - Added validation
6. `README.md` - Updated documentation
7. Created example and test files

## Platform Support

- ✅ **iOS**: Already supported (using NSURLSession multipart)
- ✅ **Android**: Now supported (using OkHttp MultipartBody)
- ✅ **TypeScript**: Full type safety and IntelliSense support

The implementation maintains the library's core principles:
- Background upload support
- Progress tracking
- Error handling
- Cross-platform compatibility
- Minimal API surface