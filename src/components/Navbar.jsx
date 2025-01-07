import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserAuth } from '../context/AuthContext';
import { FaUserCircle } from 'react-icons/fa';

const Navbar = () => {
  const { user, logOut } = UserAuth();
  const [dropdown, setDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logOut();
      navigate('/');
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className='flex items-center justify-between p-4 z-[100] w-full absolute'>
      <Link to='/'>
        <h1 className='text-red-600 text-4xl font-bold cursor-pointer'>
          NETFLIX
        </h1>
      </Link>
      {user?.email ? (
        <div className="relative">
          <FaUserCircle 
            onClick={() => setDropdown(!dropdown)} 
            className="text-white text-2xl cursor-pointer"
          />
          {dropdown && (
            <div ref={dropdownRef} className="absolute right-0 bg-white text-black p-2 rounded-md shadow-lg">
              <Link to="/account">
                <button 
                  onClick={() => setDropdown(false)} 
                  className="block px-4 py-2"
                >
                  Account
                </button>
              </Link>
              <button 
                onClick={() => {
                  setDropdown(false);
                  handleLogout();
                }} 
                className="block px-4 py-2"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      ) : (
        <div>
          <Link to='/login'>
            <button className='text-white pr-4'>Sign In</button>
          </Link>
          <Link to='/signup'>
            <button className='bg-red-600 px-6 py-2 rounded cursor-pointer text-white'>
              Sign Up
            </button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default Navbar;
