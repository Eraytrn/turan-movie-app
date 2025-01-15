import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, deleteDoc, updateDoc, getDoc } from 'firebase/firestore';

const AdminPanel = () => {
  const [comments, setComments] = useState([]);
  const [editingComment, setEditingComment] = useState(null);
  const [editedText, setEditedText] = useState('');

  useEffect(() => {
    fetchAllComments();
  }, []);

  const fetchAllComments = async () => {
    const allComments = [];
    
    
    const movieDocs = await getDocs(collection(db, 'movies'));
    for (const movieDoc of movieDocs.docs) {
      const movieComments = movieDoc.data().comments || [];
      allComments.push(...movieComments.map(comment => ({
        ...comment,
        contentId: movieDoc.id,
        contentType: 'movie'
      })));
    }

    
    const tvDocs = await getDocs(collection(db, 'tvSeries'));
    for (const tvDoc of tvDocs.docs) {
      const tvComments = tvDoc.data().comments || [];
      allComments.push(...tvComments.map(comment => ({
        ...comment,
        contentId: tvDoc.id,
        contentType: 'tv'
      })));
    }

    setComments(allComments);
  };

  const handleDeleteComment = async (comment) => {
    try {
      const contentRef = doc(db, comment.contentType === 'movie' ? 'movies' : 'tvSeries', comment.contentId);
      const contentDoc = await getDoc(contentRef);
      if (contentDoc.exists()) {
        const updatedComments = contentDoc.data().comments.filter(c => c.text !== comment.text);
        await updateDoc(contentRef, { comments: updatedComments });
        fetchAllComments();
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleEditComment = async (comment) => {
    if (editingComment) {
      try {
        const contentRef = doc(db, comment.contentType === 'movie' ? 'movies' : 'tvSeries', comment.contentId);
        const contentDoc = await getDoc(contentRef);
        if (contentDoc.exists()) {
          const updatedComments = contentDoc.data().comments.map(c => 
            c.text === editingComment.text ? { ...c, text: editedText } : c
          );
          await updateDoc(contentRef, { comments: updatedComments });
          setEditingComment(null);
          setEditedText('');
          fetchAllComments();
        }
      } catch (error) {
        console.error('Error updating comment:', error);
      }
    } else {
      setEditingComment(comment);
      setEditedText(comment.text);
    }
  };

  return (
    <div className="p-8 mt-28">
      <h1 className="text-3xl font-bold text-white mb-6">All Comments</h1>
      <div className="space-y-4">
        {comments.map((comment, index) => (
          <div key={index} className="bg-gray-800 p-4 rounded-lg">
            {editingComment === comment ? (
              <textarea
                className="w-full bg-gray-700 text-white p-2 rounded resize-y min-h-[100px] break-words"
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
              />
            ) : (
              <p className="text-white whitespace-pre-wrap break-words">
                {comment.text}
              </p>
            )}
            <div className="mt-2 text-sm text-gray-400">
              <p>User: {comment.username}</p>
              <p>Content: {comment.tvSeriesOrMovieName}</p>
            </div>
            <div className="mt-2 space-x-2">
              <button
                onClick={() => handleEditComment(comment)}
                className="bg-blue-500 text-white px-3 py-1 rounded"
              >
                {editingComment === comment ? 'Save' : 'Edit'}
              </button>
              <button
                onClick={() => handleDeleteComment(comment)}
                className="bg-red-500 text-white px-3 py-1 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPanel;