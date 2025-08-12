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
  Printer,
  Tag,
} from "lucide-react";
import axios from "axios";
import { useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Student {
  student_id: number;
  studentName: string;
  mobile: string;
  altnumber: string;
  admissionDate: string;
  totalFees: number;
  paidFees: number;
  balanceFees: number;
  dueDate: string | null;
  dueAmount: number;
  status: "fully-paid" | "partially-paid" | "overdue";
  paymentPlan: string;
}

interface FeePayment {
  _id: string;
  student_id: number;
  receiptno: number;
  amount: number;
  paymentmode: string;
  chequeNo: string;
  remark: string;
  fee_id: number;
  date: string;
}

interface Exemption {
  month: string;
  amount: string;
  reason: string;
}

interface Discount {
  _id: string;
  newDiscountId: number;
  student_id: number;
  discount: number;
  remark: string;
}

interface Installment {
  amount: number;
  dueDate: string;
  installmentno: number;
}

interface FeeHistoryResponse {
  fees: FeePayment[];
  installments: Installment[];
  exemptions: Exemption[];
  discounts: Discount[];
}

interface HistoryItem {
  id: string;
  date: string;
  amount: number;
  type: "fee" | "exemption" | "discount";
  description: string;
  paymentMode?: string;
  receiptno?: number;
}

interface Course {
  id: string;
  courseName: string;
  pendingCount: number;
  students: Student[];
  statusCounts?: {
    overdue: number;
    "partially-paid": number;
    "fully-paid": number;
  };
}

interface PaymentData {
  amount: string;
  paymentmode: string;
  chequeNo: string;
  remark: string;
  selectedInstallments: {
    installmentno: number;
    amount: number;
  }[];
}

const Feesection = () => {
  // State management
  const [courseloading, setCourseLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [feeHistoryData, setFeeHistoryData] = useState<FeeHistoryResponse>({
    fees: [],
    installments: [],
    exemptions: [],
    discounts: [],
  });
  const [combinedHistory, setCombinedHistory] = useState<HistoryItem[]>([]);
  const [sortFilter, setSortFilter] = useState<
    "all" | "fully-paid" | "partially-paid" | "overdue"
  >("all");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loadingFeeHistory, setLoadingFeeHistory] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 10;

  const [loadingStudents, setLoadingStudents] = useState(false);
  const [resendingReceipt, setResendingReceipt] = useState<number | null>(null);

  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentData>({
    amount: "",
    paymentmode: "",
    chequeNo: "",
    remark: "",
    selectedInstallments: [],
  });

  // Add to your state
  const [showExemptionModal, setShowExemptionModal] = useState(false);
  const [exemptionData, setExemptionData] = useState({
    reason: "",
    selectedInstallments: [] as {
      installmentno: number;
      amount: number;
      dueDate: string;
    }[],
  });

  const [processingPayment, setProcessingPayment] = useState(false);

  const admindbstate = useSelector((state: any) => state.admin.db);

  const LoadData = async () => {
    try {
      setLoadingStudents(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}getpendingfeepercourse`,
        { params: { db: admindbstate } }
      );

      setCourses(response.data.payload);
    } catch (error) {
      toast.error("Failed to load fee data");
    } finally {
      setLoadingStudents(false);
      setCourseLoading(false);
    }
  };

  const getNextDueInfo = (
    installments: Installment[],
    paidInstallments: { installmentno: number; amount: number }[]
  ) => {
    // Create a map of paid amounts for each installment
    const paidMap = new Map<number, number>();
    paidInstallments.forEach((pi) => {
      paidMap.set(
        pi.installmentno,
        (paidMap.get(pi.installmentno) || 0) + pi.amount
      );
    });

    // Find the next unpaid or partially paid installment
    const nextDue = installments
      .map((inst) => {
        const paidAmount = paidMap.get(inst.installmentno) || 0;
        return {
          ...inst,
          remainingAmount: inst.amount - paidAmount,
        };
      })
      .filter((inst) => inst.remainingAmount > 0)
      .sort(
        (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      )[0];

    return {
      dueDate: nextDue?.dueDate || null,
      dueAmount: nextDue?.remainingAmount || 0,
    };
  };

  const loadFeeHistory = async (studentId: string) => {
    try {
      setLoadingFeeHistory(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}getfeehistoryofstudent`,
        { params: { db: admindbstate, student_id: studentId } }
      );

      const historyData = response.data.payload || {
        fees: [],
        installments: [],
        exemptions: [],
        discounts: [],
      };

      setFeeHistoryData(historyData);
      processCombinedHistory(historyData);
    } catch (error) {
      toast.error("Failed to load fee history");
    } finally {
      setLoadingFeeHistory(false);
    }
  };

  const processCombinedHistory = (data: FeeHistoryResponse) => {
    const combined: HistoryItem[] = [];

    if (data?.fees?.length > 0) {
      // Add fee payments
      data?.fees.forEach((fee) => {
        combined.push({
          id: fee._id,
          date: fee.date,
          amount: fee.amount,
          type: "fee",
          description: fee.remark || "Fee Payment",
          paymentMode: fee.paymentmode,
          receiptno: fee.receiptno,
        });
      });
    }

    // Add exemptions
    if (data?.exemptions?.length > 0) {
      data?.exemptions.forEach((exemption, index) => {
        combined.push({
          id: `exemption_${index}`,
          date: new Date().toISOString(),
          amount: parseFloat(exemption.amount),
          type: "exemption",
          description: `${exemption.reason}`,
        });
      });
    }

    if (data?.discounts?.length > 0) {
      data?.discounts.forEach((discount) => {
        combined.push({
          id: discount._id,
          date: new Date().toISOString(),
          amount: discount.discount,
          type: "discount",
          description: discount.remark,
        });
      });
    }

    // Sort by date (newest first)
    combined.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    setCombinedHistory(combined);
  };

  // Effects
  useEffect(() => {
    if (admindbstate) LoadData();
  }, [admindbstate]);

  // Navigation handlers
  const handleStudentClick = async (student: Student) => {
    setSelectedStudent(student);
    await loadFeeHistory(student.student_id.toString());
  };

  // Add this function in your component
  const handlePrintReceipt = async (receiptno: number) => {
    try {
      setProcessingPayment(true);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}printreceipt`,
        {
          db: admindbstate,
          receiptno,
        }
      );

      const receiptUrl = response.data.url;

      // Create a temporary link to download the PDF
      const link = document.createElement("a");
      link.href = receiptUrl;
      link.target = "_blank";
      link.download = `receipt_${receiptno}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Receipt downloaded successfully");
    } catch (error) {
      console.error("Error downloading receipt:", error);
      toast.error("Failed to download receipt");
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleBackToStudents = () => {
    setSelectedStudent(null);
    setFeeHistoryData({
      fees: [],
      installments: [],
      exemptions: [],
      discounts: [],
    });
    setCombinedHistory([]);
  };

  const handleBackToCourses = () => {
    setSelectedCourse(null);
    setSelectedStudent(null);
    setFeeHistoryData({
      fees: [],
      installments: [],
      exemptions: [],
      discounts: [],
    });
    setCombinedHistory([]);
    setSearchQuery("");
    setCurrentPage(1);
  };

  // Payment handlers
  const handlePayFeesClick = () => {
    setShowPaymentModal(true);
  };

  const handleFeePayment = async () => {
    if (!selectedStudent) return;

    const totalAmount = paymentData.selectedInstallments.reduce(
      (sum, inst) => sum + inst.amount,
      0
    );

    if (totalAmount <= 0) {
      toast.error("Please enter a valid payment amount");
      return;
    }

    setProcessingPayment(true);
    try {
      const payload = {
        student_id: selectedStudent.student_id,
        db: admindbstate,
        amount: totalAmount,
        paymentmode: paymentData.paymentmode,
        chequeNo: paymentData.chequeNo,
        remark: paymentData.remark,
        installments: paymentData.selectedInstallments.map((inst) => ({
          installmentno: inst.installmentno,
          amount: inst.amount,
        })),
      };

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}payfees`,
        { payload }
      );

      toast.success(response.data.message || "Payment recorded successfully!");

      // Calculate next due information
      const { dueDate, dueAmount } = getNextDueInfo(
        feeHistoryData.installments,
        paymentData.selectedInstallments
      );

      // Update local state
      setSelectedStudent((prev) => {
        if (!prev) return null;
        const newBalance = prev.balanceFees - totalAmount;
        return {
          ...prev,
          balanceFees: newBalance,
          status: newBalance <= 0 ? "fully-paid" : "partially-paid",
          dueDate,
          dueAmount,
        };
      });

      // Refresh data
      await loadFeeHistory(selectedStudent.student_id.toString());
      await LoadData();

      // Reset form
      setPaymentData({
        amount: "",
        paymentmode: "",
        chequeNo: "",
        remark: "",
        selectedInstallments: [],
      });
      setShowPaymentModal(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to record payment");
    } finally {
      setProcessingPayment(false);
    }
  };

  const ResendReceipt = async (receiptno: number) => {
    try {
      setResendingReceipt(receiptno);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}resendreceipt`,
        {
          db: admindbstate,
          receiptno,
        }
      );
      toast.success(response.data?.message || "Receipt Sent Successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to resend receipt");
    } finally {
      setResendingReceipt(null);
    }
  };

  // Helper functions
  const getStatusBadge = (status: string) => {
    const badges = {
      "fully-paid": "bg-green-100 text-green-800",
      "partially-paid": "bg-yellow-100 text-yellow-800",
      overdue: "bg-red-100 text-red-800",
    };
    const labels = {
      "fully-paid": "Fully Paid",
      "partially-paid": "Partially Paid",
      overdue: "Overdue",
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

  const getTypeColor = (type: string) => {
    switch (type) {
      case "fee":
        return "text-green-600 bg-green-50";
      case "exemption":
        return "text-red-600 bg-red-50";
      case "discount":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "fee":
        return "Fee Payment";
      case "exemption":
        return "Exemption";
      case "discount":
        return "Discount";
      default:
        return "Unknown";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN");
  };

  const filteredStudents = selectedCourse
    ? selectedCourse.students.filter((student) => {
        const matchesFilter =
          sortFilter === "all" || student.status === sortFilter;
        const matchesSearch =
          student.studentName
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          student.mobile.includes(searchQuery);
        return matchesFilter && matchesSearch;
      })
    : [];

  // Calculate pagination
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(
    indexOfFirstStudent,
    indexOfLastStudent
  );
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleAddExemption = async () => {
    if (!selectedStudent) return;

    const totalAmount = exemptionData.selectedInstallments.reduce(
      (sum, inst) => sum + inst.amount,
      0
    );

    if (totalAmount <= 0) {
      toast.error("Please enter valid exemption amounts");
      return;
    }

    setProcessingPayment(true);
    try {
      const payload = {
        student_id: selectedStudent.student_id,
        db: admindbstate,
        reason: exemptionData.reason,
        amount: totalAmount,
        installments: exemptionData.selectedInstallments.map((inst) => ({
          installmentno: inst.installmentno,
          amount: inst.amount,
          dueDate: inst.dueDate,
        })),
      };

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}addexemption`,
        { payload }
      );

      toast.success(response.data.message || "Exemption added successfully!");

      // Calculate next due information
      const { dueDate, dueAmount } = getNextDueInfo(
        feeHistoryData.installments,
        exemptionData.selectedInstallments
      );

      // Update local state
      setSelectedStudent((prev) => {
        if (!prev) return null;
        const newBalance = prev.balanceFees - totalAmount;
        return {
          ...prev,
          balanceFees: newBalance,
          status: newBalance <= 0 ? "fully-paid" : "partially-paid",
          dueDate,
          dueAmount,
        };
      });

      // Refresh data
      await loadFeeHistory(selectedStudent.student_id.toString());
      await LoadData();

      // Reset form
      setExemptionData({
        reason: "",
        selectedInstallments: [],
      });
      setShowExemptionModal(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add exemption");
    } finally {
      setProcessingPayment(false);
    }
  };

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      {selectedStudent ? (
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
              <div className="flex flex-col">
                <span className="text-sm text-gray-600">
                  Total: ₹{selectedStudent.totalFees.toLocaleString()}
                </span>
                <span className="text-sm text-gray-600">
                  Balance: ₹{selectedStudent.balanceFees.toLocaleString()}
                </span>
                {selectedStudent.dueAmount > 0 && (
                  <span className="text-sm text-red-600">
                    Due: ₹{selectedStudent.dueAmount.toLocaleString()}
                    {selectedStudent.dueDate && (
                      <span> ({formatDate(selectedStudent.dueDate)})</span>
                    )}
                  </span>
                )}
              </div>
              {getStatusBadge(selectedStudent.status)}
              <button
                onClick={handlePayFeesClick}
                className="flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                <IndianRupee size={16} className="mr-1" />
                Pay Fees
              </button>
              <button
                onClick={() => setShowExemptionModal(true)}
                className="flex items-center px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                <Tag size={16} className="mr-1" />
                Add Exemption
              </button>
            </div>
          </div>

          {loadingFeeHistory ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : combinedHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 px-4 py-3 text-left font-semibold">
                      Date
                    </th>
                    <th className="border border-gray-200 px-4 py-3 text-left font-semibold">
                      Type
                    </th>
                    <th className="border border-gray-200 px-4 py-3 text-left font-semibold">
                      Amount
                    </th>
                    <th className="border border-gray-200 px-4 py-3 text-left font-semibold">
                      Description
                    </th>
                    <th className="border border-gray-200 px-4 py-3 text-left font-semibold">
                      Payment Mode
                    </th>
                    <th className="border border-gray-200 px-4 py-3 text-left font-semibold"></th>
                  </tr>
                </thead>
                <tbody>
                  {combinedHistory.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="border border-gray-200 px-4 py-3">
                        {formatDate(item.date)}
                      </td>
                      <td className="border border-gray-200 px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(
                            item.type
                          )}`}
                        >
                          {getTypeLabel(item.type)}
                        </span>
                      </td>
                      <td
                        className={`border border-gray-200 px-4 py-3 font-medium ${
                          item.type === "fee"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {item.type === "fee" ? "+" : "-"}₹
                        {item.amount.toLocaleString()}
                      </td>
                      <td className="border border-gray-200 px-4 py-3">
                        {item.description}
                      </td>
                      <td className="border border-gray-200 px-4 py-3">
                        {item.paymentMode || "-"}
                      </td>
                      <td className="border border-gray-200 px-4 py-3 flex justify-center items-center space-x-2">
                        {item.type === "fee" && item.receiptno ? (
                          <>
                            <button
                              onClick={() => ResendReceipt(item.receiptno)}
                              className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 flex items-center"
                              disabled={resendingReceipt === item.receiptno}
                            >
                              {resendingReceipt === item.receiptno ? (
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
                                  Sending...
                                </div>
                              ) : (
                                <span>Resend</span>
                              )}
                            </button>
                            <button
                              onClick={() => handlePrintReceipt(item.receiptno)}
                              className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 flex items-center"
                              disabled={processingPayment}
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
                                <>
                                  <Printer size={16} className="mr-1" />
                                  <span>Print</span>
                                </>
                              )}
                            </button>
                          </>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
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
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">
                    Pay Fees for {selectedStudent?.studentName}
                  </h3>
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={20} />
                  </button>
                </div>
                23
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left Column - Payment Details */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Student ID
                      </label>
                      <input
                        type="text"
                        value={selectedStudent?.student_id || ""}
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
                          setPaymentData({
                            ...paymentData,
                            amount: e.target.value,
                          })
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
                          setPaymentData({
                            ...paymentData,
                            remark: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="e.g. June and July Installments"
                      />
                    </div>
                  </div>

                  {/* Right Column - Installments */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Apply Payment To:
                    </label>
                    <div className="border rounded-md p-2 h-[280px] overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {feeHistoryData.installments.map((installment, index) => (
                        <div
                          key={index}
                          className={`p-2 rounded border ${
                            paymentData.selectedInstallments.some(
                              (i) =>
                                i.installmentno === installment.installmentno
                            )
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200"
                          }`}
                        >
                          <div className="flex items-start">
                            <input
                              type="checkbox"
                              id={`installment-${index}`}
                              checked={paymentData.selectedInstallments.some(
                                (i) =>
                                  i.installmentno === installment.installmentno
                              )}
                              onChange={(e) => {
                                const newSelection = e.target.checked
                                  ? [
                                      ...paymentData.selectedInstallments,
                                      {
                                        installmentno:
                                          installment.installmentno,
                                        amount: installment.amount,
                                      },
                                    ]
                                  : paymentData.selectedInstallments.filter(
                                      (i) =>
                                        i.installmentno !==
                                        installment.installmentno
                                    );
                                setPaymentData({
                                  ...paymentData,
                                  selectedInstallments: newSelection,
                                });
                              }}
                              className="mt-1 mr-2"
                            />
                            <div className="flex-1">
                              <label
                                htmlFor={`installment-${index}`}
                                className="block font-medium"
                              >
                                {formatDate(installment.dueDate)}
                              </label>
                              <div className="flex items-center justify-between mt-1">
                                <span className="font-medium">
                                  ₹{installment.amount}
                                </span>
                                {installment.dueDate &&
                                  new Date(installment.dueDate) <
                                    new Date() && (
                                    <span className="ml-2 text-red-500 text-xs">
                                      (Overdue)
                                    </span>
                                  )}
                              </div>
                              {paymentData.selectedInstallments.some(
                                (i) =>
                                  i.installmentno === installment.installmentno
                              ) && (
                                <div className="mt-2">
                                  <label className="block text-xs text-gray-600 mb-1">
                                    Amount to pay:
                                  </label>
                                  <input
                                    type="number"
                                    min="0"
                                    max={installment.amount}
                                    value={
                                      paymentData.selectedInstallments.find(
                                        (i) =>
                                          i.installmentno ===
                                          installment.installmentno
                                      )?.amount || ""
                                    }
                                    onChange={(e) => {
                                      const newInstallments = [
                                        ...paymentData.selectedInstallments,
                                      ];
                                      const installmentIndex =
                                        newInstallments.findIndex(
                                          (i) =>
                                            i.installmentno ===
                                            installment.installmentno
                                        );
                                      if (installmentIndex !== -1) {
                                        newInstallments[
                                          installmentIndex
                                        ].amount = parseFloat(e.target.value);
                                        setPaymentData({
                                          ...paymentData,
                                          selectedInstallments: newInstallments,
                                        });
                                      }
                                    }}
                                    className="w-full px-2 py-1 text-sm border rounded"
                                    placeholder="Enter amount"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
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
          {/* Exemption Modal - similar to payment modal */}
          {showExemptionModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">
                    Add Exemption for {selectedStudent?.studentName}
                  </h3>
                  <button
                    onClick={() => {
                      setShowExemptionModal(false);
                      setExemptionData({
                        reason: "",
                        selectedInstallments: [],
                      });
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left Column - Reason */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Reason <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={exemptionData.reason}
                        onChange={(e) =>
                          setExemptionData({
                            ...exemptionData,
                            reason: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="Enter reason for exemption"
                      />
                    </div>
                  </div>

                  {/* Right Column - Installments (same as payment modal) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Months to Exempt:
                    </label>
                    <div className="border rounded-md p-2 h-[280px] overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {feeHistoryData.installments.map((installment, index) => (
                        <div
                          key={index}
                          className={`p-2 rounded border ${
                            exemptionData.selectedInstallments.some(
                              (i) =>
                                i.installmentno === installment.installmentno
                            )
                              ? "border-red-500 bg-red-50"
                              : "border-gray-200"
                          }`}
                        >
                          <div className="flex items-start">
                            <input
                              type="checkbox"
                              id={`exempt-installment-${index}`}
                              checked={exemptionData.selectedInstallments.some(
                                (i) =>
                                  i.installmentno === installment.installmentno
                              )}
                              onChange={(e) => {
                                const newSelection = e.target.checked
                                  ? [
                                      ...exemptionData.selectedInstallments,
                                      {
                                        installmentno:
                                          installment.installmentno,
                                        amount: installment.amount,
                                        dueDate: installment.dueDate,
                                      },
                                    ]
                                  : exemptionData.selectedInstallments.filter(
                                      (i) =>
                                        i.installmentno !==
                                        installment.installmentno
                                    );
                                setExemptionData({
                                  ...exemptionData,
                                  selectedInstallments: newSelection,
                                });
                              }}
                              className="mt-1 mr-2"
                            />
                            <div className="flex-1">
                              <label
                                htmlFor={`exempt-installment-${index}`}
                                className="block font-medium"
                              >
                                {formatDate(installment.dueDate)}
                              </label>
                              <div className="flex items-center justify-between mt-1">
                                <span className="font-medium">
                                  ₹{installment.amount}
                                </span>
                                {installment.dueDate &&
                                  new Date(installment.dueDate) <
                                    new Date() && (
                                    <span className="ml-2 text-red-500 text-xs">
                                      (Overdue)
                                    </span>
                                  )}
                              </div>
                              {exemptionData.selectedInstallments.some(
                                (i) =>
                                  i.installmentno === installment.installmentno
                              ) && (
                                <div className="mt-2">
                                  <label className="block text-xs text-gray-600 mb-1">
                                    Exemption Amount:
                                  </label>
                                  <input
                                    type="number"
                                    min="0"
                                    max={installment.amount}
                                    value={
                                      exemptionData.selectedInstallments.find(
                                        (i) =>
                                          i.installmentno ===
                                          installment.installmentno
                                      )?.amount || ""
                                    }
                                    onChange={(e) => {
                                      const newInstallments = [
                                        ...exemptionData.selectedInstallments,
                                      ];
                                      const installmentIndex =
                                        newInstallments.findIndex(
                                          (i) =>
                                            i.installmentno ===
                                            installment.installmentno
                                        );
                                      if (installmentIndex !== -1) {
                                        newInstallments[
                                          installmentIndex
                                        ].amount = parseFloat(e.target.value);
                                        setExemptionData({
                                          ...exemptionData,
                                          selectedInstallments: newInstallments,
                                        });
                                      }
                                    }}
                                    className="w-full px-2 py-1 text-sm border rounded"
                                    placeholder="Enter amount"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowExemptionModal(false);
                      setExemptionData({
                        reason: "",
                        selectedInstallments: [],
                      });
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddExemption}
                    disabled={
                      exemptionData.selectedInstallments.length === 0 ||
                      !exemptionData.reason
                    }
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50"
                  >
                    Add Exemption
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : selectedCourse ? (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
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

            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <div className="flex items-center border rounded-lg px-3 py-2 w-full">
                  <Search size={16} className="text-gray-400 mr-2" />
                  <input
                    type="text"
                    placeholder="Search by name or phone..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="outline-none bg-transparent w-full"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setCurrentPage(1);
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
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
                      : "Overdue"}
                  </span>
                  <ChevronDown size={16} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-10">
                    {[
                      { value: "all", label: "All Students" },
                      { value: "fully-paid", label: "Fully Paid" },
                      { value: "partially-paid", label: "Partially Paid" },
                      { value: "overdue", label: "Overdue" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSortFilter(option.value as any);
                          setDropdownOpen(false);
                          setCurrentPage(1);
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
                {loadingStudents ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="border border-gray-200 px-4 py-8 text-center"
                    >
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                      </div>
                    </td>
                  </tr>
                ) : currentStudents.length > 0 ? (
                  currentStudents.map((student) => (
                    <tr
                      key={student.student_id}
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
                      No students found for the selected filter or search query.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {indexOfFirstStudent + 1} to{" "}
                {Math.min(indexOfLastStudent, filteredStudents.length)} of{" "}
                {filteredStudents.length} students
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1 border rounded-md ${
                        currentPage === page
                          ? "bg-blue-500 text-white border-blue-500"
                          : "border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Fee Status</h2>
          </div>

          {courseloading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Overdue:</span>
                        <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                          {course.statusCounts?.overdue || 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          Partially Paid:
                        </span>
                        <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                          {course.statusCounts?.["partially-paid"] || 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          Fully Paid:
                        </span>
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                          {course.statusCounts?.["fully-paid"] || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center text-gray-500 py-8">
                  No courses found.
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default Feesection;
