import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Upload, FileText, CheckCircle, AlertCircle, Clock, Edit2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const FileUpload: React.FC = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadedData, setUploadedData] = useState<any>({});
  const [uploadStatus, setUploadStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });
  const [editField, setEditField] = useState<string | null>(null);
  const { user } = useAuth();

  const handleFileSelect = async () => {
    try {
      const result = await window.electronAPI.showOpenDialog();
      if (result.canceled || result.filePaths.length === 0) return;

      const filePath = result.filePaths[0];
      const fileName = filePath.split(/[\\/]/).pop() || 'unknown.pdf';

      setUploading(true);
      setUploadStatus({ type: null, message: '' });

      const uploadResult = await window.electronAPI.uploadFile({ filePath, fileName, userId: user?.id });

      if (uploadResult.additionalData) setUploadedData(uploadResult.additionalData);

      if (uploadResult.success) {
        setUploadStatus({ type: 'success', message: 'File uploaded successfully! Processing started in background.' });
      } else {
        setUploadStatus({ type: 'error', message: uploadResult.error || 'Upload failed' });
      }
    } catch (error) {
      setUploadStatus({ type: 'error', message: 'An error occurred during upload' });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      const res: any = await window.electronAPI.updateProcessedFile({
        fileId: uploadedData.fileId,
        fileName: uploadedData.fileName,
        idNumber: uploadedData.idNumber,
        name: uploadedData.name,
        address1: uploadedData.address1,
        address2: uploadedData.address2,
        finalImageBuffer: uploadedData.photoBuffer,
      });
      alert(
        `Created successfully!${res.pngOutputPath ? `\nPNG saved at: ${res.pngOutputPath}` : ''}${res.pdfOutputPath ? `\nPDF saved at: ${res.pdfOutputPath}` : ''
        }`
      );
      setEditField(null);
      setUploadedData({});
      setUploadStatus({ type: null, message: '' });
    } catch (err) {
      console.error(err);
      alert('Update failed.');
    }
  };

  // small reusable editor wrapper
  const RichEditor = ({ field }: { field: string }) => (
    <ReactQuill
      theme="snow"
      value={uploadedData[field] || ''}
      onChange={(val) => setUploadedData({ ...uploadedData, [field]: val })}
      className="border rounded bg-white"
    />
  );

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

          <h3 className="text-lg font-semibold text-gray-900 mb-2">{uploading ? 'Uploading...' : 'Select PDF File'}</h3>
          <p className="text-gray-600 mb-6">Choose a PDF file to process with OCR text extraction</p>

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
        <div
          className={`mt-6 p-4 rounded-lg border ${uploadStatus.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
            }`}
        >
          <div className="flex items-center gap-2">
            {uploadStatus.type === 'success' ? (
              <CheckCircle className="text-green-600" size={20} />
            ) : (
              <AlertCircle className="text-red-600" size={20} />
            )}
            <p
              className={`text-sm font-medium ${uploadStatus.type === 'success' ? 'text-green-800' : 'text-red-800'
                }`}
            >
              {uploadStatus.message}
            </p>
          </div>
        </div>
      )}

      {/* Processed Info */}
      {uploadedData.fileId && (
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-blue-900 mb-3">Processed Information</h4>
          <div className="space-y-6">
            {['idNumber', 'name', 'address1', 'address2'].map((field) => (
              <div key={field} className="flex items-start gap-3">
                <FileText className="text-blue-600 mt-0.5" size={16} />
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <p className="font-medium text-blue-900 capitalize">{field}</p>
                    <button
                      className="ml-2 p-1 hover:bg-gray-200 rounded"
                      onClick={() => setEditField(editField === field ? null : field)}
                    >
                      <Edit2 size={16} className="text-gray-600" />
                    </button>
                  </div>
                  {editField === field ? (
                    <RichEditor field={field} />
                  ) : (
                    <div
                      className="prose max-w-none text-sm text-blue-700"
                      dangerouslySetInnerHTML={{ __html: uploadedData[field] }}
                    />
                  )}
                </div>
              </div>
            ))}

            {/* Processed Image */}
            <div className="flex items-start gap-3">
              <FileText className="text-blue-600 mt-0.5" size={16} />
              <div>
                <p className="font-medium text-blue-900">Image</p>
                <img
                  src={`data:image/png;base64,${uploadedData.photoBufferImg}`}
                  alt="Processed"
                  className="mt-2 rounded border"
                  style={{ width: 100, height: 'auto' }}
                />
              </div>
            </div>

            {/* Update Button */}
            <div className="mt-4 text-right">
              <button
                onClick={handleSave}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
              >
                Verify
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
