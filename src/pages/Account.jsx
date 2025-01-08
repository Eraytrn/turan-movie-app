import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'
import { UserAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { FaTrashAlt } from 'react-icons/fa';


const Account = () => {
  const { user } = UserAuth();
  const [watchLaterMovies, setWatchLaterMovies] = useState([]);
  const [likedMovies, setLikedMovies] = useState([]);
  const [activeTab, setActiveTab] = useState('watchLater');

  useEffect(() => {
    const fetchUserData = async () => {
      const userRef = doc(db, 'users', user?.email);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        setWatchLaterMovies(userDoc.data().watchLaterMovies || []);
        setLikedMovies(userDoc.data().likedMovies || []);
      }
    };
    if (user?.email) {
      fetchUserData();
    }
  }, [user]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const removeMovieFromList = async (movie, list) => {
    const userRef = doc(db, 'users', user?.email);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const updatedList = userData[list].filter((m) => m.id !== movie.id);

      
      await updateDoc(userRef, {
        [list]: updatedList,
      });

      
      if (list === 'watchLaterMovies') {
        setWatchLaterMovies(updatedList);
      } else {
        setLikedMovies(updatedList);
      }
    }
  };

  const baseImageUrl = 'https://image.tmdb.org/t/p/w500';

  return (
    <div className="text-white p-4 max-w-4xl mx-auto" style={{ paddingTop: '120px' }}>
      <div className="mb-4">
        <button
          onClick={() => handleTabChange('watchLater')}
          className={`mr-4 ${activeTab === 'watchLater' ? 'text-red-600 font-bold' : ''}`}
        >
          Watch Later
        </button>
        <button
          onClick={() => handleTabChange('likedMovies')}
          className={`${activeTab === 'likedMovies' ? 'text-red-600 font-bold' : ''}`}
        >
          Liked Movies
        </button>
      </div>

      <div className="bg-gray-900 p-4 rounded-lg">
        {activeTab === 'watchLater' ? (
          <div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {watchLaterMovies.map((movie, index) => (
                <div key={index} className="text-center relative">
                   <Link to={`/movie/${movie.id}`}>  
                  <img
                    src={`${baseImageUrl}${movie.poster_path}`}
                    alt={movie.title}
                    className="rounded-lg mb-2"
                  />
                  </Link>
                  <button
                    onClick={() => removeMovieFromList(movie, 'watchLaterMovies')}
                    className="absolute top-2 right-2  text-white rounded-full p-1"
                  >
                    <FaTrashAlt />
                  </button>
                  <p className="text-gray-300">{movie.title}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {likedMovies.map((movie, index) => (
                <div key={index} className="text-center relative">
                  <Link to={`/movie/${movie.id}`}>
                  <img
                    src={`${baseImageUrl}${movie.poster_path}`}
                    alt={movie.title}
                    className="rounded-lg mb-2"
                  />
                  </Link>
                  <button
                    onClick={() => removeMovieFromList(movie, 'likedMovies')}
                    className="absolute top-2 right-2 text-white rounded-full p-1"
                  >
                    <FaTrashAlt />
                  </button>
                  <p className="text-gray-300">{movie.title}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Account;
