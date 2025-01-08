import React, { useState, useEffect } from 'react';
import { FaHeart } from 'react-icons/fa';
import { MdOutlineWatchLater } from "react-icons/md";
import { db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { UserAuth } from '../context/AuthContext';

const Movie = ({ item }) => {
  const [like, setLike] = useState(false);
  const [watchLater, setWatchLater] = useState(false);
  const { user } = UserAuth();

  
  const handleSaveMovie = async (movie, type) => {
    if (!user) {
      alert('Please log in to save movies.');
      return;
    }

    const userRef = doc(db, 'users', user.email);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      let updatedMovies;

      
      if (type === 'watchLater') {
        if (userData.watchLaterMovies.some((m) => m.id === movie.id)) { 
          updatedMovies = userData.watchLaterMovies.filter((m) => m.id !== movie.id);
          await updateDoc(userRef, { watchLaterMovies: updatedMovies });
          setWatchLater(false); 
          return;
        } else {
       
          const watchLaterMovies = userData.watchLaterMovies || [];
          updatedMovies = [...watchLaterMovies, { ...movie, type }];
          await updateDoc(userRef, { watchLaterMovies: updatedMovies });
          setWatchLater(true); 
        }
      } 
      else if (type === 'liked') {
        if (userData.likedMovies.some((m) => m.id === movie.id)) {
       
          updatedMovies = userData.likedMovies.filter((m) => m.id !== movie.id);
          await updateDoc(userRef, { likedMovies: updatedMovies });
          setLike(false); 
          return;
        } else {
        
          const likedMovies = userData.likedMovies || [];
          updatedMovies = [...likedMovies, { ...movie, type }];
          await updateDoc(userRef, { likedMovies: updatedMovies });
          setLike(true); 
        }
      }
    } else {
      const newUserMovies = {
        watchLaterMovies: type === 'watchLater' ? [{ ...movie, type }] : [],
        likedMovies: type === 'liked' ? [{ ...movie, type }] : [],
      };
      await updateDoc(userRef, newUserMovies);
      if (type === 'watchLater') {
        setWatchLater(true);
      } else {
        setLike(true);
      }
    }
  };

  const handleLike = () => {
    handleSaveMovie(item, 'liked'); 
  };

  const handleWatchLater = () => {
    handleSaveMovie(item, 'watchLater'); 
  };

  useEffect(() => {
    if (user && user.email) {
      const fetchUserData = async () => {
        try {
          const userRef = doc(db, 'users', user.email);
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            
            if (userData.watchLaterMovies && userData.watchLaterMovies.some((m) => m.id === item.id)) {
              setWatchLater(true);
            }
            if (userData.likedMovies && userData.likedMovies.some((m) => m.id === item.id)) {
              setLike(true);
            }
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      };
      fetchUserData();
    }
  }, [user, item.id]);

  return (
    <div className="w-[160px] sm:w-[200px] md:w-[240px] inline-block cursor-pointer relative p-2">
      <img
        className="w-full h-auto block"
        src={`https://image.tmdb.org/t/p/w500/${item?.backdrop_path}`}
        alt={item?.title}
      />
      <div className="absolute top-0 left-0 w-full h-full hover:bg-black/80 opacity-0 hover:opacity-100 text-white">
        <p className="white-space-normal text-xs md:text-sm font-bold flex justify-center items-center h-full text-center">
          {item?.title}
        </p>
        <p>
          <FaHeart
            className={`absolute top-4 left-4 text-gray-300 ${like ? 'text-red-600' : ''}`}
            onClick={handleLike}
          />
          <MdOutlineWatchLater 
            className={`absolute bottom-4 left-4 text-gray-300 ${watchLater ? 'text-red-600' : ''}`}
            onClick={handleWatchLater}
          />
        </p>
      </div>
    </div>
  );
};

export default Movie;
