"use client";
import { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  ArrowUp, 
  ArrowDown, 
  X, 
  CheckCircle, 
  Shield, 
  Eye, 
  EyeOff, 
  Key, 
  Edit, 
  Trash2, 
  User 
} from 'lucide-react';
import _ from 'lodash';

const initialAdmins = [
  {
    admin_id: "AD001",
    admin_name: "John Admin",
    email: "john.admin@example.com",
    mobile_number: "+1-555-0123",
    created_date: "2023-01-15",
    status: "active",
    last_login: "2023-05-18 14:30:22"
  },
  {
    admin_id: "AD002",
    admin_name: "Sarah Manager",
    email: "sarah.manager@example.com",
    mobile_number: "+1-555-0456",
    created_date: "2023-02-10",
    status: "active",
    last_login: "2023-05-20 09:15:43"
  },
  {
    admin_id: "AD003",
    admin_name: "Michael Editor",
    email: "michael.editor@example.com",
    mobile_number: "+1-555-0789",
    created_date: "2023-03-05",
    status: "inactive",
    last_login: "2023-04-30 16:22:10"
  },
  {
    admin_id: "AD004",
    admin_name: "Jessica Analyst",
    email: "jessica.analyst@example.com",
    mobile_number: "+1-555-0321",
    created_date: "2023-03-20",
    status: "active",
    last_login: "2023-05-19 11:05:38"
  },
  {
    admin_id: "AD005",
    admin_name: "David Support",
    email: "david.support@example.com",
    mobile_number: "+1-555-0654",
    created_date: "2023-04-10",
    status: "active",
    last_login: "2023-05-20 10:45:12"
  }
];

export default function AdminManagement() {
  const [admins, setAdmins] = useState(initialAdmins);
  const [currentPage, setCurrentPage] = useState(1);
  const [adminsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState('admin_id');
  const [sortDirection, setSortDirection] = useState('asc');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showPassword, setShowPassword] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    admin_name: "",
    email: "",
    password: "",
    confirm_password: "",
    status: "active"
  });

  // Memoized filtering logic
  const filteredAdmins = useMemo(() => {
    let filtered = [...admins];
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(admin => admin.status === statusFilter);
    }
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(admin => 
        admin.admin_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.admin_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.email.toLowerCase().includes(searchTerm.toLowerCase())
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

  // Get current admins for pagination
  const indexOfLastAdmin = currentPage * adminsPerPage;
  const indexOfFirstAdmin = indexOfLastAdmin - adminsPerPage;
  const currentAdmins = sortedAdmins.slice(indexOfFirstAdmin, indexOfLastAdmin);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Open edit form
  const openEditForm = (admin) => {
    setCurrentAdmin({ ...admin });
    setNewAdmin({
      ...admin,
      password: "",
      confirm_password: ""
    });
    setShowEditForm(true);
  };

  // Handle input change for admin form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAdmin({
      ...newAdmin,
      [name]: value
    });
  };

  // Validate email format
  const isEmailValid = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validate form
  const validateForm = () => {
    // Adding a new admin requires password
    if (!showEditForm) {
      if (!newAdmin.password || newAdmin.password.length < 8) {
        alert("Password must be at least 8 characters long");
        return false;
      }
      if (newAdmin.password !== newAdmin.confirm_password) {
        alert("Passwords do not match");
        return false;
      }
    } else {
      // For editing, only validate password if provided
      if (newAdmin.password && newAdmin.password.length < 8) {
        alert("Password must be at least 8 characters long");
        return false;
      }
      if (newAdmin.password && newAdmin.password !== newAdmin.confirm_password) {
        alert("Passwords do not match");
        return false;
      }
    }
    
    // Email validation
    if (!isEmailValid(newAdmin.email)) {
      alert("Please enter a valid email address");
      return false;
    }
    
    return true;
  };

  // Handle form submission for adding new admin
  const handleSubmit = () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    // Generate new ID
    const newId = `AD${String(admins.length + 1).padStart(3, '0')}`;
    
    const adminToAdd = {
      ...newAdmin,
      admin_id: newId,
      created_date: new Date().toISOString().split('T')[0],
      last_login: "-"
    };
    
    // Remove password fields before storing
    const { password, confirm_password, ...adminToStore } = adminToAdd;
    
    // Simulate API call with a delay
    setTimeout(() => {
      setAdmins([...admins, adminToStore]);
      setNewAdmin({
        admin_name: "",
        email: "",
        password: "",
        confirm_password: "",
        status: "active"
      });
      setIsLoading(false);
      setShowAddForm(false);
      setSuccessMessage('Admin created successfully!');
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    }, 1000);
  };

  // Handle form submission for updating admin
  const handleUpdate = () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    const adminToUpdate = {
      ...currentAdmin,
      admin_name: newAdmin.admin_name,
      email: newAdmin.email,
      status: newAdmin.status
    };
    
    // Simulate API call with a delay
    setTimeout(() => {
      const updatedAdmins = admins.map(admin => 
        admin.admin_id === adminToUpdate.admin_id ? adminToUpdate : admin
      );
      
      setAdmins(updatedAdmins);
      setNewAdmin({
        admin_name: "",
        email: "",
        password: "",
        confirm_password: "",
        status: "active"
      });
      setIsLoading(false);
      setShowEditForm(false);
      setSuccessMessage('Admin updated successfully!');
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    }, 1000);
  };

  // Handle admin deletion
  const handleDelete = (adminId) => {
    if (window.confirm('Are you sure you want to delete this admin?')) {
      setIsLoading(true);
      
      setTimeout(() => {
        const updatedAdmins = admins.filter(admin => admin.admin_id !== adminId);
        setAdmins(updatedAdmins);
        setIsLoading(false);
        setSuccessMessage('Admin deleted successfully!');
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      }, 1000);
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Placeholder for quick actions (to be implemented)
  const handleQuickAction = (action) => {
    alert(`${action} is not yet implemented.`);
  };

  // Reset form on cancel
  const handleCancel = () => {
    setNewAdmin({
      admin_name: "",
      email: "",
      password: "",
      confirm_password: "",
      status: "active"
    });
    setShowAddForm(false);
    setShowEditForm(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Admin Management</h2>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search admins..."
              className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={handleSearch}
              aria-label="Search admins"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
          <select
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="flex items-center space-x-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            aria-label="Create new admin"
          >
            <Plus size={18} />
            <span>Create Admin</span>
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
      
      {/* Admins Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="py-2 px-4 border-b cursor-pointer" onClick={() => handleSort('admin_id')}>
                <div className="flex items-center">
                  <span>Admin ID</span>
                  {sortColumn === 'admin_id' && (
                    <span className="ml-1">
                      {sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                    </span>
                  )}
                </div>
              </th>
              <th className="py-2 px-4 border-b cursor-pointer" onClick={() => handleSort('admin_name')}>
                <div className="flex items-center">
                  <span>Admin Name</span>
                  {sortColumn === 'admin_name' && (
                    <span className="ml-1">
                      {sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                    </span>
                  )}
                </div>
              </th>
              <th className="py-2 px-4 border-b cursor-pointer" onClick={() => handleSort('email')}>
                <div className="flex items-center">
                  <span>Email</span>
                  {sortColumn === 'email' && (
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
                <td className="py-3 px-4 border-b">{admin.admin_name}</td>
                <td className="py-3 px-4 border-b">{admin.email}</td>
                <td className="py-3 px-4 border-b">{admin.created_date}</td>
                <td className="py-3 px-4 border-b">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    admin.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {admin.status.charAt(0).toUpperCase() + admin.status.slice(1)}
                  </span>
                </td>
                <td className="py-3 px-4 border-b">
                  <div className="flex space-x-2">
                    <button 
                      className="text-green-500 hover:text-green-700"
                      onClick={() => openEditForm(admin)}
                      aria-label={`Edit admin ${admin.admin_name}`}
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleDelete(admin.admin_id)}
                      aria-label={`Delete admin ${admin.admin_name}`}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {currentAdmins.length === 0 && (
              <tr>
                <td colSpan="6" className="py-4 text-center text-gray-500">
                  No admins found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-gray-500">
          Showing {indexOfFirstAdmin + 1} to {Math.min(indexOfLastAdmin, sortedAdmins.length)} of {sortedAdmins.length} entries
        </div>
        <div className="flex space-x-1">
          {Array.from({ length: Math.ceil(sortedAdmins.length / adminsPerPage) }, (_, i) => (
            <button
              key={i}
              onClick={() => paginate(i + 1)}
              className={`px-3 py-1 border ${
                currentPage === i + 1 ? 'bg-blue-500 text-white' : 'bg-white text-gray-500'
              } rounded`}
              aria-label={`Go to page ${i + 1}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
      
      {/* Add Admin Form (Modal) */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-xl max-h-screen overflow-y-auto">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Admin Name *</label>
                <input
                  type="text"
                  name="admin_name"
                  value={newAdmin.admin_name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Enter admin name"
                  required
                  aria-required="true"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={newAdmin.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Enter email address"
                  required
                  aria-required="true"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={newAdmin.password}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md"
                    placeholder="Enter password"
                    required
                    aria-required="true"
                  />
                  <button 
                    type="button"
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                    onClick={togglePasswordVisibility}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Password must be at least 8 characters long</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirm_password"
                    value={newAdmin.confirm_password}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md"
                    placeholder="Confirm password"
                    required
                    aria-required="true"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  value={newAdmin.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  aria-label="Select admin status"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                aria-label="Cancel creating admin"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isLoading || !newAdmin.admin_name || !newAdmin.email || !newAdmin.password || !newAdmin.confirm_password}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
                aria-label="Create new admin"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </div>
                ) : 'Create Admin'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Admin Form (Modal) */}
      {showEditForm && currentAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Edit Admin: {currentAdmin.admin_name}</h3>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Admin ID</label>
                <input
                  type="text"
                  value={currentAdmin.admin_id}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                  disabled
                  aria-label="Admin ID (read-only)"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Admin Name *</label>
                <input
                  type="text"
                  name="admin_name"
                  value={newAdmin.admin_name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Enter admin name"
                  required
                  aria-required="true"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={newAdmin.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Enter email address"
                  required
                  aria-required="true"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Change Password (Optional)</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={newAdmin.password}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md"
                    placeholder="Enter new password"
                  />
                  <button 
                    type="button"
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                    onClick={togglePasswordVisibility}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Leave blank to keep current password</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirm_password"
                    value={newAdmin.confirm_password}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  value={newAdmin.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  aria-label="Select admin status"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Login</label>
                <input
                  type="text"
                  value={currentAdmin.last_login}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                  disabled
                  aria-label="Last login (read-only)"
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                aria-label="Cancel editing admin"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                disabled={isLoading || !newAdmin.admin_name || !newAdmin.email}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
                aria-label="Update admin"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </div>
                ) : 'Update Admin'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Admin Actions */}
      <div className="mt-6">
        <h3 className="font-medium text-gray-700 mb-3">Quick Admin Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors disabled:opacity-50"
            onClick={() => handleQuickAction('Reset Admin Password')}
            disabled
            aria-label="Reset admin password (coming soon)"
            title="Coming soon"
          >
            <div className="flex items-center">
              <div className="bg-purple-100 p-2 rounded-lg">
                <User className="text-purple-600" size={20} />
              </div>
              <div className="ml-3">
                <h4 className="font-medium">Reset Admin Password</h4>
                <p className="text-sm text-gray-500">Send password reset links</p>
              </div>
            </div>
          </button>
          
          <button 
            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors disabled:opacity-50"
            onClick={() => handleQuickAction('Bulk Edit Admins')}
            disabled
            aria-label="Bulk edit admins (coming soon)"
            title="Coming soon"
          >
            <div className="flex items-center">
              <div className="bg-green-100 p-2 rounded-lg">
                <Edit className="text-green-600" size={20} />
              </div>
              <div className="ml-3">
                <h4 className="font-medium">Bulk Edit Admins</h4>
                <p className="text-sm text-gray-500">Edit multiple admin accounts</p>
              </div>
            </div>
          </button>
          
          <button 
            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors disabled:opacity-50"
            onClick={() => handleQuickAction('Clean Inactive Accounts')}
            disabled
            aria-label="Clean inactive accounts (coming soon)"
            title="Coming soon"
          >
            <div className="flex items-center">
              <div className="bg-red-100 p-2 rounded-lg">
                <Trash2 className="text-red-600" size={20} />
              </div>
              <div className="ml-3">
                <h4 className="font-medium">Clean Inactive Accounts</h4>
                <p className="text-sm text-gray-500">Remove inactive admin accounts</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-5 rounded-lg shadow-lg flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Processing your request...</span>
          </div>
        </div>
      )}
    </div>
  );
}