import { create } from "zustand";
import { persist } from "zustand/middleware";
import { FavoritesState } from "../Types/Types";

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
      name: "favorites-storage", // Имя для сохранения в localStorage
      partialize: (state) => ({ favorites: state.favorites }),
    }
  )
);
