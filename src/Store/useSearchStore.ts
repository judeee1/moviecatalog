import { create } from "zustand";
import { Movie } from "../Types/Types";

// Интерфейс для хранилища поиска, определяет состояние и методы
interface SearchState {
  query: string; // Поисковый запрос
  results: Movie[]; // Массив результатов поиска
  setQuery: (query: string) => void;
  setResults: (results: Movie[]) => void;
  clearSearch: () => void; // Метод для сброса поиска
  filters: { year?: string; genre?: string; rating?: string }; // Фильтры для поиска
  setFilters: (filters: {
    year?: string;
    genre?: string;
    rating?: string;
  }) => void;
  currentPage: number; // Текущая страница пагинации
  totalPages: number; // Общее количество страниц
  setCurrentPage: (page: number) => void;
  setTotalPages: (totalPages: number) => void;
}

// Хранилище Zustand для управления поиском и фильтрами
export const useSearchStore = create<SearchState>((set) => ({
  query: "", // Начальное значение поискового запроса
  results: [],
  filters: {},
  currentPage: 1,
  totalPages: 1,
  setQuery: (query) => set({ query }), // Устанавливает новый поисковый запрос
  setResults: (results) => set({ results }), // Обновляет результаты поиска
  clearSearch: () =>
    set({ query: "", results: [], filters: {}, currentPage: 1, totalPages: 1 }), // Сбрасывает все параметры поиска
  setFilters: (filters) => set({ filters, currentPage: 1 }), // Устанавливает фильтры и сбрасывает страницу
  setCurrentPage: (page) => set({ currentPage: page }), // Устанавливает текущую страницу
  setTotalPages: (totalPages) => set({ totalPages }), // Устанавливает общее количество страниц
}));
