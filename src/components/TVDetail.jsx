import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchTVDetails, fetchTVVideos, fetchTVCredits, getComments, addComment, updateComment, deleteComment } from "../api";
import VideoComponent from "./VideoComponent";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { UserAuth } from "../context/AuthContext";

const TVDetail = () => {
  const { id } = useParams();
  const { user } = UserAuth();
  const [details, setDetails] = useState({});
  const [video, setVideo] = useState(null);
  const [credits, setCredits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [editingComment, setEditingComment] = useState(null);
  const [editedText, setEditedText] = useState('');
  const [watchLater, setWatchLater] = useState(false);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      try {
        const [detailsData, videosData, creditsData] = await Promise.all([
          fetchTVDetails(id),
          fetchTVVideos(id),
          fetchTVCredits(id)
        ]);

        if (detailsData.success === false) {
          throw new Error('TV Series not found');
        }

        setDetails(detailsData);
        setCredits(creditsData?.cast || []);
        const trailer = videosData?.results?.find((vid) => vid.type === "Trailer");
        setVideo(trailer);

        try {
          const commentsData = await getComments('tv', id);
          setComments(commentsData.comments || []);
        } catch (error) {
          console.error('Error fetching comments:', error);
        }

        if (user) {
          const userRef = doc(db, 'users', user.email);
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setWatchLater(userData.watchLaterTVMovie?.some((t) => t.id === detailsData.id) || false);
            setLiked(userData.likedTVMovie?.some((t) => t.id === detailsData.id) || false);
          }
        }
      } catch (error) {
        console.error('Error fetching TV series details:', error);
        setDetails({ error: 'Failed to load TV series details' });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, user]);

  const handleAddComment = async () => {
    if (!newComment || !user) return;
    try {
      const result = await addComment('tv', id, {
        text: newComment,
        username: user.email,
        tvSeriesName: details.name,
        createdAt: new Date().toISOString()
      });

      if (result && result.id) {
        setComments([...comments, result]);
        setNewComment('');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment');
    }
  };

  const handleEditComment = async (comment) => {
    if (editingComment === comment) {
      try {
        await updateComment(
          'tv', 
          id, 
          comment.id, 
          editedText,
          details.name
        );
        
        setComments(comments.map(c => 
          c.id === comment.id 
            ? { 
                ...comment,
                text: editedText,
                updatedAt: new Date().toISOString(),
                tvSeriesName: details.name
              } 
            : c
        ));
        
        setEditingComment(null);
        setEditedText('');
      } catch (error) {
        console.error('Error updating comment:', error);
        alert('Failed to update comment');
      }
    } else {
      setEditingComment(comment);
      setEditedText(comment.text);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment('tv', id, commentId);
      setComments(comments.filter(comment => comment.id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment');
    }
  };

  const handleSaveMovie = async (tvSeries, type) => {
    if (!user) {
      alert('Please log in to save tv series.');
      return;
    }

    try {
      const userRef = doc(db, 'users', user.email);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.exists() ? userDoc.data() : { watchLaterTVMovie: [], likedTVMovie: [] };

      
      if (!userData.watchLaterTVMovie) userData.watchLaterTVMovie = [];
      if (!userData.likedTVMovie) userData.likedTVMovie = [];

      if (type === 'watchLater') {
        if (userData.watchLaterTVMovie.some((item) => item.id === tvSeries.id)) {
          
          const updatedList = userData.watchLaterTVMovie.filter((item) => item.id !== tvSeries.id);
          await updateDoc(userRef, { watchLaterTVMovie: updatedList });
          setWatchLater(false);
        } else {
         
          const itemToAdd = {
            id: tvSeries.id,
            name: tvSeries.name,
            poster_path: tvSeries.poster_path,
            first_air_date: tvSeries.first_air_date,
            type: 'tv'
          };
          const updatedList = [...userData.watchLaterTVMovie, itemToAdd];
          await updateDoc(userRef, { watchLaterTVMovie: updatedList });
          setWatchLater(true);
        }
      } else if (type === 'liked') {
        if (userData.likedTVMovie.some((item) => item.id === tvSeries.id)) {
          
          const updatedList = userData.likedTVMovie.filter((item) => item.id !== tvSeries.id);
          await updateDoc(userRef, { likedTVMovie: updatedList });
          setLiked(false);
        } else {
          
          const itemToAdd = {
            id: tvSeries.id,
            name: tvSeries.name,
            poster_path: tvSeries.poster_path,
            first_air_date: tvSeries.first_air_date,
            type: 'tv'
          };
          const updatedList = [...userData.likedTVMovie, itemToAdd];
          await updateDoc(userRef, { likedTVMovie: updatedList });
          setLiked(true);
        }
      }
    } catch (error) {
      console.error('Error saving TV series:', error);
      alert('Failed to save TV series');
    }
  };

  return (
    <div className="p-4">
      {loading ? (
        <p>Loading TV series details...</p>
      ) : (
        <div className="flex flex-col sm:flex-row mt-20">
          <div className="w-[150px] sm:w-[200px]">
            {details.poster_path ? (
              <img
                src={`https://image.tmdb.org/t/p/w500${details.poster_path}`}
                alt={details.name || "TV Series Poster"}
                className="w-full h-auto rounded-lg"
              />
            ) : (
              <p>No Image Available</p>
            )}
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

            {details.episode_run_time?.length > 0 && (
              <div className="mt-2">
                <span className="font-semibold">Episode Runtime: </span>
                {details.episode_run_time[0]} minutes
              </div>
            )}


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
        <h3 className="text-white text-xl font-bold mb-4">Comments</h3>
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-gray-800 p-4 rounded-lg">
              {editingComment === comment ? (
                <textarea
                  className="w-full p-4 bg-gray-700 text-white rounded-lg resize-y min-h-[100px] break-words"
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                />
              ) : (
                <p className="text-white whitespace-pre-wrap break-words">
                  {comment.text}
                </p>
              )}
              <p className="text-gray-400 text-sm mt-2">
                Posted by: {comment.username}
              </p>
              {user && user.email === comment.username && (
                <div className="mt-2 space-x-2">
                  <button
                    onClick={() => handleEditComment(comment)}
                    className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                  >
                    {editingComment === comment ? 'Save' : 'Edit'}
                  </button>
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {user && (
        <div className="mt-6">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="w-full p-4 bg-gray-700 text-white rounded-lg resize-y min-h-[100px] break-words"
          />
          <button
            onClick={handleAddComment}
            className="mt-2 bg-red-600 text-white px-4 py-2 rounded"
          >
            Post Comment
          </button>
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

export default TVDetail;
