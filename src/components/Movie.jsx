import React, { useState, useEffect } from 'react';
import { FaHeart } from 'react-icons/fa';
import { MdOutlineWatchLater } from "react-icons/md";
import { db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { UserAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom'; 

const Movie = ({ item }) => {
  const [like, setLike] = useState(false);
  const [watchLater, setWatchLater] = useState(false);
  const { user } = UserAuth();
  const navigate = useNavigate(); 

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
        if (userData.watchLaterTVMovie?.some((m) => m.id === movie.id)) {
          updatedMovies = userData.watchLaterTVMovie.filter((m) => m.id !== movie.id);
          await updateDoc(userRef, { watchLaterTVMovie: updatedMovies });
          setWatchLater(false);
          return;
        } else {
          const watchLaterList = userData.watchLaterTVMovie || [];
          const movieToAdd = {
            id: movie.id,
            title: movie.title,
            poster_path: movie.poster_path,
            release_date: movie.release_date,
            type: 'movie'
          };
          updatedMovies = [...watchLaterList, movieToAdd];
          await updateDoc(userRef, { watchLaterTVMovie: updatedMovies });
          setWatchLater(true);
        }
      } else if (type === 'liked') {
        if (userData.likedTVMovie?.some((m) => m.id === movie.id)) {
          updatedMovies = userData.likedTVMovie.filter((m) => m.id !== movie.id);
          await updateDoc(userRef, { likedTVMovie: updatedMovies });
          setLike(false);
          return;
        } else {
          const likedList = userData.likedTVMovie || [];
          const movieToAdd = {
            id: movie.id,
            title: movie.title,
            poster_path: movie.poster_path,
            release_date: movie.release_date,
            type: 'movie'
          };
          updatedMovies = [...likedList, movieToAdd];
          await updateDoc(userRef, { likedTVMovie: updatedMovies });
          setLike(true);
        }
      }
    } else {
      const newUserMovies = {
        watchLaterTVMovie: type === 'watchLater' ? [{
          id: movie.id,
          title: movie.title,
          poster_path: movie.poster_path,
          release_date: movie.release_date,
          type: 'movie'
        }] : [],
        likedTVMovie: type === 'liked' ? [{
          id: movie.id,
          title: movie.title,
          poster_path: movie.poster_path,
          release_date: movie.release_date,
          type: 'movie'
        }] : [],
      };
      await updateDoc(userRef, newUserMovies);
      if (type === 'watchLater') {
        setWatchLater(true);
      } else {
        setLike(true);
      }
    }
  };

  const handleLike = (e) => {
    e.stopPropagation(); 
    handleSaveMovie(item, 'liked');
  };

  const handleWatchLater = (e) => {
    e.stopPropagation(); 
    handleSaveMovie(item, 'watchLater');
  };

  const handleMovieClick = () => {
    navigate(`/movie/${item.id}`); 
  };

  useEffect(() => {
    if (user && user.email) {
      const fetchUserData = async () => {
        try {
          const userRef = doc(db, 'users', user.email);
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();

            if (userData.watchLaterTVMovie?.some((m) => m.id === item.id)) {
              setWatchLater(true);
            }
            if (userData.likedTVMovie?.some((m) => m.id === item.id)) {
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
    <div className="w-[160px] sm:w-[200px] md:w-[240px] inline-block cursor-pointer relative p-2" onClick={handleMovieClick}>
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
