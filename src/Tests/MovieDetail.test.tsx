import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import MovieDetail from "../Pages/MovieDetail";
import {
  getMovieDetails,
  getMovieVideos,
  getSimilarMovies,
  getImageUrl,
} from "../Services/movieService";
import { useFavoritesStore } from "../Store/useFavoritesStore";
import * as router from "react-router-dom";

// Импортируем матчеры
import "@testing-library/jest-dom";

// Мокаем сервисы
vi.mock("../Services/movieService", () => ({
  getMovieDetails: vi.fn(),
  getMovieVideos: vi.fn(),
  getSimilarMovies: vi.fn(),
  getImageUrl: vi.fn(),
}));

// Мокаем хранилище
vi.mock("../Store/useFavoritesStore", () => ({
  useFavoritesStore: vi.fn(),
}));

// Мокаем хуки
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useParams: vi.fn(),
  };
});

describe("MovieDetail Component", () => {
  const mockAddFavorite = vi.fn();
  const mockRemoveFavorite = vi.fn();
  const mockIsFavorite = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (router.useParams as any).mockReturnValue({ id: "123" });
    (useFavoritesStore as any).mockReturnValue({
      isFavorite: mockIsFavorite,
      addFavorite: mockAddFavorite,
      removeFavorite: mockRemoveFavorite,
    });
    mockIsFavorite.mockReturnValue(false);
    (getMovieDetails as any).mockResolvedValue({
      id: 123,
      title: "Test Movie",
      poster_path: "/poster.jpg",
      vote_average: 7.5,
      release_date: "2023-01-01",
      genres: [{ name: "Action" }, { name: "Drama" }],
      runtime: 120,
      overview: "This is a test movie description.",
    });
    (getMovieVideos as any).mockResolvedValue([
      { type: "Trailer", site: "YouTube", key: "trailer123" },
    ]);
    (getSimilarMovies as any).mockResolvedValue({
      results: [
        { id: 1, title: "Similar Movie 1" },
        { id: 2, title: "Similar Movie 2" },
      ],
    });
    (getImageUrl as any).mockReturnValue("http://example.com/poster.jpg");
  });

  it("рендерит состояние загрузки изначально", async () => {
    render(
      <MemoryRouter>
        <MovieDetail />
      </MemoryRouter>
    );

    expect(
      screen.getByText("Загрузка информации о фильме...")
    ).toBeInTheDocument();
  });

  it("рендерит детали фильма после успешной загрузки", async () => {
    render(
      <MemoryRouter>
        <MovieDetail />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Test Movie")).toBeInTheDocument();
      expect(screen.getByTestId("movie-rating")).toHaveTextContent("7.5");
      expect(screen.getByText("Дата выхода: 1.01.2023")).toBeInTheDocument();
      expect(screen.getByText("Жанры: Action, Drama")).toBeInTheDocument();
      expect(
        screen.getByText("Продолжительность: 2 ч 0 мин")
      ).toBeInTheDocument();
      expect(
        screen.getByText("This is a test movie description.")
      ).toBeInTheDocument();
    });
  });

  it("отображает трейлер, если он доступен", async () => {
    render(
      <MemoryRouter>
        <MovieDetail />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId("movie-trailer")).toHaveTextContent(
        "Trailer: trailer123"
      );
    });
  });

  it("отображает сообщение, если трейлера нет", async () => {
    (getMovieVideos as any).mockResolvedValue([]);
    render(
      <MemoryRouter>
        <MovieDetail />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Трейлер недоступен")).toBeInTheDocument();
    });
  });

  it("отображает похожие фильмы", async () => {
    render(
      <MemoryRouter>
        <MovieDetail />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId("movie-carousel")).toBeInTheDocument();
      expect(screen.getByTestId("similar-movie-1")).toHaveTextContent(
        "Similar Movie 1"
      );
      expect(screen.getByTestId("similar-movie-2")).toHaveTextContent(
        "Similar Movie 2"
      );
    });
  });

  it("отображает сообщение, если похожих фильмов нет", async () => {
    (getSimilarMovies as any).mockResolvedValue({ results: [] });
    render(
      <MemoryRouter>
        <MovieDetail />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText("Похожих фильмов не найдено")
      ).toBeInTheDocument();
    });
  });

  it("добавляет фильм в избранное", async () => {
    render(
      <MemoryRouter>
        <MovieDetail />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Добавить в избранное")).toBeInTheDocument();
    });

    const favoriteButton = screen.getByText("Добавить в избранное");
    fireEvent.click(favoriteButton);

    expect(mockAddFavorite).toHaveBeenCalledWith({
      id: 123,
      title: "Test Movie",
      poster_path: "/poster.jpg",
      vote_average: 7.5,
      release_date: "2023-01-01",
      genres: [{ name: "Action" }, { name: "Drama" }],
      runtime: 120,
      overview: "This is a test movie description.",
    });
  });

  it("удаляет фильм из избранного", async () => {
    mockIsFavorite.mockReturnValue(true);
    render(
      <MemoryRouter>
        <MovieDetail />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Удалить из избранного")).toBeInTheDocument();
    });

    const favoriteButton = screen.getByText("Удалить из избранного");
    fireEvent.click(favoriteButton);

    expect(mockRemoveFavorite).toHaveBeenCalledWith(123);
  });

  it("обработает ошибку при загрузке", async () => {
    (getMovieDetails as any).mockRejectedValueOnce(new Error("API Error"));

    render(
      <MemoryRouter>
        <MovieDetail />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText("Ошибка при загрузке информации о фильме")
      ).toBeInTheDocument();
      expect(screen.getByText("Вернуться на главную")).toBeInTheDocument();
    });
  });
});
