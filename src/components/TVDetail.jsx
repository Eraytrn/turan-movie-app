import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchTVDetails, fetchTVVideos } from "../api";
import VideoComponent from "./VideoComponent"; 

const TVDetail = () => {
  const { id } = useParams(); 
  const [details, setDetails] = useState({});
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      try {
        const detailsData = await fetchTVDetails(id);
        const videosData = await fetchTVVideos(id);
        setDetails(detailsData);
        const trailer = videosData?.results?.find((vid) => vid.type === "Trailer");
        setVideo(trailer);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  return (
    <div className="p-4">
      {loading ? (
        <p>Loading TV show details...</p>
      ) : (
        <div className="flex flex-col sm:flex-row">
         
          <div className="w-full sm:w-1/3">
            <img
              src={`https://image.tmdb.org/t/p/w500${details.poster_path}`}
              alt={details.name}
              className="w-full h-auto rounded-lg"
            />
            <div className="mt-4 flex justify-between items-center">
              <span className="text-lg font-semibold">User Score: {details.vote_average}</span>
              <div className="flex space-x-2">
                <button className="bg-blue-500 text-white px-4 py-2 rounded">Add to Watchlist</button>
                <button className="bg-red-500 text-white px-4 py-2 rounded">Liked</button>
              </div>
            </div>
          </div>

          
          <div className="ml-4 text-white flex-1">
            <h1 className="text-3xl font-bold">{details.name}</h1>
            <p className="mt-2 text-lg">{details.overview}</p>

        
            <div className="mt-4">
              <span className="font-semibold">Genres: </span>
              {details.genres?.map((genre) => genre.name).join(", ")}
            </div>

          
            <div className="mt-2">
              <span className="font-semibold">First Air Date: </span>
              {details.first_air_date}
            </div>
            <div className="mt-2">
              <span className="font-semibold">Number of Seasons: </span>
              {details.number_of_seasons}
            </div>
            <div className="mt-2">
              <span className="font-semibold">Number of Episodes: </span>
              {details.number_of_episodes}
            </div>
          </div>
        </div>
      )}

      
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-white">Cast</h2>
        <div className="flex overflow-x-scroll space-x-4 mt-4">
          {details?.credits?.cast?.map((actor) => (
            <div key={actor.id} className="flex-none w-32">
              <img
                src={`https://image.tmdb.org/t/p/w200${actor.profile_path}`}
                alt={actor.name}
                className="w-full h-auto rounded-lg"
              />
              <p className="text-center text-white mt-2">{actor.name}</p>
            </div>
          ))}
        </div>
      </div>

      
      {video && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-white">Watch Trailer</h2>
          <VideoComponent id={video.key} />
        </div>
      )}
    </div>
  );
};

export default TVDetail;
