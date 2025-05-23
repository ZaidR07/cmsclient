"use client";
import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Plus, 
  ArrowUp, 
  ArrowDown, 
  X, 
  CheckCircle, 
  FileText, 
  Award,
  Calendar,
  Tag
} from 'lucide-react';
import _ from 'lodash';

// Sample exam data
const initialExams = [
  {
    exam_id: "EX001",
    exam_name: "JavaScript Fundamentals",
    created_date: "2023-01-15",
    status: "active",
    participants: [
      { id: "STD001", name: "John Smith", score: 85, completed: true },
      { id: "STD002", name: "Emily Johnson", score: 92, completed: true },
      { id: "STD005", name: "David Miller", score: 78, completed: true },
      { id: "STD007", name: "Robert Wilson", score: 65, completed: true },
    ]
  },
  {
    exam_id: "EX002",
    exam_name: "Database Management",
    created_date: "2023-02-10",
    status: "active",
    participants: [
      { id: "STD003", name: "Michael Williams", score: 88, completed: true },
      { id: "STD004", name: "Sarah Brown", score: 91, completed: true },
      { id: "STD008", name: "Amanda Taylor", score: 79, completed: true },
      { id: "STD009", name: "Thomas Anderson", score: 95, completed: true },
    ]
  },
  {
    exam_id: "EX003",
    exam_name: "Web Design Principles",
    created_date: "2023-03-05",
    status: "closed",
    participants: [
      { id: "STD002", name: "Emily Johnson", score: 89, completed: true },
      { id: "STD006", name: "Jessica Davis", score: 94, completed: true },
      { id: "STD010", name: "Jennifer Martin", score: 82, completed: true },
    ]
  },
  {
    exam_id: "EX004",
    exam_name: "Python Programming",
    created_date: "2023-03-20",
    status: "active",
    participants: [
      { id: "STD001", name: "John Smith", score: 72, completed: true },
      { id: "STD003", name: "Michael Williams", score: 81, completed: true },
      { id: "STD005", name: "David Miller", score: 90, completed: true },
      { id: "STD007", name: "Robert Wilson", score: 85, completed: true },
      { id: "STD009", name: "Thomas Anderson", score: 94, completed: true },
    ]
  },
  {
    exam_id: "EX005",
    exam_name: "Digital Marketing Fundamentals",
    created_date: "2023-04-10",
    status: "active",
    participants: [
      { id: "STD004", name: "Sarah Brown", score: 88, completed: true },
      { id: "STD006", name: "Jessica Davis", score: 75, completed: true },
      { id: "STD010", name: "Jennifer Martin", score: 91, completed: true },
    ]
  },
  {
    exam_id: "EX006",
    exam_name: "Machine Learning Basics",
    created_date: "2023-05-01",
    status: "closed",
    participants: [
      { id: "STD001", name: "John Smith", score: 76, completed: true },
      { id: "STD005", name: "David Miller", score: 89, completed: true },
      { id: "STD008", name: "Amanda Taylor", score: 94, completed: true },
      { id: "STD009", name: "Thomas Anderson", score: 97, completed: true },
    ]
  },
  {
    exam_id: "EX007",
    exam_name: "UI/UX Design",
    created_date: "2023-05-15",
    status: "active",
    participants: [
      { id: "STD002", name: "Emily Johnson", score: 92, completed: true },
      { id: "STD004", name: "Sarah Brown", score: 85, completed: true },
      { id: "STD006", name: "Jessica Davis", score: 90, completed: true },
      { id: "STD010", name: "Jennifer Martin", score: 95, completed: true },
    ]
  },
  {
    exam_id: "EX008",
    exam_name: "Mobile App Development",
    created_date: "2023-06-01",
    status: "active",
    participants: [
      { id: "STD001", name: "John Smith", score: 79, completed: true },
      { id: "STD003", name: "Michael Williams", score: 82, completed: true },
      { id: "STD007", name: "Robert Wilson", score: 88, completed: true },
      { id: "STD009", name: "Thomas Anderson", score: 91, completed: true },
    ]
  },
  {
    exam_id: "EX009",
    exam_name: "Network Security",
    created_date: "2023-06-15",
    status: "closed",
    participants: [
      { id: "STD005", name: "David Miller", score: 85, completed: true },
      { id: "STD008", name: "Amanda Taylor", score: 90, completed: true },
      { id: "STD009", name: "Thomas Anderson", score: 96, completed: true },
    ]
  },
  {
    exam_id: "EX010",
    exam_name: "Cloud Computing",
    created_date: "2023-07-01",
    status: "active",
    participants: [
      { id: "STD001", name: "John Smith", score: 82, completed: true },
      { id: "STD003", name: "Michael Williams", score: 88, completed: true },
      { id: "STD005", name: "David Miller", score: 91, completed: true },
      { id: "STD007", name: "Robert Wilson", score: 84, completed: true },
      { id: "STD009", name: "Thomas Anderson", score: 95, completed: true },
    ]
  }
];

export default function ExamsManagement() {
  const [exams, setExams] = useState(initialExams);
  const [filteredExams, setFilteredExams] = useState(initialExams);
  const [currentPage, setCurrentPage] = useState(1);
  const [examsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState('exam_id');
  const [sortDirection, setSortDirection] = useState('asc');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [currentExam, setCurrentExam] = useState(null);
  const [participantSearchTerm, setParticipantSearchTerm] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [newExam, setNewExam] = useState({
    exam_name: "",
    status: "active",
    participants: []
  });

  // Filter exams when search term changes
  useEffect(() => {
    let filtered = exams;
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(exam => exam.status === statusFilter);
    }
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(exam => 
        exam.exam_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exam.exam_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exam.created_date.includes(searchTerm)
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
  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Handle search input change
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Get current exams for pagination
  const indexOfLastExam = currentPage * examsPerPage;
  const indexOfFirstExam = indexOfLastExam - examsPerPage;
  const currentExams = filteredExams.slice(indexOfFirstExam, indexOfLastExam);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Open participants modal
  const openParticipantsModal = (exam) => {
    setCurrentExam(exam);
    setParticipantSearchTerm('');
    setShowParticipantsModal(true);
  };

  // Filter participants in modal
  const filteredParticipants = currentExam?.participants.filter(participant =>
    participant.name.toLowerCase().includes(participantSearchTerm.toLowerCase()) ||
    participant.id.toLowerCase().includes(participantSearchTerm.toLowerCase())
  ) || [];

  // Handle input change for new exam form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewExam({
      ...newExam,
      [name]: value
    });
  };

  // Handle form submission
  const handleSubmit = () => {
    setIsLoading(true);
    
    // Generate new ID
    const newId = `EX${String(exams.length + 1).padStart(3, '0')}`;
    
    const examToAdd = {
      ...newExam,
      exam_id: newId,
      created_date: new Date().toISOString().split('T')[0],
      participants: []
    };
    
    // Simulate API call with a delay
    setTimeout(() => {
      setExams([...exams, examToAdd]);
      setNewExam({
        exam_name: "",
        status: "active",
        participants: []
      });
      setIsLoading(false);
      setShowAddForm(false);
      setSuccessMessage('Exam added successfully!');
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    }, 1000);
  };

  // Generate certificate for a single student
  const generateCertificate = (examId, studentId) => {
    console.log(`Generating certificate for student ${studentId} in exam ${examId}`);
    setSuccessMessage(`Certificate generated for student ID: ${studentId}`);
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };

  // Generate certificates for all students
  const generateAllCertificates = (examId) => {
    console.log(`Generating certificates for all students in exam ${examId}`);
    setSuccessMessage(`Certificates generated for all students in exam ID: ${examId}`);
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
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
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
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
      
      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center">
          <CheckCircle size={20} className="mr-2" />
          {successMessage}
        </div>
      )}
      
      {/* Exams Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="py-2 px-4 border-b cursor-pointer" onClick={() => handleSort('exam_id')}>
                <div className="flex items-center">
                  <span>Exam ID</span>
                  {sortColumn === 'exam_id' && (
                    <span className="ml-1">
                      {sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                    </span>
                  )}
                </div>
              </th>
              <th className="py-2 px-4 border-b cursor-pointer" onClick={() => handleSort('exam_name')}>
                <div className="flex items-center">
                  <span>Exam Name</span>
                  {sortColumn === 'exam_name' && (
                    <span className="ml-1">
                      {sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                    </span>
                  )}
                </div>
              </th>
              <th className="py-2 px-4 border-b cursor-pointer" onClick={() => handleSort('created_date')}>
                <div className="flex items-center">
                  <span>Created Date</span>
                  {sortColumn === 'created_date' && (
                    <span className="ml-1">
                      {sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                    </span>
                  )}
                </div>
              </th>
              <th className="py-2 px-4 border-b cursor-pointer" onClick={() => handleSort('status')}>
                <div className="flex items-center">
                  <span>Status</span>
                  {sortColumn === 'status' && (
                    <span className="ml-1">
                      {sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                    </span>
                  )}
                </div>
              </th>
              <th className="py-2 px-4 border-b">Participants</th>
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
                <td className="py-3 px-4 border-b">{exam.created_date}</td>
                <td className="py-3 px-4 border-b">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    exam.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {exam.status.charAt(0).toUpperCase() + exam.status.slice(1)}
                  </span>
                </td>
                <td className="py-3 px-4 border-b">
                  {exam.participants.length} students
                </td>
                <td className="py-3 px-4 border-b">
                  <div className="flex space-x-2">
                    <button 
                      className="text-green-500 hover:text-green-700"
                      onClick={() => openParticipantsModal(exam)}
                    >
                      View
                    </button>
                    <button className="text-blue-500 hover:text-blue-700">Edit</button>
                    <button className="text-red-500 hover:text-red-700">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {currentExams.length === 0 && (
              <tr>
                <td colSpan="6" className="py-4 text-center text-gray-500">
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
          Showing {indexOfFirstExam + 1} to {Math.min(indexOfLastExam, filteredExams.length)} of {filteredExams.length} entries
        </div>
        <div className="flex space-x-1">
          {Array.from({ length: Math.ceil(filteredExams.length / examsPerPage) }, (_, i) => (
            <button
              key={i}
              onClick={() => paginate(i + 1)}
              className={`px-3 py-1 border ${
                currentPage === i + 1 ? 'bg-blue-500 text-white' : 'bg-white text-gray-500'
              } rounded`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
      
      {/* Add Exam Form (Modal) */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Create New Exam</h3>
              <button 
                onClick={() => setShowAddForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Exam Name</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  value={newExam.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="active">Active</option>
                  <option value="closed">Closed</option>
                </select>
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
                disabled={isLoading || !newExam.exam_name}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </div>
                ) : 'Create Exam'}
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
                Exam: {currentExam.exam_name} ({currentExam.exam_id})
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
                <span>Created: {currentExam.created_date}</span>
              </div>
              <div className="flex items-center mr-6">
                <Tag size={16} className="mr-1 text-gray-500" />
                <span>Status: {currentExam.status.charAt(0).toUpperCase() + currentExam.status.slice(1)}</span>
              </div>
              <div className="flex items-center">
                <FileText size={16} className="mr-1 text-gray-500" />
                <span>Participants: {currentExam.participants.length}</span>
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
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              </div>
              <button
                onClick={() => generateAllCertificates(currentExam.exam_id)}
                className="flex items-center space-x-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
              >
                <Award size={18} />
                <span>Generate All Certificates</span>
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="py-2 px-4 border-b">Student ID</th>
                    <th className="py-2 px-4 border-b">Name</th>
                    <th className="py-2 px-4 border-b">Score</th>
                    <th className="py-2 px-4 border-b">Status</th>
                    <th className="py-2 px-4 border-b">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredParticipants.map((participant) => (
                    <tr key={participant.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 border-b">{participant.id}</td>
                      <td className="py-3 px-4 border-b">{participant.name}</td>
                      <td className="py-3 px-4 border-b">{participant.score}/100</td>
                      <td className="py-3 px-4 border-b">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          participant.completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {participant.completed ? 'Completed' : 'Pending'}
                        </span>
                      </td>
                      <td className="py-3 px-4 border-b">
                        <button 
                          onClick={() => generateCertificate(currentExam.exam_id, participant.id)} 
                          className="flex items-center text-green-500 hover:text-green-700"
                          disabled={!participant.completed}
                        >
                          <Award size={16} className="mr-1" />
                          Generate Certificate
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredParticipants.length === 0 && (
                    <tr>
                      <td colSpan="5" className="py-4 text-center text-gray-500">
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
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}