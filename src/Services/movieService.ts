import axios from "axios"; // Импорт библиотеки axios для HTTP-запросов

// Настройки API
const API_KEY = import.meta.env.VITE_TMDB_API_KEY; // Ключ API из переменных окружения
const BASE_URL = "https://api.themoviedb.org/3"; // Базовый URL TMDb API

// Получение деталей фильма по ID
export const getMovieDetails = async (movieId: string) => {
  const response = await axios.get(`${BASE_URL}/movie/${movieId}`, {
    params: {
      api_key: API_KEY, // Ключ API для аутентификации
      language: "ru-RU", // Язык ответа (русский)
    },
  });
  return response.data; // Возвращает объект с данными фильма
};

// Получение трейлеров для фильма по ID
export const getMovieVideos = async (movieId: string) => {
  const response = await axios.get(`${BASE_URL}/movie/${movieId}/videos`, {
    params: {
      api_key: API_KEY,
      language: "ru-RU",
    },
  });
  return response.data.results; // Возвращает массив видео (трейлеров)
};

// Получение популярных фильмов с пагинацией
export const getPopularMovies = async (page: number = 1) => {
  const response = await axios.get(`${BASE_URL}/movie/popular`, {
    params: {
      api_key: API_KEY,
      language: "ru-RU",
      page, // Номер страницы для пагинации
    },
  });
  return response.data; // Возвращает объект с результатами и метаинформацией
};

// Поиск фильмов по запросу с пагинацией
export const searchMovies = async (query: string, page: number = 1) => {
  const response = await axios.get(`${BASE_URL}/search/movie`, {
    params: {
      api_key: API_KEY,
      language: "ru-RU",
      query, // Поисковый запрос
      page,
    },
  });
  return response.data; // Возвращает объект с результатами и метаинформацией
};

// Получение похожих фильмов по ID
export const getSimilarMovies = async (movieId: number) => {
  const response = await axios.get(`${BASE_URL}/movie/${movieId}/similar`, {
    params: {
      api_key: API_KEY,
      language: "ru-RU",
      page: 1, // Первая страница похожих фильмов
    },
  });
  return response.data; // Возвращает объект с результатами и метаинформацией
};

// Получение отфильтрованных фильмов с пагинацией
export const getFilteredMovies = async (
  filters: { year?: string; genre?: string; rating?: string },
  page: number = 1
) => {
  const response = await axios.get(`${BASE_URL}/discover/movie`, {
    params: {
      api_key: API_KEY,
      language: "ru", // Язык ответа (русский)
      page,
      with_genres: filters.genre || undefined, // Фильтр по жанру
      primary_release_year: filters.year || undefined, // Фильтр по году
      "vote_average.gte": filters.rating || undefined, // Минимальный рейтинг
      sort_by: "popularity.desc", // Сортировка по популярности
    },
  });
  return response.data; // Возвращает объект с результатами и метаинформацией
};

// Формирование URL для изображения
export const getImageUrl = (path: string) => {
  return path ? `https://image.tmdb.org/t/p/w500${path}` : ""; // Возвращает URL или пустую строку
};
