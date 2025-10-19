/**
 * @format
 */

import { UploadOptions } from '../src/types';

describe('Multipart Upload Types', () => {
  it('should accept valid multipart upload options', () => {
    const multipartOptions: UploadOptions = {
      url: 'https://example.com/upload',
      path: 'file://path/to/file.jpg',
      method: 'POST',
      type: 'multipart',
      field: 'uploaded_file',
      parameters: {
        'user_id': '123',
        'description': 'Test upload'
      },
      headers: {
        'Authorization': 'Bearer token'
      },
      android: {
        notificationChannel: 'upload-channel',
        notificationId: 'upload-1',
        notificationTitle: 'Uploading...',
        notificationTitleNoWifi: 'Waiting for Wifi...',
        notificationTitleNoInternet: 'Waiting for Internet...'
      }
    };

    expect(multipartOptions.type).toBe('multipart');
    expect(multipartOptions.field).toBe('uploaded_file');
    expect(multipartOptions.parameters).toEqual({
      'user_id': '123',
      'description': 'Test upload'
    });
  });

  it('should accept valid raw upload options', () => {
    const rawOptions: UploadOptions = {
      url: 'https://example.com/upload',
      path: 'file://path/to/file.jpg',
      method: 'POST',
      type: 'raw',
      headers: {
        'content-type': 'application/octet-stream'
      },
      android: {
        notificationChannel: 'upload-channel',
        notificationId: 'upload-1',
        notificationTitle: 'Uploading...',
        notificationTitleNoWifi: 'Waiting for Wifi...',
        notificationTitleNoInternet: 'Waiting for Internet...'
      }
    };

    expect(rawOptions.type).toBe('raw');
  });

  it('should accept multipart options without parameters', () => {
    const multipartOptions: UploadOptions = {
      url: 'https://example.com/upload',
      path: 'file://path/to/file.jpg',
      method: 'POST',
      type: 'multipart',
      field: 'uploaded_file',
      android: {
        notificationChannel: 'upload-channel',
        notificationId: 'upload-1',
        notificationTitle: 'Uploading...',
        notificationTitleNoWifi: 'Waiting for Wifi...',
        notificationTitleNoInternet: 'Waiting for Internet...'
      }
    };

    expect(multipartOptions.type).toBe('multipart');
    expect(multipartOptions.field).toBe('uploaded_file');
    expect(multipartOptions.parameters).toBeUndefined();
  });
});