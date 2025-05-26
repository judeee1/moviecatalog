import { FC } from "react";
import { MovieTrailerProps } from "../Types/Types";

// Компонент для отображения трейлера фильма с ключом
const MovieTrailer: FC<MovieTrailerProps> = ({ videoKey }) => {
  // Если ключа нет, показываем сообщение
  if (!videoKey) {
    return (
      <div className="movie-trailer">
        <p className="no-trailer-text">Трейлер недоступен</p>
      </div>
    );
  }

  const youtubeUrl = `https://www.youtube.com/embed/${videoKey}?autoplay=0&controls=1`; // URL для YouTube

  return (
    <div className="movie-trailer">
      <h2 className="trailer-title">Трейлер</h2>
      <iframe
        width="100%"
        height="530"
        src={youtubeUrl}
        title="Трейлер фильма"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="trailer-iframe"
      ></iframe>{" "}
      {/* Встраиваем видео */}
    </div>
  );
};

export default MovieTrailer;
