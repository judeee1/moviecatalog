// Тип для объекта фильма
export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  release_date: string;
  vote_average: number; // Рейтинг фильма
}

// Тип для детальной информации о фильме
export interface MovieDetailResponse extends Movie {
  genres: { id: number; name: string }[];
  runtime: number;
}

// Типы для пропсов компонентов
export interface MovieCardProps {
  movie: Movie;
  alwaysVisible?: boolean;
}

export interface LikeButtonProps {
  movie: Movie;
  alwaysVisible?: boolean;
}

export interface FavoriteButtonProps {
  movie: Movie;
}

export interface MovieCarouselProps {
  movies: Movie[];
}
