"use client";
import React, { useState, useEffect } from "react";
import { Search, ArrowLeft, ChevronDown } from "lucide-react";

interface Student {
  id: string;
  studentName: string;
  admissionDate: string;
  totalFees: number;
  balanceFees: number;
  dueDate: string;
  status: 'fully-paid' | 'partially-paid' | 'due';
}

interface Course {
  id: string;
  courseName: string;
  pendingCount: number;
  students: Student[];
}

const Feesection = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortFilter, setSortFilter] = useState<'all' | 'fully-paid' | 'partially-paid' | 'due'>('all');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Sample data with students
  useEffect(() => {
    const sampleCourses: Course[] = [
      {
        id: "1",
        courseName: "Web Development",
        pendingCount: 5,
        students: [
          {
            id: "s1",
            studentName: "Rahul Sharma",
            admissionDate: "2024-01-15",
            totalFees: 15000,
            balanceFees: 5000,
            dueDate: "2024-07-15",
            status: 'partially-paid'
          },
          {
            id: "s2",
            studentName: "Priya Patel",
            admissionDate: "2024-02-01",
            totalFees: 15000,
            balanceFees: 0,
            dueDate: "2024-08-01",
            status: 'fully-paid'
          },
          {
            id: "s3",
            studentName: "Amit Kumar",
            admissionDate: "2024-01-20",
            totalFees: 15000,
            balanceFees: 15000,
            dueDate: "2024-06-20",
            status: 'due'
          },
          {
            id: "s4",
            studentName: "Sneha Singh",
            admissionDate: "2024-03-10",
            totalFees: 15000,
            balanceFees: 8000,
            dueDate: "2024-09-10",
            status: 'partially-paid'
          },
          {
            id: "s5",
            studentName: "Vikash Yadav",
            admissionDate: "2024-02-15",
            totalFees: 15000,
            balanceFees: 12000,
            dueDate: "2024-07-15",
            status: 'due'
          }
        ]
      },
      {
        id: "2",
        courseName: "Data Science",
        pendingCount: 3,
        students: [
          {
            id: "s6",
            studentName: "Anita Desai",
            admissionDate: "2024-01-10",
            totalFees: 20000,
            balanceFees: 0,
            dueDate: "2024-07-10",
            status: 'fully-paid'
          },
          {
            id: "s7",
            studentName: "Ravi Gupta",
            admissionDate: "2024-02-20",
            totalFees: 20000,
            balanceFees: 10000,
            dueDate: "2024-08-20",
            status: 'partially-paid'
          },
          {
            id: "s8",
            studentName: "Meera Joshi",
            admissionDate: "2024-03-05",
            totalFees: 20000,
            balanceFees: 20000,
            dueDate: "2024-09-05",
            status: 'due'
          }
        ]
      },
      {
        id: "3",
        courseName: "Cloud Computing",
        pendingCount: 4,
        students: [
          {
            id: "s9",
            studentName: "Suresh Reddy",
            admissionDate: "2024-01-25",
            totalFees: 18000,
            balanceFees: 6000,
            dueDate: "2024-07-25",
            status: 'partially-paid'
          },
          {
            id: "s10",
            studentName: "Kavya Nair",
            admissionDate: "2024-02-10",
            totalFees: 18000,
            balanceFees: 0,
            dueDate: "2024-08-10",
            status: 'fully-paid'
          }
        ]
      },
      {
        id: "4",
        courseName: "Cybersecurity",
        pendingCount: 2,
        students: [
          {
            id: "s11",
            studentName: "Arjun Mehta",
            admissionDate: "2024-03-01",
            totalFees: 22000,
            balanceFees: 11000,
            dueDate: "2024-09-01",
            status: 'partially-paid'
          }
        ]
      },
      {
        id: "5",
        courseName: "Mobile App Development",
        pendingCount: 6,
        students: [
          {
            id: "s12",
            studentName: "Pooja Agarwal",
            admissionDate: "2024-01-30",
            totalFees: 17000,
            balanceFees: 0,
            dueDate: "2024-07-30",
            status: 'fully-paid'
          },
          {
            id: "s13",
            studentName: "Deepak Verma",
            admissionDate: "2024-02-25",
            totalFees: 17000,
            balanceFees: 17000,
            dueDate: "2024-08-25",
            status: 'due'
          }
        ]
      }
    ];
    setCourses(sampleCourses);
  }, []);

  // Filter courses based on search term
  const filteredCourses = courses.filter((course) =>
    course.courseName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter students based on sort filter
  const filteredStudents = selectedCourse ? 
    selectedCourse.students.filter(student => 
      sortFilter === 'all' || student.status === sortFilter
    ) : [];

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleCourseClick = (course: Course) => {
    setSelectedCourse(course);
    setSortFilter('all');
  };

  const handleBackClick = () => {
    setSelectedCourse(null);
    setSearchTerm("");
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      'fully-paid': 'bg-green-100 text-green-800',
      'partially-paid': 'bg-yellow-100 text-yellow-800',
      'due': 'bg-red-100 text-red-800'
    };
    const labels = {
      'fully-paid': 'Fully Paid',
      'partially-paid': 'Partially Paid', 
      'due': 'Due'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[status as keyof typeof badges]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  if (selectedCourse) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        {/* Table Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <button 
              onClick={handleBackClick}
              className="mr-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <h2 className="text-xl font-semibold">{selectedCourse.courseName} - Fee Details</h2>
          </div>
          
          {/* Sort Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center px-4 py-2 bg-gray-50 border rounded-lg hover:bg-gray-100 transition-colors"
            >
              <span className="mr-2">
                {sortFilter === 'all' ? 'All Students' : 
                 sortFilter === 'fully-paid' ? 'Fully Paid' :
                 sortFilter === 'partially-paid' ? 'Partially Paid' : 'Due'}
              </span>
              <ChevronDown size={16} />
            </button>
            
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-10">
                {[
                  { value: 'all', label: 'All Students' },
                  { value: 'fully-paid', label: 'Fully Paid' },
                  { value: 'partially-paid', label: 'Partially Paid' },
                  { value: 'due', label: 'Due' }
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

        {/* Students Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-200 px-4 py-3 text-left font-semibold">Student Name</th>
                <th className="border border-gray-200 px-4 py-3 text-left font-semibold">Admission Date</th>
                <th className="border border-gray-200 px-4 py-3 text-left font-semibold">Total Fees</th>
                <th className="border border-gray-200 px-4 py-3 text-left font-semibold">Balance Fees</th>
                <th className="border border-gray-200 px-4 py-3 text-left font-semibold">Due Date</th>
                <th className="border border-gray-200 px-4 py-3 text-left font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="border border-gray-200 px-4 py-3">{student.studentName}</td>
                    <td className="border border-gray-200 px-4 py-3">{formatDate(student.admissionDate)}</td>
                    <td className="border border-gray-200 px-4 py-3">₹{student.totalFees.toLocaleString()}</td>
                    <td className="border border-gray-200 px-4 py-3">₹{student.balanceFees.toLocaleString()}</td>
                    <td className="border border-gray-200 px-4 py-3">{formatDate(student.dueDate)}</td>
                    <td className="border border-gray-200 px-4 py-3">{getStatusBadge(student.status)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="border border-gray-200 px-4 py-8 text-center text-gray-500">
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

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Fee Status</h2>
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
      </div>

      {/* Course Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredCourses.length > 0 ? (
          filteredCourses.map((course) => (
            <div
              key={course.id}
              onClick={() => handleCourseClick(course)}
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
    </div>
  );
};

export default Feesection;