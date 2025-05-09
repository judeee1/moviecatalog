import { FC } from "react";
import { MovieRatingProps } from "../Types/Types";

// Компонент отображения рейтинга фильма
const MovieRating: FC<MovieRatingProps> = ({ rating }) => {
  // Если рейтинга нет, показываем сообщение
  if (rating === undefined || rating === null) {
    return (
      <div
        className="movie-rating"
        style={{ backgroundColor: "var(--muted-foreground)" }}
      >
        <span>Нет рейтинга</span>
      </div>
    );
  }

  const formattedRating = rating.toFixed(1); // Округляем рейтинг до 1 знака

  // Определяем цвет фона в зависимости от рейтинга
  const getRatingColor = (rating: number) => {
    if (rating >= 7.5) return "var(--rating-high)";
    if (rating >= 5) return "var(--rating-medium)";
    return "var(--rating-low)";
  };

  return (
    <div
      className="movie-rating"
      style={{ backgroundColor: getRatingColor(rating) }}
    >
      <span className="rating-icon">★</span>
      <span>{formattedRating}</span> {/* Отображаем рейтинг */}
    </div>
  );
};

export default MovieRating;
