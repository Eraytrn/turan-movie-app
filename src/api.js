import { auth } from './firebase';

const TMDB_API_KEY = process.env.REACT_APP_TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

const FIREBASE_DB_URL = process.env.REACT_FIREBASE_DB_URL;

const getFirebaseToken = async () => {
  const user = auth.currentUser;
  if (user) {
    return user.getIdToken();
  }
  return null;
};

export const searchData = async (query) => {
  try {
    const response = await fetch(`${TMDB_BASE_URL}/search/multi?query=${query}&api_key=${TMDB_API_KEY}`);
    const data = await response.json();
    console.log(data); 
    return data;
  } catch (error) {
    console.error("Error fetching data: ", error);
  }
};

export const fetchMovieList = async (id) => {
  const response = await fetch(`${TMDB_BASE_URL}/genre/movie/${id}/list?/api_key=${TMDB_API_KEY}`);
  const data = await response.json();
  return data;
};

export const fetchTVList = async (id) => {
  const response = await fetch(`${TMDB_BASE_URL}/genre/tv/${id}/list?/api_key=${TMDB_API_KEY}`);
  const data = await response.json();
  return data;
};

export const fetchMovieDetails = async (id) => {
  const response = await fetch(
    `${TMDB_BASE_URL}/movie/${id}?api_key=${TMDB_API_KEY}`
  );
  const data = await response.json();
  return data;
};

export const fetchTVDetails = async (id) => {
  const response = await fetch(`${TMDB_BASE_URL}/tv/${id}?api_key=${TMDB_API_KEY}`);
  const data = await response.json();
  return data;
};

export const fetchMovieVideos = async (id) => {
  const response = await fetch(
    `${TMDB_BASE_URL}/movie/${id}/videos?api_key=${TMDB_API_KEY}`
  );
  const data = await response.json();
  return data;
};


export const fetchTVVideos = async (id) => {
  const response = await fetch(`${TMDB_BASE_URL}/tv/${id}/videos?api_key=${TMDB_API_KEY}`);
  const data = await response.json();
  return data;
};

export const fetchMovieCredits = async (id) => {
  const response = await fetch(
    `${TMDB_BASE_URL}/movie/${id}/credits?api_key=${TMDB_API_KEY}`
  );
  const data = await response.json();
  return data;
};

export const fetchTVCredits = async (id) => {
  const response = await fetch(`${TMDB_BASE_URL}/tv/${id}/credits?api_key=${TMDB_API_KEY}`);
  const data = await response.json();
  return data;
};

export const getComments = async (contentType, contentId) => {
  try {
    const token = await getFirebaseToken();
    const response = await fetch(
      `${FIREBASE_DB_URL}/comments/${contentType}/${contentId}.json${token ? `?auth=${token}` : ''}`,
    );
    const data = await response.json();
    return { comments: data ? Object.values(data) : [] };
  } catch (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }
};

export const addComment = async (contentType, contentId, comment) => {
  try {
    const token = await getFirebaseToken();
    if (!token) throw new Error('No authentication token');

    const commentId = Date.now().toString();

    const response = await fetch(
      `${FIREBASE_DB_URL}/comments/${contentType}/${contentId}/${commentId}.json?auth=${token}`,
      {
        method: 'PUT', 
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...comment,
          id: commentId, 
          createdAt: new Date().toISOString()
        })
      }
    );

    const data = await response.json();
    if (!data) throw new Error('Failed to add comment');
    return { ...data, id: commentId }; 
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};

export const updateComment = async (contentType, contentId, commentId, newText, contentName) => {
  try {
    const token = await getFirebaseToken();
    if (!token) throw new Error('No authentication token');

    
    const response = await fetch(
      `${FIREBASE_DB_URL}/comments/${contentType}/${contentId}/${commentId}.json?auth=${token}`
    );
    const existingComment = await response.json();
    if (!existingComment) throw new Error('Comment not found');

    
    const updateResponse = await fetch(
      `${FIREBASE_DB_URL}/comments/${contentType}/${contentId}/${commentId}.json?auth=${token}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...existingComment,
          id: commentId, 
          text: newText,
          updatedAt: new Date().toISOString(),
          ...(contentType === 'movie' ? { movieName: contentName } : { tvSeriesName: contentName })
        })
      }
    );

    const data = await updateResponse.json();
    if (!data) throw new Error('Failed to update comment');
    return { ...data, id: commentId }; 
  } catch (error) {
    console.error('Error updating comment:', error);
    throw error;
  }
};

export const deleteComment = async (contentType, contentId, commentId) => {
  try {
    const token = await getFirebaseToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(
      `${FIREBASE_DB_URL}/comments/${contentType}/${contentId}/${commentId}.json?auth=${token}`,
      {
        method: 'DELETE'
      }
    );
    
    if (!response.ok) throw new Error('Failed to delete comment');
    return { success: true };
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
};

export const getAllComments = async () => {
  try {
    const token = await getFirebaseToken();
    const response = await fetch(
      `${FIREBASE_DB_URL}/comments.json${token ? `?auth=${token}` : ''}`,
    );
    const data = await response.json() || {};
    
    const allComments = [];
    
    Object.entries(data).forEach(([type, contents]) => {
      Object.entries(contents).forEach(([contentId, comments]) => {
        Object.values(comments).forEach(comment => {
          allComments.push({
            ...comment,
            contentId,
            contentType: type
          });
        });
      });
    });
    
    return { comments: allComments };
  } catch (error) {
    console.error('Error fetching all comments:', error);
    throw error;
  }
};