/* eslint-disable */
// @ts-nocheck

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";



const CertificateSettings = () => {
//@ts-expect-error err
  const admindbstate = useSelector((state) => state.admin.db);
  
  const [formData, setFormData] = useState({
    logo: null,
    companyName: "",
    associates: [""],
    signature: null,
    gradingSystem: [
      { grade: "", min: 0, max: 0 }
    ],
    template: ""
  });

  const [errors, setErrors] = useState({});

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCertificateSettings();
  }, []);

  

  const fetchCertificateSettings = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}certificate/settings`,
        {
          params: {
            db: admindbstate
          }
        }
      );
      
      if (response.data.payload) {
        // Transform the data to match our form structure
        const settings = response.data.payload;
        
        // Ensure associates is an array
        const associates = Array.isArray(settings.associates) 
          ? settings.associates 
          : ["" ];
        
        // Ensure gradingSystem is an array
        const gradingSystem = Array.isArray(settings.gradingSystem) 
          ? settings.gradingSystem 
          : [{ grade: "", min: 0, max: 0 }];
        
        setFormData({
          logo: settings.logo || null,
          companyName: settings.companyName || "",
          associates: associates,
          signature: settings.signature || null,
          gradingSystem: gradingSystem,
          template: settings.template || ""
        });
      }
    } catch (err) {
      console.error("Error fetching certificate settings:", err);
      // Initialize with default values if fetch fails
      setFormData({
        logo: null,
        companyName: "",
        associates: [""],
        signature: null,
        gradingSystem: [{ grade: "", min: 0, max: 0 }],
        template: ""
      });
    }
  };

  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleImageUpload = (field, event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({
        ...prev,
        [field]: "Please select a valid image file",
      }));
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        [field]: "File size should be less than 5MB",
      }));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.result,
      }));
      // Clear any existing errors
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleAssociatesChange = (index, value) => {
    const newAssociates = [...formData.associates];
    newAssociates[index] = value;
    setFormData({
      ...formData,
      associates: newAssociates
    });
    // Clear error when user starts typing
    if (errors[`associate-${index}`]) {
      setErrors(prev => ({
        ...prev,
        [`associate-${index}`]: ""
      }));
    }
  };

  const handleAssociateImageUpload = (index, event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setErrors(prev => ({
        ...prev,
        [`associate-${index}`]: "Please select a valid image file"
      }));
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({
        ...prev,
        [`associate-${index}`]: "File size should be less than 5MB"
      }));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const newAssociates = [...formData.associates];
      newAssociates[index] = e.target.result;
      setFormData({
        ...formData,
        associates: newAssociates
      });
      // Clear any existing errors
      setErrors(prev => ({
        ...prev,
        [`associate-${index}`]: ""
      }));
    };
    reader.readAsDataURL(file);
  };

  const addAssociate = () => {
    setFormData({
      ...formData,
      associates: [...formData.associates, ""]
    });
  };

  const removeAssociate = (index) => {
    const newAssociates = formData.associates.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      associates: newAssociates
    });
  };

  const handleGradingChange = (index, field, value) => {
    const newGradingSystem = [...formData.gradingSystem];
    newGradingSystem[index] = {
      ...newGradingSystem[index],
      [field]: value
    };
    setFormData({
      ...formData,
      gradingSystem: newGradingSystem
    });
  };

  const addGrade = () => {
    setFormData({
      ...formData,
      gradingSystem: [...formData.gradingSystem, { grade: "", min: 0, max: 0 }]
    });
  };

  const removeGrade = (index) => {
    const newGradingSystem = formData.gradingSystem.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      gradingSystem: newGradingSystem
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    console.log("Validating form data:", formData);
    
    if (!formData.companyName || !formData.companyName.trim()) {
      newErrors.companyName = "Company name is required";
    }
    
    if (!formData.template || !formData.template.trim()) {
      newErrors.template = "HTML template is required";
    }
    
    // Validate associates - only validate if there are associates
    if (formData.associates && formData.associates.length > 0) {
      formData.associates.forEach((associate, index) => {
        // Only require associate if it's not the default empty string
        if (associate === "" && formData.associates.length === 1) {
          // Allow empty if it's the default single empty associate
          return;
        }
        if (!associate || (typeof associate === "string" && !associate.trim())) {
          newErrors[`associate-${index}`] = "Associate logo is required";
        }
      });
    }
    
    
    
    console.log("Validation errors:", newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
   
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    console.log("Form submission started");

    if (!validateForm()) {
      console.log("Form validation failed");
      setLoading(false);
      return;
    }

    console.log("Form validation passed");

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

    try {
      const formDataToSend = new FormData();
      
      // Log form data for debugging
      console.log("Form data to send:", formData);
      
      // Append text fields
      formDataToSend.append("companyName", formData.companyName);
      formDataToSend.append("db", admindbstate);
      formDataToSend.append("template", formData.template);
      
      // Append associates - send as multiple files with the same key name
      formData.associates.forEach((associate, index) => {
        // If it's a base64 image, convert it back to Blob
        if (typeof associate === "string" && associate.startsWith("data:image")) {
          formDataToSend.append("associates", dataURLtoBlob(associate), `associate-${index}.png`);
        } else if (associate && typeof associate === "string") {
          // If it's a URL, send it as form data
          formDataToSend.append(`associates[${index}]`, associate);
        }
        // If it's empty, we don't send anything for this index
      });
      
      // Append grading system
      formData.gradingSystem.forEach((grade, index) => {
        formDataToSend.append(`gradingSystem[${index}][grade]`, grade.grade);
        formDataToSend.append(`gradingSystem[${index}][min]`, grade.min);
        formDataToSend.append(`gradingSystem[${index}][max]`, grade.max);
      });

      // Handle logo
      if (formData.logo) {
        if (typeof formData.logo === "string" && formData.logo.startsWith("data:image")) {
          // It's a base64 image, convert to blob
          formDataToSend.append(
            "logo",
            dataURLtoBlob(formData.logo),
            "logo.png"
          );
        } else if (typeof formData.logo === "string") {
          // It's a URL, send as string
          formDataToSend.append("logo", formData.logo);
        }
      }

      // Handle signature
      if (formData.signature) {
        if (typeof formData.signature === "string" && formData.signature.startsWith("data:image")) {
          // It's a base64 image, convert to blob
          formDataToSend.append(
            "signature",
            dataURLtoBlob(formData.signature),
            "signature.png"
          );
        } else if (typeof formData.signature === "string") {
          // It's a URL, send as string
          formDataToSend.append("signature", formData.signature);
        }
      }

      // Remove the duplicate dataURLtoBlob function that was here
      
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}addupdatecertificatesettings`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Response received:", response.data);
      
      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error saving certificate settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Certificate Settings</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          Certificate settings saved successfully!
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Logo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Institute Logo
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
              {formData.logo ? (
                <img
                  src={formData.logo}
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
          {errors.logo && (
            <p className="mt-1 text-sm text-red-600">{errors.logo}</p>
          )}
        </div>
        
        {/* Company Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Company Name
          </label>
          <input
            type="text"
            value={formData.companyName}
            onChange={(e) => handleInputChange("companyName", e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.companyName ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Enter company name"
          />
          {errors.companyName && (
            <p className="mt-1 text-sm text-red-600">{errors.companyName}</p>
          )}
        </div>
        
        {/* Associates */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Associates Logos
          </label>
          {formData.associates.map((associate, index) => (
            <div key={index} className="mb-4">
              <div className="flex items-center space-x-2 mb-2">
                <div className="flex-1 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleAssociateImageUpload(index, e)}
                    className="hidden"
                    id={`associate-upload-${index}`}
                  />
                  <label htmlFor={`associate-upload-${index}`} className="cursor-pointer">
                    {associate ? (
                      <img
                        src={associate}
                        alt={`Associate logo ${index + 1}`}
                        className="mx-auto h-16 w-auto object-contain"
                      />
                    ) : (
                      <div className="text-gray-500">
                        <div className="text-2xl mb-2">📷</div>
                        <p>Click to upload associate logo</p>
                      </div>
                    )}
                  </label>
                </div>
                {formData.associates.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeAssociate(index)}
                    className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    Remove
                  </button>
                )}
              </div>
              {errors[`associate-${index}`] && (
                <p className="mt-1 text-sm text-red-600">{errors[`associate-${index}`]}</p>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addAssociate}
            className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Add Associate Logo
          </button>
        </div>

        {/* HTML Template Field */}
        <div className="mt-6 space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            HTML Template * (For developers only)
          </label>
          <div className="relative">
            <textarea
              value={formData.template}
              onChange={(e) => handleInputChange("template", e.target.value)}
              rows={8}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm ${
                errors.template ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter HTML template with template literals for dynamic values"
            />
            <div className="absolute top-0 right-0 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-bl-md rounded-tr-md">
              WARNING: For developers only
            </div>
          </div>
          {errors.template && (
            <p className="mt-1 text-sm text-red-600">{errors.template}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Use template literals (e.g., ${"{"}variable{"}"}) for dynamic values
            in the HTML template.
          </p>
        </div>
        
        {/* Signature */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Authorized Signature
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
              {formData.signature ? (
                <img
                  src={formData.signature}
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
          {errors.signature && (
            <p className="mt-1 text-sm text-red-600">{errors.signature}</p>
          )}
        </div>
        
        {/* Grading System */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Grading System
          </label>
          <div className="space-y-3">
            {formData.gradingSystem.map((grade, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="flex-1">
                  <input
                    type="text"
                    value={grade.grade}
                    onChange={(e) => handleGradingChange(index, 'grade', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors[`grade-${index}`] ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Grade (e.g., A, B, C)"
                  />
                  {errors[`grade-${index}`] && (
                    <p className="mt-1 text-sm text-red-600">{errors[`grade-${index}`]}</p>
                  )}
                </div>
                <div>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={grade.min}
                    onChange={(e) => handleGradingChange(index, 'min', parseInt(e.target.value) || 0)}
                    className={`w-20 px-2 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors[`min-${index}`] ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Min %"
                  />
                  {errors[`min-${index}`] && (
                    <p className="mt-1 text-sm text-red-600">{errors[`min-${index}`]}</p>
                  )}
                </div>
                <div className="text-gray-500">to</div>
                <div>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={grade.max}
                    onChange={(e) => handleGradingChange(index, 'max', parseInt(e.target.value) || 0)}
                    className={`w-20 px-2 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors[`max-${index}`] ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Max %"
                  />
                  {errors[`max-${index}`] && (
                    <p className="mt-1 text-sm text-red-600">{errors[`max-${index}`]}</p>
                  )}
                </div>
                {formData.gradingSystem.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeGrade(index)}
                    className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addGrade}
              className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Grade
            </button>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CertificateSettings;
