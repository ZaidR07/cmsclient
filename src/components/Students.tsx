"use client";
import { useState, useEffect } from 'react';
import { Search, Filter, Download, Plus, ArrowUp, ArrowDown, X, CheckCircle } from 'lucide-react';
import _ from 'lodash';

// Sample student data
const initialStudents = [
  {
    id: "STD001",
    formno: "F23001",
    firstName: "John",
    middleName: "David",
    lastName: "Smith",
    dob: "1998-05-15",
    gender: "Male",
    qualification: "High School",
    adhaar: "123456789012",
    address: "123 Main St, City",
    mobile: "9876543210",
    altnumber: "8765432109",
    course: "Computer Science",
    date: "2023-01-15",
    totalPayment: 50000,
    discount: 5000,
    payment: 25000,
    balance: 20000
  },
  {
    id: "STD002",
    formno: "F23002",
    firstName: "Emily",
    middleName: "Rose",
    lastName: "Johnson",
    dob: "1999-08-23",
    gender: "Female",
    qualification: "Bachelor",
    adhaar: "234567890123",
    address: "456 Park Ave, Town",
    mobile: "8765432109",
    altnumber: "",
    course: "Business Management",
    date: "2023-01-20",
    totalPayment: 60000,
    discount: 0,
    payment: 30000,
    balance: 30000
  },
  {
    id: "STD003",
    formno: "F23003",
    firstName: "Michael",
    middleName: "",
    lastName: "Williams",
    dob: "1997-12-05",
    gender: "Male",
    qualification: "Diploma",
    adhaar: "345678901234",
    address: "789 Oak St, Village",
    mobile: "7654321098",
    altnumber: "6543210987",
    course: "Mechanical Engineering",
    date: "2023-02-10",
    totalPayment: 45000,
    discount: 2000,
    payment: 25000,
    balance: 18000
  },
  {
    id: "STD004",
    formno: "F23004",
    firstName: "Sarah",
    middleName: "Jane",
    lastName: "Brown",
    dob: "2000-03-17",
    gender: "Female",
    qualification: "High School",
    adhaar: "456789012345",
    address: "101 Pine St, City",
    mobile: "6543210987",
    altnumber: "",
    course: "Digital Marketing",
    date: "2023-02-15",
    totalPayment: 35000,
    discount: 3000,
    payment: 20000,
    balance: 12000
  },
  {
    id: "STD005",
    formno: "F23005",
    firstName: "David",
    middleName: "Robert",
    lastName: "Miller",
    dob: "1996-11-29",
    gender: "Male",
    qualification: "Bachelor",
    adhaar: "567890123456",
    address: "202 Maple St, Town",
    mobile: "5432109876",
    altnumber: "4321098765",
    course: "Civil Engineering",
    date: "2023-03-01",
    totalPayment: 55000,
    discount: 0,
    payment: 30000,
    balance: 25000
  },
  {
    id: "STD006",
    formno: "F23006",
    firstName: "Jessica",
    middleName: "",
    lastName: "Davis",
    dob: "1999-07-12",
    gender: "Female",
    qualification: "Diploma",
    adhaar: "678901234567",
    address: "303 Elm St, Village",
    mobile: "4321098765",
    altnumber: "",
    course: "Fashion Design",
    date: "2023-03-05",
    totalPayment: 40000,
    discount: 4000,
    payment: 20000,
    balance: 16000
  },
  {
    id: "STD007",
    formno: "F23007",
    firstName: "Robert",
    middleName: "James",
    lastName: "Wilson",
    dob: "1997-04-22",
    gender: "Male",
    qualification: "High School",
    adhaar: "789012345678",
    address: "404 Cedar St, City",
    mobile: "3210987654",
    altnumber: "2109876543",
    course: "Graphic Design",
    date: "2023-03-10",
    totalPayment: 38000,
    discount: 3000,
    payment: 20000,
    balance: 15000
  },
  {
    id: "STD008",
    formno: "F23008",
    firstName: "Amanda",
    middleName: "Lee",
    lastName: "Taylor",
    dob: "1998-09-19",
    gender: "Female",
    qualification: "Bachelor",
    adhaar: "890123456789",
    address: "505 Birch St, Town",
    mobile: "2109876543",
    altnumber: "",
    course: "Data Science",
    date: "2023-03-15",
    totalPayment: 65000,
    discount: 5000,
    payment: 30000,
    balance: 30000
  },
  {
    id: "STD009",
    formno: "F23009",
    firstName: "Thomas",
    middleName: "",
    lastName: "Anderson",
    dob: "1996-10-31",
    gender: "Male",
    qualification: "Diploma",
    adhaar: "901234567890",
    address: "606 Aspen St, Village",
    mobile: "1098765432",
    altnumber: "0987654321",
    course: "Electrical Engineering",
    date: "2023-04-01",
    totalPayment: 48000,
    discount: 0,
    payment: 24000,
    balance: 24000
  },
  {
    id: "STD010",
    formno: "F23010",
    firstName: "Jennifer",
    middleName: "Marie",
    lastName: "Martin",
    dob: "1999-01-25",
    gender: "Female",
    qualification: "High School",
    adhaar: "012345678901",
    address: "707 Walnut St, City",
    mobile: "0987654321",
    altnumber: "",
    course: "Interior Design",
    date: "2023-04-05",
    totalPayment: 42000,
    discount: 2000,
    payment: 20000,
    balance: 20000
  }
];

export default function StudentsManagement() {
  const [students, setStudents] = useState(initialStudents);
  const [filteredStudents, setFilteredStudents] = useState(initialStudents);
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState('id');
  const [sortDirection, setSortDirection] = useState('asc');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStudent, setNewStudent] = useState({
    id: "",
    formno: "",
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
    date: new Date().toISOString().split('T')[0],
    totalPayment: 0,
    discount: 0,
    payment: 0,
    balance: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Filter students when search term changes
  useEffect(() => {
    if (searchTerm) {
      const filtered = students.filter(student => 
        Object.values(student).some(value => 
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
    const sorted = _.orderBy(filteredStudents, [sortColumn], [sortDirection]);
    setFilteredStudents(sorted);
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

  // Get current students for pagination
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Handle input change for new student form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'totalPayment' || name === 'discount' || name === 'payment') {
      const total = name === 'totalPayment' ? parseFloat(value) || 0 : parseFloat(newStudent.totalPayment) || 0;
      const discount = name === 'discount' ? parseFloat(value) || 0 : parseFloat(newStudent.discount) || 0;
      const payment = name === 'payment' ? parseFloat(value) || 0 : parseFloat(newStudent.payment) || 0;
      
      const balance = total - discount - payment;
      
      setNewStudent({
        ...newStudent,
        [name]: value,
        balance: balance >= 0 ? balance : 0
      });
    } else {
      setNewStudent({
        ...newStudent,
        [name]: value
      });
    }
  };

  // Handle form submission
  const handleSubmit = () => {
    setIsLoading(true);
    
    // Generate new ID and form number
    const newId = `STD${String(students.length + 1).padStart(3, '0')}`;
    const newFormNo = `F${new Date().getFullYear().toString().substr(-2)}${String(students.length + 1).padStart(3, '0')}`;
    
    const studentToAdd = {
      ...newStudent,
      id: newId,
      formno: newFormNo
    };
    
    // Simulate API call with a delay
    setTimeout(() => {
      setStudents([...students, studentToAdd]);
      setNewStudent({
        id: "",
        formno: "",
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
        date: new Date().toISOString().split('T')[0],
        totalPayment: 0,
        discount: 0,
        payment: 0,
        balance: 0
      });
      setIsLoading(false);
      setShowAddForm(false);
      setSuccessMessage('Student added successfully!');
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    }, 1000);
  };

  // Handle export to Excel
  const exportToExcel = () => {
    console.log('Exporting data to Excel...');
    // In a real application, this would use a library like ExcelJS or SheetJS
    // to generate an Excel file from the students data
  };

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
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
          <button 
            onClick={() => exportToExcel()}
            className="flex items-center space-x-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
          >
            <Download size={18} />
            <span>Export</span>
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
      
      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center">
          <CheckCircle size={20} className="mr-2" />
          {successMessage}
        </div>
      )}
      
      {/* Student Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="py-2 px-4 border-b cursor-pointer" onClick={() => handleSort('id')}>
                <div className="flex items-center">
                  <span>ID</span>
                  {sortColumn === 'id' && (
                    <span className="ml-1">
                      {sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                    </span>
                  )}
                </div>
              </th>
              <th className="py-2 px-4 border-b cursor-pointer" onClick={() => handleSort('formno')}>
                <div className="flex items-center">
                  <span>Form No</span>
                  {sortColumn === 'formno' && (
                    <span className="ml-1">
                      {sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                    </span>
                  )}
                </div>
              </th>
              <th className="py-2 px-4 border-b cursor-pointer" onClick={() => handleSort('firstName')}>
                <div className="flex items-center">
                  <span>Name</span>
                  {sortColumn === 'firstName' && (
                    <span className="ml-1">
                      {sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                    </span>
                  )}
                </div>
              </th>
              <th className="py-2 px-4 border-b cursor-pointer" onClick={() => handleSort('course')}>
                <div className="flex items-center">
                  <span>Course</span>
                  {sortColumn === 'course' && (
                    <span className="ml-1">
                      {sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                    </span>
                  )}
                </div>
              </th>
              <th className="py-2 px-4 border-b cursor-pointer" onClick={() => handleSort('mobile')}>
                <div className="flex items-center">
                  <span>Mobile</span>
                  {sortColumn === 'mobile' && (
                    <span className="ml-1">
                      {sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                    </span>
                  )}
                </div>
              </th>
              <th className="py-2 px-4 border-b cursor-pointer" onClick={() => handleSort('date')}>
                <div className="flex items-center">
                  <span>Date</span>
                  {sortColumn === 'date' && (
                    <span className="ml-1">
                      {sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                    </span>
                  )}
                </div>
              </th>
              <th className="py-2 px-4 border-b cursor-pointer" onClick={() => handleSort('totalPayment')}>
                <div className="flex items-center">
                  <span>Total</span>
                  {sortColumn === 'totalPayment' && (
                    <span className="ml-1">
                      {sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                    </span>
                  )}
                </div>
              </th>
              <th className="py-2 px-4 border-b cursor-pointer" onClick={() => handleSort('balance')}>
                <div className="flex items-center">
                  <span>Balance</span>
                  {sortColumn === 'balance' && (
                    <span className="ml-1">
                      {sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                    </span>
                  )}
                </div>
              </th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentStudents.map((student) => (
              <tr key={student.id} className="hover:bg-gray-50">
                <td className="py-3 px-4 border-b">{student.id}</td>
                <td className="py-3 px-4 border-b">{student.formno}</td>
                <td className="py-3 px-4 border-b">
                  {student.firstName} {student.middleName && student.middleName + ' '}{student.lastName}
                </td>
                <td className="py-3 px-4 border-b">{student.course}</td>
                <td className="py-3 px-4 border-b">{student.mobile}</td>
                <td className="py-3 px-4 border-b">{student.date}</td>
                <td className="py-3 px-4 border-b">₹{student.totalPayment}</td>
                <td className="py-3 px-4 border-b">₹{student.balance}</td>
                <td className="py-3 px-4 border-b">
                  <div className="flex space-x-2">
                    <button className="text-blue-500 hover:text-blue-700">Edit</button>
                    <button className="text-red-500 hover:text-red-700">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {currentStudents.length === 0 && (
              <tr>
                <td colSpan="9" className="py-4 text-center text-gray-500">
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
          Showing {indexOfFirstStudent + 1} to {Math.min(indexOfLastStudent, filteredStudents.length)} of {filteredStudents.length} entries
        </div>
        <div className="flex space-x-1">
          {Array.from({ length: Math.ceil(filteredStudents.length / studentsPerPage) }, (_, i) => (
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={newStudent.firstName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="First Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Middle Name</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={newStudent.lastName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Last Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  name="dob"
                  value={newStudent.dob}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select
                  name="gender"
                  value={newStudent.gender}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
                <input
                  type="text"
                  name="qualification"
                  value={newStudent.qualification}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Qualification"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Aadhaar Number</label>
                <input
                  type="text"
                  name="adhaar"
                  value={newStudent.adhaar}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="12-digit Aadhaar Number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                <input
                  type="text"
                  name="mobile"
                  value={newStudent.mobile}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="10-digit Mobile Number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alternative Number</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  name="address"
                  value={newStudent.address}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Full Address"
                  rows="2"
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                <input
                  type="text"
                  name="course"
                  value={newStudent.course}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Course Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Admission Date</label>
                <input
                  type="date"
                  name="date"
                  value={newStudent.date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Payment (₹)</label>
                <input
                  type="number"
                  name="totalPayment"
                  value={newStudent.totalPayment}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Total Course Fee"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount (₹)</label>
                <input
                  type="number"
                  name="discount"
                  value={newStudent.discount}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Discount Amount"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Made (₹)</label>
                <input
                  type="number"
                  name="payment"
                  value={newStudent.payment}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Payment Made"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Balance (₹)</label>
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
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </div>
                ) : 'Save Student'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}