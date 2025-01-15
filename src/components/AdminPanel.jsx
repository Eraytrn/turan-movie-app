import React, { useEffect, useState } from 'react';
import { getAllComments, updateComment, deleteComment } from '../api';

const AdminPanel = () => {
  const [comments, setComments] = useState([]);
  const [editingComment, setEditingComment] = useState(null);
  const [editedText, setEditedText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAllComments();
  }, []);

  const fetchAllComments = async () => {
    try {
      setLoading(true);
      const data = await getAllComments();
      setComments(data.comments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      setError('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleEditComment = async (comment) => {
    if (editingComment === comment) {
      try {
        const contentName = comment.movieName || comment.tvSeriesName;
        await updateComment(
          comment.contentType,
          comment.contentId,
          comment.id,
          editedText,
          contentName
        );

        setComments(comments.map(c => 
          c.id === comment.id 
            ? { 
                ...c,
                text: editedText,
                updatedAt: new Date().toISOString()
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

  const handleDeleteComment = async (comment) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        await deleteComment(comment.contentType, comment.contentId, comment.id);
        setComments(comments.filter(c => c.id !== comment.id));
      } catch (error) {
        console.error('Error deleting comment:', error);
        alert('Failed to delete comment');
      }
    }
  };

  if (loading) return <div className="p-8 mt-28">Loading comments...</div>;
  if (error) return <div className="p-8 mt-28 text-red-500">{error}</div>;

  return (
    <div className="p-8 mt-28">
      <h1 className="text-3xl font-bold text-white mb-6">All Comments</h1>
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-gray-800 p-4 rounded-lg">
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
              <p>Content: {comment.movieName || comment.tvSeriesName}</p>
              <p>Type: {comment.contentType}</p>
              <p>Created: {new Date(comment.createdAt).toLocaleString()}</p>
              {comment.updatedAt && (
                <p>Updated: {new Date(comment.updatedAt).toLocaleString()}</p>
              )}
            </div>
            <div className="mt-2 space-x-2">
              <button
                onClick={() => handleEditComment(comment)}
                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
              >
                {editingComment === comment ? 'Save' : 'Edit'}
              </button>
              <button
                onClick={() => handleDeleteComment(comment)}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors"
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