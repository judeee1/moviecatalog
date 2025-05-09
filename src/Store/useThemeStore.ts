import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ThemeState } from "../Types/Types";

// Хранилище Zustand для управления темой
export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "dark", // Темная тема по умолчанию
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === "dark" ? "light" : "dark", // Переключение темы
        })),
    }),
    {
      name: "theme-storage", // Сохранение в localStorage
    }
  )
);
