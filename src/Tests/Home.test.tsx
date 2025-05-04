import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Home from "../Pages/Home";
import { getPopularMovies } from "../Services/movieService";
import { useSearchStore } from "../Store/useSearchStore";
// Импортируем матчеры
import "@testing-library/jest-dom";

// Мокаем сервисы
vi.mock("../Services/movieService", () => ({
  getPopularMovies: vi.fn(),
}));

// Мокаем хранилище
vi.mock("../Store/useSearchStore", () => ({
  useSearchStore: vi.fn(),
}));

// Мокаем дочерние компоненты
vi.mock("./MovieFilters", () => ({
  default: () => <div data-testid="mock-filters">Filters</div>,
}));

describe("Home Component", () => {
  const mockSetResults = vi.fn();
  const mockSetTotalPages = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useSearchStore as any).mockReturnValue({
      results: [],
      setResults: mockSetResults,
      setTotalPages: mockSetTotalPages,
    });
    (getPopularMovies as any).mockResolvedValue({
      results: [
        {
          id: 1,
          title: "Movie 1",
          poster_path: "/poster1.jpg",
          vote_average: 7.5,
        },
        {
          id: 2,
          title: "Movie 2",
          poster_path: "/poster2.jpg",
          vote_average: 6.5,
        },
      ],
      total_pages: 10,
    });
  });

  it("рендерит популярные фильмы при загрузке", async () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Популярные фильмы")).toBeInTheDocument();
      expect(screen.getByTestId("mock-filters")).toBeInTheDocument();
      expect(screen.getByText("Movie 1")).toBeInTheDocument();
      expect(screen.getByText("Movie 2")).toBeInTheDocument();
    });

    expect(mockSetResults).toHaveBeenCalledWith([
      {
        id: 1,
        title: "Movie 1",
        poster_path: "/poster1.jpg",
        vote_average: 7.5,
      },
      {
        id: 2,
        title: "Movie 2",
        poster_path: "/poster2.jpg",
        vote_average: 6.5,
      },
    ]);
    expect(mockSetTotalPages).toHaveBeenCalledWith(10);
  });

  it("обработает поиск фильма", async () => {
    (useSearchStore as any).mockReturnValue({
      results: [],
      setResults: mockSetResults,
      setTotalPages: mockSetTotalPages,
      searchQuery: "",
      setSearchQuery: vi.fn(),
    });

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    const searchInput = screen.getByPlaceholderText(/поиск фильмов/i);
    fireEvent.change(searchInput, { target: { value: "Action" } });
    fireEvent.keyPress(searchInput, { key: "Enter", code: "Enter" });

    await waitFor(() => {
      expect(screen.getByText("Результаты")).toBeInTheDocument();
    });

    expect(mockSetResults).toHaveBeenCalled();
  });

  it("показывает сообщение об ошибке при неудачной загрузке", async () => {
    (getPopularMovies as any).mockRejectedValueOnce(new Error("API Error"));

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText(/не удалось загрузить популярные фильмы/i)
      ).toBeInTheDocument();
    });

    expect(mockSetResults).toHaveBeenCalledWith([]);
  });

  it("рендерит пагинацию с правильным количеством страниц", async () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    await waitFor(() => {
      const pagination = screen.getByTestId("pagination");
      expect(pagination).toBeInTheDocument();
      expect(screen.getAllByText(/\d+/).length).toBeGreaterThan(1); // Проверяем наличие страниц
    });
  });
});
