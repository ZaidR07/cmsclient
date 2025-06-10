"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Filter,
  Download,
  Plus,
  ArrowUp,
  ArrowDown,
  X,
  CheckCircle,
  Upload,
  User,
  Trash2,
} from "lucide-react";

import _ from "lodash";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { useSelector } from "react-redux";
import ExcelUpload from "./ExcelUpload";
import { handleExcelDataUpload } from "@/util/ExcelUpload";

export default function StudentsManagement() {
  const [students, setStudents] = useState();
  const [filteredStudents, setFilteredStudents] = useState();
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState("id");
  const [sortDirection, setSortDirection] = useState("asc");
  const [showAddForm, setShowAddForm] = useState(false);
  const [exceluploadopen, setExcelUploadOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({
    form_no: "",
    student_id: "",
    firstName: "",
    middleName: "",
    lastName: "",
    dob: "",
    gender: "Male",
    qualification: "",
    adhaar: "",
    address: "",
    mobile: "",
    altnumber: "",
    course: "",
    date: new Date().toISOString().split("T")[0],
    totalPayment: 0,
    discount: 0,
    payment: 0,
    balance: 0,
    photo: null,
  });
  const [updateID, setUpdateID] = useState("");
  const [deleteID, setDeleteID] = useState("");

  const [photoPreview, setPhotoPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [deletemodalopen, setDeleteModalOpen] = useState(false);

  const [formErrors, setFormErrors] = useState({});

  //@ts-expect-error err
  const admindbstate = useSelector((state) => state.admin.db);

  // Filter students when search term changes
  useEffect(() => {
    if (searchTerm) {
      //@ts-expect-error err
      const filtered = students?.filter((student) =>
        Object.values(student).some(
          (value) =>
            value &&
            value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      setFilteredStudents(filtered);
      setCurrentPage(1);
    } else {
      setFilteredStudents(students);
    }
  }, [searchTerm, students]);

  // Sort students when sort column or direction changes
  useEffect(() => {
    //@ts-expect-error err
    const sorted = _.orderBy(filteredStudents, [sortColumn], [sortDirection]);
    //@ts-expect-error err
    setFilteredStudents(sorted);
  }, [sortColumn, sortDirection]);

  // Handle column sorting
  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // Handle search input change
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Get current students for pagination
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  //@ts-expect-error err
  const currentStudents = filteredStudents?.slice(
    indexOfFirstStudent,
    indexOfLastStudent
  );

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Handle photo upload
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size should be less than 5MB");
        return;
      }

      setNewStudent({
        ...newStudent,
        photo: file,
      });

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove photo
  const removePhoto = () => {
    setNewStudent({
      ...newStudent,
      photo: null,
    });
    setPhotoPreview(null);
  };

  // Handle input change for new student form
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "totalPayment" || name === "discount" || name === "payment") {
      const total =
        name === "totalPayment"
          ? parseFloat(value) || 0
          : //@ts-expect-error err
            parseFloat(newStudent.totalPayment) || 0;
      const discount =
        name === "discount"
          ? parseFloat(value) || 0
          : //@ts-expect-error err
            parseFloat(newStudent.discount) || 0;

      const payment =
        name === "payment"
          ? parseFloat(value) || 0
          : //@ts-expect-error err
            parseFloat(newStudent.payment) || 0;

      const balance = total - discount - payment;

      setNewStudent({
        ...newStudent,
        [name]: value,
        balance: balance >= 0 ? balance : 0,
      });
    } else {
      setNewStudent({
        ...newStudent,
        [name]: value,
      });
    }

    // Clear error when field is filled
    if (value && formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null,
      });
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    let isValid = true;

    if (!newStudent.firstName.trim()) {
      //@ts-expect-error err
      errors.firstName = "First name is required";
      isValid = false;
    }
    if (!newStudent.lastName.trim()) {
      //@ts-expect-error err
      errors.lastName = "Last name is required";
      isValid = false;
    }
    if (!newStudent.dob) {
      //@ts-expect-error err
      errors.dob = "Date of birth is required";
      isValid = false;
    }
    if (!newStudent.qualification.trim()) {
      //@ts-expect-error err
      errors.qualification = "Qualification is required";
      isValid = false;
    }
    if (!newStudent.adhaar.trim()) {
      //@ts-expect-error err
      errors.adhaar = "Aadhaar number is required";
      isValid = false;
    } else if (newStudent.adhaar.length !== 12) {
      //@ts-expect-error err
      errors.adhaar = "Aadhaar must be 12 digits";
      isValid = false;
    }
    if (!newStudent.address.trim()) {
      //@ts-expect-error err
      errors.address = "Address is required";
      isValid = false;
    }
    if (!newStudent.mobile.trim()) {
      //@ts-expect-error err
      errors.mobile = "Mobile number is required";
      isValid = false;
    } else if (newStudent.mobile.length !== 10) {
      //@ts-expect-error err
      errors.mobile = "Mobile must be 10 digits";
      isValid = false;
    }
    if (!newStudent.course.trim()) {
      //@ts-expect-error err
      errors.course = "Course is required";
      isValid = false;
    }
    if (!newStudent.photo) {
      //@ts-expect-error err
      errors.photo = "Photo is required";
      isValid = false;
    }
    if (newStudent.totalPayment <= 0) {
      //@ts-expect-error err
      errors.totalPayment = "Total payment must be greater than 0";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  // Populating values of student
  const HandleUpdate = (id) => {
    //@ts-expect-error err
    const filteredstudent = students?.filter((item) => item.student_id == id);

    //@ts-expect-error
    setNewStudent(filteredStudents[0]);
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!newStudent.student_id) {
      if (!validateForm()) {
        return;
      }
    }

    setIsLoading(true);

    try {
      const formData = new FormData();

      // Add all student data to FormData
      Object.keys(newStudent).forEach((key) => {
        if (key === "photo" && newStudent.photo) {
          formData.append("photo", newStudent.photo);
        } else {
          formData.append(key, newStudent[key]);
        }
      });

      formData.append("folder", admindbstate);
      formData.append("student_id", updateID);

      // Make API call with multipart/form-data
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}addupdatestudent`,
        formData
      );

      toast.success(response.data?.message);
      setShowAddForm(false);

      // Reset form
      setNewStudent({
        form_no: "",
        student_id: "",
        firstName: "",
        middleName: "",
        lastName: "",
        dob: "",
        gender: "Male",
        qualification: "",
        adhaar: "",
        address: "",
        mobile: "",
        altnumber: "",
        course: "",
        date: new Date().toISOString().split("T")[0],
        totalPayment: 0,
        discount: 0,
        payment: 0,
        balance: 0,
        photo: null,
      });
      setPhotoPreview(null);
      setFormErrors({});
      LoadData();
    } catch (error) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something Went Wrong");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      if (!deleteID) {
        return;
      }
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}deletestudent`,
        {
          payload: {
            db: admindbstate,
            student_id: deleteID,
          },
        }
      );

      toast.success(response.data?.message);
      LoadData();
    } catch (error) {
      console.error(error);
      if (error.response.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something Went Wrong");
      }
    } finally {
      setDeleteID("");
      setDeleteModalOpen(false);
    }
  };

  // Handle export to Excel
  const importToExcel = async (data) => {
    try {
      const students = await handleExcelDataUpload(data);

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}addmultiplestudents`,
        {
          payload: {
            students: students,
            db: admindbstate,
          },
        }
      );

      toast.success(response.data.message);
    } catch (error) {
      console.error(error);
      if (error.response.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something Went Wrong");
      }
    }
  };

  const LoadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}getstudents`,
        {
          params: { db: admindbstate },
        }
      );

      setStudents(response.data.payload);
      setFilteredStudents(response.data.payload);
    } catch (error) {
      console.error("Error fetching students:", error);
      //@ts-expect-error err
      setStudents([]);
      //@ts-expect-error err
      setFilteredStudents([]);
    } finally {
      setIsLoading(false);
    }
  }, [admindbstate]);

  useEffect(() => {
    LoadData();
  }, [LoadData]);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Students Management</h2>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search students..."
              className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={handleSearch}
            />
            <Search
              className="absolute left-3 top-2.5 text-gray-400"
              size={18}
            />
          </div>
          <button
            onClick={() => setExcelUploadOpen(true)}
            className="flex items-center space-x-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
          >
            <Download size={18} />
            <span>Import Excel</span>
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            <Plus size={18} />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {/* Student Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th
                className="py-2 px-4 border-b cursor-pointer"
                onClick={() => handleSort("id")}
              >
                <div className="flex items-center">
                  <span>ID</span>
                  {sortColumn === "id" && (
                    <span className="ml-1">
                      {sortDirection === "asc" ? (
                        <ArrowUp size={14} />
                      ) : (
                        <ArrowDown size={14} />
                      )}
                    </span>
                  )}
                </div>
              </th>

              <th
                className="py-2 px-4 border-b cursor-pointer"
                onClick={() => handleSort("firstName")}
              >
                <div className="flex items-center">
                  <span>Name</span>
                  {sortColumn === "firstName" && (
                    <span className="ml-1">
                      {sortDirection === "asc" ? (
                        <ArrowUp size={14} />
                      ) : (
                        <ArrowDown size={14} />
                      )}
                    </span>
                  )}
                </div>
              </th>
              <th
                className="py-2 px-4 border-b cursor-pointer"
                onClick={() => handleSort("course")}
              >
                <div className="flex items-center">
                  <span>Course</span>
                  {sortColumn === "course" && (
                    <span className="ml-1">
                      {sortDirection === "asc" ? (
                        <ArrowUp size={14} />
                      ) : (
                        <ArrowDown size={14} />
                      )}
                    </span>
                  )}
                </div>
              </th>
              <th
                className="py-2 px-4 border-b cursor-pointer"
                onClick={() => handleSort("mobile")}
              >
                <div className="flex items-center">
                  <span>Mobile</span>
                  {sortColumn === "mobile" && (
                    <span className="ml-1">
                      {sortDirection === "asc" ? (
                        <ArrowUp size={14} />
                      ) : (
                        <ArrowDown size={14} />
                      )}
                    </span>
                  )}
                </div>
              </th>
              <th
                className="py-2 px-4 border-b cursor-pointer"
                onClick={() => handleSort("date")}
              >
                <div className="flex items-center">
                  <span>Date</span>
                  {sortColumn === "date" && (
                    <span className="ml-1">
                      {sortDirection === "asc" ? (
                        <ArrowUp size={14} />
                      ) : (
                        <ArrowDown size={14} />
                      )}
                    </span>
                  )}
                </div>
              </th>
              <th
                className="py-2 px-4 border-b cursor-pointer"
                onClick={() => handleSort("totalPayment")}
              >
                <div className="flex items-center">
                  <span>Total</span>
                  {sortColumn === "totalPayment" && (
                    <span className="ml-1">
                      {sortDirection === "asc" ? (
                        <ArrowUp size={14} />
                      ) : (
                        <ArrowDown size={14} />
                      )}
                    </span>
                  )}
                </div>
              </th>
              <th
                className="py-2 px-4 border-b cursor-pointer"
                onClick={() => handleSort("balance")}
              >
                <div className="flex items-center">
                  <span>Balance</span>
                  {sortColumn === "balance" && (
                    <span className="ml-1">
                      {sortDirection === "asc" ? (
                        <ArrowUp size={14} />
                      ) : (
                        <ArrowDown size={14} />
                      )}
                    </span>
                  )}
                </div>
              </th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentStudents?.map((student) => (
              <tr key={student.student_id} className="hover:bg-gray-50">
                <td className="py-3 px-4 border-b">{student.student_id}</td>

                <td className="py-3 px-4 border-b">
                  {student.firstName}{" "}
                  {student.middleName && student.middleName + " "}
                  {student.lastName}
                </td>
                <td className="py-3 px-4 border-b">{student.course}</td>
                <td className="py-3 px-4 border-b">{student.mobile}</td>
                <td className="py-3 px-4 border-b">{student.date}</td>
                <td className="py-3 px-4 border-b">₹{student.totalPayment}</td>
                <td className="py-3 px-4 border-b">₹{student.balance}</td>
                <td className="py-3 px-4 border-b">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setShowAddForm(true);
                        HandleUpdate(student.student_id);
                      }}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => {
                        setDeleteModalOpen(true);
                        setDeleteID(student.student_id);
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            <ExcelUpload
              isOpen={exceluploadopen}
              onClose={setExcelUploadOpen}
              onImport={importToExcel}
            />
            {deletemodalopen && (
              <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg shadow-xl max-w-md w-full transform transition-all">
                  {/* Modal Header */}
                  <div className="flex items-center justify-between p-6 border-b">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <Trash2 className="w-5 h-5 text-red-600" />
                      </div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        Confirm Deletion
                      </h2>
                    </div>
                    <button
                      onClick={() => setDeleteModalOpen(false)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                      disabled={isLoading}
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {/* Modal Body */}
                  <div className="p-6">
                    <p className="text-gray-600 mb-2">
                      Are you sure you want to delete this item?
                    </p>
                    <p className="text-sm text-gray-500">
                      This action cannot be undone. The item will be permanently
                      removed from your account.
                    </p>
                  </div>

                  {/* Modal Footer */}
                  <div className="flex gap-3 p-6 border-t bg-gray-50 rounded-b-lg">
                    <button
                      onClick={() => setDeleteModalOpen(false)}
                      disabled={isLoading}
                      className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={isLoading}
                      className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Deleting...
                        </>
                      ) : (
                        "Delete"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
            {currentStudents?.length === 0 && (
              <tr>
                <td colSpan={9} className="py-4 text-center text-gray-500">
                  No students found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-gray-500">
          Showing {indexOfFirstStudent + 1} to{" "}
          {Math.min(indexOfLastStudent, filteredStudents?.length)} of{" "}
          {filteredStudents?.length} entries
        </div>
        <div className="flex space-x-1">
          {Array.from(
            //@ts-expect-error err
            { length: Math.ceil(filteredStudents?.length / studentsPerPage) },
            (_, i) => (
              <button
                key={i}
                onClick={() => paginate(i + 1)}
                className={`px-3 py-1 border ${
                  currentPage === i + 1
                    ? "bg-blue-500 text-white"
                    : "bg-white text-gray-500"
                } rounded`}
              >
                {i + 1}
              </button>
            )
          )}
        </div>
      </div>

      {/* Add Student Form (Modal) */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Add New Student</h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Photo Upload Section */}
              <div className="md:col-span-3 mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Student Photo <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-6">
                  <div className="relative">
                    {photoPreview ? (
                      <div className="relative w-24 h-24">
                        <button
                          type="button"
                          onClick={removePhoto}
                          className="absolute self-end -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                        >
                          <X size={16} />
                        </button>
                        <img
                          src={photoPreview}
                          alt="Student Preview"
                          className="h-full w-full object-cover rounded-full border-2 border-gray-300"
                        />
                      </div>
                    ) : (
                      <div className="w-20 h-20 bg-gray-100 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center">
                        <User size={32} className="text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div>
                    <input
                      type="file"
                      id="photo"
                      name="photo"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                      required
                    />
                    <label
                      htmlFor="photo"
                      className="flex items-center space-x-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-100"
                    >
                      <Upload size={16} />
                      <span>Upload Photo</span>
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      JPG, PNG or GIF. Max size 5MB
                    </p>
                    {formErrors.photo && (
                      <p className="text-xs text-red-500 mt-1">
                        {formErrors.photo}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={newStudent.firstName}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border ${
                    formErrors.firstName ? "border-red-500" : "border-gray-300"
                  } rounded-md`}
                  placeholder="First Name"
                  required
                />
                {formErrors.firstName && (
                  <p className="text-xs text-red-500 mt-1">
                    {formErrors.firstName}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Middle Name
                </label>
                <input
                  type="text"
                  name="middleName"
                  value={newStudent.middleName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Middle Name (Optional)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={newStudent.lastName}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border ${
                    formErrors.lastName ? "border-red-500" : "border-gray-300"
                  } rounded-md`}
                  placeholder="Last Name"
                  required
                />
                {formErrors.lastName && (
                  <p className="text-xs text-red-500 mt-1">
                    {formErrors.lastName}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="dob"
                  value={newStudent.dob}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border ${
                    formErrors.dob ? "border-red-500" : "border-gray-300"
                  } rounded-md`}
                  required
                />
                {formErrors.dob && (
                  <p className="text-xs text-red-500 mt-1">{formErrors.dob}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  name="gender"
                  value={newStudent.gender}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Qualification <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="qualification"
                  value={newStudent.qualification}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border ${
                    formErrors.qualification
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded-md`}
                  placeholder="Qualification"
                  required
                />
                {formErrors.qualification && (
                  <p className="text-xs text-red-500 mt-1">
                    {formErrors.qualification}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Aadhaar Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="adhaar"
                  value={newStudent.adhaar}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border ${
                    formErrors.adhaar ? "border-red-500" : "border-gray-300"
                  } rounded-md`}
                  placeholder="12-digit Aadhaar Number"
                  required
                />
                {formErrors.adhaar && (
                  <p className="text-xs text-red-500 mt-1">
                    {formErrors.adhaar}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="mobile"
                  value={newStudent.mobile}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border ${
                    formErrors.mobile ? "border-red-500" : "border-gray-300"
                  } rounded-md`}
                  placeholder="10-digit Mobile Number"
                  required
                />
                {formErrors.mobile && (
                  <p className="text-xs text-red-500 mt-1">
                    {formErrors.mobile}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alternative Number
                </label>
                <input
                  type="text"
                  name="altnumber"
                  value={newStudent.altnumber}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Alternative Number (Optional)"
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="address"
                  value={newStudent.address}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border ${
                    formErrors.address ? "border-red-500" : "border-gray-300"
                  } rounded-md`}
                  placeholder="Full Address"
                  rows={2}
                  required
                ></textarea>
                {formErrors.address && (
                  <p className="text-xs text-red-500 mt-1">
                    {formErrors.address}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="course"
                  value={newStudent.course}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border ${
                    formErrors.course ? "border-red-500" : "border-gray-300"
                  } rounded-md`}
                  placeholder="Course Name"
                  required
                />
                {formErrors.course && (
                  <p className="text-xs text-red-500 mt-1">
                    {formErrors.course}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Admission Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="date"
                  value={newStudent.date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Payment (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="totalPayment"
                  value={newStudent.totalPayment}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border ${
                    formErrors.totalPayment
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded-md`}
                  placeholder="Total Course Fee"
                  required
                  min="1"
                />
                {formErrors.totalPayment && (
                  <p className="text-xs text-red-500 mt-1">
                    {formErrors.totalPayment}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount (₹)
                </label>
                <input
                  type="number"
                  name="discount"
                  value={newStudent.discount}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Discount Amount"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Made (₹)
                </label>
                <input
                  type="number"
                  name="payment"
                  value={newStudent.payment}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Payment Made"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Balance (₹)
                </label>
                <input
                  type="number"
                  name="balance"
                  value={newStudent.balance}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                  placeholder="Balance Amount"
                  disabled
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </div>
                ) : (
                  "Save Student"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      <ToastContainer />
    </div>
  );
}
