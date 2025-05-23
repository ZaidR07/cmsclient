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
  Book,
  Calendar,
  Tag,
  Edit,
  Trash2,
  ImageIcon,
  DollarSign
} from 'lucide-react';
import _ from 'lodash';

// Sample course data
const initialCourses = [
  {
    course_id: "CS001",
    course_name: "React Fundamentals",
    about: "Learn the basics of React including components, state, and props.",
    image_url: "/api/placeholder/400/300",
    created_date: "2023-01-15",
    status: "active",
    mrp: 299,
    highlights: ["24/7 Support", "Certificate on Completion", "30 Day Money Back Guarantee"]
  },
  {
    course_id: "CS002",
    course_name: "Advanced Node.js",
    about: "Master Node.js through building real-world server-side applications.",
    image_url: "/api/placeholder/400/300",
    created_date: "2023-02-10",
    status: "active",
    mrp: 399,
    highlights: ["Weekly Live Sessions", "Access to Community Forum", "Project Reviews"]
  },
  {
    course_id: "CS003",
    course_name: "Full Stack Development",
    about: "Comprehensive course covering both frontend and backend development.",
    image_url: "/api/placeholder/400/300",
    created_date: "2023-03-05",
    status: "inactive",
    mrp: 599,
    highlights: ["Real-world Projects", "1-on-1 Mentoring", "Job Placement Support"]
  },
  {
    course_id: "CS004",
    course_name: "UI/UX Design Principles",
    about: "Learn the fundamentals of creating user-friendly interfaces and experiences.",
    image_url: "/api/placeholder/400/300",
    created_date: "2023-03-20",
    status: "active",
    mrp: 349,
    highlights: ["Design Portfolio", "Industry Expert Sessions", "Lifetime Access"]
  },
  {
    course_id: "CS005",
    course_name: "Data Science Essentials",
    about: "Introduction to data analysis, visualization, and basic machine learning.",
    image_url: "/api/placeholder/400/300",
    created_date: "2023-04-10",
    status: "active",
    mrp: 499,
    highlights: ["Hands-on Labs", "Capstone Project", "Interview Preparation"]
  },
  {
    course_id: "CS006",
    course_name: "Python Programming",
    about: "Learn Python programming from basics to advanced concepts.",
    image_url: "/api/placeholder/400/300",
    created_date: "2023-05-01",
    status: "inactive",
    mrp: 249,
    highlights: ["Coding Exercises", "Automated Feedback", "Discussion Forum"]
  },
  {
    course_id: "CS007",
    course_name: "Mobile App Development",
    about: "Create cross-platform mobile apps using React Native.",
    image_url: "/api/placeholder/400/300",
    created_date: "2023-05-15",
    status: "active",
    mrp: 449,
    highlights: ["App Store Submission Guide", "Real Device Testing", "Code Reviews"]
  }
];

export default function CoursesManagement() {
  const [courses, setCourses] = useState(initialCourses);
  const [filteredCourses, setFilteredCourses] = useState(initialCourses);
  const [currentPage, setCurrentPage] = useState(1);
  const [coursesPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState('course_id');
  const [sortDirection, setSortDirection] = useState('asc');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [currentCourse, setCurrentCourse] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [newCourse, setNewCourse] = useState({
    course_name: "",
    about: "",
    image_url: "/api/placeholder/400/300",
    status: "active",
    mrp: 0,
    highlights: [""]
  });
  const [highlightInput, setHighlightInput] = useState("");

  // Filter courses when search term changes
  useEffect(() => {
    let filtered = courses;
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(course => course.status === statusFilter);
    }
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(course => 
        course.course_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.about.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.created_date.includes(searchTerm)
      );
    }
    
    setFilteredCourses(filtered);
    setCurrentPage(1);
  }, [searchTerm, courses, statusFilter]);

  // Sort courses when sort column or direction changes
  useEffect(() => {
    const sorted = _.orderBy(filteredCourses, [sortColumn], [sortDirection]);
    setFilteredCourses(sorted);
  }, [sortColumn, sortDirection, filteredCourses]);

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

  // Get current courses for pagination
  const indexOfLastCourse = currentPage * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses = filteredCourses.slice(indexOfFirstCourse, indexOfLastCourse);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Open view modal
  const openViewModal = (course) => {
    setCurrentCourse(course);
    setShowViewModal(true);
  };

  // Open edit form
  const openEditForm = (course) => {
    setCurrentCourse({...course});
    setNewCourse({...course});
    setShowEditForm(true);
  };

  // Handle input change for course form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "mrp") {
      setNewCourse({
        ...newCourse,
        [name]: parseFloat(value) || 0
      });
    } else {
      setNewCourse({
        ...newCourse,
        [name]: value
      });
    }
  };

  // Handle highlight input change
  const handleHighlightInputChange = (e) => {
    setHighlightInput(e.target.value);
  };

  // Add new highlight
  const addHighlight = () => {
    if (highlightInput.trim()) {
      setNewCourse({
        ...newCourse,
        highlights: [...newCourse.highlights, highlightInput.trim()]
      });
      setHighlightInput("");
    }
  };

  // Remove highlight
  const removeHighlight = (index) => {
    const updatedHighlights = [...newCourse.highlights];
    updatedHighlights.splice(index, 1);
    setNewCourse({
      ...newCourse,
      highlights: updatedHighlights
    });
  };

  // Update highlight
  const updateHighlight = (index, value) => {
    const updatedHighlights = [...newCourse.highlights];
    updatedHighlights[index] = value;
    setNewCourse({
      ...newCourse,
      highlights: updatedHighlights
    });
  };

  // Handle form submission for adding new course
  const handleSubmit = () => {
    setIsLoading(true);
    
    // Generate new ID
    const newId = `CS${String(courses.length + 1).padStart(3, '0')}`;
    
    const courseToAdd = {
      ...newCourse,
      course_id: newId,
      created_date: new Date().toISOString().split('T')[0],
      highlights: newCourse.highlights.filter(h => h.trim() !== "") // Remove empty highlights
    };
    
    // Simulate API call with a delay
    setTimeout(() => {
      setCourses([...courses, courseToAdd]);
      setNewCourse({
        course_name: "",
        about: "",
        image_url: "/api/placeholder/400/300",
        status: "active",
        mrp: 0,
        highlights: [""]
      });
      setIsLoading(false);
      setShowAddForm(false);
      setSuccessMessage('Course added successfully!');
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    }, 1000);
  };

  // Handle form submission for updating course
  const handleUpdate = () => {
    setIsLoading(true);
    
    const courseToUpdate = {
      ...newCourse,
      highlights: newCourse.highlights.filter(h => h.trim() !== "") // Remove empty highlights
    };
    
    // Simulate API call with a delay
    setTimeout(() => {
      const updatedCourses = courses.map(course => 
        course.course_id === courseToUpdate.course_id ? courseToUpdate : course
      );
      
      setCourses(updatedCourses);
      setIsLoading(false);
      setShowEditForm(false);
      setSuccessMessage('Course updated successfully!');
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    }, 1000);
  };

  // Handle course deletion
  const handleDelete = (courseId) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      // Simulate API call with a delay
      setIsLoading(true);
      
      setTimeout(() => {
        const updatedCourses = courses.filter(course => course.course_id !== courseId);
        setCourses(updatedCourses);
        setIsLoading(false);
        setSuccessMessage('Course deleted successfully!');
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      }, 1000);
    }
  };

  // Export courses as CSV
  const exportCourses = () => {
    // Create CSV header
    const headers = ['Course ID', 'Course Name', 'About', 'Created Date', 'Status', 'Price', 'Highlights'];
    
    // Convert courses data to CSV format
    const csvData = filteredCourses.map(course => [
      course.course_id,
      course.course_name,
      course.about,
      course.created_date,
      course.status,
      course.mrp,
      course.highlights.join(', ')
    ]);
    
    // Combine header and data
    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'courses_export.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Courses Management</h2>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search courses..."
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
            <option value="inactive">Inactive</option>
          </select>
          <button 
            onClick={exportCourses}
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
            <span>Create Course</span>
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
      
      {/* Courses Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="py-2 px-4 border-b cursor-pointer" onClick={() => handleSort('course_id')}>
                <div className="flex items-center">
                  <span>Course ID</span>
                  {sortColumn === 'course_id' && (
                    <span className="ml-1">
                      {sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                    </span>
                  )}
                </div>
              </th>
              <th className="py-2 px-4 border-b">Image</th>
              <th className="py-2 px-4 border-b cursor-pointer" onClick={() => handleSort('course_name')}>
                <div className="flex items-center">
                  <span>Course Name</span>
                  {sortColumn === 'course_name' && (
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
              <th className="py-2 px-4 border-b cursor-pointer" onClick={() => handleSort('mrp')}>
                <div className="flex items-center">
                  <span>Price</span>
                  {sortColumn === 'mrp' && (
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
            {currentCourses.map((course) => (
              <tr key={course.course_id} className="hover:bg-gray-50">
                <td className="py-3 px-4 border-b">
                  <span className="font-medium text-gray-700">
                    {course.course_id}
                  </span>
                </td>
                <td className="py-3 px-4 border-b">
                  <div className="w-12 h-12 rounded overflow-hidden">
                    <img 
                      src={course.image_url} 
                      alt={course.course_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </td>
                <td className="py-3 px-4 border-b">{course.course_name}</td>
                <td className="py-3 px-4 border-b">{course.created_date}</td>
                <td className="py-3 px-4 border-b">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    course.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                  </span>
                </td>
                <td className="py-3 px-4 border-b">${course.mrp}</td>
                <td className="py-3 px-4 border-b">
                  <div className="flex space-x-2">
                    <button 
                      className="text-blue-500 hover:text-blue-700"
                      onClick={() => openViewModal(course)}
                    >
                      View
                    </button>
                    <button 
                      className="text-green-500 hover:text-green-700"
                      onClick={() => openEditForm(course)}
                    >
                      Edit
                    </button>
                    <button 
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleDelete(course.course_id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {currentCourses.length === 0 && (
              <tr>
                <td colSpan="7" className="py-4 text-center text-gray-500">
                  No courses found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-gray-500">
          Showing {indexOfFirstCourse + 1} to {Math.min(indexOfLastCourse, filteredCourses.length)} of {filteredCourses.length} entries
        </div>
        <div className="flex space-x-1">
          {Array.from({ length: Math.ceil(filteredCourses.length / coursesPerPage) }, (_, i) => (
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
      
      {/* Add Course Form (Modal) */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Create New Course</h3>
              <button 
                onClick={() => setShowAddForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course Name</label>
                <input
                  type="text"
                  name="course_name"
                  value={newCourse.course_name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Enter course name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">About</label>
                <textarea
                  name="about"
                  value={newCourse.about}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md h-24"
                  placeholder="Enter course description"
                ></textarea>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course Image</label>
                <div className="flex items-center">
                  <div className="w-32 h-24 border border-gray-300 rounded-md flex items-center justify-center mr-4">
                    {newCourse.image_url ? (
                      <img 
                        src={newCourse.image_url} 
                        alt="Course Preview" 
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : (
                      <ImageIcon className="text-gray-400" size={32} />
                    )}
                  </div>
                  <div>
                    <input
                      type="text"
                      name="image_url"
                      value={newCourse.image_url}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Image URL"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter URL for course image or upload file
                    </p>
                    <button className="mt-2 px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200">
                      Upload Image
                    </button>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  value={newCourse.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (MRP)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign size={16} className="text-gray-500" />
                  </div>
                  <input
                    type="number"
                    name="mrp"
                    value={newCourse.mrp}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course Highlights</label>
                <div className="space-y-2">
                  {newCourse.highlights.map((highlight, index) => (
                    <div key={index} className="flex items-center">
                      <input
                        type="text"
                        value={highlight}
                        onChange={(e) => updateHighlight(index, e.target.value)}
                        className="flex-grow px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="Enter highlight"
                      />
                      {newCourse.highlights.length > 1 && (
                        <button 
                          onClick={() => removeHighlight(index)}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          <X size={18} />
                        </button>
                      )}
                    </div>
                  ))}
                  
                  <div className="flex items-center mt-2">
                    <input
                      type="text"
                      value={highlightInput}
                      onChange={handleHighlightInputChange}
                      className="flex-grow px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Add another highlight"
                    />
                    <button 
                      onClick={addHighlight}
                      className="ml-2 bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
                      disabled={!highlightInput.trim()}
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>
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
                disabled={isLoading || !newCourse.course_name || !newCourse.about}
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
                ) : 'Create Course'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Course Form (Modal) */}
      {showEditForm && currentCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Edit Course: {currentCourse.course_name}</h3>
              <button 
                onClick={() => setShowEditForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course Name</label>
                <input
                  type="text"
                  name="course_name"
                  value={newCourse.course_name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Enter course name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">About</label>
                <textarea
                  name="about"
                  value={newCourse.about}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md h-24"
                  placeholder="Enter course description"
                ></textarea>
              </div><div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course Image</label>
                <div className="flex items-center">
                  <div className="w-32 h-24 border border-gray-300 rounded-md flex items-center justify-center mr-4">
                    {newCourse.image_url ? (
                      <img 
                        src={newCourse.image_url} 
                        alt="Course Preview" 
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : (
                      <ImageIcon className="text-gray-400" size={32} />
                    )}
                  </div>
                  <div>
                    <input
                      type="text"
                      name="image_url"
                      value={newCourse.image_url}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Image URL"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter URL for course image or upload file
                    </p>
                    <button className="mt-2 px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200">
                      Upload Image
                    </button>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  value={newCourse.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (MRP)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign size={16} className="text-gray-500" />
                  </div>
                  <input
                    type="number"
                    name="mrp"
                    value={newCourse.mrp}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course Highlights</label>
                <div className="space-y-2">
                  {newCourse.highlights.map((highlight, index) => (
                    <div key={index} className="flex items-center">
                      <input
                        type="text"
                        value={highlight}
                        onChange={(e) => updateHighlight(index, e.target.value)}
                        className="flex-grow px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="Enter highlight"
                      />
                      {newCourse.highlights.length > 1 && (
                        <button 
                          onClick={() => removeHighlight(index)}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          <X size={18} />
                        </button>
                      )}
                    </div>
                  ))}
                  
                  <div className="flex items-center mt-2">
                    <input
                      type="text"
                      value={highlightInput}
                      onChange={handleHighlightInputChange}
                      className="flex-grow px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Add another highlight"
                    />
                    <button 
                      onClick={addHighlight}
                      className="ml-2 bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
                      disabled={!highlightInput.trim()}
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowEditForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                disabled={isLoading || !newCourse.course_name || !newCourse.about}
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
                ) : 'Update Course'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* View Course Modal */}
      {showViewModal && currentCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Course Details</h3>
              <button 
                onClick={() => setShowViewModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <div className="w-full aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <img 
                    src={currentCourse.image_url} 
                    alt={currentCourse.course_name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="mt-4 p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-500">Course ID</span>
                    <span className="font-medium">{currentCourse.course_id}</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-500">Price</span>
                    <span className="font-medium">${currentCourse.mrp}</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-500">Created</span>
                    <span className="font-medium">{currentCourse.created_date}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">Status</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      currentCourse.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {currentCourse.status.charAt(0).toUpperCase() + currentCourse.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="md:col-span-2">
                <div className="mb-4">
                  <h4 className="text-xl font-semibold text-gray-800">{currentCourse.course_name}</h4>
                </div>
                
                <div className="mb-6">
                  <h5 className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <Book size={16} className="mr-2" /> About
                  </h5>
                  <p className="text-gray-600">{currentCourse.about}</p>
                </div>
                
                <div>
                  <h5 className="flex items-center text-sm font-medium text-gray-700 mb-3">
                    <Tag size={16} className="mr-2" /> Course Highlights
                  </h5>
                  <ul className="space-y-2">
                    {currentCourse.highlights.map((highlight, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle size={16} className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                        <span className="text-gray-600">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  openEditForm(currentCourse);
                }}
                className="flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                <Edit size={16} className="mr-1" />
                Edit
              </button>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  handleDelete(currentCourse.course_id);
                }}
                className="flex items-center px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                <Trash2 size={16} className="mr-1" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}