import React, { useEffect, useState } from 'react';
import requests from '../Requests';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { UserAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

const Main = () => {
  const [movies, setMovies] = useState([]);
  const navigate = useNavigate();
  const { user } = UserAuth();

  const movie = movies[Math.floor(Math.random() * movies.length)];

  useEffect(() => {
    axios.get(requests.requestPopular).then((response) => {
      setMovies(response.data.results);
    });
  }, []);

  const handleSaveMovie = async (movie) => {
    if (!user) {
      alert('Please log in to save movies.');
      return;
    }
  
    const userRef = doc(db, 'users', user.email);
    const userDoc = await getDoc(userRef);
  
    if (userDoc.exists()) {
      const userData = userDoc.data();
      let updatedMovies;
  
      const watchLaterMovies = userData.watchLaterMovies || [];
  
      
      if (watchLaterMovies.some((m) => m.id === movie.id)) {
        alert('This movie is already in your Watch Later list.');
        return;
      }
  
      updatedMovies = [...watchLaterMovies, movie];
      await updateDoc(userRef, { watchLaterMovies: updatedMovies });
      alert('Movie added to Watch Later');
    } else {
      const newUserMovies = {
        watchLaterMovies: [movie],
      };
      await updateDoc(userRef, newUserMovies);
      alert('Movie added to Watch Later');
    }
  };
  

  const handlePlayMovie = (movie) => {
    navigate(`/movie/${movie.id}`);
  };

  const truncateString = (str, num) => {
    if (str?.length > num) {
      return str.slice(0, num) + '...';
    } else {
      return str;
    }
  };

  return (
    <div className="w-full h-[550px] text-white">
      <div className="w-full h-full">
        <div className="absolute w-full h-[550px] bg-gradient-to-r from-black"></div>
        <img
          className="w-full h-full object-cover"
          src={`https://image.tmdb.org/t/p/original/${movie?.backdrop_path}`}
          alt={movie?.title}
        />
        <div className="absolute w-full top-[20%] p-4 md:p-8">
          <h1 className="text-3xl md:text-5xl font-bold">{movie?.title}</h1>
          <div className="my-4">
            <button
              onClick={() => handlePlayMovie(movie)}
              className="border bg-gray-300 text-black border-gray-300 py-2 px-5 hover:bg-gray-500 transition duration-200"
            >
              Play
            </button>
            <button
              onClick={() => handleSaveMovie(movie)}
              className="border text-white border-gray-300 py-2 px-5 ml-4 hover:bg-red-600 transition duration-200"
            >
              Watch Later
            </button>
          </div>
          <p className="text-gray-400 text-sm">Released: {movie?.release_date}</p>
          <p className="w-full md:max-w-[70%] lg:max-w-[50%] xl:max-w-[35%] text-gray-200">
            {truncateString(movie?.overview, 150)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Main;
