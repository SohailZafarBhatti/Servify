import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../context/AuthContext';
import background from '../assets/background.jpg';
import logo from '../assets/logo.png';

// Pakistani phone number validation - must start with 03 and be 11 digits
const pakistaniPhoneRegex = /^03[0-9]{9}$/;

const schema = yup.object({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string()
    .min(6, 'Password must be at least 6 characters')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)/, 'Password must contain at least one letter and one number')
    .required('Password is required'),
  confirmPassword: yup.string().oneOf([yup.ref('password'), null], 'Passwords must match').required('Confirm password is required'),
  phone: yup.string()
    .required('Phone number is required')
    .matches(pakistaniPhoneRegex, 'Please enter a valid Pakistani mobile number (e.g., 03001234567)'),
  role: yup.string().oneOf(['user','service_provider'], 'Please select a role').required('Role is required'),
  cnic: yup.string().when('role', {
    is: 'service_provider',
    then: (schema) => schema.required('CNIC is required for service providers').matches(/^[0-9]{5}-[0-9]{7}-[0-9]$/, 'CNIC format: 12345-1234567-1'),
    otherwise: (schema) => schema.notRequired()
  }),
}).required();

const Register = () => {
  const navigate = useNavigate();
  const { registerUser } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, watch, formState: { errors, isValid } } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange'
  });

  // Debug validation errors
  React.useEffect(() => {
    console.log('Form validation errors:', errors);
    console.log('Form is valid:', isValid);
  }, [errors, isValid]);

  // Capitalize first letter of name
  const capitalizeName = (name) => {
    if (!name) return name;
    return name.trim().split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  const onSubmit = async (data) => {
    console.log('Form submitted with data:', data);
    setError('');
    setLoading(true);
    try {
      // Create FormData for file uploads
      const formData = new FormData();
      
      // Capitalize name before sending
      const capitalizedName = capitalizeName(data.name);
      
      // Append basic user data
      formData.append('name', capitalizedName);
      formData.append('email', data.email.toLowerCase().trim());
      formData.append('password', data.password);
      formData.append('phone', data.phone);
      formData.append('role', data.role);
      
      if (data.address) formData.append('address', data.address);
      
      // Handle service provider specific fields
      if (data.role === 'service_provider') {
        if (data.cnic) formData.append('cnic', data.cnic);
        if (data.policeVerification && data.policeVerification[0]) {
          formData.append('policeVerification', data.policeVerification[0]);
        }
      }

      const result = await registerUser(formData);
      if (result.success) {
        console.log('Registration successful, user:', result.user);
        
        // Redirect to dashboard - the Dashboard component will handle user type routing
        if (result.user?.userType === 'admin') {
          console.log('Redirecting to Admin Dashboard');
          navigate('/admin-dashboard');
        } else {
          console.log('Redirecting to Dashboard');
          navigate('/dashboard');
        }
      } else {
        setError(result.error || 'Registration failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const role = watch('role');

  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center relative px-4 sm:px-6 lg:px-8" style={{ backgroundImage: `url(${background})` }}>
      <div className="absolute inset-0 bg-black/30"></div>
      <div className="relative z-10 w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl bg-white/20 backdrop-blur-lg rounded-2xl shadow-2xl p-4 sm:p-6 lg:p-8">
        <div className="flex justify-center mb-4"><img src={logo} alt="Servify Logo" className="h-12 sm:h-14 w-auto" /></div>
        <div className="text-center mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Create Account</h1>
          <p className="text-sm sm:text-base text-gray-700">Join SERVIFY and start connecting with service providers</p>
        </div>
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input type="text" {...register('name')} className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.name ? 'border-red-500' : 'border-gray-300'}`} placeholder="Enter your full name" />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input type="email" {...register('email')} className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.email ? 'border-red-500' : 'border-gray-300'}`} placeholder="Enter your email" />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input type="password" {...register('password')} className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.password ? 'border-red-500' : 'border-gray-300'}`} placeholder="Enter your password" />
              <p className="text-sm text-gray-500 mt-1">Minimum 6 characters with at least one letter and one number</p>
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
              <input type="password" {...register('confirmPassword')} className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`} placeholder="Confirm password" />
              {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input type="tel" {...register('phone')} className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.phone ? 'border-red-500' : 'border-gray-300'}`} placeholder="03001234567" />
              <p className="text-sm text-gray-500 mt-1">Pakistani mobile number (e.g., 03001234567)</p>
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <select {...register('role')} className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.role ? 'border-red-500' : 'border-gray-300'}`}>
                <option value="">Select your role</option>
                <option value="user">User</option>
                <option value="service_provider">Service Provider</option>
              </select>
              {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>}
            </div>
          </div>

          {role === 'service_provider' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CNIC</label>
                <input 
                  type="text" 
                  {...register('cnic')} 
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.cnic ? 'border-red-500' : 'border-gray-300'}`} 
                  placeholder="12345-1234567-1" 
                />
                <p className="text-sm text-gray-500 mt-1">Format: 12345-1234567-1</p>
                {errors.cnic && <p className="text-red-500 text-sm mt-1">{errors.cnic.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Police Verification</label>
                <input 
                  type="file" 
                  {...register('policeVerification')} 
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  accept=".pdf,.jpg,.jpeg,.png" 
                />
                <p className="text-sm text-gray-500 mt-1">Upload PDF, JPG, or PNG file</p>
              </div>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading} 
            className="relative z-20 w-full bg-primary-600 text-white py-2 sm:py-3 px-4 sm:px-6 text-sm sm:text-base rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-4 sm:mt-6 text-center">
          <p className="text-sm sm:text-base text-gray-700">Already have an account? <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">Sign in here</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;
