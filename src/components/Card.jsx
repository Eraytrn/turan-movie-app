import { useEffect } from "react";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { UserAuth } from "../context/AuthContext";

const Card = ({ movie, onClick }) => {
  const { user } = UserAuth();

  useEffect(() => {
   
    if (user && user.email) {
      const fetchUserData = async () => {
        try {
          const userRef = doc(db, "users", user.email);
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      };
      fetchUserData();
    }
  }, [user, movie.id]);

  return (
    <div onClick={onClick} className="bg-black rounded-lg overflow-hidden transform hover:scale-105 transition-transform duration-300">
      <img
        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
        alt={movie.title || movie.name}
        className="w-full h-90 object-cover"
      />
      <div className="p-2">
        <h3 className="text-white text-sm mt-2 text-center truncate">{movie.title || movie.name}</h3>
      </div>
    </div>
  );
};

export default Card;
