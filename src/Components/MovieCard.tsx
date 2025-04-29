import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getImageUrl } from '../Services/movieService';
import { FC } from 'react';
import { MovieCardProps } from '../Types/Types';
import FavoriteButton from './FavoriteButton';
import MovieRating from './MovieRating';

// Компонент карточки фильма, принимает фильм как пропс
const MovieCard: FC<MovieCardProps> = ({ movie }) => {
  return (
    // Ссылка на страницу фильма
    <Link to={`/movie/${movie.id}`} className="movie-card-link">
      <motion.div
        className="movie-card"
        whileHover={{ scale: 1.05 }} // Анимация увеличения при наведении
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <div className="poster-wrapper">
          <img
            src={getImageUrl(movie.poster_path)} // Получаем URL постера
            alt={movie.title}
            className="movie-card-poster"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = ''; // Если ошибка загрузки, убираем изображение
            }}
          />
          <MovieRating rating={movie.vote_average} /> {/* Компонент рейтинга */}
          <FavoriteButton movie={movie} /> {/* Кнопка избранного */}
        </div>
        <h3 className="movie-card-title">{movie.title}</h3>{' '}
        {/* Название фильма */}
      </motion.div>
    </Link>
  );
};

export default MovieCard;
