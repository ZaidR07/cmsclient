/* eslint-disable */
// @ts-nocheck

"use client";
import { useState, useEffect, useCallback } from "react";
import {
  ArrowUp,
  ArrowDown,
  Download,
  FileText,
  Calendar,
  Users,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { formatToDDMMYYYY } from "@/util/DateConverter";

export default function PrintCertificate() {
  const [certificateRequests, setCertificateRequests] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [requestsPerPage] = useState(5);
  const [sortColumn, setSortColumn] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const admindbstate = useSelector((state) => state.admin.db);

  // Sort certificate requests
  useEffect(() => {
    const sorted = [...certificateRequests].sort((a, b) => {
      const valueA = a[sortColumn];
      const valueB = b[sortColumn];

      if (sortColumn === "createdAt") {
        return sortDirection === "asc"
          ? new Date(valueA) - new Date(valueB)
          : new Date(valueB) - new Date(valueA);
      }

      return sortDirection === "asc"
        ? String(valueA).localeCompare(String(valueB))
        : String(valueB).localeCompare(String(valueA));
    });

    setCertificateRequests(sorted);
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

  // Get current requests for pagination
  const indexOfLastRequest = currentPage * requestsPerPage;
  const indexOfFirstRequest = indexOfLastRequest - requestsPerPage;
  const currentRequests = certificateRequests?.slice(
    indexOfFirstRequest,
    indexOfLastRequest
  );

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Load certificate requests data
  const LoadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}getcertificaterequests`,
        {
          params: {
            db: admindbstate,
          },
        }
      );
      setCertificateRequests(response.data.payload || []);
    } catch (error) {
      console.error("Error fetching certificate requests:", error);
      toast.error("Failed to load certificate requests");
    } finally {
      setIsLoading(false);
    }
  }, [admindbstate]);

  useEffect(() => {
    LoadData();
  }, [LoadData]);

  // Download certificates
  const downloadCertificates = async (request) => {
    setIsDownloading(true);
    try {
      const certificateIds = request.certificates.map(
        (cert) => cert.certificate_id
      );

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}downloadcertificates`,
        {
          certificate_ids: certificateIds,
          db: admindbstate,
        },
        {
          responseType: "blob",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Create download link for the PDF
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `certificates_exam_${request.exam_id}.pdf`);
      document.body.appendChild(link);
      link.click();

      // Clean up
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);

      toast.success(`Downloaded ${certificateIds.length} certificates as PDF!`);
    } catch (error) {
      console.error("Error downloading certificates:", error);
      toast.error(
        error.response?.data?.message || "Failed to download certificates"
      );
    } finally {
      setIsDownloading(false);
    }
  };

  
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Certificate Requests</h2>
      </div>

      {/* Certificate Requests Table */}
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
                        <ChevronUp size={14} />
                      ) : (
                        <ChevronDown size={14} />
                      )}
                    </span>
                  )}
                </div>
              </th>
              <th className="py-2 px-4 border-b">
                <div className="flex items-center">
                  <Users size={16} className="mr-1" />
                  <span>Certificates</span>
                </div>
              </th>
              <th
                className="py-2 px-4 border-b cursor-pointer"
                onClick={() => handleSort("createdAt")}
              >
                <div className="flex items-center">
                  <Calendar size={16} className="mr-1" />
                  <span>Request Date</span>
                  {sortColumn === "createdAt" && (
                    <span className="ml-1">
                      {sortDirection === "asc" ? (
                        <ChevronUp size={14} />
                      ) : (
                        <ChevronDown size={14} />
                      )}
                    </span>
                  )}
                </div>
              </th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentRequests?.map((request) => (
              <tr key={request._id} className="hover:bg-gray-50">
                <td className="py-3 px-4 border-b">
                  <span className="font-medium text-gray-700">
                    {request.exam_id}
                  </span>
                </td>
                <td className="py-3 px-4 border-b">
                  <span className="text-sm">
                    {request.certificates?.length || 0} certificates
                  </span>
                </td>
                <td className="py-3 px-4 border-b">
                  {formatToDDMMYYYY(request.createdAt)}
                </td>
                <td className="py-3 px-4 border-b">
                  <button
                    onClick={() => downloadCertificates(request)}
                    disabled={isDownloading}
                    className="flex items-center text-blue-600 hover:text-blue-800"
                  >
                    <Download size={16} className="mr-1" />
                    {isDownloading ? "Downloading..." : "Download PDF"}
                  </button>
                </td>
              </tr>
            ))}
            {currentRequests?.length === 0 && (
              <tr>
                <td colSpan={4} className="py-4 text-center text-gray-500">
                  {isLoading
                    ? "Loading certificate requests..."
                    : "No certificate requests found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-gray-500">
          Showing {indexOfFirstRequest + 1} to{" "}
          {Math.min(indexOfLastRequest, certificateRequests?.length)} of{" "}
          {certificateRequests?.length} entries
        </div>
        <div className="flex space-x-1">
          {Array.from(
            {
              length: Math.ceil(certificateRequests?.length / requestsPerPage),
            },
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
