import React from 'react';
import { Loader2 } from 'lucide-react';

const CertificateGenerationModal = () => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-4 p-8 text-center">
        {/* Spinner */}
        <div className="mb-6">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
        </div>
        
        {/* Main Message */}
        <h2 className="text-xl font-semibold text-gray-800 mb-3">
          Generating Certificate
        </h2>
        
        {/* Warning Message */}
        <p className="text-gray-600 mb-2">
          Please hold on...
        </p>
        
        <p className="text-red-600 font-medium text-sm">
          Don't close or refresh this page
        </p>
      </div>
    </div>
  );
};

export default CertificateGenerationModal;