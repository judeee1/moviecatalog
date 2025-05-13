import { useEffect, useState } from "react";
import MovieCard from "../Components/MovieCard";
import { getPopularMovies } from "../Services/movieService";
import { Movie } from "../Types/Types";
import SearchBar from "../Components/SearchBar";
import MovieFilters from "../Components/MovieFilters";
import { useSearchStore } from "../Store/useSearchStore";
import { useLocation, useNavigate } from "react-router-dom";

// Главная страница, где отображаются фильмы
const Home = () => {
  // Состояния для популярных фильмов, загрузки, ошибок и страниц
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setLocalCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Из zustand-хранилища берем данные поиска, фильтров и страниц
  const {
    query,
    results,
    filters,
    currentPage: filterPage,
    totalPages: filterTotalPages,
    setCurrentPage,
  } = useSearchStore();

  const location = useLocation(); // для получения параметров из URL
  const navigate = useNavigate(); // для переходов по страницам
  const MAX_PAGES = 300;

  // Считываем номер страницы из URL при монтировании или смене URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const pageFromUrl = parseInt(params.get("page") || "1", 10);

    if (pageFromUrl >= 1 && pageFromUrl <= MAX_PAGES) {
      setLocalCurrentPage(pageFromUrl); // сохраняем локально текущую страницу
    }
  }, [location.search, setCurrentPage]);

  // Загружаем популярные фильмы с сервера, если нет активного поиска/фильтров
  useEffect(() => {
    const fetchPopularMovies = async () => {
      try {
        setLoading(true);
        const data = await getPopularMovies(currentPage);
        setPopularMovies(data.results); // сохраняем фильмы
        setTotalPages(Math.min(data.total_pages, MAX_PAGES)); // ограничиваем максимальное число страниц
        setLoading(false);
      } catch {
        setError("Не удалось загрузить популярные фильмы.");
        setLoading(false);
      }
    };

    // Загружаем только если поиск и фильтры не активны
    if (!query.trim() && !filters.year && !filters.genre && !filters.rating) {
      fetchPopularMovies();
    } else {
      setLoading(false);
    }
  }, [currentPage, query, filters]);

  // Смена страницы по клику на пагинацию
  const handlePageChange = (page: number) => {
    const activeTotalPages = results.length > 0 ? filterTotalPages : totalPages;
    const activeCurrentPage = results.length > 0 ? filterPage : currentPage;

    if (page >= 1 && page <= activeTotalPages && page !== activeCurrentPage) {
      setLocalCurrentPage(page);
      navigate(`/?page=${page}`); // обновляем URL
      window.scrollTo({ top: 0, behavior: "smooth" }); // плавно скроллим вверх
    }
  };

  // Выбираем, какие фильмы отображать: результаты поиска или популярные
  const movies = results.length > 0 ? results : popularMovies;
  const isSearchOrFilterActive =
    query.trim() || filters.year || filters.genre || filters.rating;

  // Отображаемые значения для пагинации (зависят от поиска)
  const displayTotalPages = results.length > 0 ? filterTotalPages : totalPages;
  const displayCurrentPage = results.length > 0 ? filterPage : currentPage;

  return (
    <div className="home-container">
      {/* Заголовок зависит от состояния поиска */}
      <h1 className="home-title">
        {isSearchOrFilterActive ? "Результаты" : "Популярные фильмы"}
      </h1>

      <SearchBar />
      <MovieFilters />

      {/* Состояния загрузки, ошибки и пустого результата */}
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
              ? "Фильмы не найдены"
              : "Нет фильмов для отображения"}
          </p>
        </div>
      )}

      {/* Отображение списка фильмов и пагинации */}
      {!loading && !error && movies.length > 0 && (
        <>
          <div className="movies-grid">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} /> // Отдельная карточка фильма
            ))}
          </div>

          {/* Пагинация — если есть больше одной страницы */}
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
                {/* Показ 5 страниц рядом с текущей */}
                {Array.from(
                  { length: Math.min(5, displayTotalPages) },
                  (_, i) => {
                    const page = displayCurrentPage - 2 + i;
                    if (page > 0 && page <= displayTotalPages) {
                      return (
                        <button
                          key={page}
                          className={`pagination-number ${page === displayCurrentPage ? "active" : ""}`}
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </button>
                      );
                    }
                    return null;
                  }
                )}

                {/* Многоточие и кнопка последней страницы */}
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
