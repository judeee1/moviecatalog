import { create } from "zustand";
import { persist } from "zustand/middleware";
import { FavoritesState } from "../Types/Types";

// Хранилище Zustand для избранного с сохранением в localStorage
export const useFavoritesStore = create<FavoritesState>()(
  persist(
    // Функция создания хранилища
    (set, get) => ({
      favorites: [], //Изначально пуст
      // Функция добавления фильма в избранное
      addFavorite: (movie) =>
        set((state) => {
          if (!state.favorites.find((m) => m.id === movie.id)) {
            return { favorites: [...state.favorites, movie] }; // Добавляем фильм в избранное в конец массива
          }
          return state; // Если фильм уже в избранном, ничего не делаем
        }),

      removeFavorite: (id) =>
        set((state) => ({
          favorites: state.favorites.filter((movie) => movie.id !== id), // Удаляем фильм и оставляем тоолько те у которых не свопадает id
        })),
      // Проверяем, есть ли фильм с таким id в избранном
      isFavorite: (id) => get().favorites.some((movie) => movie.id === id),
    }),
    {
      name: "favorites-storage", // Имя для сохранения в localStorage
      partialize: (state) => ({ favorites: state.favorites }), //сохранение онли favorites без остального
    }
  )
);
