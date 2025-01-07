import React, { useState, useEffect } from 'react';
import { UserAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

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

  const baseImageUrl = 'https://image.tmdb.org/t/p/w500'; 

  return (
    <div className="text-white p-4 max-w-4xl mx-auto" style={{ paddingTop: '70px' }}>
      <h2 className="text-2xl font-bold mb-4">Your Account</h2>
      <div className="mb-4">
        <button
          onClick={() => handleTabChange('watchLater')}
          className={`mr-4 ${activeTab === 'watchLater' ? 'text-red-600' : ''}`}
        >
          Watch Later
        </button>
        <button
          onClick={() => handleTabChange('likedMovies')}
          className={`${activeTab === 'likedMovies' ? 'text-red-600' : ''}`}
        >
          Liked Movies
        </button>
      </div>

      <div className="bg-gray-800 p-4 rounded-lg">
        {activeTab === 'watchLater' ? (
          <div>
            <h3 className="font-semibold mb-2">Watch Later</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {watchLaterMovies.map((movie, index) => (
                <div key={index} className="text-center">
                  <img 
                    src={`${baseImageUrl}${movie.poster_path}`} 
                    alt={movie.title} 
                    className="rounded-lg mb-2"
                  />
                  <p className="text-gray-300">{movie.title}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <h3 className="font-semibold mb-2">Liked Movies</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {likedMovies.map((movie, index) => (
                <div key={index} className="text-center">
                  <img 
                    src={`${baseImageUrl}${movie.poster_path}`} 
                    alt={movie.title} 
                    className="rounded-lg mb-2"
                  />
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
