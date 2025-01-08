import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchMovieDetails, fetchMovieVideos, fetchMovieCredits } from "../api";
import VideoComponent from "./VideoComponent";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase"; 
import { UserAuth } from "../context/AuthContext"; 

const MovieDetails = () => {
  const { id } = useParams();
  const { user } = UserAuth(); 
  const [details, setDetails] = useState({});
  const [video, setVideo] = useState(null);
  const [credits, setCredits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [watchLater, setWatchLater] = useState(false);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      try {
        const detailsData = await fetchMovieDetails(id);
        const videosData = await fetchMovieVideos(id);
        const creditsData = await fetchMovieCredits(id); 

        setDetails(detailsData);
        setCredits(creditsData?.cast || []);
        const trailer = videosData?.results?.find((vid) => vid.type === "Trailer");
        setVideo(trailer);

        if (user) {
          const userRef = doc(db, 'users', user.email);
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setWatchLater(userData.watchLaterMovies?.some((m) => m.id === parseInt(id)) || false);
            setLiked(userData.likedMovies?.some((m) => m.id === parseInt(id)) || false);
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, user]);

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
          setLiked(false);
        } else {
          const likedMovies = userData.likedMovies || [];
          updatedMovies = [...likedMovies, { ...movie, type }];
          await updateDoc(userRef, { likedMovies: updatedMovies });
          setLiked(true);
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
        setLiked(true);
      }
    }
  };

  return (
    <div className="p-4">
      {loading ? (
        <p>Loading movie details...</p>
      ) : (
        <div className="flex flex-col sm:flex-row mt-20">
          <div className="w-[150px] sm:w-[200px]">
            <img
              src={`https://image.tmdb.org/t/p/w500${details.poster_path}`}
              alt={details.title}
              className="w-full h-auto rounded-lg"
            />
          </div>

          <div className="ml-4 text-white flex-1">
            <h1 className="text-3xl font-bold">{details.title}</h1>
            <p className="mt-2 text-lg">{details.overview}</p>

            <div className="mt-4">
              <span className="font-semibold">Genres: </span>
              {details.genres?.map((genre) => genre.name).join(", ")}
            </div>

            <div className="mt-2">
              <span className="font-semibold">Release Date: </span>
              {details.release_date}
            </div>
            <div className="mt-2">
              <span className="font-semibold">Runtime: </span>
              {details.runtime} minutes
            </div>

            <div className="mt-4 flex justify-start items-center space-x-2">
              <button
                className={`px-4 py-2 rounded shadow-lg hover:opacity-90 focus:outline-none transition-opacity duration-300 ${
                  watchLater
                    ? "bg-gray-500"
                    : "bg-gradient-to-r from-blue-500 to-blue-700 text-white"
                }`}
                onClick={() => handleSaveMovie(details, 'watchLater')}
              >
                {watchLater ? "Remove from Watchlist" : "Add to Watchlist"}
              </button>
              <button
                className={`px-4 py-2 rounded shadow-lg hover:opacity-90 focus:outline-none transition-opacity duration-300 ${
                  liked
                    ? "bg-gray-500"
                    : "bg-gradient-to-r from-red-500 to-red-700 text-white"
                }`}
                onClick={() => handleSaveMovie(details, 'liked')}
              >
                {liked ? "Unlike" : "Like"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-2xl font-bold text-white">Cast</h2>
        <div className="flex overflow-x-scroll space-x-4 mt-4">
          {credits?.map((actor) => (
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
          <div className="w-full sm:w-3/4 mx-auto">
            <VideoComponent id={video.key} />
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieDetails;
