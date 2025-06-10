"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Download,
  Plus,
  ArrowUp,
  ArrowDown,
  X,
  CheckCircle,
  Book,
  Tag,
  Edit,
  Trash2,
} from "lucide-react";
import _ from "lodash";
import Image from "next/image";
import axios from "axios";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

export default function CoursesManagement() {
  const [courses, setCourses] = useState();
  const [filteredCourses, setFilteredCourses] = useState();
  const [currentPage, setCurrentPage] = useState(1);
  const [coursesPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState("course_id");
  const [sortDirection, setSortDirection] = useState("asc");
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [currentCourse, setCurrentCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [newCourse, setNewCourse] = useState({
    course_name: "",
    about: "",
    image: "/api/placeholder/400/300",
    status: "active",
    mrp: 0,
    discountedprice: 0,
    highlights: [""],
  });
  const [highlightInput, setHighlightInput] = useState("");
  const [imagePreview, setImagePreview] = useState(newCourse.image);
  const [updateID, setUpdateID] = useState("");

  const admindbstate = useSelector((state: any) => state.admin.db);

  // Filter courses when search term changes
  useEffect(() => {
    let filtered = courses;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered?.filter(
        (course) =>
          course.course_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.about.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.createdAt.includes(searchTerm)
      );
    }

    setFilteredCourses(filtered);
    setCurrentPage(1);
  }, [searchTerm, courses]);

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

  // Get current courses for pagination
  const indexOfLastCourse = currentPage * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses = filteredCourses?.slice(
    indexOfFirstCourse,
    indexOfLastCourse
  );

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Open view modal
  const openViewModal = (course) => {
    setCurrentCourse(course);
    setShowViewModal(true);
  };

  // Open edit form
  const openEditForm = (course) => {
    setCurrentCourse({ ...course });
    setNewCourse({ ...course });
    setImagePreview(course.image);
    setShowEditForm(true);
  };

  // Handle input change for course form
  const handleInputChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image" && files[0]) {
      const file = files[0];
      setNewCourse({
        ...newCourse,
        image: URL.createObjectURL(file),
      });
      setImagePreview(URL.createObjectURL(file));
    } else if (name === "mrp") {
      setNewCourse({
        ...newCourse,
        [name]: parseFloat(value) || 0,
      });
    } else {
      setNewCourse({
        ...newCourse,
        [name]: value,
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
        highlights: [...newCourse.highlights, highlightInput.trim()],
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
      highlights: updatedHighlights,
    });
  };

  // Update highlight
  const updateHighlight = (index, value) => {
    const updatedHighlights = [...newCourse.highlights];
    updatedHighlights[index] = value;
    setNewCourse({
      ...newCourse,
      highlights: updatedHighlights,
    });
  };

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

      setNewCourse({
        ...newCourse,
        image: file,
      });

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const LoadData = useCallback(async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}getcourses`,
        {
          params: { db: admindbstate },
        }
      );

      setCourses(response.data.payload); // Handle data as needed
      setFilteredCourses(response.data.payload);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  }, [admindbstate]);

  useEffect(() => {
    LoadData();
  }, [LoadData]);

  // Handle form submission for adding new course

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (
      !newCourse.course_name ||
      !newCourse.about ||
      !newCourse.image ||
      !newCourse.mrp ||
      !newCourse.discountedprice ||
      newCourse.highlights.length === 0
    ) {
      toast.error("Required Fields are Missing");
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();

      formData.append("course_name", newCourse.course_name);
      formData.append("about", newCourse.about);
      formData.append("status", newCourse.status);
      formData.append("mrp", newCourse.mrp);
      formData.append("discountedprice", newCourse.discountedprice);

      formData.append("folder", admindbstate);
     

      // If image is a file (not just a string URL), append it
      if (newCourse.image instanceof File) {
        formData.append("image", newCourse.image);
      }

      // Append highlights
      const highlights = newCourse.highlights.filter((h) => h.trim() !== "");
      formData.append("highlights", JSON.stringify(highlights));

      // 🔥 Axios POST (correct FormData usage)
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}addupdatecourse`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success("Course added/updated successfully!");

      // Reset form
      setNewCourse({
        course_name: "",
        about: "",
        image: "/api/placeholder/400/300",
        status: "active",
        mrp: 0,
        discountedprice: 0,
        highlights: [""],
      });

      setImagePreview("/api/placeholder/400/300");
      setShowAddForm(false);
      setShowEditForm(false);
      LoadData();
    } catch (error) {
      if (error.response.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something Went Wrong");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle course deletion
  const handleDelete = (courseId) => {};

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
            <Search
              className="absolute left-3 top-2.5 text-gray-400"
              size={18}
            />
          </div>

          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            <Plus size={18} />
            <span>Create Course</span>
          </button>
        </div>
      </div>

      {/* Courses Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th
                className="py-2 px-4 border-b cursor-pointer"
                onClick={() => handleSort("course_id")}
              >
                <div className="flex items-center">
                  <span>Course ID</span>
                  {sortColumn === "course_id" && (
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
              <th className="py-2 px-4 border-b">Image</th>
              <th
                className="py-2 px-4 border-b cursor-pointer"
                onClick={() => handleSort("course_name")}
              >
                <div className="flex items-center">
                  <span>Course Name</span>
                  {sortColumn === "course_name" && (
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
                onClick={() => handleSort("createdAt")}
              >
                <div className="flex items-center">
                  <span>Created Date</span>
                  {sortColumn === "createdAt" && (
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
                onClick={() => handleSort("mrp")}
              >
                <div className="flex items-center">
                  <span>Price</span>
                  {sortColumn === "mrp" && (
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
            {currentCourses?.map((course) => (
              <tr key={course.course_id} className="hover:bg-gray-50">
                <td className="py-3 px-4 border-b">
                  <span className="font-medium text-gray-700">
                    {course.course_id}
                  </span>
                </td>
                <td className="py-3 px-4 border-b">
                  <div className="w-12 h-12 rounded overflow-hidden">
                    <img
                      src={course.imageUrl}
                      alt={course.course_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </td>
                <td className="py-3 px-4 border-b">{course.course_name}</td>
                <td className="py-3 px-4 border-b">{course.createdAt}</td>

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
                      className="text-green seksualitas
                      hover:text-green-700"
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
            {currentCourses?.length === 0 && (
              <tr>
                <td colSpan={7} className="py-4 text-center text-gray-500">
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
          Showing {indexOfFirstCourse + 1} to{" "}
          {Math.min(indexOfLastCourse, filteredCourses?.length)} of{" "}
          {filteredCourses?.length} entries
        </div>
        <div className="flex space-x-1">
          {Array.from(
            { length: Math.ceil(filteredCourses?.length / coursesPerPage) },
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

      {/* Add Course Form (Modal) */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Create New Course</h3>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setImagePreview(newCourse.image);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course Name
                </label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  About
                </label>
                <textarea
                  name="about"
                  value={newCourse.about}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md h-24"
                  placeholder="Enter course description"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course Image
                </label>
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-500 file:text-white hover:file:bg-blue-600"
                />
                {imagePreview && (
                  <Image
                    width={200}
                    height={200}
                    src={imagePreview}
                    alt="preview"
                    className="mt-2"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (MRP)
                </label>
                <input
                  type="number"
                  name="mrp"
                  value={newCourse.mrp > 0 ? newCourse.mrp : ""}
                  onChange={handleInputChange}
                  className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-md"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discounted Price (Real)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="discountedprice"
                    value={
                      newCourse.discountedprice > 0
                        ? newCourse.discountedprice
                        : ""
                    }
                    onChange={handleInputChange}
                    className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-md"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course Highlights
                </label>
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
                onClick={() => {
                  setShowAddForm(false);
                  setImagePreview(newCourse.image);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={
                  isLoading || !newCourse.course_name || !newCourse.about
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
                  "Create Course"
                )}
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
                    src={currentCourse.image}
                    alt={currentCourse.course_name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="mt-4 p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-500">
                      Course ID
                    </span>
                    <span className="font-medium">
                      {currentCourse.course_id}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-500">
                      Price
                    </span>
                    <span className="font-medium">${currentCourse.mrp}</span>
                  </div>

                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-500">
                      Created
                    </span>
                    <span className="font-medium">
                      {currentCourse.createdAt}
                    </span>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                <div className="mb-4">
                  <h4 className="text-xl font-semibold text-gray-800">
                    {currentCourse.course_name}
                  </h4>
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
                        <CheckCircle
                          size={16}
                          className="text-green-500 mr-2 mt-1 flex-shrink-0"
                        />
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
