"use client";
import { useState } from 'react';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import axios from 'axios';

import { useSelector , useDispatch } from 'react-redux';

import { setdb, setEmail, setRank } from '@/slices/adminSlice';

import { useRouter } from 'next/navigation';
import { toast , ToastContainer } from 'react-toastify';
import { decryptData } from '@/util/Data_protection';



export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    client_id: '',
    admin_id: '',
    password: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const dispatch = useDispatch();

  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    // setLoading(true);

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}adminlogin`, formData);


      if(response.data.payload?.rank){
        dispatch(setRank(decryptData(response.data.payload.rank , process.env.NEXT_PUBLIC_API_KEY)))
      }

      if(response.data.payload?.db){
        dispatch(setdb(decryptData(response.data.payload.db , process.env.NEXT_PUBLIC_API_KEY)))
      }

      if(response.data.payload?.email){
        dispatch(setEmail(response.data.payload.email))
      }


      router.push("/dashboard");




    } catch (error) {
      if(error.response.data?.message){
        toast.error(error.response.data?.message)
      }else{
        toast.error("Something Went Wrong")
      }
    }

    
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center ">
      {/* Background Blurs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-yellow-300/10 rounded-full blur-2xl"></div>
      </div>

      {/* Card */}
      <div className="relative w-full max-w-lg">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 transition-all duration-300 hover:scale-[1.02]">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-blue-700 rounded-xl mx-auto mb-6 flex items-center justify-center shadow-lg transform hover:rotate-12 transition-transform duration-300">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold bg-blue-700 bg-clip-text text-transparent">
              Classes&nbsp;Management&nbsp;System
            </h1>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Client ID */}
            <div className="group">
              
              <input
                id="client_id"
                name="client_id"
                type="text"
                value={formData.client_id}
                onChange={handleInputChange}
                placeholder="Enter Client ID"
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/20 transition-all"
              />
            </div>

            {/* Admin ID */}
            <div className="group">
            
              <input
                id="admin_id"
                name="admin_id"
                type="text"
                value={formData.admin_id}
                onChange={handleInputChange}
                placeholder="Enter Admin ID"
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/20 transition-all"
              />
            </div>

            {/* Password */}
            <div className="group">
              
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter Password"
                  className="w-full px-4 py-3 pr-12 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-indigo-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Forgot/Change Password */}
            <div className="text-right">
              <button
                type="button"
                className="text-sm text-blue-700 hover:text-purple-600 hover:underline transition-all"
                onClick={() => console.log("Forgot/Change Password clicked")}
              >
                Forgot Password / Change Password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-6 bg-blue-700 text-white font-semibold rounded-2xl hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 shadow-lg"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.3 0 0 5.3 0 12h4zm2 5.3A7.96 7.96 0 014 12H0c0 3.04 1.13 5.82 3 7.94l3-2.64z" />
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <LogIn className="h-5 w-5 mr-3" />
                  Sign in
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-4 text-blue-800 text-sm">
          <span className="font-medium">Powered by </span>
          <span className="font-semibold text-lg  bg-clip-text ">T-Rex Infotech</span>
        </div>
      </div>
      <ToastContainer/>
    </div>
  );
}
