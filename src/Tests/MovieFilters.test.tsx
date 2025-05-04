import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import MovieFilters from "../Components/MovieFilters";
import { getFilteredMovies } from "../Services/movieService";
import { useSearchStore } from "../Store/useSearchStore";
import * as router from "react-router-dom";

// Импортируем матчеры
import "@testing-library/jest-dom";

// Мокаем сервисы
vi.mock("../Services/movieService", () => ({
  getFilteredMovies: vi.fn(),
}));

// Мокаем хранилище
vi.mock("../Store/useSearchStore", () => ({
  useSearchStore: vi.fn(),
}));

// Мокаем хуки
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: vi.fn(),
    useLocation: vi.fn(),
  };
});

describe("MovieFilters Component", () => {
  const mockNavigate = vi.fn();
  const mockLocation = { search: "" };
  const mockSetResults = vi.fn();
  const mockSetFilters = vi.fn();
  const mockSetCurrentPage = vi.fn();
  const mockSetTotalPages = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (router.useNavigate as any).mockReturnValue(mockNavigate);
    (router.useLocation as any).mockReturnValue(mockLocation);
    (useSearchStore as any).mockReturnValue({
      filters: { year: "", genre: "", rating: "" },
      currentPage: 1,
      setResults: mockSetResults,
      setFilters: mockSetFilters,
      setCurrentPage: mockSetCurrentPage,
      setTotalPages: mockSetTotalPages,
    });
    (getFilteredMovies as any).mockResolvedValue({
      results: [
        { id: 1, title: "Filtered Movie 1" },
        { id: 2, title: "Filtered Movie 2" },
      ],
      total_pages: 5,
    });
  });

  it("рендерит форму фильтров и кнопку переключения", () => {
    render(
      <MemoryRouter>
        <MovieFilters />
      </MemoryRouter>
    );

    expect(screen.getByText("Показать фильтры")).toBeInTheDocument();
    expect(screen.getByLabelText("Жанр:")).toBeInTheDocument();
    expect(screen.getByLabelText("Год выпуска:")).toBeInTheDocument();
    expect(screen.getByLabelText("Минимальный рейтинг:")).toBeInTheDocument();
  });

  it("переключает видимость формы фильтров", () => {
    render(
      <MemoryRouter>
        <MovieFilters />
      </MemoryRouter>
    );

    const toggleButton = screen.getByText("Показать фильтры");
    fireEvent.click(toggleButton);

    expect(screen.getByText("Скрыть фильтры")).toBeInTheDocument();
    expect(screen.getByText("Применить фильтры")).toBeInTheDocument();

    fireEvent.click(toggleButton);
    expect(screen.getByText("Показать фильтры")).toBeInTheDocument();
  });

  it("применяет фильтры и обновляет результаты", async () => {
    render(
      <MemoryRouter>
        <MovieFilters />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText("Показать фильтры"));

    fireEvent.change(screen.getByLabelText("Год выпуска:"), {
      target: { value: "2020" },
    });
    fireEvent.change(screen.getByLabelText("Минимальный рейтинг:"), {
      target: { value: "8" },
    });
    fireEvent.change(screen.getByLabelText("Жанр:"), {
      target: { value: "28" },
    });

    fireEvent.click(screen.getByText("Применить фильтры"));

    await waitFor(() => {
      expect(mockSetFilters).toHaveBeenCalledWith({
        year: "2020",
        genre: "28",
        rating: "8",
      });
      expect(mockSetCurrentPage).toHaveBeenCalledWith(1);
      expect(mockNavigate).toHaveBeenCalledWith("/?page=1");
      expect(getFilteredMovies).toHaveBeenCalledWith(
        { year: "2020", genre: "28", rating: "8" },
        1
      );
      expect(mockSetResults).toHaveBeenCalledWith([
        { id: 1, title: "Filtered Movie 1" },
        { id: 2, title: "Filtered Movie 2" },
      ]);
      expect(mockSetTotalPages).toHaveBeenCalledWith(5);
    });
  });

  it("сбрасывает фильтры", () => {
    render(
      <MemoryRouter>
        <MovieFilters />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText("Показать фильтры"));

    fireEvent.change(screen.getByLabelText("Год выпуска:"), {
      target: { value: "2020" },
    });
    fireEvent.change(screen.getByLabelText("Минимальный рейтинг:"), {
      target: { value: "8" },
    });
    fireEvent.change(screen.getByLabelText("Жанр:"), {
      target: { value: "28" },
    });

    fireEvent.click(screen.getByText("Сбросить"));

    expect(screen.getByLabelText("Год выпуска:")).toHaveValue("");
    expect(screen.getByLabelText("Минимальный рейтинг:")).toHaveValue("");
    expect(screen.getByLabelText("Жанр:")).toHaveValue("");
    expect(mockSetFilters).toHaveBeenCalledWith({
      year: "",
      genre: "",
      rating: "",
    });
    expect(mockSetResults).toHaveBeenCalledWith([]);
    expect(mockSetCurrentPage).toHaveBeenCalledWith(1);
    expect(mockNavigate).toHaveBeenCalledWith("/?page=1");
  });

  it("синхронизирует страницу с URL", () => {
    (router.useLocation as any).mockReturnValue({ search: "?page=3" });

    render(
      <MemoryRouter initialEntries={["/?page=3"]}>
        <MovieFilters />
      </MemoryRouter>
    );

    expect(mockSetCurrentPage).toHaveBeenCalledWith(3);
  });

  it("не запрашивает фильтры, если они пустые", () => {
    render(
      <MemoryRouter>
        <MovieFilters />
      </MemoryRouter>
    );

    expect(getFilteredMovies).not.toHaveBeenCalled();
  });

  it("обработает ошибку при загрузке фильтров", async () => {
    (getFilteredMovies as any).mockRejectedValueOnce(new Error("Fetch error"));
    (useSearchStore as any).mockReturnValue({
      filters: { year: "2020", genre: "28", rating: "8" },
      currentPage: 1,
      setResults: mockSetResults,
      setFilters: mockSetFilters,
      setCurrentPage: mockSetCurrentPage,
      setTotalPages: mockSetTotalPages,
    });

    render(
      <MemoryRouter>
        <MovieFilters />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockSetResults).toHaveBeenCalledWith([]);
    });
  });

  it("валидирует рейтинг перед применением", () => {
    render(
      <MemoryRouter>
        <MovieFilters />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText("Показать фильтры"));

    fireEvent.change(screen.getByLabelText("Минимальный рейтинг:"), {
      target: { value: "11" },
    });
    fireEvent.change(screen.getByLabelText("Год выпуска:"), {
      target: { value: "2020" },
    });

    fireEvent.click(screen.getByText("Применить фильтры"));

    expect(mockSetFilters).toHaveBeenCalledWith({
      year: "2020",
      genre: "",
      rating: "",
    });
  });
});
