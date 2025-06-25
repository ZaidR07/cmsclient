"use client";
import { useState, useEffect } from "react";
import {
  Home,
  Users,
  BookOpen,
  GraduationCap,
  DollarSign,
  UserCog,
  Settings,
  Menu,
  X,
  LogOut,
  UserPlusIcon,
  IndianRupeeIcon,
  UserPlus2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import StudentsManagement from "@/components/Students";
import ExamsManagement from "@/components/Exams";
import CoursesManagement from "@/components/Courses";
import AdminManagement from "@/components/Admin";
import { decryptData } from "@/util/Data_protection";
import { useSelector, useDispatch } from "react-redux";
import Settingstab from "@/components/Settings";
import Feesection from "@/components/Feesection";
import EnquiryManagement from "@/components/Enquiry";
import { useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { setdb, setEmail, setRank } from "@/slices/adminSlice";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isLoading, setIsLoading] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const [statsData, setStatsData] = useState([]);
  const [visitorData, setVisitorData] = useState([]);

  const dispatch = useDispatch();
  const router = useRouter();

  const adminemailstate = useSelector((state: any) => state.admin.email);

  const adminrankstate = useSelector((state: any) => state.admin.rank);

  const admindbstate = useSelector((state: any) => state.admin.db);

  const sidebarItems = [
    { icon: <Home size={20} />, label: "Dashboard", value: "dashboard" },
    { icon: <Users size={20} />, label: "Students", value: "students" },
    { icon: <GraduationCap size={20} />, label: "Exams", value: "exams" },
    { icon: <BookOpen size={20} />, label: "Courses", value: "courses" },
    { icon: <DollarSign size={20} />, label: "Fees", value: "fees" },
    {
      icon: <UserPlusIcon size={20} />,
      label: "Enquiries",
      value: "enquiries",
    },
    ...(adminrankstate == "1"
      ? [
          { icon: <UserCog size={20} />, label: "Admin", value: "admin" },
          {
            icon: <Settings size={20} />,
            label: "Settings",
            value: "settings",
          },
        ]
      : []),
  ];

  // Load open enquiries data
  const LoadData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetching stats for cards
      const statsResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}getdashboardnumbers`,
        {
          params: {
            db: admindbstate,
          },
        }
      );
      setStatsData(statsResponse.data.payload || []);

      // Fetching chart data
      const chartResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}getvisitornumbers`,
        {
          params: {
            db: admindbstate,
          },
        }
      );
      setVisitorData(chartResponse.data.payload || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to Load Dashboard Data");
    } finally {
      setIsLoading(false);
    }
  }, [admindbstate]);

  // Reload when switching to dashboard tab
  useEffect(() => {
    if (activeTab === "dashboard") {
      LoadData();
    }
  }, [activeTab, LoadData]);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`${
          isSidebarOpen ? "w-64" : "w-20"
        } bg-white h-full shadow-lg transition-all duration-300 fixed`}
      >
        <div className="p-4 flex items-center justify-between border-b">
          {isSidebarOpen && (
            <h1 className="text-xl font-bold text-gray-800">Control Panel</h1>
          )}
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <div className="py-4">
          {sidebarItems.map((item) => (
            <div
              key={item.value}
              onClick={() => setActiveTab(item.value)}
              className={`flex items-center px-4 py-3 cursor-pointer transition-colors ${
                activeTab === item.value
                  ? "bg-blue-50 text-blue-600"
                  : "hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center">
                {item.icon}
                {isSidebarOpen && (
                  <span className="ml-3 text-sm">{item.label}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="absolute bottom-0 w-full p-4 border-t">
          <div
            onClick={() => {
              dispatch(setRank(""));
              dispatch(setdb(""));
              dispatch(setEmail(""));
              router.push("/");
            }}
            className="flex items-center cursor-pointer text-red-500 hover:bg-red-50 px-4 py-2 rounded-md"
          >
            <LogOut size={20} />
            {isSidebarOpen && <span className="ml-3 text-sm">Logout</span>}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        className={` flex-1 ${
          isSidebarOpen ? "ml-64 w-[80%]" : "ml-20"
        } transition-all duration-300`}
      >
        {/* Header */}
        <header className="bg-white shadow-sm px-4 py-2">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-800">
              {sidebarItems.find((item) => item.value === activeTab)?.label ||
                "Dashboard"}
            </h1>
            <div className="flex items-center">
              <div className="flex flex-col gap-2 items-end space-x-2">
                <div className="w-8 h-8 text-xl rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                  {adminemailstate.slice(0, 1)}
                </div>
                <div className="hidden md:block">
                  {/* <p className="text-sm font-medium">{adminemailstate}</p> */}
                  <p className="text-xs text-gray-500">{adminemailstate}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-6">
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statsData.map((stat, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg shadow-sm p-6 flex justify-between items-center"
                  >
                    <div>
                      <p className="text-sm text-gray-500">{stat.title}</p>
                      <p className="text-2xl font-bold mt-1">{stat.count}</p>
                    </div>
                    {stat.icon == "Users" && (
                      <div className="p-3 bg-gray-50 rounded-full">
                        <Users className="text-blue-700" size={28} />
                      </div>
                    )}
                    {stat.icon == "Course" && (
                      <div className="p-3 bg-gray-50 rounded-full">
                        <BookOpen className="text-blue-700" size={28} />
                      </div>
                    )}
                    {stat.icon == "Admission" && (
                      <div className="p-3 bg-gray-50 rounded-full">
                        <UserPlus2 className="text-blue-700" size={28} />
                      </div>
                    )}
                    {stat.icon == "Fee" && (
                      <div className="p-3 bg-gray-50 rounded-full">
                        <IndianRupeeIcon className="text-blue-700" size={28} />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Visitor Chart */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">
                  Yearly Visitors Overview
                </h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={visitorData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="visitors" fill="#3B82F6" name="Visitors" />
                      <Bar
                        dataKey="enquiries"
                        fill="#10B981"
                        name="Enquiries"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeTab === "students" && (
            <div>
              <StudentsManagement />
            </div>
          )}

          {activeTab === "exams" && (
            <div>
              <ExamsManagement />
            </div>
          )}
          {activeTab === "courses" && (
            <div>
              <CoursesManagement />
            </div>
          )}
          {activeTab === "fees" && (
            <div>
              <Feesection />
            </div>
          )}
          {activeTab === "enquiries" && (
            <div>
              <EnquiryManagement />
            </div>
          )}

          {adminrankstate == "1" && (
            <>
              {activeTab === "admin" && (
                <div>
                  <AdminManagement />
                </div>
              )}
              {activeTab === "settings" && (
                <div>
                  <Settingstab />
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
