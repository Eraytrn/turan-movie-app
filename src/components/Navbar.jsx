import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { UserAuth } from '../context/AuthContext';
import { FaUserCircle } from 'react-icons/fa';

const Navbar = () => {
  const { user, logOut } = UserAuth();
  const [dropdown, setDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery) {
      navigate(`/search?query=${searchQuery}`);
    }
  };

  const handleLogout = async () => {
    try {
      await logOut();
      window.location.reload();
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

  useEffect(() => {
    if (!location.pathname.includes('/search')) {
      setSearchQuery('');
    }
  }, [location]);

  return (
    <div className='flex items-center justify-between p-4 z-[100] w-full bg-black/70 fixed top-0 left-0'>
      <Link to='/'>
        <h1 className='text-red-600 text-4xl font-bold cursor-pointer'>
          TURAN MOVIE
        </h1>
      </Link>
      
      <div className="flex-1 flex justify-center">
        <nav className="flex space-x-6">
          <Link to="/movies" className="text-white font-bold">
            Movie List
          </Link>
          <Link to="/tv" className="text-white font-bold">
            TV List
          </Link>
        </nav>
      </div>

      <div className="flex items-center space-x-6">
      <form onSubmit={handleSearch} className="flex items-center space-x-2">
        <input
          type="text"
          placeholder="Search movies or shows..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-4 py-2 rounded-md text-black w-80"
        />
        <button type="submit" className="text-white bg-red-600 px-4 py-2 rounded-md cursor-pointer">
          Search
        </button>
      </form>

      {user?.email ? (
        <div className="relative">
          <FaUserCircle 
            onClick={() => setDropdown(!dropdown)} 
            className="text-white text-4xl cursor-pointer"
          />
          {dropdown && (
              <div ref={dropdownRef} className="absolute right-0 bg-white text-black p-2 rounded-md shadow-lg">
                <Link to="/account">
                  <button 
                    onClick={() => setDropdown(false)} 
                    className="block px-4 py-2 transition-colors duration-300 hover:bg-gray-200 transform hover:scale-105"
                  >
                    Account
                  </button>
                </Link>
                <button 
                  onClick={() => {
                    setDropdown(false);
                    handleLogout();
                  }} 
                  className="block px-4 py-2 transition-colors duration-300 hover:bg-gray-200 transform hover:scale-105"
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
    </div>
  );
};

export default Navbar;
