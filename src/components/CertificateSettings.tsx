import React, { useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";

const CertificateSettings = () => {
  const [formData, setFormData] = useState({
    companyName: "",
    contactNo: "",
    email: "",
    watermark: "",
    template: "", // New field for HTML template
    associates: [],
    logo: null,
    seal: null,
    signature: null,
  });

  const [previews, setPreviews] = useState({
    associates: [],
    logo: null,
    seal: null,
    signature: null,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  //@ts-expect-error err
  const admindbstate = useSelector((state) => state.admin.db);

  // Handle text input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Convert file to base64 for preview
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Handle single image upload (logo, seal, signature)
  const handleSingleImageChange = async (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({
        ...prev,
        [fieldName]: "Please select a valid image file",
      }));
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        [fieldName]: "File size should be less than 5MB",
      }));
      return;
    }

    try {
      const base64 = await fileToBase64(file);

      setFormData((prev) => ({
        ...prev,
        [fieldName]: file,
      }));

      setPreviews((prev) => ({
        ...prev,
        [fieldName]: base64,
      }));

      // Clear any existing errors
      setErrors((prev) => ({
        ...prev,
        [fieldName]: "",
      }));
    } catch (error) {
      console.error("Error converting file to base64:", error);
      setErrors((prev) => ({
        ...prev,
        [fieldName]: "Error processing image",
      }));
    }
  };

  // Handle associates photos upload
  const handleAssociatesChange = async (e) => {
    const files = Array.from(e.target.files);

    // Validate number of files
    if (files.length < 1 || files.length > 4) {
      setErrors((prev) => ({
        ...prev,
        associates: "Please select between 1 to 4 images",
      }));
      return;
    }

    // Validate file types and sizes
    const validFiles = [];
    const invalidFiles = [];

    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        invalidFiles.push(`${file.name} is not an image`);
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        invalidFiles.push(`${file.name} is larger than 5MB`);
        continue;
      }
      validFiles.push(file);
    }

    if (invalidFiles.length > 0) {
      setErrors((prev) => ({
        ...prev,
        associates: invalidFiles.join(", "),
      }));
      return;
    }

    try {
      // Convert all files to base64 for preview
      const base64Promises = validFiles.map((file) => fileToBase64(file));
      const base64Results = await Promise.all(base64Promises);

      setFormData((prev) => ({
        ...prev,
        associates: validFiles,
      }));

      setPreviews((prev) => ({
        ...prev,
        associates: base64Results,
      }));

      // Clear any existing errors
      setErrors((prev) => ({
        ...prev,
        associates: "",
      }));
    } catch (error) {
      console.error("Error converting files to base64:", error);
      setErrors((prev) => ({
        ...prev,
        associates: "Error processing images",
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.companyName.trim()) {
      newErrors.companyName = "Company name is required";
    }

    if (!formData.contactNo.trim()) {
      newErrors.contactNo = "Contact number is required";
    } else if (!/^\+?[\d\s\-\(\)]+$/.test(formData.contactNo)) {
      newErrors.contactNo = "Please enter a valid contact number";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.watermark.trim()) {
      newErrors.watermark = "Watermark text is required";
    }

    if (!formData.template.trim()) {
      newErrors.template = "HTML template is required";
    }

    if (!formData.associates || formData.associates.length === 0) {
      newErrors.associates = "At least one associate photo is required";
    }

    if (!formData.logo) {
      newErrors.logo = "Logo is required";
    }

    if (!formData.seal) {
      newErrors.seal = "Seal is required";
    }

    if (!formData.signature) {
      newErrors.signature = "Signature is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Create FormData for multipart form data
      const multipartFormData = new FormData();

      // Append text fields
      multipartFormData.append("companyName", formData.companyName);
      multipartFormData.append("contactNo", formData.contactNo);
      multipartFormData.append("email", formData.email);
      multipartFormData.append("watermark", formData.watermark);
      multipartFormData.append("template", formData.template);

      // Append associate photos
      formData.associates.forEach((file, index) => {
        multipartFormData.append(`associates`, file);
      });

      // Append single images
      multipartFormData.append("logo", formData.logo);
      multipartFormData.append("seal", formData.seal);
      multipartFormData.append("signature", formData.signature);

      multipartFormData.append("db", admindbstate);

      // Make API call
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}addupdatecertificatedata`,
        multipartFormData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Success:", response.data);
      alert("Certificate settings updated successfully!");

      // Optionally reset form
      // resetForm();
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Error updating certificate settings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      companyName: "",
      contactNo: "",
      email: "",
      watermark: "",
      template: "",
      associates: [],
      logo: null,
      seal: null,
      signature: null,
    });
    setPreviews({
      associates: [],
      logo: null,
      seal: null,
      signature: null,
    });
    setErrors({});
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Certificate Settings
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Name *
            </label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.companyName ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter company name"
            />
            {errors.companyName && (
              <p className="mt-1 text-sm text-red-600">{errors.companyName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Number *
            </label>
            <input
              type="tel"
              name="contactNo"
              value={formData.contactNo}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.contactNo ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter contact number"
            />
            {errors.contactNo && (
              <p className="mt-1 text-sm text-red-600">{errors.contactNo}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter email address"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Watermark Text *
            </label>
            <input
              type="text"
              name="watermark"
              value={formData.watermark}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.watermark ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter watermark text"
            />
            {errors.watermark && (
              <p className="mt-1 text-sm text-red-600">{errors.watermark}</p>
            )}
          </div>
        </div>

        {/* HTML Template Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            HTML Template * (For developers only)
          </label>
          <div className="relative">
            <textarea
              name="template"
              value={formData.template}
              onChange={handleInputChange}
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

        {/* Associates Photos */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Associates Photos * (1-4 images)
          </label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleAssociatesChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.associates ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.associates && (
            <p className="mt-1 text-sm text-red-600">{errors.associates}</p>
          )}

          {/* Associates Preview */}
          {previews.associates.length > 0 && (
            <div className="mt-3">
              <p className="text-sm text-gray-600 mb-2">Preview:</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {previews.associates.map((preview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={preview}
                      alt={`Associate ${index + 1}`}
                      className="w-full h-24 object-cover rounded-md border"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Image Uploads */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Logo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Logo *
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleSingleImageChange(e, "logo")}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.logo ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.logo && (
              <p className="mt-1 text-sm text-red-600">{errors.logo}</p>
            )}
            {previews.logo && (
              <div className="mt-3">
                <img
                  src={previews.logo}
                  alt="Logo Preview"
                  className="w-full h-24 object-contain border rounded-md bg-gray-50"
                />
              </div>
            )}
          </div>

          {/* Seal */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seal *
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleSingleImageChange(e, "seal")}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.seal ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.seal && (
              <p className="mt-1 text-sm text-red-600">{errors.seal}</p>
            )}
            {previews.seal && (
              <div className="mt-3">
                <img
                  src={previews.seal}
                  alt="Seal Preview"
                  className="w-full h-24 object-contain border rounded-md bg-gray-50"
                />
              </div>
            )}
          </div>

          {/* Signature */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Signature *
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleSingleImageChange(e, "signature")}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.signature ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.signature && (
              <p className="mt-1 text-sm text-red-600">{errors.signature}</p>
            )}
            {previews.signature && (
              <div className="mt-3">
                <img
                  src={previews.signature}
                  alt="Signature Preview"
                  className="w-full h-24 object-contain border rounded-md bg-gray-50"
                />
              </div>
            )}
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4 pt-6">
          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-2 rounded-md text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Updating..." : "Update Certificate Settings"}
          </button>

          <button
            type="button"
            onClick={resetForm}
            disabled={loading}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Reset Form
          </button>
        </div>
      </form>
    </div>
  );
};

export default CertificateSettings;
