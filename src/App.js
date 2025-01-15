import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import AdminNavbar from "./components/AdminNavbar";
import { AuthContextProvider, UserAuth } from "./context/AuthContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Account from "./pages/Account";
import ProtectedRoute from "./components/ProtectedRoute";
import Search from "./components/Search";
import MovieDetails from "./components/MovieDetails";
import MovieList from "./components/MovieList";
import TVList from "./components/TVList";
import TVDetail from "./components/TVDetail";
import AdminPanel from "./components/AdminPanel";
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

// Ana uygulama içeriğini ayrı bir bileşen olarak oluşturalım
const AppContent = () => {
  const { isAdmin } = UserAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAdmin && window.location.pathname !== '/admin') {
      navigate('/admin');
    }
  }, [isAdmin, navigate]);

  return (
    <>
      {isAdmin ? <AdminNavbar /> : <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signUp" element={<SignUp />} />
        <Route path="/search" element={<Search />} />
        <Route path="/movie/:id" element={<MovieDetails />} />
        <Route path="/tv/:id" element={<TVDetail />} />
        <Route path="/movies" element={<MovieList />} />
        <Route path="/tv" element={<TVList />} />
        <Route path="/account" element={
          <ProtectedRoute adminOnly={false}>
            <Account />
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute adminOnly={true}>
            <AdminPanel />
          </ProtectedRoute>
        } />
      </Routes>
    </>
  );
};

// Ana App bileşeni
function App() {
  return (
    <AuthContextProvider>
      <AppContent />
    </AuthContextProvider>
  );
}

export default App;
