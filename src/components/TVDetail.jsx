import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchTVDetails, fetchTVVideos, fetchTVCredits } from "../api";
import VideoComponent from "./VideoComponent";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
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
  const [editedComment, setEditedComment] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [watchLater, setWatchLater] = useState(false);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [detailsData, videosData, creditsData] = await Promise.all([
          fetchTVDetails(id),
          fetchTVVideos(id),
          fetchTVCredits(id),
        ]);

        setDetails(detailsData);
        setCredits(creditsData?.cast || []);
        const trailer = videosData?.results?.find((vid) => vid.type === "Trailer");
        setVideo(trailer);

        const tvShowCommentsRef = doc(db, 'tvSeries', id);
        const tvShowCommentsDoc = await getDoc(tvShowCommentsRef);
        if (tvShowCommentsDoc.exists()) {
          setComments(tvShowCommentsDoc.data().comments || []);
        }

        if (user) {
          const userRef = doc(db, 'users', user.email);
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setWatchLater(userData.watchLaterMovies?.some((m) => m.id === detailsData.id));
            setLiked(userData.likedMovies?.some((m) => m.id === detailsData.id));
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

  const handleAddComment = async () => {
    if (!newComment) return;

    const tvSeriesOrMovieName = details.title || "Unnamed TV Series";
    const tvShowCommentsRef = doc(db, 'tvSeries', details.id.toString());
    const tvShowCommentsDoc = await getDoc(tvShowCommentsRef);

    let updatedComments = [];

    if (tvShowCommentsDoc.exists()) {
      updatedComments = tvShowCommentsDoc.data().comments || [];
    }

    updatedComments.push({
      text: newComment,
      username: user.email,
      tvSeriesOrMovieName: tvSeriesOrMovieName,
    });

    await setDoc(tvShowCommentsRef, { comments: updatedComments }, { merge: true });

    setComments(updatedComments);
    setNewComment("");
  };

  const handleEditComment = (index) => {
    setEditedComment(comments[index].text);
    setEditingIndex(index);
  };

  const handleUpdateComment = async () => {
    if (!editedComment) return;
    const tvShowCommentsRef = doc(db, 'tvSeries', details.id.toString());
    const tvShowCommentsDoc = await getDoc(tvShowCommentsRef);
    if (tvShowCommentsDoc.exists()) {
      const tvShowComments = tvShowCommentsDoc.data().comments || [];
      const updatedComments = tvShowComments.map((comment, index) =>
        index === editingIndex ? { ...comment, text: editedComment } : comment
      );
      await setDoc(tvShowCommentsRef, { comments: updatedComments }, { merge: true });
      setComments(updatedComments);
      setEditedComment("");
      setEditingIndex(null);
    }
  };

  const handleDeleteComment = async (commentIndex) => {
    const tvShowCommentsRef = doc(db, 'tvSeries', details.id.toString());
    const tvShowCommentsDoc = await getDoc(tvShowCommentsRef);
    if (tvShowCommentsDoc.exists()) {
      const tvShowComments = tvShowCommentsDoc.data().comments || [];
      const updatedComments = tvShowComments.filter((_, index) => index !== commentIndex);
      await setDoc(tvShowCommentsRef, { comments: updatedComments }, { merge: true });
      setComments(updatedComments);
    }
  };

  const handleSaveMovie = async (tvSeries, type) => {
    if (!user) {
      alert('Please log in to save tv series.');
      return;
    }

    const userRef = doc(db, 'users', user.email);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      let updatedTVSeries;

      if (type === 'watchLater') {
        if (userData.watchLaterMovies.some((m) => m.id === tvSeries.id)) {
          updatedTVSeries = userData.watchLaterMovies.filter((m) => m.id !== tvSeries.id);
          await updateDoc(userRef, { watchLaterMovies: updatedTVSeries });
          setWatchLater(false);
        } else {
          updatedTVSeries = [...userData.watchLaterMovies, { ...tvSeries, type }];
          await updateDoc(userRef, { watchLaterMovies: updatedTVSeries });
          setWatchLater(true);
        }
      } else if (type === 'liked') {
        if (userData.likedMovies.some((m) => m.id === tvSeries.id)) {
          updatedTVSeries = userData.likedMovies.filter((m) => m.id !== tvSeries.id);
          await updateDoc(userRef, { likedMovies: updatedTVSeries });
          setLiked(false);
        } else {
          updatedTVSeries = [...userData.likedMovies, { ...tvSeries, type }];
          await updateDoc(userRef, { likedMovies: updatedTVSeries });
          setLiked(true);
        }
      }
    } else {
      const newUserMovies = {
        watchLaterMovies: type === 'watchLater' ? [{ ...tvSeries, type }] : [],
        likedMovies: type === 'liked' ? [{ ...tvSeries, type }] : [],
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
        <p>Loading TV series details...</p>
      ) : (
        <div className="flex flex-col sm:flex-row mt-20">
          <div className="w-[150px] sm:w-[200px]">
            {details.poster_path ? (
              <img
                src={`https://image.tmdb.org/t/p/w500${details.poster_path}`}
                alt={details.title || "TV Series Poster"}
                className="w-full h-auto rounded-lg"
              />
            ) : (
              <p>No Image Available</p>
            )}
          </div>

          <div className="ml-4 text-white flex-1">
            <p className="mt-2 text-lg">{details.overview}</p>

            <div className="mt-4">
              <span className="font-semibold">Genres: </span>
              {details.genres?.map((genre) => genre.name).join(", ")}
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
        <h2 className="text-2xl font-bold text-white">Comments</h2>
        <div className="mt-4 space-y-4">
          {comments.map((comment, index) => (
            <div key={index} className="bg-gray-800 p-4 rounded-lg">
              {editingIndex === index ? (
                <div>
                  <textarea
                    className="w-full p-2 bg-gray-700 text-white rounded-lg"
                    value={editedComment}
                    onChange={(e) => setEditedComment(e.target.value)}
                  />
                  <button
                    className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg"
                    onClick={handleUpdateComment}
                  >
                    Update Comment
                  </button>
                </div>
              ) : (
                <p className="text-white">{comment.text}</p>
              )}
              <div className="mt-2 text-gray-400">
                <span>{comment.username}</span>
              </div>
              {user && comment.username === user.email && (
                <div className="mt-2 flex space-x-2">
                  <button
                    className="text-blue-500"
                    onClick={() => handleDeleteComment(index)}
                  >
                    Delete
                  </button>
                  <button
                    className="text-blue-500"
                    onClick={() => handleEditComment(index)}
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {user && (
          <div className="mt-4">
            <textarea
              className="w-full p-2 rounded-lg bg-gray-800 text-white"
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <button
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg"
              onClick={handleAddComment}
            >
              Add Comment
            </button>
          </div>
        )}
      </div>

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
