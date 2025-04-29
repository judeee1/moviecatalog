import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MovieFilters from '../Components/MovieFilters';
import { getFilteredMovies } from '../Services/movieService';
import { useSearchStore } from '../Store/useSearchStore';
import * as router from 'react-router-dom';

// Импортируем матчеры для удобных проверок в тестах
import '@testing-library/jest-dom';

// Мокаем сервис для фильтрации фильмов
vi.mock('../Services/movieService', () => ({
  getFilteredMovies: vi.fn(),
}));

// Мокаем хранилище для управления состоянием поиска и фильтров
vi.mock('../Store/useSearchStore', () => ({
  useSearchStore: vi.fn(),
}));

// Мокаем хуки react-router-dom для управления маршрутами
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
    useLocation: vi.fn(),
  };
});

describe('MovieFilters Component', () => {
  const mockNavigate = vi.fn();
  const mockLocation = { search: '' };
  const mockSetResults = vi.fn();
  const mockSetFilters = vi.fn();
  const mockSetCurrentPage = vi.fn();
  const mockSetTotalPages = vi.fn();

  // Подготовка моков перед каждым тестом
  beforeEach(() => {
    // Очищаем моки перед каждым тестом
    vi.clearAllMocks();

    // Мокаем useNavigate и useLocation
    (router.useNavigate as any).mockReturnValue(mockNavigate);
    (router.useLocation as any).mockReturnValue(mockLocation);

    // Мокаем useSearchStore с начальными значениями
    (useSearchStore as any).mockReturnValue({
      filters: { year: '', genre: '', rating: '' },
      currentPage: 1,
      setResults: mockSetResults,
      setFilters: mockSetFilters,
      setCurrentPage: mockSetCurrentPage,
      setTotalPages: mockSetTotalPages,
    });

    // Мокаем getFilteredMovies для успешного ответа
    (getFilteredMovies as any).mockResolvedValue({
      results: [
        { id: 1, title: 'Filtered Movie 1' },
        { id: 2, title: 'Filtered Movie 2' },
      ],
      total_pages: 5,
    });
  });

  // Проверяем начальное отображение компонента
  it('renders filters with toggle button initially', () => {
    render(
      <MemoryRouter>
        <MovieFilters />
      </MemoryRouter>
    );

    expect(screen.getByText('Показать фильтры')).toBeInTheDocument();
    expect(screen.getByLabelText('Жанр:')).toBeInTheDocument();
    expect(screen.getByLabelText('Год выпуска:')).toBeInTheDocument();
    expect(screen.getByLabelText('Минимальный рейтинг:')).toBeInTheDocument();
  });

  // Проверяем переключение видимости формы фильтров
  it('toggles filter form visibility', () => {
    render(
      <MemoryRouter>
        <MovieFilters />
      </MemoryRouter>
    );

    const toggleButton = screen.getByText('Показать фильтры');
    fireEvent.click(toggleButton);

    expect(screen.getByText('Скрыть фильтры')).toBeInTheDocument();

    fireEvent.click(toggleButton);
    expect(screen.getByText('Показать фильтры')).toBeInTheDocument();
  });

  // Проверяем применение фильтров
  it('applies filters and updates search store', async () => {
    render(
      <MemoryRouter>
        <MovieFilters />
      </MemoryRouter>
    );

    // Вводим значения фильтров
    fireEvent.change(screen.getByLabelText('Год выпуска:'), {
      target: { value: '2020' },
    });
    fireEvent.change(screen.getByLabelText('Минимальный рейтинг:'), {
      target: { value: '8' },
    });
    fireEvent.change(screen.getByLabelText('Жанр:'), {
      target: { value: '28' },
    });

    // Применяем фильтры
    fireEvent.click(screen.getByText('Применить фильтры'));

    // Проверяем, что фильтры обновлены в хранилище
    expect(mockSetFilters).toHaveBeenCalledWith({
      year: '2020',
      genre: '28',
      rating: '8',
    });
    expect(mockSetCurrentPage).toHaveBeenCalledWith(1);
    expect(mockNavigate).toHaveBeenCalledWith('/?page=1');

    // Проверяем, что фильтрованные фильмы запрошены
    await waitFor(() => {
      expect(getFilteredMovies).toHaveBeenCalledWith(
        { year: '2020', genre: '28', rating: '8' },
        1
      );
      expect(mockSetResults).toHaveBeenCalledWith([
        { id: 1, title: 'Filtered Movie 1' },
        { id: 2, title: 'Filtered Movie 2' },
      ]);
      expect(mockSetTotalPages).toHaveBeenCalledWith(5);
    });
  });

  // Проверяем сброс фильтров
  it('resets filters and clears search store', () => {
    render(
      <MemoryRouter>
        <MovieFilters />
      </MemoryRouter>
    );

    // Вводим значения фильтров
    fireEvent.change(screen.getByLabelText('Год выпуска:'), {
      target: { value: '2020' },
    });
    fireEvent.change(screen.getByLabelText('Минимальный рейтинг:'), {
      target: { value: '8' },
    });
    fireEvent.change(screen.getByLabelText('Жанр:'), {
      target: { value: '28' },
    });

    // Сбрасываем фильтры
    fireEvent.click(screen.getByText('Сбросить'));

    // Проверяем, что поля фильтров очищены
    expect(screen.getByLabelText('Год выпуска:')).toHaveValue('');
    expect(screen.getByLabelText('Минимальный рейтинг:')).toHaveValue('');
    expect(screen.getByLabelText('Жанр:')).toHaveValue('');

    // Проверяем, что хранилище обновлено
    expect(mockSetFilters).toHaveBeenCalledWith({
      year: '',
      genre: '',
      rating: '',
    });
    expect(mockSetResults).toHaveBeenCalledWith([]);
    expect(mockSetCurrentPage).toHaveBeenCalledWith(1);
    expect(mockNavigate).toHaveBeenCalledWith('/?page=1');
  });

  // Проверяем синхронизацию страницы с URL
  it('syncs current page with URL on mount', () => {
    (router.useLocation as any).mockReturnValue({ search: '?page=3' });

    render(
      <MemoryRouter initialEntries={['/?page=3']}>
        <MovieFilters />
      </MemoryRouter>
    );

    expect(mockSetCurrentPage).toHaveBeenCalledWith(3);
  });

  // Проверяем, что фильтрованные фильмы не запрашиваются, если фильтры пустые
  it('does not fetch filtered movies when filters are empty', () => {
    render(
      <MemoryRouter>
        <MovieFilters />
      </MemoryRouter>
    );

    expect(getFilteredMovies).not.toHaveBeenCalled();
  });

  // Проверяем обработку ошибки при загрузке фильтрованных фильмов
  it('handles error when fetching filtered movies', async () => {
    (getFilteredMovies as any).mockRejectedValueOnce(new Error('Fetch error'));

    // Устанавливаем фильтры в хранилище
    (useSearchStore as any).mockReturnValue({
      filters: { year: '2020', genre: '28', rating: '8' },
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

  // Проверяем валидацию рейтинга при применении фильтров
  it('validates rating input before applying filters', () => {
    render(
      <MemoryRouter>
        <MovieFilters />
      </MemoryRouter>
    );

    // Вводим некорректный рейтинг
    fireEvent.change(screen.getByLabelText('Минимальный рейтинг:'), {
      target: { value: '11' },
    });
    fireEvent.change(screen.getByLabelText('Год выпуска:'), {
      target: { value: '2020' },
    });

    fireEvent.click(screen.getByText('Применить фильтры'));

    // Проверяем, что рейтинг сброшен, так как он вне диапазона
    expect(mockSetFilters).toHaveBeenCalledWith({
      year: '2020',
      genre: '',
      rating: '',
    });
  });
});
