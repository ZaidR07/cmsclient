/* eslint-disable */
// @ts-nocheck

"use client";
import React, { useState, useEffect } from "react";
import {
  Search,
  ArrowLeft,
  ChevronDown,
  FileText,
  IndianRupee,
  X,
} from "lucide-react";
import axios from "axios";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";

interface Student {
  id: string;
  student_id: string;
  studentName: string;
  mobile: string;
  admissionDate: string;
  totalFees: number;
  balanceFees: number;
  status: "fully-paid" | "partially-paid" | "due";
}

interface FeePayment {
  id: string;
  date: string;
  amount: number;
  paymentmode: string;
  remark: string;
}

interface Course {
  id: string;
  courseName: string;
  pendingCount: number;
  students: Student[];
}

const Feesection = () => {
  // State management
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [feeHistory, setFeeHistory] = useState<FeePayment[]>([]);
  const [sortFilter, setSortFilter] = useState<
    "all" | "fully-paid" | "partially-paid" | "due"
  >("all");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loadingFeeHistory, setLoadingFeeHistory] = useState(false);

  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState({
    amount: "",
    paymentmode: "",
    chequeNo: "",
    remark: "",
  });
  const [processingPayment, setProcessingPayment] = useState(false);

  const admindbstate = useSelector((state: any) => state.admin.db);

  // Data fetching functions
  const LoadData = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}getpendingfeepercourse`,
        { params: { db: admindbstate } }
      );
      setCourses(response.data.payload);
    } catch (error) {
      toast.error("Failed to load fee data");
    }
  };

  const loadFeeHistory = async (studentId: string) => {
    try {
      setLoadingFeeHistory(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}getfeehistoryofstudent`,
        { params: { db: admindbstate, student_id: studentId } }
      );
      setFeeHistory(response.data.payload || []);
    } catch (error) {
      toast.error("Failed to load fee history");
    } finally {
      setLoadingFeeHistory(false);
    }
  };

  // Effects
  useEffect(() => {
    if (admindbstate) LoadData();
  }, [admindbstate]);

  // Navigation handlers
  const handleStudentClick = async (student: Student) => {
    setSelectedStudent(student);
    await loadFeeHistory(student.student_id);
  };

  const handleBackToStudents = () => {
    setSelectedStudent(null);
    setFeeHistory([]);
  };

  const handleBackToCourses = () => {
    setSelectedCourse(null);
    setSelectedStudent(null);
    setFeeHistory([]);
  };

  // Payment handlers
  const handlePayFeesClick = () => {
    setShowPaymentModal(true);
  };

  const handleFeePayment = async () => {
    if (!selectedStudent || !paymentData.amount) return;

    setProcessingPayment(true);
    try {
      const payload = {
        student_id: selectedStudent.student_id,
        db: admindbstate,
        amount: parseFloat(paymentData.amount),
        paymentmode: paymentData.paymentmode,
        chequeNo: paymentData.chequeNo,
        remark: paymentData.remark,
      };

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}payfees`,
        { payload }
      );

      toast.success(response.data.message || "Payment recorded successfully!");

      // Update the local state immediately
      const paymentAmount = parseFloat(paymentData.amount);
      setSelectedStudent((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          balanceFees: prev.balanceFees - paymentAmount,
          status:
            prev.balanceFees - paymentAmount <= 0
              ? "fully-paid"
              : paymentAmount > 0
              ? "partially-paid"
              : prev.status,
        };
      });

      // Refresh data from server
      await loadFeeHistory(selectedStudent.student_id);
      await LoadData();

      // Reset form
      setPaymentData({
        amount: "",
        paymentmode: "",
        chequeNo: "",
        remark: "",
      });
      setShowPaymentModal(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to record payment");
    } finally {
      setProcessingPayment(false);
    }
  };

  const ResendReceipt = async (receiptno) => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}resendreceipt`,
        {
          db: admindbstate,
          receiptno,
        }
      );

      toast.success(response.data?.message || "Receipt Sent Successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to record payment");
    }
  };

  // Helper functions
  const getStatusBadge = (status: string) => {
    const badges = {
      "fully-paid": "bg-green-100 text-green-800",
      "partially-paid": "bg-yellow-100 text-yellow-800",
      due: "bg-red-100 text-red-800",
    };
    const labels = {
      "fully-paid": "Fully Paid",
      "partially-paid": "Partially Paid",
      due: "Due",
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          badges[status as keyof typeof badges]
        }`}
      >
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN");
  };

  const filteredStudents = selectedCourse
    ? selectedCourse.students.filter(
        (student) => sortFilter === "all" || student.status === sortFilter
      )
    : [];

  // Render student details view
  if (selectedStudent) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <button
              onClick={handleBackToStudents}
              className="mr-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <h2 className="text-xl font-semibold">
              Fee History - {selectedStudent.studentName}
            </h2>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Total Fees: ₹{selectedStudent.totalFees.toLocaleString()}
            </span>
            <span className="text-sm text-gray-600">
              Balance: ₹{selectedStudent.balanceFees.toLocaleString()}
            </span>
            {getStatusBadge(selectedStudent.status)}
            <button
              onClick={handlePayFeesClick}
              className="flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              <IndianRupee size={16} className="mr-1" />
              Pay Fees
            </button>
          </div>
        </div>

        {loadingFeeHistory ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : feeHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-200 px-4 py-3 text-left font-semibold">
                    Date
                  </th>
                  <th className="border border-gray-200 px-4 py-3 text-left font-semibold">
                    Amount
                  </th>
                  <th className="border border-gray-200 px-4 py-3 text-left font-semibold">
                    Payment Mode
                  </th>
                  <th className="border border-gray-200 px-4 py-3 text-left font-semibold">
                    Remarks
                  </th>
                  <th className="border border-gray-200 px-4 py-3 text-left font-semibold"></th>
                </tr>
              </thead>
              <tbody>
                {feeHistory.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="border border-gray-200 px-4 py-3">
                      {formatDate(payment.date)}
                    </td>
                    <td className="border border-gray-200 px-4 py-3">
                      ₹{payment.amount.toLocaleString()}
                    </td>
                    <td className="border border-gray-200 px-4 py-3">
                      {payment.paymentmode}
                    </td>
                    <td className="border border-gray-200 px-4 py-3">
                      {payment.remark || "-"}
                    </td>
                    <td className="border border-gray-200  flex justify-center py-4">
                      <button
                        onClick={() => ResendReceipt(payment.receiptno)}
                        className="bg-blue-500 text-white px-3 py-1 rounded-md"
                      >
                        Resend Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No fee history found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              This student has no recorded fee payments yet.
            </p>
          </div>
        )}

        {/* Payment Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  Pay Fees for {selectedStudent.studentName}
                </h3>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Student ID
                  </label>
                  <input
                    type="text"
                    value={selectedStudent.student_id}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={paymentData.amount}
                    onChange={(e) =>
                      setPaymentData({ ...paymentData, amount: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Enter amount"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Mode <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={paymentData.paymentmode}
                    onChange={(e) =>
                      setPaymentData({
                        ...paymentData,
                        paymentmode: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select an option</option>
                    <option value="UPI">UPI</option>
                    <option value="Cash">Cash</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Card">Card</option>
                  </select>
                </div>

                {paymentData.paymentmode === "Cheque" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cheque Number
                    </label>
                    <input
                      type="text"
                      value={paymentData.chequeNo}
                      onChange={(e) =>
                        setPaymentData({
                          ...paymentData,
                          chequeNo: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Enter cheque number"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Remarks
                  </label>
                  <input
                    type="text"
                    value={paymentData.remark}
                    onChange={(e) =>
                      setPaymentData({ ...paymentData, remark: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="e.g. 2nd Installment"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  disabled={processingPayment}
                >
                  Cancel
                </button>
                <button
                  onClick={handleFeePayment}
                  disabled={processingPayment || !paymentData.amount}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
                >
                  {processingPayment ? (
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
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Processing...
                    </div>
                  ) : (
                    "Submit Payment"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render course selection view
  if (selectedCourse) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <button
              onClick={handleBackToCourses}
              className="mr-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <h2 className="text-xl font-semibold">
              {selectedCourse.courseName} - Fee Details
            </h2>
          </div>

          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center px-4 py-2 bg-gray-50 border rounded-lg hover:bg-gray-100 transition-colors"
            >
              <span className="mr-2">
                {sortFilter === "all"
                  ? "All Students"
                  : sortFilter === "fully-paid"
                  ? "Fully Paid"
                  : sortFilter === "partially-paid"
                  ? "Partially Paid"
                  : "Due"}
              </span>
              <ChevronDown size={16} />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-10">
                {[
                  { value: "all", label: "All Students" },
                  { value: "fully-paid", label: "Fully Paid" },
                  { value: "partially-paid", label: "Partially Paid" },
                  { value: "due", label: "Due" },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSortFilter(option.value as any);
                      setDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-200 px-4 py-3 text-left font-semibold">
                  Student Name
                </th>
                <th className="border border-gray-200 px-4 py-3 text-left font-semibold">
                  Contact
                </th>
                <th className="border border-gray-200 px-4 py-3 text-left font-semibold">
                  Admission Date
                </th>
                <th className="border border-gray-200 px-4 py-3 text-left font-semibold">
                  Total Fees
                </th>
                <th className="border border-gray-200 px-4 py-3 text-left font-semibold">
                  Balance
                </th>
                <th className="border border-gray-200 px-4 py-3 text-left font-semibold">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr
                    key={student.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleStudentClick(student)}
                  >
                    <td className="border border-gray-200 px-4 py-3">
                      {student.studentName}
                    </td>
                    <td className="border border-gray-200 px-4 py-3">
                      {student.mobile}
                    </td>
                    <td className="border border-gray-200 px-4 py-3">
                      {formatDate(student.admissionDate)}
                    </td>
                    <td className="border border-gray-200 px-4 py-3">
                      ₹{student.totalFees.toLocaleString()}
                    </td>
                    <td className="border border-gray-200 px-4 py-3">
                      ₹{student.balanceFees.toLocaleString()}
                    </td>
                    <td className="border border-gray-200 px-4 py-3">
                      {getStatusBadge(student.status)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="border border-gray-200 px-4 py-8 text-center text-gray-500"
                  >
                    No students found for the selected filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Render initial course selection view
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Fee Status</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {courses.length > 0 ? (
          courses.map((course) => (
            <div
              key={course.id}
              onClick={() => setSelectedCourse(course)}
              className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 cursor-pointer hover:shadow-md hover:from-blue-100 hover:to-indigo-100 transition-all duration-200"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                {course.courseName}
              </h3>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Pending Fees:</span>
                <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                  {course.pendingCount}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center text-gray-500 py-8">
            No courses found.
          </div>
        )}
      </div>
      <ToastContainer/>
    </div>
  );
};

export default Feesection;
