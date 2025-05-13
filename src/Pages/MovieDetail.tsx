import { useParams, Link } from "react-router-dom"; // Импорт хуков и компонента для навигации
import { useState, useEffect } from "react"; // Импорт хуков React для состояния и эффектов
import { motion } from "framer-motion"; // Импорт motion для анимаций
import {
  getMovieDetails,
  getImageUrl,
  getMovieVideos,
  getSimilarMovies,
} from "../Services/movieService"; // Импорт функций API для получения данных о фильме
import { useFavoritesStore } from "../Store/useFavoritesStore";
import MovieRating from "../Components/MovieRating";
import MovieTrailer from "../Components/MovieTrailer";
import MovieCarousel from "../Components/MovieCarousel";

// Компонент страницы с деталями фильма
const MovieDetail = () => {
  // Получение ID фильма из параметров URL
  const { id } = useParams<{ id: string }>();
  // Локальное состояние для данных фильма, трейлера, похожих фильмов, загрузки и ошибок
  const [movie, setMovie] = useState<any>(null); // Данные фильма
  const [trailerKey, setTrailerKey] = useState<string | undefined>(undefined); // Ключ YouTube-трейлера
  const [similarMovies, setSimilarMovies] = useState<any[]>([]); // Похожие фильмы
  const [loading, setLoading] = useState(true); // Флаг загрузки
  const [error, setError] = useState<string | null>(null); // Сообщение об ошибке
  // Извлечение методов для управления избранным из хранилища
  const { isFavorite, addFavorite, removeFavorite } = useFavoritesStore();
  // Проверка, находится ли фильм в избранном
  const favorite = id ? isFavorite(parseInt(id)) : false;

  // Эффект для загрузки данных о фильме, трейлере и похожих фильмах
  useEffect(() => {
    if (!id) return; // Выход, если ID отсутствует

    // Функция для загрузки всех данных
    const fetchMovieData = async () => {
      try {
        // Запрос деталей фильма
        const movieData = await getMovieDetails(id);
        // Запрос видео (трейлеров)
        const videos = await getMovieVideos(id);
        // Запрос похожих фильмов
        const similarData = await getSimilarMovies(parseInt(id));
        setMovie(movieData); // Сохранение данных фильма
        setSimilarMovies(similarData.results.slice(0, 10)); // Ограничение до 10 похожих фильмов

        // Поиск трейлера на YouTube
        const trailer = videos.find(
          (video: any) => video.type === "Trailer" && video.site === "YouTube"
        );
        setTrailerKey(trailer?.key); // Установка ключа трейлера
      } catch (err) {
        // Обработка ошибок загрузки
        setError("Ошибка при загрузке информации о фильме");
      } finally {
        setLoading(false); // Отключение индикатора загрузки
      }
    };

    fetchMovieData();
  }, [id]); // Зависимость от ID фильма

  // Обработчик добавления/удаления фильма из избранного
  const handleToggleFavorite = () => {
    if (!movie) return; // Выход, если данные фильма отсутствуют
    if (favorite) {
      removeFavorite(movie.id); // Удаление из избранного
    } else {
      addFavorite(movie); // Добавление в избранное
    }
  };

  // Отображение загрузки
  if (loading) {
    return (
      <div className="movie-detail-container">
        <p className="loading-text">Загрузка информации о фильме...</p>
      </div>
    );
  }

  // Отображение ошибки или отсутствия данных
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
    // Основной контейнер страницы
    <div className="movie-detail-container">
      {/* Ссылка для возврата на главную */}
      <div className="back-link-wrapper">
        <Link to="/" className="back-link">
          Назад
        </Link>
      </div>
      {/* Контент фильма */}
      <div className="movie-content">
        {/* Секция с постером и кнопкой избранного */}
        <div className="poster-section">
          <div className="poster-wrapper">
            <img
              src={getImageUrl(movie.poster_path)} // URL постера
              alt={movie.title} // Альтернативный текст
              className="movie-poster"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (target.src !== "/placeholder.png") {
                  console.log("Ошибка загрузки:", movie.poster_path);
                  target.src = "/placeholder.png";
                }
              }}
            />
          </div>
          {/* Анимированная кнопка для добавления/удаления из избранного */}
          <motion.button
            className={`favorite-toggle-button ${favorite ? "active" : ""}`}
            onClick={handleToggleFavorite}
            whileHover={{ scale: 1.1 }} // Увеличение при наведении
            whileTap={{ scale: 0.95 }} // Уменьшение при нажатии
            transition={{ type: "spring", stiffness: 300, damping: 20 }} // Пружинная анимация
          >
            {favorite ? "Удалить из избранного" : "Добавить в избранное"}
          </motion.button>
        </div>

        {/* Информация о фильме */}
        <div className="movie-info">
          <h1 className="movie-title">{movie.title}</h1> {/* Название фильма */}
          <div className="movie-details">
            {/* Рейтинг фильма */}
            <div className="movie-rating-wrapper">
              <strong>Рейтинг:</strong>{" "}
              <MovieRating rating={movie.vote_average} />
            </div>
            {/* Дата выхода */}
            {movie.release_date && (
              <p className="description-text">
                <strong>Дата выхода:</strong>{" "}
                {new Date(movie.release_date).toLocaleDateString("ru-RU")}
              </p>
            )}
            {/* Жанры */}
            {movie.genres && movie.genres.length > 0 && (
              <p className="description-text">
                <strong>Жанры:</strong>{" "}
                {movie.genres
                  .map((genre: { name: string }) => genre.name)
                  .join(", ")}
              </p>
            )}
            {/* Продолжительность */}
            {movie.runtime && (
              <p className="description-text">
                <strong>Продолжительность:</strong>{" "}
                {Math.floor(movie.runtime / 60)} ч {movie.runtime % 60} мин
              </p>
            )}
          </div>
          {/* Описание фильма */}
          {movie.overview && (
            <div className="movie-description">
              <h2 className="description-title">Описание</h2>
              <p className="description-text">{movie.overview}</p>
            </div>
          )}
          {/* Компонент трейлера */}
          <MovieTrailer videoKey={trailerKey} />
        </div>
      </div>
      {/* Карусель похожих фильмов */}
      <MovieCarousel movies={similarMovies} />
    </div>
  );
};

// Экспорт компонента
export default MovieDetail;
