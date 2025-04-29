import React from 'react';
import { useFavoritesStore } from '../Store/useFavoritesStore';
import MovieCard from '../Components/MovieCard';

// Компонент страницы избранных фильмов
const Favorites: React.FC = () => {
  const favorites = useFavoritesStore((state) => state.favorites); // Получаем список избранных фильмов

  return (
    <div className="favorites-container">
      <h1 className="favorites-title">Избранные фильмы</h1>
      {favorites.length === 0 ? (
        <p className="favorites-message">Нет избранных фильмов.</p> // Сообщение, если избранных нет
      ) : (
        <div className="movies-grid">
          {favorites.map((movie) => (
            <MovieCard key={movie.id} movie={movie} alwaysVisible /> // Карточка фильма
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
