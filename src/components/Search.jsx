import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { searchData } from "../api";
import Card from "./Card";

const Search = () => {
  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); 
  const navigate = useNavigate();
  const [searchParams] = useSearchParams(); 
  
  const query = searchParams.get("query") || "";

  useEffect(() => {
    if (query.trim() !== "") {
      setSearchValue(query);
      setLoading(true);
      setError(null); 
      searchData(query)
        .then((data) => {
          if (data?.results?.length > 0) {
            
            setSearchResults(data.results);
          } else {
            setSearchResults([]);
          }
        })
        .catch((err) => {
          setError("An error occurred while fetching data.");
          console.error(err);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setSearchResults([]); 
    }
  }, [query]);

  const handleItemClick = (id, mediaType) => {
    
    if (mediaType === "movie") {
      navigate(`/movie/${id}`);
    } else if (mediaType === "tv") {
      navigate(`/tv/${id}`);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/search?query=${searchValue}`);
    }
  };

  return (
    <div className="p-4">
      <form onSubmit={handleSearchSubmit} className="mb-4">
        <input
          type="text"
          placeholder="Search for movies or TV shows..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </form>
  
      <div className="results">
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : searchResults.length === 0 ? (
          <p className="text-gray-500">No results found for "{searchValue}"</p>
        ) : (
          <div className="mt-20 px-20 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {searchResults.map((item) => (
              <Card
                key={item.id}
                movie={item}
                onClick={() => handleItemClick(item.id, item.media_type)} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
