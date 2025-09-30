import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Edit2 } from 'lucide-react';
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

      // alert(
      //   `Created successfully!${res.pngOutputPath ? `\nPNG saved at: ${res.pngOutputPath}` : ''}${res.pdfOutputPath ? `\nPDF saved at: ${res.pdfOutputPath}` : ''}`
      // );
      setUploadStatus({ type: 'success', message: 'File Processed Completed.' });

      const resp = await window.electronAPI.printPdf(res.pdfOutputPath);
      if (!resp.success) console.error(resp.error);

      setEditField(null);
      setUploadedData({});
      setUploadStatus({ type: null, message: '' });
    } catch (err) {
      console.error(err);
      alert('Update failed.');
    }
  };

  // Render a single field with toggleable edit
  const EditableField = ({
    field,
    label,
    multiline = false,
  }: {
    field: string;
    label: string;
    multiline?: boolean;
  }) => (
    <div className="mb-4">
      <label className="font-medium text-blue-900 block mb-1">{label}</label>
      <div className="flex items-center gap-2">
        {editField === field ? (
          multiline ? (
            <textarea
              value={uploadedData[field] || ''}
              onChange={(e) => setUploadedData({ ...uploadedData, [field]: e.target.value })}
              rows={3}
              className="flex-1 border rounded px-2 py-1"
            />
          ) : (
            <input
              type="text"
              value={uploadedData[field] || ''}
              onChange={(e) => setUploadedData({ ...uploadedData, [field]: e.target.value })}
              className="flex-1 border rounded px-2 py-1"
            />
          )
        ) : (
          <div className="flex-1 border rounded px-2 py-1 bg-gray-100">{uploadedData[field]}</div>
        )}
        <button
          className="p-1 hover:bg-gray-200 rounded"
          onClick={() => setEditField(editField === field ? null : field)}
        >
          <Edit2 size={16} className="text-gray-600" />
        </button>
      </div>
    </div>
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
            className="bg-[#2D3A7F] text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {uploading ? 'Uploading...' : 'Choose File'}
          </button>
        </div>
      </div>

      {/* Status Message */}
      {uploadStatus.type && (
        <div className={`mt-6 p-4 rounded-lg border ${uploadStatus.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-center gap-2">
            {uploadStatus.type === 'success' ? <CheckCircle className="text-green-600" size={20} /> : <AlertCircle className="text-red-600" size={20} />}
            <p className={`text-sm font-medium ${uploadStatus.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>{uploadStatus.message}</p>
          </div>
        </div>
      )}

      {/* Processed Info */}
      {uploadedData.fileId && (
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <EditableField field="idNumber" label="ID Number" />
          <EditableField field="name" label="Name" />
          <EditableField field="address1" label="Address 1" multiline />
          <EditableField field="address2" label="Address 2" multiline />

          <div className="mb-4">
            <label className="font-medium text-blue-900 block mb-1">Image</label>
            <img
              src={`data:image/png;base64,${uploadedData.photoBufferImg}`}
              alt="Processed"
              className="mt-2 rounded border"
              style={{ width: 100, height: 'auto' }}
            />
          </div>

          <div className="text-right">
            <button
              onClick={handleSave}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
            >
              Verify
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
