import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { useSelector } from "react-redux";


const Receiptsettings = () => {
 
  const [receiptSettings, setReceiptSettings] = useState({
    logo: null,
    headerBackground: "#000000",
    headerColor: "#ffffff",
    secondHeaderBackground: "#f5f5f5",
    companyName: "",
    highlight: "",
    contact: "",
    altContact: "",
    address: "",
    notes: [""],
    signature: null,
  });

  //@ts-expect-error err
  const admindbstate = useSelector((state) => state.admin.db);

  const handleInputChange = (field, value) => {
    setReceiptSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageUpload = (field, event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setReceiptSettings((prev) => ({
          ...prev,
          [field]: e.target.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const addNote = () => {
    setReceiptSettings((prev) => ({
      ...prev,
      notes: [...prev.notes, ""],
    }));
  };

  const updateNote = (index, value) => {
    setReceiptSettings((prev) => ({
      ...prev,
      notes: prev.notes.map((note, i) => (i === index ? value : note)),
    }));
  };

  const removeNote = (index) => {
    if (receiptSettings.notes.length > 1) {
      setReceiptSettings((prev) => ({
        ...prev,
        notes: prev.notes.filter((_, i) => i !== index),
      }));
    }
  };

  const fetchReceiptSettings = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}getreceiptformat`,
        {
          params: { db: admindbstate },
        }
      );

      const data = response.data.payload;

      if (data && data.length > 0) {
        const settings = data[0]; // Assuming it's one document
        setReceiptSettings((prev) => ({
          ...prev,
          logo: settings.logo || null,
          headerBackground: settings.headerBackground || "#000000",
          headerColor: settings.headerColor || "#ffffff",
          secondHeaderBackground: settings.secondHeaderBackground || "#f5f5f5",
          companyName: settings.companyName || "",
          highlight: settings.highlight || "",
          contact: settings.contact || "",
          altContact: settings.altContact || "",
          address: settings.address || "",
          notes:
            settings.notes && settings.notes.length > 0 ? settings.notes : [""],
          signature: settings.signature || null,
        }));
      }
    } catch (error) {
      console.error("Failed to fetch receipt settings:", error);
    
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();

      // Append text fields
      formData.append("companyName", receiptSettings.companyName);
      formData.append("highlight", receiptSettings.highlight);
      formData.append("contact", receiptSettings.contact);
      formData.append("altContact", receiptSettings.altContact);
      formData.append("address", receiptSettings.address);
      formData.append("headerBackground", receiptSettings.headerBackground);
      formData.append("headerColor", receiptSettings.headerColor);
      formData.append(
        "secondHeaderBackground",
        receiptSettings.secondHeaderBackground
      );

      // Append notes as JSON string or individual fields
      receiptSettings.notes.forEach((note, index) => {
        formData.append(`notes[${index}]`, note);
      });

      // Convert base64 images back to Blob before appending (if needed)
      const dataURLtoBlob = (dataurl) => {
        const arr = dataurl.split(",");
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
      };

      const isBase64Image = (dataUrl) =>
        typeof dataUrl === "string" && dataUrl.startsWith("data:image");

      if (isBase64Image(receiptSettings.logo)) {
        formData.append(
          "logo",
          dataURLtoBlob(receiptSettings.logo),
          "logo.png"
        );
      }

      if (isBase64Image(receiptSettings.signature)) {
        formData.append(
          "signature",
          dataURLtoBlob(receiptSettings.signature),
          "signature.png"
        );
      }

      formData.append("db", admindbstate);

      // Send the formData
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}addupdatereceipt`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success(response.data.message);
      setReceiptSettings({
        logo: null,
        headerBackground: "#000000",
        headerColor: "#ffffff",
        secondHeaderBackground: "#f5f5f5",
        companyName: "",
        highlight: "",
        contact: "",
        altContact: "",
        address: "",
        notes: [""],
        signature: null,
      });
      fetchReceiptSettings()
    } catch (error) {
      if (error.response.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something Went Wrong");
      }
    }
  };

  useEffect(() => {
    if (admindbstate) {
      fetchReceiptSettings();
    }
  }, [admindbstate]);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      

      {/* Receipt Section */}
      <div className="bg-gray-100 rounded-lg p-6 shadow-sm">
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
                onChange={(e) => handleImageUpload("logo", e)}
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
              onChange={(e) => handleInputChange("companyName", e.target.value)}
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
                onChange={(e) =>
                  handleInputChange("headerBackground", e.target.value)
                }
                className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={receiptSettings.headerBackground}
                onChange={(e) =>
                  handleInputChange("headerBackground", e.target.value)
                }
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
                onChange={(e) =>
                  handleInputChange("headerColor", e.target.value)
                }
                className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={receiptSettings.headerColor}
                onChange={(e) =>
                  handleInputChange("headerColor", e.target.value)
                }
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
                onChange={(e) =>
                  handleInputChange("secondHeaderBackground", e.target.value)
                }
                className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={receiptSettings.secondHeaderBackground}
                onChange={(e) =>
                  handleInputChange("secondHeaderBackground", e.target.value)
                }
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
              onChange={(e) => handleInputChange("highlight", e.target.value)}
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
              onChange={(e) => handleInputChange("contact", e.target.value)}
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
              onChange={(e) => handleInputChange("altContact", e.target.value)}
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
            onChange={(e) => handleInputChange("address", e.target.value)}
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
              onChange={(e) => handleImageUpload("signature", e)}
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
        <div onClick={handleSubmit} className="mt-8 flex justify-end">
          <button className="px-6 py-2 bg-green-500 text-white font-medium rounded-md hover:bg-green-600 transition-colors">
            Save Receipt Settings
          </button>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Receiptsettings

