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
        setWatchLaterMovies(userDoc.data().watchLaterTVMovie || []);
        setLikedMovies(userDoc.data().likedTVMovie || []);
      }
    };
    if (user?.email) {
      fetchUserData();
    }
  }, [user]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const removeMovieFromList = async (item, list) => {
    const userRef = doc(db, 'users', user?.email);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const updatedList = userData[list].filter((m) => m.id !== item.id);
      
      await updateDoc(userRef, {
        [list]: updatedList,
      });
      
      if (list === 'watchLaterTVMovie') {
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
          Liked 
        </button>
      </div>

      <div className="bg-gray-900 p-4 rounded-lg">
        {activeTab === 'watchLater' ? (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {watchLaterMovies.map((item, index) => (
                <div key={index} className="text-center relative">
                  <Link to={`/${item.type === 'movie' ? 'movie' : 'tv'}/${item.id}`}>
                    <img
                      src={`${baseImageUrl}${item.poster_path}`}
                      alt={item.title || item.name}
                      className="rounded-lg mb-2"
                    />
                  </Link>
                  <button
                    onClick={() => removeMovieFromList(item, 'watchLaterTVMovie')}
                    className="absolute top-2 right-2 text-white rounded-full p-1"
                  >
                    <FaTrashAlt />
                  </button>
                  <p className="text-gray-300">{item.title || item.name}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {likedMovies.map((item, index) => (
                <div key={index} className="text-center relative">
                  <Link to={`/${item.type === 'movie' ? 'movie' : 'tv'}/${item.id}`}>
                    <img
                      src={`${baseImageUrl}${item.poster_path}`}
                      alt={item.title || item.name}
                      className="rounded-lg mb-2"
                    />
                  </Link>
                  <button
                    onClick={() => removeMovieFromList(item, 'likedTVMovie')}
                    className="absolute top-2 right-2 text-white rounded-full p-1"
                  >
                    <FaTrashAlt />
                  </button>
                  <p className="text-gray-300">{item.title || item.name}</p>
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
