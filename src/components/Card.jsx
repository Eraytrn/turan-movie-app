import { useEffect, useState } from 'react';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { MdOutlineWatchLater } from 'react-icons/md';
import { db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { UserAuth } from '../context/AuthContext';

const Card = ({ movie, onClick }) => {
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
      } else if (type === 'liked') {
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
    handleSaveMovie(movie, 'liked'); 
  };

  const handleWatchLater = () => {
    handleSaveMovie(movie, 'watchLater'); 
  };

  useEffect(() => {
    if (user && user.email) {
      const fetchUserData = async () => {
        try {
          const userRef = doc(db, 'users', user.email);
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();

            if (userData.watchLaterMovies && userData.watchLaterMovies.some((m) => m.id === movie.id)) {
              setWatchLater(true);
            }
            if (userData.likedMovies && userData.likedMovies.some((m) => m.id === movie.id)) {
              setLike(true);
            }
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      };
      fetchUserData();
    }
  }, [user, movie.id]);

  return (
        <div
    onClick={onClick}
    className="bg-black rounded-lg shadow-md hover:shadow-lg cursor-pointer transition-transform transform hover:scale-105 relative p-3 max-w-xs" // Increased padding and width
    >
    <img
        src={`https://image.tmdb.org/t/p/w500/${movie.poster_path}`}
        alt={movie.title || movie.name}
        className="w-56 h-80 object-cover rounded-t-lg mx-auto" 
    />
    <div className="absolute top-2 left-2 flex justify-between w-full px-2">
        <FaHeart
        className={`text-gray-300 ${like ? 'text-red-600' : ''}`}
        onClick={(e) => { e.stopPropagation(); handleLike(); }}
        />
        <MdOutlineWatchLater
        className={`text-gray-300 ${watchLater ? 'text-red-600' : ''}`}
        onClick={(e) => { e.stopPropagation(); handleWatchLater(); }}
        />
    </div>
    <h3 className="text-center text-sm font-semibold mt-2 text-white truncate">{movie.title || movie.name}</h3>
    </div>
  );
};

export default Card;
