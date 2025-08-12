"use client";
import { useState, useEffect, useMemo } from "react";
import {
  Search,
  Plus,
  X,
  Edit,
  Trash2,
} from "lucide-react";
import _ from "lodash";
import axios from "axios";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { formatToDDMMYYYY } from "@/util/DateConverter";

interface Admin {
  admin_id: string;
  name: string;
  email: string;
  mobile: string;
  status: string;
  createdAt: string;
  last_login?: string;
}

interface NewAdmin {
  name: string;
  email: string;
  mobile: string;
}

export default function AdminManagement() {
  const [currentPage, setCurrentPage] = useState(1);
  const [adminsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState<keyof Admin>("admin_id");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [newAdmin, setNewAdmin] = useState<NewAdmin>({
    name: "",
    email: "",
    mobile: "",
  });
  const [admins, setAdmins] = useState<Admin[]>([]);

  const admindbstate = useSelector((state: any) => state.admin.db);

  // Data fetching functions
  const loadAdmins = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}getadmins`,
        { params: { db: admindbstate } }
      );
      setAdmins(response.data.payload || []);
    } catch (error) {
      toast.error("Failed to load admin data");
      console.error("Error loading admins:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Add new admin
  const addAdmin = async (adminData: NewAdmin) => {
    try {
      setIsLoading(true);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}addupdateadmin`,
        {
          payload: {
            ...adminData,
            db: admindbstate,
          },
        }
      );

      if (response.data.success) {
        toast.success("Admin created successfully!");
        await loadAdmins();
        return true;
      } else {
        toast.error(response.data.message || "Failed to create admin");
        return false;
      }
    } catch (error) {
      toast.error("Error creating admin");
      console.error("Error adding admin:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Update admin
  const updateAdmin = async (adminData: Partial<Admin>) => {
    try {
      setIsLoading(true);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}addupdateadmin`,
        {
          payload: {
            ...adminData,
            db: admindbstate,
          },
        }
      );

      if (response.data.success) {
        toast.success("Admin updated successfully!");
        await loadAdmins();
        return true;
      } else {
        toast.error(response.data.message || "Failed to update admin");
        return false;
      }
    } catch (error) {
      toast.error("Error updating admin");
      console.error("Error updating admin:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete admin
  const deleteAdmin = async (adminId: string) => {
    try {
      setIsLoading(true);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}deleteadmin`,
        {
          payload: {
            admin_id: adminId,
            db: admindbstate,
          },
        }
      );

      toast.success("Admin deleted successfully!");
      await loadAdmins();
      return true;
      
    } catch (error) {
      toast.error("Error deleting admin");
      console.error("Error deleting admin:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on component mount and when db changes
  useEffect(() => {
    if (admindbstate) loadAdmins();
  }, [admindbstate]);

  // Memoized filtering logic
  const filteredAdmins = useMemo(() => {
    let filtered = [...admins];

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((admin) => admin.status === statusFilter);
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (admin) =>
          admin.admin_id?.toLowerCase().includes(term) ||
          admin.name?.toLowerCase().includes(term) ||
          admin.email?.toLowerCase().includes(term) ||
          admin.mobile?.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [searchTerm, admins, statusFilter]);

  // Memoized sorting logic
  const sortedAdmins = useMemo(() => {
    return _.orderBy(filteredAdmins, [sortColumn], [sortDirection]);
  }, [filteredAdmins, sortColumn, sortDirection]);

  // Reset current page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredAdmins]);

  // Handle column sorting
  const handleSort = (column: keyof Admin) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // Get current admins for pagination
  const indexOfLastAdmin = currentPage * adminsPerPage;
  const indexOfFirstAdmin = indexOfLastAdmin - adminsPerPage;
  const currentAdmins = sortedAdmins.slice(indexOfFirstAdmin, indexOfLastAdmin);

  // Open edit form
  const openEditForm = (admin: Admin) => {
    setCurrentAdmin(admin);
    setNewAdmin({
      name: admin.name,
      email: admin.email,
      mobile: admin.mobile,
    });
    setShowEditForm(true);
  };

  // Validate email format
  const isEmailValid = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validate mobile format
  const isMobileValid = (mobile: string) => {
    const mobileRegex = /^[0-9]{10}$/;
    return mobileRegex.test(mobile);
  };

  // Validate form
  const validateForm = () => {
    if (!newAdmin.name.trim()) {
      toast.error("Admin name is required");
      return false;
    }

    if (!isEmailValid(newAdmin.email)) {
      toast.error("Please enter a valid email address");
      return false;
    }

    if (!isMobileValid(newAdmin.mobile)) {
      toast.error("Please enter a valid 10-digit mobile number");
      return false;
    }

    return true;
  };

  // Handle form submission for adding new admin
  const handleSubmit = async () => {
    if (!validateForm()) return;

    const success = await addAdmin(newAdmin);

    if (success) {
      setNewAdmin({
        name: "",
        email: "",
        mobile: "",
      });
      setShowAddForm(false);
    }
  };

  // Handle form submission for updating admin
  const handleUpdate = async () => {
    if (!currentAdmin || !validateForm()) return;

    const adminToUpdate = {
      admin_id: currentAdmin.admin_id,
      name: newAdmin.name,
      email: newAdmin.email,
      mobile: newAdmin.mobile,
    };

    const success = await updateAdmin(adminToUpdate);

    if (success) {
      setNewAdmin({
        name: "",
        email: "",
        mobile: "",
      });
      setShowEditForm(false);
    }
  };

  // Handle admin deletion
  const handleDelete = async (adminId: string) => {
    if (window.confirm("Are you sure you want to delete this admin?")) {
      await deleteAdmin(adminId);
    }
  };

  // Reset form on cancel
  const handleCancel = () => {
    setNewAdmin({
      name: "",
      email: "",
      mobile: "",
    });
    setShowAddForm(false);
    setShowEditForm(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-xl font-semibold">Admin Management</h2>
        <div className="flex flex-col md:flex-row items-start md:items-center w-full md:w-auto gap-3">
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Search admins..."
              className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search admins"
            />
            <Search
              className="absolute left-3 top-2.5 text-gray-400"
              size={18}
            />
          </div>
          <select
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-auto"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by status"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center justify-center space-x-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 w-full md:w-auto"
            aria-label="Create new admin"
          >
            <Plus size={18} />
            <span>Create Admin</span>
          </button>
        </div>
      </div>

      {/* Admins Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th
                className="py-2 px-4 border-b cursor-pointer"
                onClick={() => handleSort("admin_id")}
              >
                <div className="flex items-center">
                  <span>Admin ID</span>
                </div>
              </th>
              <th
                className="py-2 px-4 border-b cursor-pointer"
                onClick={() => handleSort("name")}
              >
                <div className="flex items-center">
                  <span>Admin&nbsp;Name</span>
                </div>
              </th>
              <th
                className="py-2 px-4 border-b cursor-pointer"
                onClick={() => handleSort("email")}
              >
                <div className="flex items-center">
                  <span>Email</span>
                </div>
              </th>
              <th
                className="py-2 px-4 border-b cursor-pointer"
                onClick={() => handleSort("mobile")}
              >
                <div className="flex items-center">
                  <span>Mobile</span>
                </div>
              </th>
              <th
                className="py-2 px-4 border-b cursor-pointer"
                onClick={() => handleSort("createdAt")}
              >
                <div className="flex items-center">
                  <span>Created&nbsp;Date</span>
                </div>
              </th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentAdmins.map((admin) => (
              <tr key={admin.admin_id} className="hover:bg-gray-50">
                <td className="py-3 px-4 border-b">
                  <span className="font-medium text-gray-700">
                    {admin.admin_id}
                  </span>
                </td>
                <td className="py-3 px-4 border-b">{admin.name}</td>
                <td className="py-3 px-4 border-b">{admin.email}</td>
                <td className="py-3 px-4 border-b">{admin.mobile}</td>
                <td className="py-3 px-4 border-b">
                  {formatToDDMMYYYY(admin.createdAt)}
                </td>
                <td className="py-3 px-4 border-b">
                  <div className="flex space-x-2">
                    <button
                      className="text-green-500 hover:text-green-700"
                      onClick={() => openEditForm(admin)}
                      aria-label={`Edit admin ${admin.name}`}
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleDelete(admin.admin_id)}
                      aria-label={`Delete admin ${admin.name}`}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {currentAdmins.length === 0 && (
              <tr>
                <td colSpan={6} className="py-4 text-center text-gray-500">
                  {isLoading ? "Loading admins..." : "No admins found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col md:flex-row justify-between items-center mt-4 gap-4">
        <div className="text-sm text-gray-500">
          Showing {indexOfFirstAdmin + 1} to{" "}
          {Math.min(indexOfLastAdmin, sortedAdmins.length)} of{" "}
          {sortedAdmins.length} entries
        </div>
        <div className="flex flex-wrap gap-1">
          {Array.from(
            { length: Math.ceil(sortedAdmins.length / adminsPerPage) },
            (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 border ${
                  currentPage === i + 1
                    ? "bg-blue-500 text-white"
                    : "bg-white text-gray-500"
                } rounded`}
                aria-label={`Go to page ${i + 1}`}
              >
                {i + 1}
              </button>
            )
          )}
        </div>
      </div>

      {/* Add Admin Form (Modal) */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Create New Admin</h3>
              <button
                onClick={handleCancel}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close create admin form"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Admin Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={newAdmin.name}
                  onChange={(e) =>
                    setNewAdmin({ ...newAdmin, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Enter admin name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={newAdmin.email}
                  onChange={(e) =>
                    setNewAdmin({ ...newAdmin, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Enter email address"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  name="mobile"
                  value={newAdmin.mobile}
                  onChange={(e) =>
                    setNewAdmin({ ...newAdmin, mobile: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Enter 10-digit mobile number"
                  required
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={
                  isLoading ||
                  !newAdmin.name ||
                  !newAdmin.email ||
                  !newAdmin.mobile
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
                  "Create Admin"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Admin Form (Modal) */}
      {showEditForm && currentAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                Edit Admin: {currentAdmin.name}
              </h3>
              <button
                onClick={handleCancel}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close edit admin form"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Admin Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={newAdmin.name}
                  onChange={(e) =>
                    setNewAdmin({ ...newAdmin, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Enter admin name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={newAdmin.email}
                  onChange={(e) =>
                    setNewAdmin({ ...newAdmin, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Enter email address"
                  disabled
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  name="mobile"
                  value={newAdmin.mobile}
                  onChange={(e) =>
                    setNewAdmin({ ...newAdmin, mobile: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Enter 10-digit mobile number"
                  required
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                disabled={
                  isLoading ||
                  !newAdmin.name ||
                  !newAdmin.email ||
                  !newAdmin.mobile
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
                  "Update Admin"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-5 rounded-lg shadow-lg flex items-center">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500"
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
            <span>Processing your request...</span>
          </div>
        </div>
      )}
    </div>
  );
}
