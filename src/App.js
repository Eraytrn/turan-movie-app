import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import { AuthContextProvider } from "./context/AuthContext";
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



function App() {
  return (
    <>
    <AuthContextProvider>
    <Navbar />
    <Routes>
      <Route  path="/" element = {<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signUp" element={<SignUp />} />
      <Route path="/search" element={<Search />} />
      <Route path="/movie/:id" element={<MovieDetails />} />
      <Route path="/tv/:id" component={<TVDetail />} />
      <Route path="/movies" element={<MovieList />} />
      <Route path="/tv" element={<TVList />} />
      <Route 
      path="/account" 
      element={
      <ProtectedRoute>
        <Account />
      </ProtectedRoute>
    } />
    </Routes>
    </AuthContextProvider>
    </>
  );
}

export default App;
