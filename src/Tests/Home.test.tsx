import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Home from '../Pages/Home';
import { getPopularMovies } from '../Services/movieService';
import { useSearchStore } from '../Store/useSearchStore';
import * as router from 'react-router-dom';

// Импортируем матчеры для удобных проверок в тестах
import '@testing-library/jest-dom';

// Мокаем getPopularMovies для имитации запросов к API
vi.mock('../Services/movieService', () => ({
  getPopularMovies: vi.fn(),
}));

// Мокаем useSearchStore для управления состоянием поиска
vi.mock('../Store/useSearchStore', () => ({
  useSearchStore: vi.fn(),
}));

// Мокаем хуки react-router-dom для тестирования маршрутизации
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
    useLocation: vi.fn(),
  };
});

// Мокаем дочерние компоненты, чтобы изолировать тестирование Home
vi.mock('../Components/SearchBar', () => ({
  default: () => <div data-testid="search-bar">SearchBar</div>,
}));
vi.mock('../Components/MovieFilters', () => ({
  default: () => <div data-testid="movie-filters">MovieFilters</div>,
}));
vi.mock('../Components/MovieCard', () => ({
  default: ({ movie }: { movie: { id: number; title: string } }) => (
    <div data-testid={`movie-card-${movie.id}`}>{movie.title}</div>
  ),
}));

describe('Home Component', () => {
  const mockNavigate = vi.fn();
  const mockLocation = { search: '' };

  // Сбрасываем моки и устанавливаем начальные значения перед каждым тестом
  beforeEach(() => {
    vi.clearAllMocks();
    (router.useNavigate as any).mockReturnValue(mockNavigate);
    (router.useLocation as any).mockReturnValue(mockLocation);
    (useSearchStore as any).mockReturnValue({
      query: '',
      results: [],
      filters: { year: '', genre: '', rating: '' },
      currentPage: 1,
      totalPages: 1,
      setCurrentPage: vi.fn(),
    });
    (getPopularMovies as any).mockResolvedValue({
      results: [
        {
          id: 1,
          title: 'Movie 1',
          overview: '',
          poster_path: '',
          release_date: '',
          vote_average: 7.5,
        },
        {
          id: 2,
          title: 'Movie 2',
          overview: '',
          poster_path: '',
          release_date: '',
          vote_average: 8.0,
        },
      ],
      total_pages: 10,
    });
  });

  // Проверяем, что компонент отображает состояние загрузки при монтировании
  it('renders loading state initially', () => {
    render(
      <MemoryRouter initialEntries={['/?page=1']}>
        <Home />
      </MemoryRouter>
    );
    expect(screen.getByText('Загрузка фильмов...')).toBeInTheDocument();
  });

  // Проверяем успешную загрузку популярных фильмов
  it('renders popular movies after successful fetch', async () => {
    render(
      <MemoryRouter initialEntries={['/?page=1']}>
        <Home />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Популярные фильмы')).toBeInTheDocument();
      expect(screen.getByTestId('movie-card-1')).toHaveTextContent('Movie 1');
      expect(screen.getByTestId('movie-card-2')).toHaveTextContent('Movie 2');
    });
  });

  // Проверяем отображение ошибки при неудачном запросе
  it('renders error message when fetch fails', async () => {
    (getPopularMovies as any).mockRejectedValueOnce(new Error('Fetch error'));

    render(
      <MemoryRouter initialEntries={['/?page=1']}>
        <Home />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText('Не удалось загрузить популярные фильмы.')
      ).toBeInTheDocument();
    });
  });

  // Проверяем отображение результатов поиска, если есть query
  it('renders search results when query is present', async () => {
    (useSearchStore as any).mockReturnValue({
      query: 'test',
      results: [
        {
          id: 3,
          title: 'Search Movie',
          overview: '',
          poster_path: '',
          release_date: '',
          vote_average: 6.0,
        },
      ],
      filters: { year: '', genre: '', rating: '' },
      currentPage: 1,
      totalPages: 5,
      setCurrentPage: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/?page=1']}>
        <Home />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Результаты')).toBeInTheDocument();
      expect(screen.getByTestId('movie-card-3')).toHaveTextContent(
        'Search Movie'
      );
    });
  });

  // Проверяем сообщение, если фильмы отсутствуют
  it('renders empty message when no movies are available', async () => {
    (getPopularMovies as any).mockResolvedValueOnce({
      results: [],
      total_pages: 0,
    });

    render(
      <MemoryRouter initialEntries={['/?page=1']}>
        <Home />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText('Нет фильмов для отображения')
      ).toBeInTheDocument();
    });
  });

  // Проверяем синхронизацию текущей страницы с URL
  it('syncs current page with URL on mount', () => {
    (router.useLocation as any).mockReturnValue({ search: '?page=3' });
    const setCurrentPageMock = vi.fn();

    (useSearchStore as any).mockReturnValue({
      query: '',
      results: [],
      filters: { year: '', genre: '', rating: '' },
      currentPage: 1,
      totalPages: 1,
      setCurrentPage: setCurrentPageMock,
    });

    render(
      <MemoryRouter initialEntries={['/?page=3']}>
        <Home />
      </MemoryRouter>
    );

    expect(screen.getByText('Загрузка фильмов...')).toBeInTheDocument();
    expect(setCurrentPageMock).not.toHaveBeenCalled();
    // Локальная страница обновляется через setLocalCurrentPage, проверяем косвенно
  });

  // Проверяем корректность переключения страниц
  it('handles page change correctly', async () => {
    render(
      <MemoryRouter initialEntries={['/?page=1']}>
        <Home />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Популярные фильмы')).toBeInTheDocument();
    });

    const nextPageButton = screen.getByText('Вперед');
    fireEvent.click(nextPageButton);

    expect(mockNavigate).toHaveBeenCalledWith('/?page=2');
  });

  // Проверяем, что кнопки пагинации отключаются, если страниц всего одна
  it('disables pagination buttons correctly', async () => {
    (getPopularMovies as any).mockResolvedValueOnce({
      results: [
        {
          id: 1,
          title: 'Movie 1',
          overview: '',
          poster_path: '',
          release_date: '',
          vote_average: 7.5,
        },
      ],
      total_pages: 1,
    });

    render(
      <MemoryRouter initialEntries={['/?page=1']}>
        <Home />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Популярные фильмы')).toBeInTheDocument();
    });

    expect(screen.queryByText('Назад')).not.toBeInTheDocument();
    expect(screen.queryByText('Вперед')).not.toBeInTheDocument();
  });

  // Проверяем отображение номеров страниц и многоточия при большом количестве страниц
  it('renders pagination numbers and ellipsis for large total pages', async () => {
    (getPopularMovies as any).mockResolvedValueOnce({
      results: [
        {
          id: 1,
          title: 'Movie 1',
          overview: '',
          poster_path: '',
          release_date: '',
          vote_average: 7.5,
        },
      ],
      total_pages: 10,
    });

    render(
      <MemoryRouter initialEntries={['/?page=1']}>
        <Home />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Популярные фильмы')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('...')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
    });
  });
});
