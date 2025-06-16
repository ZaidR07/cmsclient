"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Calendar,
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
    email: "",
    course: "",
    date: new Date().toISOString().split("T")[0],
    totalPayment: 0,
    discount: 0,
    payment: 0,
    balance: 0,
    paymentmode: "",
    chequeNo: "",
    otherPaymentMode: "",
    photo: null,
  });
  const [update, setUpdate] = useState(false);
  const [deleteID, setDeleteID] = useState("");
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [deletemodalopen, setDeleteModalOpen] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const [paymentPlan, setPaymentPlan] = useState("full"); // 'full' or 'installment'
  const [installments, setInstallments] = useState([
    { amount: 0, dueDate: "" },
  ]);
  const [installmentFrequency, setInstallmentFrequency] = useState("monthly");

  //@ts-expect-error err
  const admindbstate = useSelector((state) => state.admin.db);

  const [courses, setCourses] = useState([]);

  const paymentmodes = ["UPI", "Cash", "Cheque", "Other"];

  const [numberOfInstallments, setNumberOfInstallments] = useState(1);

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

  // Add this useEffect hook to your component
  useEffect(() => {
    if (paymentPlan === "installment" && newStudent.balance > 0) {
      // Calculate equal installment amounts
      const installmentAmount = Math.floor(
        newStudent.balance / numberOfInstallments
      );
      const remainder = newStudent.balance % numberOfInstallments;

      // Generate installments based on numberOfInstallments
      const calculatedInstallments = Array.from(
        { length: numberOfInstallments },
        (_, index) => ({
          amount:
            index === 0 ? installmentAmount + remainder : installmentAmount,
          dueDate:
            calculateDueDates(
              newStudent.date,
              installmentFrequency,
              numberOfInstallments
            )[index] || "",
          description: `Installment ${index + 1}`,
        })
      );

      setInstallments(calculatedInstallments);
    } else {
      // If not in installment mode or no balance, reset to single installment
      setInstallments([{ amount: 0, dueDate: "" }]);
    }
  }, [
    newStudent.balance,
    paymentPlan,
    installmentFrequency,
    newStudent.date,
    numberOfInstallments,
  ]);

  // Update the calculateDueDates function to accept count parameter
  const calculateDueDates = (startDate, frequency, count) => {
    const dates = [];
    const date = new Date(startDate);

    for (let i = 0; i < count; i++) {
      const newDate = new Date(date);
      if (frequency === "monthly") {
        newDate.setMonth(date.getMonth() + i + 1);
      } else if (frequency === "bimonthly") {
        newDate.setMonth(date.getMonth() + (i + 1) * 2);
      } else if (frequency === "quarterly") {
        newDate.setMonth(date.getMonth() + (i + 1) * 3);
      }
      dates.push(newDate.toISOString().split("T")[0]);
    }
    return dates;
  };

  // Handle input change for new student form
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "totalPayment" || name === "discount" || name === "payment") {
      const total =
        name === "totalPayment"
          ? parseFloat(value) || 0
          : parseFloat(newStudent.totalPayment) || 0;
      const discount =
        name === "discount"
          ? parseFloat(value) || 0
          : parseFloat(newStudent.discount) || 0;
      const payment =
        name === "payment"
          ? parseFloat(value) || 0
          : parseFloat(newStudent.payment) || 0;

      const balance = total - discount - payment;

      setNewStudent({
        ...newStudent,
        [name]: value,
        balance: balance >= 0 ? balance : 0,
      });
    } else if (name === "paymentmode") {
      setNewStudent({
        ...newStudent,
        [name]: value,
        chequeNo: value === "Cheque" ? newStudent.chequeNo : "",
        otherPaymentMode: value === "Other" ? newStudent.otherPaymentMode : "",
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
    if (!newStudent.email) {
      //@ts-expect-error err
      errors.email = "Email is required";
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
    if (newStudent.paymentmode === "Cheque" && !newStudent.chequeNo.trim()) {
      //@ts-expect-error err
      errors.chequeNo = "Cheque number is required for Cheque payment";
      isValid = false;
    }
    if (
      newStudent.paymentmode === "Other" &&
      !newStudent.otherPaymentMode.trim()
    ) {
      //@ts-expect-error err
      errors.otherPaymentMode =
        "Payment mode name is required for Other payment";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  // Populating values of student
  const HandleUpdate = (id) => {
    //@ts-expect-error err
    const filteredStudents = students?.filter((item) => item.student_id == id);

    setUpdate(true);
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

      // Add installments as individual entries
      if (paymentPlan === "installment") {
        const validInstallments = installments.filter(
          (inst) => inst.amount > 0 && inst.dueDate
        );

        validInstallments.forEach((installment, index) => {
          formData.append(`installments[${index}][amount]`, installment.amount);
          formData.append(
            `installments[${index}][dueDate]`,
            installment.dueDate
          );
        });
      }
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
        email: "",
        course: "",
        date: new Date().toISOString().split("T")[0],
        totalPayment: 0,
        discount: 0,
        payment: 0,
        balance: 0,
        paymentmode: "",
        chequeNo: "",
        otherPaymentMode: "",
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
    setIsLoading(true);

    try {
      // Run both independently to avoid one failing the other
      const studentPromise = axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}getstudents`,
        {
          params: { db: admindbstate },
        }
      );

      const coursePromise = axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}getcourses`,
        {
          params: { db: admindbstate },
        }
      );

      const [studentsRes, coursesRes] = await Promise.allSettled([
        studentPromise,
        coursePromise,
      ]);

      // Handle students response
      if (studentsRes.status === "fulfilled") {
        const students = studentsRes.value.data?.payload || [];
        setStudents(students);
        setFilteredStudents(students);
      } else {
        console.error("Failed to fetch students:", studentsRes.reason);
        setStudents([]);
        setFilteredStudents([]);
      }

      // Handle courses response
      if (coursesRes.status === "fulfilled") {
        const courses = coursesRes.value.data?.payload || [];
        setCourses(courses);
      } else {
        console.error("Failed to fetch courses:", coursesRes.reason);
        setCourses([]);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [admindbstate]);

  useEffect(() => {
    LoadData();
  }, [LoadData]);

  return (
    <div className="bg-white  rounded-lg shadow-sm p-6">
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
            onClick={() => {
              setShowAddForm(true);
              setFormErrors({});
            }}
            className="flex items-center space-x-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            <Plus size={18} />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {/* Student Table */}
      <div className="overflow-x-scroll">
        <table className="min-w-full overflow-x-scroll border border-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="py-2 px-4 border-b cursor-pointer">
                <div className="flex items-center">
                  <span>ID</span>
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
              <th className="py-2 px-4 border-b cursor-pointer">
                <div className="flex items-center">
                  <span>Course</span>
                </div>
              </th>
              <th className="py-2 px-4 border-b cursor-pointer">
                <div className="flex items-center">
                  <span>Mobile</span>
                </div>
              </th>
              <th className="py-2 px-4 border-b cursor-pointer">
                <div className="flex items-center">
                  <span>Email</span>
                </div>
              </th>
              <th className="py-2 px-4 border-b cursor-pointer">
                <div className="flex items-center">
                  <span>Date</span>
                </div>
              </th>
              <th
                className="py-2 px-4 border-b cursor-pointer"
                onClick={() => handleSort("totalPayment")}
              >
                <div className="flex items-center">
                  <span>Total</span>
                </div>
              </th>
              <th className="py-2 px-4 border-b cursor-pointer">
                <div className="flex items-center">
                  <span>Balance</span>
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
                <td className="py-3 px-4 border-b">
                  {courses.find((item) => item.course_id == student.course)
                    ?.course_name ?? "N/A"}
                </td>

                <td className="py-3 px-4 border-b">{student.mobile}</td>
                <td className="py-3 px-4 border-b">{student.email}</td>
                <td className="py-3 px-4 border-b">{student.date}</td>
                <td className="py-3 px-4 border-b">₹{student.totalPayment}</td>
                <td className="py-3 px-4 border-b">₹{student.balance}</td>
                <td className="py-3 px-4 border-b">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setShowAddForm(true);
                        setFormErrors({});
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
              <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg shadow-xl max-w-md w-full transform transition-all">
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
                  <div className="p-6">
                    <p className="text-gray-600 mb-2">
                      Are you sure you want to delete this item?
                    </p>
                    <p className="text-sm text-gray-500">
                      This action cannot be undone. The item will be permanently
                      removed from your account.
                    </p>
                  </div>
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
                  Aadhaar Number
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email<span className="text-red-500">&nbsp;*</span>
                </label>
                <input
                  type="text"
                  name="email"
                  value={newStudent.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Email"
                  required
                />
                {formErrors.email && (
                  <p className="text-xs text-red-500 mt-1">
                    {formErrors.email}
                  </p>
                )}
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
                <select
                  className={`w-full px-2 py-2 border ${
                    formErrors.course ? "border-red-500" : "border-gray-300"
                  } rounded-md`}
                  placeholder="Course Name"
                  onChange={handleInputChange}
                  required
                  name="course"
                >
                  <option value="">Select a Course</option>
                  {courses?.length > 0 &&
                    courses.map((item, index) => (
                      <option key={index} value={item.course_id}>
                        {item.course_name}
                      </option>
                    ))}
                </select>
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
                  disabled={update}
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
                  disabled={update}
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
                  disabled={update}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Mode <span className="text-red-500">*</span>
                </label>
                <select
                  name="paymentmode"
                  value={newStudent.paymentmode}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border ${
                    formErrors.paymentmode
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded-md`}
                  required
                  disabled={update}
                >
                  <option value="">Select Payment Mode</option>
                  {paymentmodes.map((mode) => (
                    <option key={mode} value={mode}>
                      {mode}
                    </option>
                  ))}
                </select>
                {formErrors.paymentmode && (
                  <p className="text-xs text-red-500 mt-1">
                    {formErrors.paymentmode}
                  </p>
                )}
              </div>
              {newStudent.paymentmode === "Cheque" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cheque Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="chequeNo"
                    value={newStudent.chequeNo}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${
                      formErrors.chequeNo ? "border-red-500" : "border-gray-300"
                    } rounded-md`}
                    placeholder="Enter Cheque Number"
                    required
                    disabled={update}
                  />
                  {formErrors.chequeNo && (
                    <p className="text-xs text-red-500 mt-1">
                      {formErrors.chequeNo}
                    </p>
                  )}
                </div>
              )}
              {newStudent.paymentmode === "Other" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Other Payment Mode <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="otherPaymentMode"
                    value={newStudent.otherPaymentMode}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${
                      formErrors.otherPaymentMode
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md`}
                    placeholder="Specify Payment Mode"
                    required
                    disabled={update}
                  />
                  {formErrors.otherPaymentMode && (
                    <p className="text-xs text-red-500 mt-1">
                      {formErrors.otherPaymentMode}
                    </p>
                  )}
                </div>
              )}
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

            <div className="md:col-span-3 border-t pt-4 mt-4">
              <h4 className="font-medium mb-3">Payment Plan</h4>
              <div className="flex gap-4 mb-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="paymentPlan"
                    checked={paymentPlan === "full"}
                    onChange={() => setPaymentPlan("full")}
                    className="mr-2"
                  />
                  Full Payment
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="paymentPlan"
                    checked={paymentPlan === "installment"}
                    onChange={() => setPaymentPlan("installment")}
                    className="mr-2"
                  />
                  Installment Payment
                </label>
              </div>

              {paymentPlan === "installment" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Number of Installments (Max 3)
                    </label>
                    <select
                      value={numberOfInstallments}
                      onChange={(e) => {
                        const count = parseInt(e.target.value);
                        setNumberOfInstallments(count);
                        // No need to set installments here since useEffect will handle it
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Installment Frequency
                    </label>
                    <select
                      value={installmentFrequency}
                      onChange={(e) => {
                        const frequency = e.target.value;
                        setInstallmentFrequency(frequency);
                        const dueDates = calculateDueDates(
                          newStudent.date,
                          frequency,
                          3
                        );
                        setInstallments((prevInstallments) =>
                          prevInstallments.map((inst, i) => ({
                            ...inst,
                            dueDate: dueDates[i] || "",
                          }))
                        );
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="monthly">Monthly</option>
                      <option value="bimonthly">
                        Bi-Monthly (Every 2 Months)
                      </option>
                      <option value="quarterly">
                        Quarterly (Every 3 Months)
                      </option>
                    </select>
                  </div>

                  {installments.map((installment, index) => (
                    <div key={index} className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Installment {index + 1} Amount (₹)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={installment.amount || ""}
                          onChange={(e) => {
                            setInstallments((prev) =>
                              prev.map((inst, i) =>
                                i === index
                                  ? {
                                      ...inst,
                                      amount: parseFloat(e.target.value) || 0,
                                    }
                                  : inst
                              )
                            );
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Due Date
                        </label>
                        <div className="relative">
                          <input
                            type="date"
                            value={installment.dueDate}
                            onChange={(e) => {
                              setInstallments((prev) =>
                                prev.map((inst, i) =>
                                  i === index
                                    ? { ...inst, dueDate: e.target.value }
                                    : inst
                                )
                              );
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            min={newStudent.date} // Can't be before admission date
                          />
                          <Calendar
                            className="absolute right-3 top-2.5 text-gray-400"
                            size={18}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
