/* eslint-disable */
// @ts-nocheck

"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Plus,
  ArrowUp,
  ArrowDown,
  X,
  CheckCircle,
  FileText,
  Award,
  Calendar,
  Tag,
} from "lucide-react";
import _ from "lodash";
import * as XLSX from "xlsx";
import axios from "axios";
import { useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { formatToDDMMYYYY } from "@/util/DateConverter";
import CertificateGenerationModal from "./Certificategenerationloader";

interface Option {
  id: string;
  value: string;
}

interface Question {
  qno: number;
  questionname: string;
  options: Option[];
  correct: string;
}

interface Exam {
  exam_id: string;
  exam_name: string;
  questions: Question[];
  status: string;
  password: string;
  created_date: string;
  participants?: any[];
}

type Exams = Exam[];

export default function ExamsManagement() {
  // State management
  const [exams, setExams] = useState<Exams>([]);
  const [filteredExams, setFilteredExams] = useState<Exams>([]);

  const [showExcelPreview, setShowExcelPreview] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [examsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState("exam_id");
  const [sortDirection, setSortDirection] = useState("asc");
  const [showAddForm, setShowAddForm] = useState(false);
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [currentExam, setCurrentExam] = useState<Exam | null>(null);
  const [participantSearchTerm, setParticipantSearchTerm] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [newExam, setNewExam] = useState({
    exam_name: "",
    questions: [] as Question[],
    status: "active",
  });
  const [examloading, setExamloading] = useState(false);
  const [isgeneratingcertificate, setISGeneratingCertificate] = useState(false);

  const admindbstate = useSelector((state: any) => state.admin.db);

  const LoadData = useCallback(async () => {
    setExamloading(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}getexams`,
        {
          params: { dbname: admindbstate },
        }
      );

      setExams(response.data.payload);
      setFilteredExams(response.data.payload);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setExamloading(false);
    }
  }, [admindbstate]);

  // Sample data for demonstration
  useEffect(() => {
    LoadData();
  }, [LoadData]);

  // Handle Excel file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const parsedData = XLSX.utils.sheet_to_json(sheet);

      // Process the Excel data into questions format
      const questions = parsedData.map((row: any) => {
        const options = [];
        for (let i = 1; i <= 4; i++) {
          const optionKey = `option${i}`;
          const optionId = String.fromCharCode(64 + i); // A, B, C, D
          if (row[optionKey]) {
            options.push({
              id: optionId,
              value: row[optionKey],
            });
          }
        }

        return {
          qno: row.qno || 0,
          questionname: row.question || "",
          options: options,
          correct: row.correct || "",
        };
      });
      // Store raw data for preview
      setNewExam((prev) => ({
        ...prev,
        questions: questions,
      }));
      setShowExcelPreview(true);
    };
    reader.readAsBinaryString(file);
  };

  // Filter exams when search term or status changes
  useEffect(() => {
    let filtered = exams;

    if (statusFilter !== "all") {
      filtered = filtered.filter((exam) => exam.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter((exam) =>
        exam.exam_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredExams(filtered);
    setCurrentPage(1);
  }, [searchTerm, exams, statusFilter]);

  // Sort exams when sort column or direction changes
  useEffect(() => {
    const sorted = _.orderBy(filteredExams, [sortColumn], [sortDirection]);
    setFilteredExams(sorted);
  }, [sortColumn, sortDirection]);

  // Handle column sorting
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // Handle search input change
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Pagination calculations
  const indexOfLastExam = currentPage * examsPerPage;
  const indexOfFirstExam = indexOfLastExam - examsPerPage;
  const currentExams = filteredExams.slice(indexOfFirstExam, indexOfLastExam);
  const totalPages = Math.ceil(filteredExams.length / examsPerPage);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Open participants modal
  const openParticipantsModal = async (exam: Exam) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}getexamparticipants`,
        {
          params: {
            exam_id: exam.exam_id,
            db: admindbstate,
          },
        }
      );

      setCurrentExam(response.data.payload);
      setParticipantSearchTerm("");
      setShowParticipantsModal(true);
    } catch (error) {
      console.log(error);
      setShowParticipantsModal(true);
    }
  };

  // Filter participants in modal
  const filteredParticipants =
    currentExam?.participants?.filter(
      (participant: any) =>
        participant.firstName
          .toLowerCase()
          .includes(participantSearchTerm.toLowerCase()) ||
        participant.lastName
          .toLowerCase()
          .includes(participantSearchTerm.toLowerCase())
    ) || [];

  // Handle input change for new exam form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewExam({
      ...newExam,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}createexam`,
        {
          payload: newExam,
          db: admindbstate,
        }
      );

      // Show toast
      toast.success(response.data.payload?.message);

      // Refresh data
      await LoadData();

      // Delay to allow toast to render
      setTimeout(() => {
        setShowAddForm(false);
        setShowExcelPreview(false);
        setNewExam({
          exam_name: "",
          questions: [],
          status: "active",
        });
      }, 1500);
    } catch (error) {
      console.error(error);

      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const generateCertificate = async (studentsArray, exam_id) => {
    setISGeneratingCertificate(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}generatecertificate`,
        {
          students: studentsArray,
          exam_id: exam_id,
          db: admindbstate,
        }
      );

      toast.success("Certificates generated successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate certificates");
    } finally {
      setISGeneratingCertificate(false);
    }
  };

  const Spinner = ({ size, className = "" }) => (
    <svg
      className={`animate-spin h-${size} w-${size} text-blue-500 ${className}`}
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
  );

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      <div className="flex justify-between items-center mb-6">
        {examloading && (
          <div className="absolute left-0 w-full top-[30vh] flex justify-center items-center">
            <Spinner size={20} />
          </div>
        )}
        <h2 className="text-xl font-semibold">Exams Management</h2>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search exams..."
              className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={handleSearch}
            />
            <Search
              className="absolute left-3 top-2.5 text-gray-400"
              size={18}
            />
          </div>
          <select
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="closed">Closed</option>
          </select>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            <Plus size={18} />
            <span>Create Exam</span>
          </button>
        </div>
      </div>

      {/* Exams Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th
                className="py-2 px-4 border-b cursor-pointer"
                onClick={() => handleSort("exam_id")}
              >
                <div className="flex items-center">
                  <span>Exam ID</span>
                  {sortColumn === "exam_id" && (
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
                onClick={() => handleSort("exam_name")}
              >
                <div className="flex items-center">
                  <span>Exam Name</span>
                  {sortColumn === "exam_name" && (
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
                  <span>Created Date</span>
                </div>
              </th>
              <th className="py-2 px-4 border-b ">
                <div className="flex items-center">
                  <span>Password</span>
                </div>
              </th>
              <th className="py-2 px-4 border-b cursor-pointer">
                <div className="flex items-center">
                  <span>Status</span>
                </div>
              </th>
              <th className="py-2 px-4 border-b">Participants</th>
              <th className="py-2 px-4 border-b">Questions</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentExams.map((exam) => (
              <tr key={exam.exam_id} className="hover:bg-gray-50">
                <td className="py-3 px-4 border-b">
                  <button
                    className="text-blue-500 hover:text-blue-700 font-medium"
                    onClick={() => openParticipantsModal(exam)}
                  >
                    {exam.exam_id}
                  </button>
                </td>
                <td className="py-3 px-4 border-b">{exam.exam_name}</td>
                <td className="py-3 px-4 border-b">
                  {formatToDDMMYYYY(exam.createdAt)}
                </td>
                <td className="py-3 px-4 border-b">{exam.password}</td>
                <td className="py-3 px-4 border-b">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      exam.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {exam.status.charAt(0).toUpperCase() + exam.status.slice(1)}
                  </span>
                </td>
                <td className="py-3 px-4 border-b">
                  {exam.participants?.length || 0} students
                </td>
                <td className="py-3 px-4 border-b">
                  {exam.questions.length} questions
                </td>
                <td className="py-3 px-4 border-b">
                  <div className="flex space-x-2">
                    <button
                      className="text-green-500 hover:text-green-700"
                      onClick={() => openParticipantsModal(exam)}
                    >
                      View
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {currentExams.length === 0 && (
              <tr>
                <td colSpan={7} className="py-4 text-center text-gray-500">
                  No exams found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-gray-500">
          Showing {indexOfFirstExam + 1} to{" "}
          {Math.min(indexOfLastExam, filteredExams.length)} of{" "}
          {filteredExams.length} entries
        </div>
        <div className="flex space-x-1">
          {Array.from({ length: totalPages }, (_, i) => (
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
          ))}
        </div>
      </div>

      {/* Add Exam Form (Modal) */}
      {showAddForm && (
        <div className="fixed inset-0   bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white shadow-2xl border-2 border-blue-500 rounded-lg p-6 w-full max-w-4xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Create New Exam</h3>
              <button
                onClick={() => {
                  setShowAddForm(false);

                  setShowExcelPreview(false);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Exam Name
                </label>
                <input
                  type="text"
                  name="exam_name"
                  value={newExam.exam_name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Enter exam name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Upload Questions (Excel)
                </label>
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={handleFileUpload}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Excel format should have columns: qno, question, option1,
                  option2, option3, option4, correct
                </p>
              </div>

              {showExcelPreview && (
                <div className="mt-4 border rounded-lg p-3 max-h-60 overflow-y-auto">
                  <h4 className="font-medium mb-2">
                    Uploaded Questions Preview
                  </h4>
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-2 py-1 text-left text-xs font-medium text-gray-500">
                          Q.No
                        </th>
                        <th className="px-2 py-1 text-left text-xs font-medium text-gray-500">
                          Question
                        </th>
                        <th className="px-2 py-1 text-left text-xs font-medium text-gray-500">
                          Options
                        </th>
                        <th className="px-2 py-1 text-left text-xs font-medium text-gray-500">
                          Correct
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {newExam.questions.map((q, index) => (
                        <tr key={index}>
                          <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-500">
                            {q.qno}
                          </td>
                          <td className="px-2 py-1 text-sm text-gray-500">
                            {q.questionname}
                          </td>
                          <td className="px-2 py-1 text-sm text-gray-500">
                            <ul className="list-disc list-inside">
                              {q.options.map((opt) => (
                                <li key={opt.id}>
                                  {opt.id}: {opt.value}
                                </li>
                              ))}
                            </ul>
                          </td>
                          <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-500">
                            {q.correct}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="text-xs text-gray-500 mt-2">
                    Total questions: {newExam.questions.length}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setExcelData([]);
                  setShowExcelPreview(false);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={
                  isLoading ||
                  !newExam.exam_name ||
                  newExam.questions.length === 0
                }
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
                  "Create Exam"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Participants Modal */}
      {showParticipantsModal && currentExam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                Exam Name: {currentExam.exam.exam_name} (
                {currentExam.exam.exam_id})
              </h3>
              <button
                onClick={() => setShowParticipantsModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex items-center mb-4 text-sm">
              <div className="flex items-center mr-6">
                <Calendar size={16} className="mr-1 text-gray-500" />
                <span>Created: {currentExam.exam.createdAt}</span>
              </div>

              <div className="flex items-center">
                <FileText size={16} className="mr-1 text-gray-500" />
                <span>
                  Participants: {currentExam.participants?.length || 0}
                </span>
              </div>
            </div>

            <div className="mb-4 flex justify-between items-center">
              <div className="relative w-64">
                <input
                  type="text"
                  placeholder="Search participants..."
                  className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={participantSearchTerm}
                  onChange={(e) => setParticipantSearchTerm(e.target.value)}
                />
                <Search
                  className="absolute left-3 top-2.5 text-gray-400"
                  size={18}
                />
              </div>

              <button
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 text-sm"
                onClick={() => {
                  const students = filteredParticipants.map(
                    (p) => p.student_id
                  );
                  console.log(students);

                  generateCertificate(students, currentExam.exam.exam_id);
                }}
              >
                Generate All Certificates
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full mt-4 bg-white border border-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="py-2 px-4 border-b">Student ID</th>
                    <th className="py-2 px-4 border-b">Name</th>
                    <th className="py-2 px-4 border-b">Score</th>
                    <th className="py-2 px-4 border-b">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredParticipants.map((participant) => (
                    <tr
                      key={participant.id}
                      className="hover:bg-gray-50 text-center"
                    >
                      <td className="py-3 px-6 border-b">
                        {participant.student_id}
                      </td>
                      <td className="py-3 px-4 border-b">
                        {participant.firstName}&nbsp;{participant.lastName}
                      </td>

                      <td className="py-3 px-4 border-b">
                        {Array.isArray(participant?.exams)
                          ? participant.exams.find(
                              (item) =>
                                item.exam_id === currentExam.exam.exam_id
                            )?.score ?? "N/A"
                          : "N/A"}
                      </td>
                      <td className="py-3 px-4 border-b">
                        <button
                          className="text-blue-600 hover:text-blue-800 text-sm"
                          onClick={() =>
                            generateCertificate(
                              participant.student_id,
                              currentExam.exam.exam_id
                            )
                          }
                        >
                          Generate Certificate
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredParticipants.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-4 text-center text-gray-500"
                      >
                        No participants found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowParticipantsModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-red-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
          {isgeneratingcertificate && <CertificateGenerationModal />}
        </div>
      )}
    </div>
  );
}
