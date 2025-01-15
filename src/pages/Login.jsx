import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { logIn } = UserAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await logIn(email, password);
    } catch (error) {
      console.log(error);
      if (error.code === 'auth/invalid-email') {
        setError('Invalid email address.');
      } else if (error.code === 'auth/user-not-found') {
        setError('No account found with this email.');
      } else if (error.code === 'auth/wrong-password') {
        setError('Incorrect password.');
      } else {
        setError('Failed to login. Please check your credentials.');
      }
    }
  };

  return (
    <div className='w-full h-screen'>
      <img
        className='hidden sm:block absolute w-full h-full object-cover'
        src={require('../components/loginregisterbackground.jpg')}
        alt='/'
      />
      <div className='fixed top-0 left-0 w-full h-screen'></div>
      <div className='fixed w-full px-4 py-36 z-50'>
        <div className='max-w-[450px] mx-auto bg-white rounded-xl shadow-2xl'>
          <div className='p-8'>
            <h1 className='text-4xl font-bold text-blue-600 text-center mb-8'>Sign Into Your Account</h1>
            {error ? (
              <div className='bg-red-500/20 border border-red-500 text-red-500 px-4 py-3 rounded mb-6'>
                {error}
              </div>
            ) : null}
            <form onSubmit={handleSubmit} className='space-y-6'>
              <div>
                <label className='text-gray-700 text-sm font-semibold block mb-2'>Email Address</label>
                <input
                  onChange={(e) => setEmail(e.target.value)}
                  className='w-full px-4 py-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-900'
                  type='email'
                  placeholder='Enter your email'
                  autoComplete='email'
                />
              </div>
              <div>
                <label className='text-gray-700 text-sm font-semibold block mb-2'>Password</label>
                <input
                  onChange={(e) => setPassword(e.target.value)}
                  className='w-full px-4 py-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-900'
                  type='password'
                  placeholder='Enter your password'
                  autoComplete='current-password'
                />
              </div>
              <button className='w-full bg-blue-600 text-white py-3 rounded-lg font-semibold transition duration-300 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2'>
                Sign In
              </button>
              <div className='flex items-center justify-center space-x-2 mt-6'>
                <span className='text-gray-600'>New to Turan Movie?</span>
                <Link to='/signup' className='text-blue-600 hover:text-blue-500 font-semibold'>
                  Sign Up
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;