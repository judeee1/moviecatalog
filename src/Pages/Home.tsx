import { useEffect, useState } from 'react';
import MovieCard from '../Components/MovieCard';
import { getPopularMovies } from '../Services/movieService';
import { Movie } from '../Types/Types';
import SearchBar from '../Components/SearchBar';
import MovieFilters from '../Components/MovieFilters';
import { useSearchStore } from '../Store/useSearchStore';
import { useLocation, useNavigate } from 'react-router-dom';

// Главная страница с фильмами
const Home = () => {
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setLocalCurrentPage] = useState(1); // Локальная текущая страница
  const [totalPages, setTotalPages] = useState(1);
  const {
    query,
    results,
    filters,
    currentPage: filterPage,
    totalPages: filterTotalPages,
    setCurrentPage,
  } = useSearchStore();
  const location = useLocation();
  const navigate = useNavigate();
  const MAX_PAGES = 300;

  // Синхронизация страницы из URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const pageFromUrl = parseInt(params.get('page') || '1', 10);
    if (pageFromUrl >= 1 && pageFromUrl <= MAX_PAGES) {
      setLocalCurrentPage(pageFromUrl);
    }
  }, [location.search, setCurrentPage]);

  // Загрузка популярных фильмов
  useEffect(() => {
    const fetchPopularMovies = async () => {
      try {
        setLoading(true);
        const data = await getPopularMovies(currentPage);
        setPopularMovies(data.results);
        setTotalPages(Math.min(data.total_pages, MAX_PAGES));
        setLoading(false);
      } catch (err) {
        setError('Не удалось загрузить популярные фильмы.');
        setLoading(false);
      }
    };

    if (!query.trim() && !filters.year && !filters.genre && !filters.rating) {
      fetchPopularMovies(); // Загружаем, если нет поиска или фильтров
    } else {
      setLoading(false);
    }
  }, [currentPage, query, filters]);

  // Переключение страниц
  const handlePageChange = (page: number) => {
    const activeTotalPages = results.length > 0 ? filterTotalPages : totalPages;
    const activeCurrentPage = results.length > 0 ? filterPage : currentPage;

    console.log('Page change:', { page, activeCurrentPage, activeTotalPages });

    if (page >= 1 && page <= activeTotalPages && page !== activeCurrentPage) {
      setLocalCurrentPage(page);
      navigate(`/?page=${page}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const movies = results.length > 0 ? results : popularMovies;
  const isSearchOrFilterActive =
    query.trim() !== '' || filters.year || filters.genre || filters.rating;
  const displayTotalPages = results.length > 0 ? filterTotalPages : totalPages;
  const displayCurrentPage = results.length > 0 ? filterPage : currentPage;

  return (
    <div className="home-container">
      <h1 className="home-title">
        {isSearchOrFilterActive ? 'Результаты' : 'Популярные фильмы'}
      </h1>
      <SearchBar />
      <MovieFilters />

      {loading && (
        <div className="status-message">
          <p className="loading-text">Загрузка фильмов...</p>
        </div>
      )}

      {!loading && error && (
        <div className="status-message">
          <p className="error-text">{error}</p>
        </div>
      )}

      {!loading && !error && movies.length === 0 && (
        <div className="status-message">
          <p className="empty-text">
            {isSearchOrFilterActive
              ? 'Фильмы не найдены'
              : 'Нет фильмов для отображения'}
          </p>
        </div>
      )}

      {!loading && !error && movies.length > 0 && (
        <>
          <div className="movies-grid">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} /> // Карточка фильма
            ))}
          </div>

          {displayTotalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-button"
                onClick={() => handlePageChange(displayCurrentPage - 1)}
                disabled={displayCurrentPage === 1}
              >
                Назад
              </button>

              <div className="pagination-numbers">
                {Array.from(
                  { length: Math.min(5, displayTotalPages) },
                  (_, i) => {
                    const page = displayCurrentPage - 2 + i;
                    if (page > 0 && page <= displayTotalPages) {
                      return (
                        <button
                          key={page}
                          className={`pagination-number ${page === displayCurrentPage ? 'active' : ''}`}
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </button>
                      );
                    }
                    return null;
                  }
                )}
                {displayTotalPages > 5 &&
                  displayCurrentPage < displayTotalPages - 2 && (
                    <span className="pagination-ellipsis">...</span>
                  )}
                {displayTotalPages > 5 &&
                  displayCurrentPage < displayTotalPages - 1 && (
                    <button
                      className="pagination-number"
                      onClick={() => handlePageChange(displayTotalPages)}
                    >
                      {displayTotalPages}
                    </button>
                  )}
              </div>

              <button
                className="pagination-button"
                onClick={() => handlePageChange(displayCurrentPage + 1)}
                disabled={displayCurrentPage === displayTotalPages}
              >
                Вперед
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Home;
