"use client"
import { useState } from 'react';
import { 
  Home, Users, BookOpen, GraduationCap, DollarSign, 
  Award, UserCog, Settings, Menu, X, LogOut, Search
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import StudentsManagement from '@/components/Students';
import ExamsManagement from '@/components/Exams';
import CoursesManagement from '@/components/Courses';
import AdminManagement from '@/components/Admin';
import { decryptData } from '@/util/Data_protection';
import { useSelector } from 'react-redux';
import Settingstab from '@/components/Settings';

// Sample data for the visitors chart
const visitorData = [
  { name: 'Jan', visitors: 400 },
  { name: 'Feb', visitors: 300 },
  { name: 'Mar', visitors: 600 },
  { name: 'Apr', visitors: 800 },
  { name: 'May', visitors: 500 },
  { name: 'Jun', visitors: 400 },
  { name: 'Jul', visitors: 300 },
  { name: 'Aug', visitors: 500 },
  { name: 'Sep', visitors: 700 },
  { name: 'Oct', visitors: 900 },
  { name: 'Nov', visitors: 600 },
  { name: 'Dec', visitors: 400 }
];

// Dashboard Stats Data
const statsData = [
  { title: 'Total Students', count: 1250, icon: <Users size={24} className="text-blue-500" /> },
  { title: 'Total Courses', count: 42, icon: <BookOpen size={24} className="text-green-500" /> },
  { title: 'Upcoming Exams', count: 8, icon: <GraduationCap size={24} className="text-yellow-500" /> },
  { title: 'Pending Fees', count: 63, icon: <DollarSign size={24} className="text-red-500" /> }
];

export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const sidebarItems = [
    { icon: <Home size={20} />, label: 'Dashboard', value: 'dashboard' },
    { icon: <Users size={20} />, label: 'Students', value: 'students' },
    { icon: <GraduationCap size={20} />, label: 'Exams', value: 'exams' },
    { icon: <BookOpen size={20} />, label: 'Courses', value: 'courses' },
    { icon: <DollarSign size={20} />, label: 'Fees', value: 'fees' },
    { icon: <Award size={20} />, label: 'Certificate', value: 'certificate' },
    { icon: <UserCog size={20} />, label: 'Admin', value: 'admin' },
    { icon: <Settings size={20} />, label: 'Settings', value: 'settings' }
  ];

  const adminemailstate = useSelector((state: any) => state.admin.email); 

  



  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-white h-full shadow-lg transition-all duration-300 fixed`}>
        <div className="p-4 flex items-center justify-between border-b">
          {isSidebarOpen && <h1 className="text-xl font-bold text-gray-800">Control Panel</h1>}
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
                activeTab === item.value ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center">
                {item.icon}
                {isSidebarOpen && <span className="ml-3 text-sm">{item.label}</span>}
              </div>
            </div>
          ))}
        </div>
        
        <div className="absolute bottom-0 w-full p-4 border-t">
          <div className="flex items-center cursor-pointer text-red-500 hover:bg-red-50 px-4 py-2 rounded-md">
            <LogOut size={20} />
            {isSidebarOpen && <span className="ml-3 text-sm">Logout</span>}
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className={`flex-1 ${isSidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300`}>
        {/* Header */}
        <header className="bg-white shadow-sm px-4 py-2" >
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-800">
              {sidebarItems.find(item => item.value === activeTab)?.label || 'Dashboard'}
            </h1>
            <div className="flex items-center">
              {/* <div className="relative mr-8">
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              </div> */}
              <div className="flex flex-col gap-2 items-end space-x-2">
                <div className="w-8 h-8 text-xl rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                  {adminemailstate.slice(0,1)}
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
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statsData.map((stat, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-sm p-6 flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-500">{stat.title}</p>
                      <p className="text-2xl font-bold mt-1">{stat.count}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-full">
                      {stat.icon}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Visitor Chart */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">Yearly Visitors Overview</h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={visitorData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="visitors" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'students' && (
            <div>
              {/* <p className="text-gray-500">Students management module will be displayed here.</p> */}
              <StudentsManagement/>
            </div>
          )}
          {activeTab === 'exams' && (
            <div>
              <ExamsManagement/>
            </div>
          )}
          {activeTab === 'courses' && (
            <div>
              <CoursesManagement/>c
            </div>
          )}
          {activeTab === 'admin' && (
            <div>
              <AdminManagement/>c
            </div>
          )}
          {activeTab === 'settings' && (
            <div>
              <Settingstab/>
            </div>
          )}
          
          {/* {activeTab !== 'dashboard' && activeTab !== 'students' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-2">{sidebarItems.find(item => item.value === activeTab)?.label} Module</h2>
              <p className="text-gray-500">This module is under development.</p>
            </div>
          )} */}
        </main>
      </div>
    </div>
  );
}