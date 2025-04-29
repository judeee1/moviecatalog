import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MovieDetail from '../Pages/MovieDetail';
import {
  getMovieDetails,
  getMovieVideos,
  getSimilarMovies,
  getImageUrl,
} from '../Services/movieService';
import { useFavoritesStore } from '../Store/useFavoritesStore';
import * as router from 'react-router-dom';

// Импортируем матчеры для удобных проверок в тестах
import '@testing-library/jest-dom';

// Мокаем сервисы для работы с API
vi.mock('../Services/movieService', () => ({
  getMovieDetails: vi.fn(),
  getMovieVideos: vi.fn(),
  getSimilarMovies: vi.fn(),
  getImageUrl: vi.fn(),
}));

// Мокаем хранилище избранного
vi.mock('../Store/useFavoritesStore', () => ({
  useFavoritesStore: vi.fn(),
}));

// Мокаем хуки react-router-dom для управления маршрутами
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: vi.fn(),
  };
});

// Мокаем дочерние компоненты для изоляции тестирования MovieDetail
vi.mock('../Components/MovieRating', () => ({
  default: ({ rating }: { rating: number }) => (
    <span data-testid="movie-rating">{rating}</span>
  ),
}));
vi.mock('../Components/MovieTrailer', () => ({
  default: ({ videoKey }: { videoKey?: string }) => (
    <div data-testid="movie-trailer">
      {videoKey ? `Trailer: ${videoKey}` : 'No Trailer'}
    </div>
  ),
}));
vi.mock('../Components/MovieCarousel', () => ({
  default: ({ movies }: { movies: any[] }) => (
    <div data-testid="movie-carousel">
      {movies.map((movie) => (
        <div key={movie.id} data-testid={`similar-movie-${movie.id}`}>
          {movie.title}
        </div>
      ))}
    </div>
  ),
}));

// Основной блок тестов для MovieDetail
describe('MovieDetail Component', () => {
  const mockAddFavorite = vi.fn();
  const mockRemoveFavorite = vi.fn();
  const mockIsFavorite = vi.fn();

  // Подготовка моков перед каждым тестом
  beforeEach(() => {
    // Очищаем моки перед каждым тестом
    vi.clearAllMocks();

    // Мокаем useParams для возврата ID фильма
    (router.useParams as any).mockReturnValue({ id: '123' });

    // Мокаем useFavoritesStore с начальными значениями
    (useFavoritesStore as any).mockReturnValue({
      isFavorite: mockIsFavorite,
      addFavorite: mockAddFavorite,
      removeFavorite: mockRemoveFavorite,
    });
    mockIsFavorite.mockReturnValue(false);

    // Мокаем функции сервисов для успешного ответа
    (getMovieDetails as any).mockResolvedValue({
      id: 123,
      title: 'Test Movie',
      poster_path: '/poster.jpg',
      vote_average: 7.5,
      release_date: '2023-01-01',
      genres: [{ name: 'Action' }, { name: 'Drama' }],
      runtime: 120,
      overview: 'This is a test movie description.',
    });
    (getMovieVideos as any).mockResolvedValue([
      { type: 'Trailer', site: 'YouTube', key: 'trailer123' },
    ]);
    (getSimilarMovies as any).mockResolvedValue({
      results: [
        { id: 1, title: 'Similar Movie 1' },
        { id: 2, title: 'Similar Movie 2' },
      ],
    });
    (getImageUrl as any).mockReturnValue('http://example.com/poster.jpg');
  });

  // Проверяем, что компонент отображает состояние загрузки
  it('renders loading state initially', () => {
    render(
      <MemoryRouter>
        <MovieDetail />
      </MemoryRouter>
    );
    expect(
      screen.getByText('Загрузка информации о фильме...')
    ).toBeInTheDocument();
  });

  // Проверяем успешную загрузку данных о фильме
  it('renders movie details after successful fetch', async () => {
    render(
      <MemoryRouter>
        <MovieDetail />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Movie')).toBeInTheDocument();
      expect(screen.getByTestId('movie-rating')).toHaveTextContent('7.5');
      expect(screen.getByText('Дата выхода: 1.01.2023')).toBeInTheDocument();
      expect(screen.getByText('Жанры: Action, Drama')).toBeInTheDocument();
      expect(
        screen.getByText('Продолжительность: 2 ч 0 мин')
      ).toBeInTheDocument();
      expect(
        screen.getByText('This is a test movie description.')
      ).toBeInTheDocument();
    });
  });

  // Проверяем отображение трейлера
  it('renders movie trailer when available', async () => {
    render(
      <MemoryRouter>
        <MovieDetail />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('movie-trailer')).toHaveTextContent(
        'Trailer: trailer123'
      );
    });
  });

  // Проверяем отображение похожих фильмов
  it('renders similar movies', async () => {
    render(
      <MemoryRouter>
        <MovieDetail />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('movie-carousel')).toBeInTheDocument();
      expect(screen.getByTestId('similar-movie-1')).toHaveTextContent(
        'Similar Movie 1'
      );
      expect(screen.getByTestId('similar-movie-2')).toHaveTextContent(
        'Similar Movie 2'
      );
    });
  });

  // Проверяем отображение ошибки при неудачном запросе
  it('renders error message when fetch fails', async () => {
    (getMovieDetails as any).mockRejectedValueOnce(new Error('Fetch error'));

    render(
      <MemoryRouter>
        <MovieDetail />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText('Ошибка при загрузке информации о фильме')
      ).toBeInTheDocument();
      expect(screen.getByText('Вернуться на главную')).toBeInTheDocument();
    });
  });

  // Проверяем добавление фильма в избранное
  it('adds movie to favorites when not favorited', async () => {
    render(
      <MemoryRouter>
        <MovieDetail />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Добавить в избранное')).toBeInTheDocument();
    });

    const favoriteButton = screen.getByText('Добавить в избранное');
    fireEvent.click(favoriteButton);

    expect(mockAddFavorite).toHaveBeenCalledWith({
      id: 123,
      title: 'Test Movie',
      poster_path: '/poster.jpg',
      vote_average: 7.5,
      release_date: '2023-01-01',
      genres: [{ name: 'Action' }, { name: 'Drama' }],
      runtime: 120,
      overview: 'This is a test movie description.',
    });
  });

  // Проверяем удаление фильма из избранного
  it('removes movie from favorites when already favorited', async () => {
    mockIsFavorite.mockReturnValue(true);

    render(
      <MemoryRouter>
        <MovieDetail />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Удалить из избранного')).toBeInTheDocument();
    });

    const favoriteButton = screen.getByText('Удалить из избранного');
    fireEvent.click(favoriteButton);

    expect(mockRemoveFavorite).toHaveBeenCalledWith(123);
  });

  // Проверяем поведение при отсутствии ID фильма
  it('does not fetch data if id is missing', () => {
    (router.useParams as any).mockReturnValue({ id: undefined });

    render(
      <MemoryRouter>
        <MovieDetail />
      </MemoryRouter>
    );

    expect(getMovieDetails).not.toHaveBeenCalled();
    expect(
      screen.getByText('Загрузка информации о фильме...')
    ).toBeInTheDocument();
  });
});
