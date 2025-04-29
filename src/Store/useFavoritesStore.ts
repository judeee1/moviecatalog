import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Movie } from '../Types/Types';

// Интерфейс для хранилища избранного
interface FavoritesState {
  favorites: Movie[];
  addFavorite: (movie: Movie) => void;
  removeFavorite: (id: number) => void;
  isFavorite: (id: number) => boolean;
}

// Хранилище Zustand для избранного с сохранением в localStorage
export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],

      addFavorite: (movie) =>
        set((state) => {
          if (!state.favorites.find((m) => m.id === movie.id)) {
            return { favorites: [...state.favorites, movie] }; // Добавляем фильм в избранное
          }
          return state;
        }),

      removeFavorite: (id) =>
        set((state) => ({
          favorites: state.favorites.filter((movie) => movie.id !== id), // Удаляем фильм
        })),

      isFavorite: (id) => get().favorites.some((movie) => movie.id === id), // Проверяем, в избранном ли фильм
    }),
    {
      name: 'favorites-storage', // Имя для сохранения в localStorage
      partialize: (state) => ({ favorites: state.favorites }),
    }
  )
);
