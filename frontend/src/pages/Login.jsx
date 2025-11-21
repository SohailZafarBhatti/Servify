import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../context/AuthContext';
import background from '../assets/background.jpg';
import logo from '../assets/logo.png';

const schema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
}).required();

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema)
  });

  const onSubmit = async (data) => {
    setError('');
    setLoading(true);
    try {
      const result = await login(data.email, data.password);
      if (result.success) {
        console.log('Login successful, user:', result.user);
        
        // Redirect to dashboard - the Dashboard component will handle user type routing
        if (result.user?.userType === 'admin') {
          console.log('Redirecting to Admin Dashboard');
          navigate('/admin-dashboard');
        } else {
          console.log('Redirecting to Dashboard');
          navigate('/dashboard');
        }
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center relative px-4 sm:px-6 lg:px-8" style={{ backgroundImage: `url(${background})` }}>
      <div className="absolute inset-0 bg-black/40"></div>
      <div className="relative z-10 w-full max-w-sm sm:max-w-md bg-white/30 backdrop-blur-md rounded-2xl shadow-2xl p-4 sm:p-6 lg:p-8">
        <div className="flex justify-center mb-4"><img src={logo} alt="Servify Logo" className="h-12 sm:h-14 w-auto" /></div>
        <div className="text-center mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-sm sm:text-base text-gray-700">Sign in to your SERVIFY account</p>
        </div>
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <input type="email" {...register('email')} className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.email ? 'border-red-500' : 'border-gray-300'}`} placeholder="Enter your email" />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input type="password" {...register('password')} className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.password ? 'border-red-500' : 'border-gray-300'}`} placeholder="Enter your password" />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
          </div>
          <button type="submit" disabled={loading} className="w-full bg-primary-600 text-white py-2 sm:py-3 px-4 sm:px-6 text-sm sm:text-base rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500">{loading ? 'Signing in...' : 'Sign In'}</button>
        </form>
        <div className="mt-4 sm:mt-6 text-center">
          <p className="text-sm sm:text-base text-gray-700">Don't have an account? <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">Sign up here</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
