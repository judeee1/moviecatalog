import { useEffect, useState } from "react"; // Импорт хуков React для состояния и эффектов
import { useSearchStore } from "../Store/useSearchStore"; // Импорт хранилища Zustand для поиска
import { getFilteredMovies } from "../Services/movieService"; // Импорт функции для фильтрации фильмов
import { useNavigate, useLocation } from "react-router-dom"; // Импорт хуков для навигации и URL

// Компонент фильтров для фильмов
const MovieFilters: React.FC = () => {
  // Локальное состояние для фильтров и видимости формы
  const [genre, setGenre] = useState<string>(""); // Жанр
  const [year, setYear] = useState<string>(""); // Год выпуска
  const [rating, setRating] = useState<string>(""); // Минимальный рейтинг
  const [isFiltersVisible, setIsFiltersVisible] = useState<boolean>(false); // Видимость формы
  // Извлечение методов и состояния из хранилища
  const {
    setResults,
    setFilters,
    filters,
    currentPage,
    setCurrentPage,
    setTotalPages,
  } = useSearchStore();
  const navigate = useNavigate(); // Хук для изменения URL
  const location = useLocation(); // Хук для чтения текущего URL
  const MAX_PAGES = 300; // Максимальное количество страниц

  // Список жанров для выпадающего меню
  const genres = [
    { id: "", name: "Все жанры" },
    { id: "28", name: "Экшен" },
    { id: "12", name: "Приключения" },
    { id: "35", name: "Комедия" },
    { id: "18", name: "Драма" },
    { id: "27", name: "Ужасы" },
    { id: "10749", name: "Романтика" },
    { id: "878", name: "Фантастика" },
  ];

  // Эффект для синхронизации страницы с URL
  useEffect(() => {
    const params = new URLSearchParams(location.search); // Извлечение параметров URL
    const pageFromUrl = parseInt(params.get("page") || "1", 10); // Страница из URL
    if (
      pageFromUrl >= 1 &&
      pageFromUrl <= MAX_PAGES &&
      pageFromUrl !== currentPage
    ) {
      setCurrentPage(pageFromUrl); // Обновление текущей страницы
    }
  }, [location.search, currentPage, setCurrentPage]);

  // Эффект для загрузки отфильтрованных фильмов
  useEffect(() => {
    const fetchFilteredMovies = async () => {
      // Выходим, если нет активных фильтров
      if (!filters.year && !filters.genre && !filters.rating) return;
      try {
        // Запрос отфильтрованных фильмов
        const data = await getFilteredMovies(filters, currentPage);
        setResults(data.results); // Сохраняем результаты в хранилище
        setTotalPages(Math.min(data.total_pages, MAX_PAGES)); // Ограничиваем страницы
      } catch (error) {
        console.error("Ошибка при фильтрации фильмов:", error); // Логируем ошибку
        setResults([]); // Очищаем результаты при ошибке
      }
    };
    fetchFilteredMovies();
  }, [filters, currentPage, setResults, setTotalPages]);

  // Обработчик применения фильтров
  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault(); // Предотвращаем отправку формы
    // Проверяем валидность рейтинга (0–10)
    const parsedRating =
      rating && parseFloat(rating) >= 0 && parseFloat(rating) <= 10
        ? rating
        : "";
    setFilters({ year, genre, rating: parsedRating }); // Обновляем фильтры
    setCurrentPage(1); // Сбрасываем страницу
    navigate(`/?page=1`); // Обновляем URL
  };

  // Обработчик сброса фильтров
  const resetFilters = () => {
    setGenre(""); // Сбрасываем жанр
    setYear(""); // Сбрасываем год
    setRating(""); // Сбрасываем рейтинг
    setFilters({ year: "", genre: "", rating: "" }); // Очищаем фильтры в хранилище
    setResults([]); // Очищаем результаты
    setCurrentPage(1); // Сбрасываем страницу
    navigate(`/?page=1`); // Обновляем URL
  };

  // Обработчик переключения видимости формы
  const toggleFilters = () => {
    setIsFiltersVisible((prev) => !prev); // Переключаем видимость
  };

  return (
    // Контейнер для фильтров
    <div className="movie-filters-container">
      {/* Кнопка для показа/скрытия формы */}
      <button onClick={toggleFilters} className="toggle-filters-button">
        {isFiltersVisible ? "Скрыть фильтры" : "Показать фильтры"}
      </button>

      {/* Форма фильтров, видимость зависит от isFiltersVisible */}
      <form
        onSubmit={handleFilter}
        className={`movie-filters ${isFiltersVisible ? "visible" : ""}`}
      >
        {/* Поле выбора жанра */}
        <div className="filter-group">
          <label htmlFor="genre">Жанр:</label>
          <select
            id="genre"
            value={genre}
            onChange={(e) => setGenre(e.target.value)} // Обновляем жанр
          >
            {genres.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>

        {/* Поле ввода года */}
        <div className="filter-group">
          <label htmlFor="year">Год выпуска:</label>
          <input
            id="year"
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)} // Обновляем год
            placeholder="Например, 2023"
            min="1900"
            max={new Date().getFullYear()} // Ограничиваем текущим годом
          />
        </div>

        {/* Поле ввода рейтинга */}
        <div className="filter-group">
          <label htmlFor="rating">Минимальный рейтинг:</label>
          <input
            id="rating"
            type="number"
            value={rating}
            onChange={(e) => setRating(e.target.value)} // Обновляем рейтинг
            placeholder="От 0 до 10"
            min="0"
            max="10"
            step="0.1" // Шаг 0.1 для дробных значений
          />
        </div>

        {/* Кнопки управления */}
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

// Экспорт компонента
export default MovieFilters;
