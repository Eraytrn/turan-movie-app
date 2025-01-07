import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';  
const MovieList = () => {
  const [movies, setMovies] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages] = useState(50);

  useEffect(() => {
    const fetchMovies = async () => {
      const response = await axios.get('https://api.themoviedb.org/3/movie/popular', {
        params: {
          api_key: '302083967326b88c8620c4f55dadc469',
          page: currentPage,
        },
      });
      setMovies(response.data.results);
    };

    fetchMovies();
  }, [currentPage]);

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Popular Movies</h2>
      <div className="mt-20 px-20 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {movies.map((movie) => (
          <Link key={movie.id} to={`/movie/${movie.id}`} className="group"> 
            <div className="bg-black rounded-lg overflow-hidden transform group-hover:scale-105 transition-transform duration-300">
              <img 
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
                alt={movie.title} 
                className="w-full h-90 object-cover"
              />
              <div className="p-2">
                <h3 className="text-white text-sm mt-2">{movie.title}</h3>
              </div>
            </div>
          </Link>
        ))}
      </div>
      <div className="flex justify-center items-center mt-4 space-x-4">
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className="bg-gray-700 text-white px-4 py-2 rounded"
        >
          Previous
        </button>
        <span className="text-white">{`Page ${currentPage} of ${totalPages}`}</span>
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className="bg-gray-700 text-white px-4 py-2 rounded"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default MovieList;
