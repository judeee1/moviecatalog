import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  getMovieDetails,
  getImageUrl,
  getMovieVideos,
  getSimilarMovies,
} from '../Services/movieService';
import { useFavoritesStore } from '../Store/useFavoritesStore';
import MovieRating from '../Components/MovieRating';
import MovieTrailer from '../Components/MovieTrailer';
import MovieCarousel from '../Components/MovieCarousel';

// Компонент страницы с деталями фильма
const MovieDetail = () => {
  const { id } = useParams<{ id: string }>(); // Получаем ID фильма из URL
  const [movie, setMovie] = useState<any>(null);
  const [trailerKey, setTrailerKey] = useState<string | undefined>(undefined);
  const [similarMovies, setSimilarMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isFavorite, addFavorite, removeFavorite } = useFavoritesStore();
  const favorite = id ? isFavorite(parseInt(id)) : false; // Проверяем, в избранном ли фильм

  // Загрузка данных о фильме
  useEffect(() => {
    if (!id) return;

    const fetchMovieData = async () => {
      try {
        const movieData = await getMovieDetails(id);
        const videos = await getMovieVideos(id);
        const similarData = await getSimilarMovies(parseInt(id));
        setMovie(movieData);
        setSimilarMovies(similarData.results.slice(0, 10)); // Ограничиваем до 10 похожих фильмов

        const trailer = videos.find(
          (video: any) => video.type === 'Trailer' && video.site === 'YouTube'
        );
        setTrailerKey(trailer?.key);
      } catch (err) {
        setError('Ошибка при загрузке информации о фильме');
      } finally {
        setLoading(false);
      }
    };

    fetchMovieData();
  }, [id]);

  // Добавление/удаление из избранного
  const handleToggleFavorite = () => {
    if (!movie) return;
    if (favorite) {
      removeFavorite(movie.id);
    } else {
      addFavorite(movie);
    }
  };

  if (loading) {
    return (
      <div className="movie-detail-container">
        <p className="loading-text">Загрузка информации о фильме...</p>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="movie-detail-container">
        <p className="error-text">Ошибка при загрузке информации о фильме</p>
        <Link to="/" className="back-link">
          Вернуться на главную
        </Link>
      </div>
    );
  }

  return (
    <div className="movie-detail-container">
      <div className="back-link-wrapper">
        <Link to="/" className="back-link">
          Назад
        </Link>
      </div>
      <div className="movie-content">
        <div className="poster-section">
          <div className="poster-wrapper">
            <img
              src={getImageUrl(movie.poster_path)}
              alt={movie.title}
              className="movie-poster"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = ''; // Убираем изображение при ошибке
              }}
            />
          </div>
          <motion.button
            className={`favorite-toggle-button ${favorite ? 'active' : ''}`}
            onClick={handleToggleFavorite}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            {favorite ? 'Удалить из избранного' : 'Добавить в избранное'}
          </motion.button>
        </div>

        <div className="movie-info">
          <h1 className="movie-title">{movie.title}</h1>
          <div className="movie-details">
            <div className="movie-rating-wrapper">
              <strong>Рейтинг:</strong>{' '}
              <MovieRating rating={movie.vote_average} />
            </div>
            {movie.release_date && (
              <p className="description-text">
                <strong>Дата выхода:</strong>{' '}
                {new Date(movie.release_date).toLocaleDateString('ru-RU')}
              </p>
            )}
            {movie.genres && movie.genres.length > 0 && (
              <p className="description-text">
                <strong>Жанры:</strong>{' '}
                {movie.genres
                  .map((genre: { name: string }) => genre.name)
                  .join(', ')}
              </p>
            )}
            {movie.runtime && (
              <p className="description-text">
                <strong>Продолжительность:</strong>{' '}
                {Math.floor(movie.runtime / 60)} ч {movie.runtime % 60} мин
              </p>
            )}
          </div>
          {movie.overview && (
            <div className="movie-description">
              <h2 className="description-title">Описание</h2>
              <p className="description-text">{movie.overview}</p>
            </div>
          )}
          <MovieTrailer videoKey={trailerKey} /> {/* Трейлер фильма */}
        </div>
      </div>
      <MovieCarousel movies={similarMovies} /> {/* Карусель похожих фильмов */}
    </div>
  );
};

export default MovieDetail;
