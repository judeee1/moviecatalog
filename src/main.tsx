import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./Components/Navbar.tsx";
import About from "./Pages/About.tsx";
import Favorites from "./Pages/Favorites.tsx";
import Home from "./Pages/Home.tsx";
import MovieDetail from "./Pages/MovieDetail.tsx";
import { useThemeStore } from "./Store/useThemeStore";
import { useEffect } from "react";

const App = () => {
  const { theme } = useThemeStore();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movie/:id" element={<MovieDetail />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </BrowserRouter>
  );
};

createRoot(document.getElementById("root")!).render(<App />);
