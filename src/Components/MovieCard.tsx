import { Link } from "react-router-dom"; // Импорт компонента Link для навигации между страницами
import { motion } from "framer-motion";
import { getImageUrl } from "../Services/movieService";
import { FC } from "react";
import { MovieCardProps } from "../Types/Types";
import FavoriteButton from "./FavoriteButton";
import MovieRating from "./MovieRating";

// Компонент карточки фильма, принимает объект фильма как пропс
const MovieCard: FC<MovieCardProps> = ({ movie }) => {
  return (
    // Ссылка на страницу фильма с динамическим ID (например, /movie/123)
    <Link to={`/movie/${movie.id}`} className="movie-card-link">
      {/* Анимированный контейнер карточки с эффектом увеличения при наведении */}
      <motion.div
        className="movie-card"
        whileHover={{ scale: 1.05 }} // Увеличение на 5% при наведении курсора
        transition={{ type: "spring", stiffness: 300, damping: 20 }} // Настройки пружинной анимации
      >
        {/* Контейнер для постера, рейтинга и кнопки избранного */}
        <div className="poster-wrapper">
          <img
            src={getImageUrl(movie.poster_path)} // URL постера
            alt={movie.title}
            className="movie-card-poster" // Класс для стилизации изображения
            onError={(e) => {
              // Обработчик ошибки загрузки изображения
              const target = e.target as HTMLImageElement; // Приведение типа события к HTMLImageElement
              if (target.src !== "/placeholder.png") {
                // Проверка, чтобы избежать циклических ошибок
                console.log("Ошибка загрузки:", movie.poster_path); // Логирование пути, вызвавшего ошибку
                target.src = "/placeholder.png"; // Установка заглушки при ошибке
              }
            }}
          />
          {/* Компонент рейтинга, отображающий оценку фильма */}
          <MovieRating rating={movie.vote_average} />
          {/* Кнопка добавления фильма в избранное */}
          <FavoriteButton movie={movie} />
        </div>
        {/* Заголовок с названием фильма */}
        <h3 className="movie-card-title">{movie.title}</h3>
      </motion.div>
    </Link>
  );
};

// Экспорт компонента по умолчанию
export default MovieCard;
