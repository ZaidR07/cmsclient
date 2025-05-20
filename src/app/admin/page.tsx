import { useState } from 'react';
import { Eye, EyeOff, LogIn } from 'lucide-react';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    password: '',
    loginType: 'client' // Default login type
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleLoginTypeChange = (type) => {
    setFormData({
      ...formData,
      loginType: type
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulating API call with axios
    console.log('Logging in with:', formData);
    
    // Simulate API delay
    setTimeout(() => {
      setLoading(false);
      // In a real app, you would handle the response and navigation here
      console.log('Login successful, redirecting to dashboard');
    }, 1500);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Student Management System</h1>
          <p className="mt-2 text-sm text-gray-600">Sign in to access your account</p>
        </div>
        
        <div className="flex rounded-md overflow-hidden border border-gray-300 mb-4">
          <button
            type="button"
            className={`flex-1 py-2 text-center ${formData.loginType === 'client' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
            onClick={() => handleLoginTypeChange('client')}
          >
            Client
          </button>
          <button
            type="button"
            className={`flex-1 py-2 text-center ${formData.loginType === 'admin' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
            onClick={() => handleLoginTypeChange('admin')}
          >
            Admin
          </button>
        </div>
        
        <div className="mt-8 space-y-6">
          <div>
            <label htmlFor="id" className="block text-sm font-medium text-gray-700">
              {formData.loginType === 'client' ? 'Client ID' : 'Admin ID'}
            </label>
            <input
              id="id"
              name="id"
              type="text"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder={formData.loginType === 'client' ? 'Enter Client ID' : 'Enter Admin ID'}
              value={formData.id}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="relative">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="flex relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleInputChange}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <span className="font-medium text-blue-600 hover:text-blue-500 cursor-pointer">
                Forgot your password?
              </span>
            </div>
          </div>
          
          <div>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <LogIn className="h-5 w-5 text-blue-500 group-hover:text-blue-400" />
              </span>
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </div>
              ) : (
                'Sign in'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}