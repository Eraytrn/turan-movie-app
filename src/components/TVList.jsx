import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';  

const TVList = () => {
  const [tvShows, setTvShows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages] = useState(50);

  useEffect(() => {
    const fetchTVShows = async () => {
      const response = await axios.get('https://api.themoviedb.org/3/tv/popular', {
        params: {
          api_key: process.env.REACT_APP_TMDB_API_KEY,
          page: currentPage,
        },
      });
      setTvShows(response.data.results);
    };

    fetchTVShows();
  }, [currentPage]);

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Popular TV Shows</h2>
      <div className="mt-20 px-20 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {tvShows.map((tv) => (
          <Link key={tv.id} to={`/tv/${tv.id}`} className="group"> 
            <div className="bg-black rounded-lg overflow-hidden transform group-hover:scale-105 transition-transform duration-300">
              <img 
                src={`https://image.tmdb.org/t/p/w500${tv.poster_path}`} 
                alt={tv.name} 
                className="w-full h-90 object-cover"
              />
              <div className="p-2">
                <h3 className="text-white text-sm mt-2">{tv.name}</h3>
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

export default TVList;
