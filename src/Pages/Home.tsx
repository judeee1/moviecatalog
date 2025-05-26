import { useEffect, useState } from "react";
import MovieCard from "../Components/MovieCard";
import { getPopularMovies } from "../Services/movieService";
import { Movie } from "../Types/Types";
import SearchBar from "../Components/SearchBar";
import MovieFilters from "../Components/MovieFilters";
import { useSearchStore } from "../Store/useSearchStore";
import { useLocation, useNavigate } from "react-router-dom";

const Home = () => {
  // Локальное состояние для хранения популярных фильмов
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  // Флаг загрузки — true пока данные загружаются
  const [loading, setLoading] = useState(true);
  // Ошибка при загрузке если произошла
  const [error, setError] = useState<string | null>(null);
  // Текущая страница
  const [currentPage, setLocalCurrentPage] = useState(1);
  // Общее число страниц для популярных фильмов
  const [totalPages, setTotalPages] = useState(1);

  // Из глобального хранилища получаем данные:
  const {
    query, // текущая поисковая строка
    results, // результаты поиска или фильтрации
    filters, // активные фильтры
    currentPage: filterPage, // текущая страница из фильтра/поиска
    totalPages: filterTotalPages, // общее число страниц при поиске/фильтре
    setCurrentPage, // функция для изменения страницы в глобальном хранилище
  } = useSearchStore();

  // Хук для получения параметров из URL
  const location = useLocation();
  // Хук для изменения URL
  const navigate = useNavigate();
  // Ограничение на максимальное количество страниц
  const MAX_PAGES = 300;

  // Эффект: при загрузке страницы или изменении URL читаем параметр ?page
  useEffect(() => {
    const params = new URLSearchParams(location.search); // Извлекаем параметры из URL
    const pageFromUrl = parseInt(params.get("page") || "1", 10); // Парсим номер страницы из параметра page, если нет — 1

    // Если страница валидная обновляем локальное состояние
    if (pageFromUrl >= 1 && pageFromUrl <= MAX_PAGES) {
      setLocalCurrentPage(pageFromUrl);
    }
  }, [location.search, setCurrentPage]); // Срабатывает при изменении URL

  // загружаем популярные фильмы, если не выполняется поиск или фильтрация
  useEffect(() => {
    const fetchPopularMovies = async () => {
      try {
        setLoading(true); // Включаем индикатор загрузки
        // Получаем данные с сервера
        const data = await getPopularMovies(currentPage);
        // Сохраняем список фильмов
        setPopularMovies(data.results);
        // Обновляем количество страниц, но не больше MAX_PAGES
        setTotalPages(Math.min(data.total_pages, MAX_PAGES));
        setLoading(false); // Выключаем индикатор загрузки
      } catch {
        // Если ошибка — сохраняем сообщение об ошибке
        setError("Не удалось загрузить популярные фильмы.");
        setLoading(false);
      }
    };

    // Загружаем популярные фильмы, только если неактивен поиск и фильтры
    if (!query.trim() && !filters.year && !filters.genre && !filters.rating) {
      fetchPopularMovies();
    } else {
      setLoading(false); // Если активен поиск или фильтр — не загружаем популярные
    }
  }, [currentPage, query, filters]); // Зависимости — при их изменении эффект перезапускается

  // Обработчик смены страницы при клике на пагинацию
  const handlePageChange = (page: number) => {
    // Определяем, какие данные используются: фильтрованные или популярные
    const activeTotalPages = results.length > 0 ? filterTotalPages : totalPages;
    const activeCurrentPage = results.length > 0 ? filterPage : currentPage;

    // Переход на новую страницу, если номер корректный и он отличается от текущего
    if (page >= 1 && page <= activeTotalPages && page !== activeCurrentPage) {
      setLocalCurrentPage(page); // Обновляем локальную страницу
      navigate(`/?page=${page}`); // Обновляем URL
      window.scrollTo({ top: 0, behavior: "smooth" }); // Плавно прокручиваем вверх
    }
  };

  // Выбираем, какие фильмы показывать: отфильтрованные или популярные
  const movies = results.length > 0 ? results : popularMovies;

  // Флаг активности поиска или фильтрации
  const isSearchOrFilterActive =
    query.trim() || filters.year || filters.genre || filters.rating;

  // Вычисляем значения текущей и общей страницы
  const displayTotalPages = results.length > 0 ? filterTotalPages : totalPages;
  const displayCurrentPage = results.length > 0 ? filterPage : currentPage;

  return (
    <div className="home-container">
      {/* Заголовок страницы — зависит от активности поиска/фильтрации */}
      <h1 className="home-title">
        {isSearchOrFilterActive ? "Результаты" : "Популярные фильмы"}
      </h1>

      <SearchBar />

      <MovieFilters />

      {/* Статус: загрузка */}
      {loading && (
        <div className="status-message">
          <p className="loading-text">Загрузка фильмов...</p>
        </div>
      )}

      {/* Статус: ошибка */}
      {!loading && error && (
        <div className="status-message">
          <p className="error-text">{error}</p>
        </div>
      )}

      {/* Статус: нет результатов */}
      {!loading && !error && movies.length === 0 && (
        <div className="status-message">
          <p className="empty-text">
            {isSearchOrFilterActive
              ? "Фильмы не найдены" // если активен поиск или фильтр
              : "Нет фильмов для отображения"}{" "}
            // иначе
          </p>
        </div>
      )}

      {/* Основной контент: список фильмов и пагинация */}
      {!loading && !error && movies.length > 0 && (
        <>
          {/* Сетка с карточками фильмов */}
          <div className="movies-grid">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>

          {/* Пагинация — только если есть больше одной страницы */}
          {displayTotalPages > 1 && (
            <div className="pagination">
              {/* Кнопка "назад" */}
              <button
                className="pagination-button"
                onClick={() => handlePageChange(displayCurrentPage - 1)}
                disabled={displayCurrentPage === 1} // неактивна на первой странице
              >
                Назад
              </button>

              {/* Номера страниц */}
              <div className="pagination-numbers">
                {Array.from(
                  { length: Math.min(5, displayTotalPages) }, // максимум 5 страниц отображаем
                  (_, i) => {
                    const page = displayCurrentPage - 2 + i; // вычисляем номер страницы
                    if (page > 0 && page <= displayTotalPages) {
                      return (
                        <button
                          key={page}
                          className={`pagination-number ${
                            page === displayCurrentPage ? "active" : ""
                          }`}
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </button>
                      );
                    }
                    return null;
                  }
                )}

                {/* Многоточие и последняя страница (если далеко от текущей) */}
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

              {/* Кнопка "вперед" */}
              <button
                className="pagination-button"
                onClick={() => handlePageChange(displayCurrentPage + 1)}
                disabled={displayCurrentPage === displayTotalPages} // неактивна на последней
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

// Экспорт компонента
export default Home;
