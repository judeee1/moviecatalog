import { create } from 'zustand';
import { Movie } from '../Types/Types';

// Интерфейс для хранилища поиска
interface SearchState {
  query: string;
  results: Movie[];
  setQuery: (query: string) => void;
  setResults: (results: Movie[]) => void;
  clearSearch: () => void;
  filters: { year?: string; genre?: string; rating?: string };
  setFilters: (filters: {
    year?: string;
    genre?: string;
    rating?: string;
  }) => void;
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
  setTotalPages: (totalPages: number) => void;
}

// Хранилище Zustand для поиска и фильтров
export const useSearchStore = create<SearchState>((set) => ({
  query: '',
  results: [],
  filters: {},
  currentPage: 1,
  totalPages: 1,
  setQuery: (query) => set({ query }), // Установка поискового запроса
  setResults: (results) => set({ results }), // Установка результатов поиска
  clearSearch: () =>
    set({ query: '', results: [], filters: {}, currentPage: 1, totalPages: 1 }), // Сброс поиска
  setFilters: (filters) => set({ filters, currentPage: 1 }), // Установка фильтров
  setCurrentPage: (page) => set({ currentPage: page }), // Установка текущей страницы
  setTotalPages: (totalPages) => set({ totalPages }), // Установка общего количества страниц
}));
