import axios from 'axios';

// Настройки API
const API_KEY = import.meta.env.VITE_TMDB_API_KEY; // Ключ API из переменных окружения
const BASE_URL = 'https://api.themoviedb.org/3';

// Получение деталей фильма
export const getMovieDetails = async (movieId: string) => {
  const response = await axios.get(`${BASE_URL}/movie/${movieId}`, {
    params: {
      api_key: API_KEY,
      language: 'ru-RU',
    },
  });
  return response.data;
};

// Получение трейлеров для фильма
export const getMovieVideos = async (movieId: string) => {
  const response = await axios.get(`${BASE_URL}/movie/${movieId}/videos`, {
    params: {
      api_key: API_KEY,
      language: 'ru-RU',
    },
  });
  return response.data.results;
};

// Получение популярных фильмов
export const getPopularMovies = async (page: number = 1) => {
  const response = await axios.get(`${BASE_URL}/movie/popular`, {
    params: {
      api_key: API_KEY,
      language: 'ru-RU',
      page,
    },
  });
  return response.data;
};

// Поиск фильмов по запросу
export const searchMovies = async (query: string, page: number = 1) => {
  const response = await axios.get(`${BASE_URL}/search/movie`, {
    params: {
      api_key: API_KEY,
      language: 'ru-RU',
      query,
      page,
    },
  });
  return response.data;
};

// Получение похожих фильмов
export const getSimilarMovies = async (movieId: number) => {
  const response = await axios.get(`${BASE_URL}/movie/${movieId}/similar`, {
    params: {
      api_key: API_KEY,
      language: 'ru-RU',
      page: 1,
    },
  });
  return response.data;
};

// Получение отфильтрованных фильмов с пагинацией
export const getFilteredMovies = async (
  filters: { year?: string; genre?: string; rating?: string },
  page: number = 1
) => {
  const response = await axios.get(`${BASE_URL}/discover/movie`, {
    params: {
      api_key: API_KEY,
      language: 'ru',
      page,
      with_genres: filters.genre || undefined,
      primary_release_year: filters.year || undefined,
      'vote_average.gte': filters.rating || undefined,
      sort_by: 'popularity.desc',
    },
  });
  return response.data; // Возвращает результаты и общее количество страниц
};

// Получение URL изображения
export const getImageUrl = (path: string) => {
  return path ? `https://image.tmdb.org/t/p/w500${path}` : '';
};
