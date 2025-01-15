import React from 'react';
import { Link } from 'react-router-dom';
import { UserAuth } from '../context/AuthContext';

const AdminNavbar = () => {
  const { logOut } = UserAuth();

  const handleLogout = async () => {
    try {
      await logOut();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className='flex items-center justify-between p-4 z-[999] w-full bg-red-600/90 fixed top-0 left-0'>
      <Link to='/'>
        <h1 className='text-black text-4xl font-bold cursor-pointer'>
          ADMIN PANEL
        </h1>
      </Link>
      <div>
        <button
          onClick={handleLogout}
          className='bg-white px-6 py-2 rounded cursor-pointer text-red-600'
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default AdminNavbar;