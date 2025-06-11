import React, { useState } from 'react';
import axios from 'axios';

const Settingstab = () => {
  const [receiptSettings, setReceiptSettings] = useState({
    logo: null,
    headerBackground: '#000000',
    headerColor: '#ffffff',
    secondHeaderBackground: '#f5f5f5',
    companyName: '',
    highlight: '',
    contact: '',
    altContact: '',
    address: '',
    notes: [''],
    signature: null
  });

  const handleInputChange = (field, value) => {
    setReceiptSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (field, event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setReceiptSettings(prev => ({
          ...prev,
          [field]: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const addNote = () => {
    setReceiptSettings(prev => ({
      ...prev,
      notes: [...prev.notes, '']
    }));
  };

  const updateNote = (index, value) => {
    setReceiptSettings(prev => ({
      ...prev,
      notes: prev.notes.map((note, i) => i === index ? value : note)
    }));
  };

  const removeNote = (index) => {
    if (receiptSettings.notes.length > 1) {
      setReceiptSettings(prev => ({
        ...prev,
        notes: prev.notes.filter((_, i) => i !== index)
      }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Settings</h1>
      
      {/* Receipt Section */}
      <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-gray-700 mb-6 border-b border-gray-200 pb-3">
          Receipt Configuration
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Logo Upload */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Company Logo
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload('logo', e)}
                className="hidden"
                id="logo-upload"
              />
              <label htmlFor="logo-upload" className="cursor-pointer">
                {receiptSettings.logo ? (
                  <img 
                    src={receiptSettings.logo} 
                    alt="Logo preview" 
                    className="mx-auto h-20 w-auto object-contain"
                  />
                ) : (
                  <div className="text-gray-500">
                    <div className="text-2xl mb-2">📷</div>
                    <p>Click to upload logo</p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Company Name */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Company Name
            </label>
            <input
              type="text"
              value={receiptSettings.companyName}
              onChange={(e) => handleInputChange('companyName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter company name"
            />
          </div>

          {/* Header Background Color */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Header Background Color
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={receiptSettings.headerBackground}
                onChange={(e) => handleInputChange('headerBackground', e.target.value)}
                className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={receiptSettings.headerBackground}
                onChange={(e) => handleInputChange('headerBackground', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="#000000"
              />
            </div>
          </div>

          {/* Header Text Color */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Header Text Color
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={receiptSettings.headerColor}
                onChange={(e) => handleInputChange('headerColor', e.target.value)}
                className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={receiptSettings.headerColor}
                onChange={(e) => handleInputChange('headerColor', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="#ffffff"
              />
            </div>
          </div>

          {/* Second Header Background */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Second Header Background
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={receiptSettings.secondHeaderBackground}
                onChange={(e) => handleInputChange('secondHeaderBackground', e.target.value)}
                className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={receiptSettings.secondHeaderBackground}
                onChange={(e) => handleInputChange('secondHeaderBackground', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="#f5f5f5"
              />
            </div>
          </div>

          {/* Highlight */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Highlight Text
            </label>
            <input
              type="text"
              value={receiptSettings.highlight}
              onChange={(e) => handleInputChange('highlight', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Special offer, promotion, etc."
            />
          </div>

          {/* Contact */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Primary Contact
            </label>
            <input
              type="text"
              value={receiptSettings.contact}
              onChange={(e) => handleInputChange('contact', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Phone, email, or website"
            />
          </div>

          {/* Alt Contact */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Alternative Contact
            </label>
            <input
              type="text"
              value={receiptSettings.altContact}
              onChange={(e) => handleInputChange('altContact', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Secondary contact method"
            />
          </div>
        </div>

        {/* Address - Full Width */}
        <div className="mt-6 space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Business Address
          </label>
          <textarea
            value={receiptSettings.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter complete business address"
          />
        </div>

        {/* Notes Section */}
        <div className="mt-6 space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">
              Receipt Notes
            </label>
            <button
              onClick={addNote}
              className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
            >
              + Add Note
            </button>
          </div>
          <div className="space-y-2">
            {receiptSettings.notes.map((note, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={note}
                  onChange={(e) => updateNote(index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={`Note ${index + 1}`}
                />
                {receiptSettings.notes.length > 1 && (
                  <button
                    onClick={() => removeNote(index)}
                    className="px-2 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Signature Upload */}
        <div className="mt-6 space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Signature
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload('signature', e)}
              className="hidden"
              id="signature-upload"
            />
            <label htmlFor="signature-upload" className="cursor-pointer">
              {receiptSettings.signature ? (
                <img 
                  src={receiptSettings.signature} 
                  alt="Signature preview" 
                  className="mx-auto h-16 w-auto object-contain"
                />
              ) : (
                <div className="text-gray-500">
                  <div className="text-2xl mb-2">✍️</div>
                  <p>Click to upload signature</p>
                </div>
              )}
            </label>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <button className="px-6 py-2 bg-green-500 text-white font-medium rounded-md hover:bg-green-600 transition-colors">
            Save Receipt Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settingstab;