import { useEffect, useState } from 'react';
import { useSearchStore } from '../Store/useSearchStore';
import { getFilteredMovies } from '../Services/movieService';
import { useNavigate, useLocation } from 'react-router-dom';

// Компонент фильтров для фильмов
const MovieFilters: React.FC = () => {
  const [genre, setGenre] = useState<string>(''); // Жанр
  const [year, setYear] = useState<string>(''); // Год выпуска
  const [rating, setRating] = useState<string>(''); // Минимальный рейтинг
  const [isFiltersVisible, setIsFiltersVisible] = useState<boolean>(false); // Видимость формы
  const {
    setResults,
    setFilters,
    filters,
    currentPage,
    setCurrentPage,
    setTotalPages,
  } = useSearchStore();
  const navigate = useNavigate();
  const location = useLocation();
  const MAX_PAGES = 300;

  const genres = [
    { id: '', name: 'Все жанры' },
    { id: '28', name: 'Экшен' },
    { id: '12', name: 'Приключения' },
    { id: '35', name: 'Комедия' },
    { id: '18', name: 'Драма' },
    { id: '27', name: 'Ужасы' },
    { id: '10749', name: 'Романтика' },
    { id: '878', name: 'Фантастика' },
  ];

  // Синхронизация страницы из URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const pageFromUrl = parseInt(params.get('page') || '1', 10);
    if (
      pageFromUrl >= 1 &&
      pageFromUrl <= MAX_PAGES &&
      pageFromUrl !== currentPage
    ) {
      setCurrentPage(pageFromUrl);
    }
  }, [location.search, currentPage, setCurrentPage]);

  // Загрузка отфильтрованных фильмов
  useEffect(() => {
    const fetchFilteredMovies = async () => {
      if (!filters.year && !filters.genre && !filters.rating) return;
      try {
        const data = await getFilteredMovies(filters, currentPage);
        setResults(data.results); // Сохраняем результаты
        setTotalPages(Math.min(data.total_pages, MAX_PAGES)); // Устанавливаем общее количество страниц
      } catch (error) {
        console.error('Ошибка при фильтрации фильмов:', error);
        setResults([]);
      }
    };
    fetchFilteredMovies();
  }, [filters, currentPage, setResults, setTotalPages]);

  // Применение фильтров
  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedRating =
      rating && parseFloat(rating) >= 0 && parseFloat(rating) <= 10
        ? rating
        : '';
    setFilters({ year, genre, rating: parsedRating });
    setCurrentPage(1);
    navigate(`/?page=1`);
  };

  // Сброс фильтров
  const resetFilters = () => {
    setGenre('');
    setYear('');
    setRating('');
    setFilters({ year: '', genre: '', rating: '' });
    setResults([]);
    setCurrentPage(1);
    navigate(`/?page=1`);
  };

  const toggleFilters = () => {
    setIsFiltersVisible((prev) => !prev); // Переключение видимости формы
  };

  return (
    <div className="movie-filters-container">
      <button onClick={toggleFilters} className="toggle-filters-button">
        {isFiltersVisible ? 'Скрыть фильтры' : 'Показать фильтры'}
      </button>

      <form
        onSubmit={handleFilter}
        className={`movie-filters ${isFiltersVisible ? 'visible' : ''}`}
      >
        <div className="filter-group">
          <label htmlFor="genre">Жанр:</label>
          <select
            id="genre"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
          >
            {genres.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="year">Год выпуска:</label>
          <input
            id="year"
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="Например, 2023"
            min="1900"
            max={new Date().getFullYear()}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="rating">Минимальный рейтинг:</label>
          <input
            id="rating"
            type="number"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            placeholder="От 0 до 10"
            min="0"
            max="10"
            step="0.1"
          />
        </div>

        <div className="filter-buttons">
          <button type="submit" className="filter-button">
            Применить фильтры
          </button>
          <button type="button" onClick={resetFilters} className="reset-button">
            Сбросить
          </button>
        </div>
      </form>
    </div>
  );
};

export default MovieFilters;
