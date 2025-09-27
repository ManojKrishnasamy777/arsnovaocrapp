import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const FileUpload: React.FC = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const { user } = useAuth();

  const handleFileSelect = async () => {
    try {
      const result = await window.electronAPI.showOpenDialog();

      if (result.canceled || result.filePaths.length === 0) {
        return;
      }

      const filePath = result.filePaths[0];
      const fileName = filePath.split(/[\\/]/).pop() || 'unknown.pdf';

      setUploading(true);
      setUploadStatus({ type: null, message: '' });

      const uploadResult = await window.electronAPI.uploadFile({
        filePath,
        fileName,
        userId: user?.id
      });

      if (uploadResult.success) {
        setUploadStatus({
          type: 'success',
          message: 'File uploaded successfully! Processing has started in the background.'
        });
      } else {
        setUploadStatus({
          type: 'error',
          message: uploadResult.error || 'Upload failed'
        });
      }
    } catch (error) {
      setUploadStatus({
        type: 'error',
        message: 'An error occurred during upload'
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload PDF File</h2>
        <p className="text-gray-600">Upload a PDF file to extract text and generate processed output</p>
      </div>

      {/* Upload Area */}
      <div className="bg-white rounded-xl shadow-sm border-2 border-dashed border-gray-300 hover:border-blue-500 transition-colors">
        <div className="p-12 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Upload className="text-blue-600" size={32} />
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {uploading ? 'Uploading...' : 'Select PDF File'}
          </h3>

          <p className="text-gray-600 mb-6">
            Choose a PDF file to process with OCR text extraction
          </p>

          <button
            onClick={handleFileSelect}
            disabled={uploading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {uploading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Uploading...
              </div>
            ) : (
              'Choose File'
            )}
          </button>
        </div>
      </div>

      {/* Status Message */}
      {uploadStatus.type && (
        <div className={`mt-6 p-4 rounded-lg border ${uploadStatus.type === 'success'
          ? 'bg-green-50 border-green-200'
          : 'bg-red-50 border-red-200'
          }`}>
          <div className="flex items-center gap-2">
            {uploadStatus.type === 'success' ? (
              <CheckCircle className="text-green-600" size={20} />
            ) : (
              <AlertCircle className="text-red-600" size={20} />
            )}
            <p className={`text-sm font-medium ${uploadStatus.type === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
              {uploadStatus.message}
            </p>
          </div>
        </div>
      )}

      {/* Processing Info */}
      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-blue-900 mb-3">Processing Information</h4>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Clock className="text-blue-600 mt-0.5" size={16} />
            <div>
              <p className="font-medium text-blue-900">Processing Time</p>
              <p className="text-sm text-blue-700">Files are processed in the background. Large files may take several minutes.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <FileText className="text-blue-600 mt-0.5" size={16} />
            <div>
              <p className="font-medium text-blue-900">Output Generation</p>
              <p className="text-sm text-blue-700">A new PDF with extracted text will be generated automatically.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;