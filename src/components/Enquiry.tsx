/* eslint-disable */
// @ts-nocheck

"use client";
import { useState, useEffect, useCallback } from "react";
import {
  ArrowUp,
  ArrowDown,
  X,
 
  Mail,
  Phone,
  User,
  MessageSquare,
  Calendar,
} from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { formatToDDMMYYYY } from "@/util/DateConverter";

export default function EnquiryManagement() {
  const [enquiries, setEnquiries] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [enquiriesPerPage] = useState(5);
  const [sortColumn, setSortColumn] = useState("enquiry_id");
  const [sortDirection, setSortDirection] = useState("desc");
  const [currentEnquiry, setCurrentEnquiry] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);

  const admindbstate = useSelector((state) => state.admin.db);

  
  // Sort enquiries
  useEffect(() => {
    const sorted = [...enquiries].sort((a, b) => {
      const valueA = a[sortColumn];
      const valueB = b[sortColumn];

      if (sortColumn === "createdAt" || sortColumn === "updatedAt") {
        return sortDirection === "asc"
          ? new Date(valueA) - new Date(valueB)
          : new Date(valueB) - new Date(valueA);
      }

      return sortDirection === "asc"
        ? String(valueA).localeCompare(String(valueB))
        : String(valueB).localeCompare(String(valueA));
    });

    setEnquiries(sorted);
    setCurrentPage(1);
  }, [sortColumn, sortDirection]);

  // Handle column sorting
  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // Get current enquiries for pagination
  const indexOfLastEnquiry = currentPage * enquiriesPerPage;
  const indexOfFirstEnquiry = indexOfLastEnquiry - enquiriesPerPage;
  const currentEnquiries = enquiries?.slice(
    indexOfFirstEnquiry,
    indexOfLastEnquiry
  );

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Load open enquiries data
  const LoadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}getenquiries`,
        {
          params: {
            db: admindbstate,
          },
        }
      );
      setEnquiries(response.data.payload || []);
    } catch (error) {
      console.error("Error fetching enquiries:", error);
      toast.error("Failed to load enquiries");
    } finally {
      setIsLoading(false);
    }
  }, [admindbstate]);

  useEffect(() => {
    LoadData();
  }, [LoadData]);

 
  // Close enquiry
  const closeEnquiry = async (enquiry) => {
    
    setIsLoading(true);
    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}closeenquiry`,
        {
          enquiry_id: enquiry.enquiry_id,
          db: admindbstate,
        }
      );

      toast.success(response.data.message || "Enquiry closed successfully!");
      await LoadData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to close enquiry");
    } finally {
      setIsLoading(false);
    }
  };

  
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Open Enquiries</h2>
      </div>

      {/* Enquiries Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="py-2 px-4 border-b cursor-pointer">
                <div className="flex items-center">
                  <span>ID</span>
                </div>
              </th>
              <th
                className="py-2 px-4 border-b cursor-pointer"
                onClick={() => handleSort("name")}
              >
                <div className="flex items-center">
                  <span>Name</span>
                  {sortColumn === "name" && (
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
              <th className="py-2 px-4 border-b">Contact</th>
              <th
                className="py-2 px-4 border-b cursor-pointer"
              >
                <div className="flex items-center">
                  <span>Subject</span>
                </div>
              </th>
              <th
                className="py-2 px-4 border-b cursor-pointer"
              >
                <div className="flex items-center">
                  <span>Date</span>
                </div>
              </th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentEnquiries?.map((enquiry) => {
              return (
                <tr key={enquiry.enquiry_id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 border-b">
                    <span className="font-medium text-gray-700">
                      {enquiry.enquiry_id}
                    </span>
                  </td>
                  <td className="py-3 px-4 border-b">
                    <div className="flex items-center">
                      <User size={16} className="text-gray-400 mr-2" />
                      {enquiry.fullname}
                    </div>
                  </td>
                  <td className="py-3 px-4 border-b">
                    <div className="space-y-1">
                      <div className="flex items-center text-sm">
                        <Mail size={12} className="text-gray-400 mr-1" />
                        {enquiry.email}
                      </div>
                      <div className="flex items-center text-sm">
                        <Phone size={12} className="text-gray-400 mr-1" />
                        {enquiry.mobile}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 border-b">
                    <span className="text-sm">{enquiry.subject}</span>
                  </td>
                  
                  <td className="py-3 px-4 border-b">
                    {formatToDDMMYYYY(enquiry.createdAt)}
                  </td>
                  <td className="py-3 px-4 border-b">
                    <div className="flex space-x-2">
                      <button
                        className="text-red-500 hover:text-red-700"
                        onClick={() => closeEnquiry(enquiry)}
                        disabled={isLoading}
                      >
                        Close
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {currentEnquiries?.length === 0 && (
              <tr>
                <td colSpan={7} className="py-4 text-center text-gray-500">
                  No open enquiries found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-gray-500">
          Showing {indexOfFirstEnquiry + 1} to{" "}
          {Math.min(indexOfLastEnquiry, enquiries?.length)} of{" "}
          {enquiries?.length} entries
        </div>
        <div className="flex space-x-1">
          {Array.from(
            { length: Math.ceil(enquiries?.length / enquiriesPerPage) },
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

      

          
    </div>
  );
}
