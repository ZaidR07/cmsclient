"use client";
import { useState, useEffect } from 'react';
import { Eye, EyeOff, LogIn, X, Mail, Lock, Key, Clock, RefreshCw } from 'lucide-react';
import axios from 'axios';

import { useSelector , useDispatch } from 'react-redux';

import { setdb, setEmail, setRank } from '@/slices/adminSlice';

import { useRouter } from 'next/navigation';
import { toast , ToastContainer } from 'react-toastify';
import { decryptData } from '@/util/Data_protection';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(true);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  
  // OTP Timer States
  const [otpExpiry, setOtpExpiry] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    client_id: '',
    admin_id: '',
    password: '',
  });

  const [forgotData, setForgotData] = useState({
    client_id: '',
    admin_id: '',
  });

  const [otpData, setOtpData] = useState({
    otp: '',
    new_password: '',
    confirm_password: '',
  });

  // OTP Timer Effect
  useEffect(() => {
    let interval = null;
    
    if (otpExpiry && showOtpModal) {
      interval = setInterval(() => {
        const now = new Date().getTime();
        const distance = otpExpiry - now;
        
        if (distance > 0) {
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((distance % (1000 * 60)) / 1000);
          setTimeLeft(minutes * 60 + seconds);
          setCanResend(false);
        } else {
          setTimeLeft(0);
          setCanResend(true);
          clearInterval(interval);
        }
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [otpExpiry, showOtpModal]);

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleForgotInputChange = (e) => {
    const { name, value } = e.target;
    setForgotData({
      ...forgotData,
      [name]: value
    });
  };

  const handleOtpInputChange = (e) => {
    const { name, value } = e.target;
    setOtpData({
      ...otpData,
      [name]: value
    });
  };

  const dispatch = useDispatch();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}adminlogin`, formData);

      
      

      if(response.data.payload?.rank){
        dispatch(setRank(decryptData(response.data.payload.rank , process.env.NEXT_PUBLIC_API_KEY)))
      }

      if(response.data.payload?.db){
        dispatch(setdb(decryptData(response.data.payload.db , process.env.NEXT_PUBLIC_API_KEY)))
      }

      if(response.data.payload?.admin_id){
        dispatch(setEmail(response.data.payload.admin_id))
      }

      router.push("/dashboard");

    } catch (error) {
      if(error.response?.data?.message){
        toast.error(error.response.data?.message)
      }else{
        toast.error("Something Went Wrong")
      }
    }

    setLoading(false);
  };

  const sendOtp = async (isResend = false) => {
    if (!forgotData.client_id || !forgotData.admin_id) {
      toast.error("Please fill in all fields");
      return;
    }

    if (isResend) {
      setResendLoading(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}forgotpassword`, forgotData);
      
      if (response.data.success) {
        // Set OTP expiry time (15 minutes from now)
        const expiryTime = new Date(Date.now() + 2 * 60 * 1000).getTime();
        setOtpExpiry(expiryTime);
        setCanResend(false);
        
        toast.success(isResend ? "OTP resent successfully!" : "OTP sent successfully!");
        
        if (!isResend) {
          setShowForgotModal(false);
          setShowOtpModal(true);
        }
      }
    } catch (error) {
      if(error.response?.data?.message){
        toast.error(error.response.data.message);
      } else {
        toast.error(isResend ? "Failed to resend OTP. Please try again." : "Failed to send OTP. Please try again.");
      }
    }

    if (isResend) {
      setResendLoading(false);
    } else {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    await sendOtp(false);
  };

  const handleResendOtp = async () => {
    await sendOtp(true);
  };

  const handleOtpVerification = async (e) => {
    e.preventDefault();
    
    if (!otpData.otp || !otpData.new_password || !otpData.confirm_password) {
      toast.error("Please fill in all fields");
      return;
    }

    if (otpData.new_password !== otpData.confirm_password) {
      toast.error("Passwords do not match");
      return;
    }

    if (otpData.new_password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}verify-otp-reset-password`, {
        client_id: forgotData.client_id,
        admin_id: forgotData.admin_id,
        otp: otpData.otp,
        new_password: otpData.new_password
      });
      
      if (response.data.success) {
        toast.success("Password reset successfully!");
        setShowOtpModal(false);
        setShowLoginModal(true);
        // Reset all form data and timer
        setForgotData({ client_id: '', admin_id: '' });
        setOtpData({ otp: '', new_password: '', confirm_password: '' });
        setOtpExpiry(null);
        setTimeLeft(0);
        setCanResend(false);
      }
    } catch (error) {
      if(error.response?.data?.message){
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to verify OTP. Please try again.");
      }
    }

    setLoading(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleNewPasswordVisibility = () => {
    setShowNewPassword(!showNewPassword);
  };

  const openForgotModal = () => {
    setShowLoginModal(false);
    setShowForgotModal(true);
  };

  const closeForgotModal = () => {
    setShowForgotModal(false);
    setShowLoginModal(true);
  };

  const closeOtpModal = () => {
    setShowOtpModal(false);
    setShowLoginModal(true);
    // Reset timer when closing modal
    setOtpExpiry(null);
    setTimeLeft(0);
    setCanResend(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative">
      {/* Background Blurs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/5 rounded-full blur-2xl"></div>
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-yellow-300/10 rounded-full blur-2xl"></div>
      </div>

      {/* Login Modal */}
      {showLoginModal && (
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
                Institute&nbsp;Management&nbsp;System
              </h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
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

              <div className="text-right">
                <button
                  type="button"
                  className="text-sm text-blue-700 hover:text-purple-600 hover:underline transition-all"
                  onClick={openForgotModal}
                >
                  Forgot Password / Change Password?
                </button>
              </div>

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

          <div className="text-center mt-4 text-blue-800 text-sm">
            <span className="font-medium">Powered by </span>
            <span className="font-semibold text-lg bg-clip-text">T-Rex Infotech</span>
          </div>
        </div>
      )}

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Forgot Password</h2>
              <button
                onClick={closeForgotModal}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="group">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    name="client_id"
                    type="text"
                    value={forgotData.client_id}
                    onChange={handleForgotInputChange}
                    placeholder="Enter Client ID"
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/20 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="group">
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    name="admin_id"
                    type="text"
                    value={forgotData.admin_id}
                    onChange={handleForgotInputChange}
                    placeholder="Enter Admin ID"
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/20 transition-all"
                    required
                  />
                </div>
              </div>

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
                    Sending OTP...
                  </>
                ) : (
                  <>
                    <Mail className="h-5 w-5 mr-3" />
                    Send OTP
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* OTP Verification Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Verify OTP</h2>
              <button
                onClick={closeOtpModal}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* OTP Timer Display */}
            <div className="mb-6 p-4 bg-gray-50 rounded-2xl border border-gray-200">
              <div className="flex items-center justify-center space-x-2">
                <Clock className="text-blue-600" size={20} />
                <span className="text-sm text-gray-600">OTP expires in:</span>
                <span className={`font-mono font-bold text-lg ${timeLeft <= 60 ? 'text-red-600' : 'text-blue-600'}`}>
                  {formatTime(timeLeft)}
                </span>
              </div>
              
              {canResend && (
                <div className="mt-3 text-center">
                  <button
                    onClick={handleResendOtp}
                    disabled={resendLoading}
                    className="inline-flex items-center px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-xl hover:bg-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-500/30 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70"
                  >
                    {resendLoading ? (
                      <>
                        <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.3 0 0 5.3 0 12h4zm2 5.3A7.96 7.96 0 014 12H0c0 3.04 1.13 5.82 3 7.94l3-2.64z" />
                        </svg>
                        Resending...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Resend OTP
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            <form onSubmit={handleOtpVerification} className="space-y-4">
              <div className="group">
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    name="otp"
                    type="text"
                    value={otpData.otp}
                    onChange={handleOtpInputChange}
                    placeholder="Enter OTP"
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/20 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="group">
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    name="new_password"
                    type={showNewPassword ? 'text' : 'password'}
                    value={otpData.new_password}
                    onChange={handleOtpInputChange}
                    placeholder="Enter New Password"
                    className="w-full pl-11 pr-12 py-3 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/20 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={toggleNewPasswordVisibility}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-indigo-600"
                  >
                    {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="group">
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    name="confirm_password"
                    type={showNewPassword ? 'text' : 'password'}
                    value={otpData.confirm_password}
                    onChange={handleOtpInputChange}
                    placeholder="Confirm New Password"
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/20 transition-all"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3 px-6 bg-green-600 text-white font-semibold rounded-2xl hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-500/30 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 shadow-lg"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.3 0 0 5.3 0 12h4zm2 5.3A7.96 7.96 0 014 12H0c0 3.04 1.13 5.82 3 7.94l3-2.64z" />
                    </svg>
                    Verifying...
                  </>
                ) : (
                  <>
                    <Key className="h-5 w-5 mr-3" />
                    Reset Password
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
}