import React, { useState } from 'react';
import { Search, Eye, Trash2, Download, FileText, AlertCircle, X } from 'lucide-react';
import axios from 'axios';
import { useSelector } from "react-redux";


const Certificate = () => {
  const [certificateId, setCertificateId] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  //@ts-ignore
  const admindbstate = useSelector((state) => state.admin.db);


  const handleSearch = async () => {
    if (!certificateId.trim()) {
      setError('Please enter a certificate ID');
      return;
    }

    setLoading(true);
    setError('');
    setPdfUrl('');

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}seecertificate`, {
        certificateId: certificateId.trim(),
        db: admindbstate
      });

      if (response.data && response.data.certificateUrl) {
        setPdfUrl(response.data.certificateUrl);
      } else {
        setError(response.data.message || 'Certificate not found');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch certificate. Please try again.');
      console.error('Error fetching certificate:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);

    try {
      const response = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}deletecertificate`, {
        data: {
          certificateId: certificateId.trim(),
          db: 'aicidb'
        }
      });

      if (response.data && response.data.success) {
        // Clear the form after successful deletion
        setCertificateId('');
        setPdfUrl('');
        setShowDeleteConfirm(false);
        alert('Certificate deleted successfully!');
      } else {
        alert(response.data.message || 'Failed to delete certificate');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting certificate. Please try again.');
      console.error('Error deleting certificate:', err);
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleDownload = () => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
          <FileText className="text-blue-600" size={24} />
          Search Certificate
        </h2>

        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Certificate ID
            </label>
            <input
              type="text"
              value={certificateId}
              onChange={(e) => setCertificateId(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter certificate ID..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-7"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Searching...
              </>
            ) : (
              <>
                <Search size={16} />
                Search
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2 text-red-700">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Certificate Display Section */}
      {pdfUrl && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Eye className="text-green-600" size={20} />
              Certificate Preview
            </h3>
            <div className="flex gap-2">
              <button
                onClick={handleDownload}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Download size={16} />
                Download
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>

          {/* PDF Viewer */}
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <div className="bg-gray-50 p-3 border-b border-gray-200">
              <p className="text-sm text-gray-600">Certificate ID: <span className="font-semibold">{certificateId}</span></p>
            </div>
            <div className="relative">
              <iframe
                src={pdfUrl}
                width="100%"
                height="800"
                className="border-0"
                title="Certificate PDF"
              />

            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Confirm Delete</h3>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="text-red-600" size={24} />
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">Delete Certificate</h4>
                  <p className="text-sm text-gray-600">Certificate ID: {certificateId}</p>
                </div>
              </div>

              <p className="text-gray-600">
                Are you sure you want to delete this certificate? This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Certificate;