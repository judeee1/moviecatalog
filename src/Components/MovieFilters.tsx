import { useEffect, useState } from "react";
import { useSearchStore } from "../Store/useSearchStore";
import { getFilteredMovies } from "../Services/movieService";
import { useNavigate, useLocation } from "react-router-dom";

const MovieFilters: React.FC = () => {
  // Локальные состояния для каждого фильтра
  const [genre, setGenre] = useState<string>(""); // Выбранный жанр
  const [year, setYear] = useState<string>(""); // Выбранный год
  const [rating, setRating] = useState<string>(""); // Минимальный рейтинг
  const [isFiltersVisible, setIsFiltersVisible] = useState<boolean>(false); // Управление видимостью формы

  // Извлекаем данные и функции из хранилища Zustand
  const {
    setResults, // Функция для сохранения полученных фильмов
    setFilters, // Установка текущих фильтров
    filters, // Текущие фильтры
    currentPage, // Текущая страница
    setCurrentPage, // Установка текущей страницы
    setTotalPages, // Установка общего количества страниц
  } = useSearchStore();

  const navigate = useNavigate(); // Для изменения URL
  const location = useLocation(); // Получение текущего URL
  const MAX_PAGES = 300; // Максимальное количество страниц

  // Жанры, доступные для выбора в выпадающем списке
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

  // Эффект: следит за параметром page в URL и синхронизирует его с текущей страницей в Zustand
  useEffect(() => {
    const params = new URLSearchParams(location.search); // Получаем параметры URL
    const pageFromUrl = parseInt(params.get("page") || "1", 10); // Извлекаем значение страницы

    // Если страница из URL корректна и отличается от текущей, обновляем состояние
    if (
      pageFromUrl >= 1 &&
      pageFromUrl <= MAX_PAGES &&
      pageFromUrl !== currentPage
    ) {
      setCurrentPage(pageFromUrl);
    }
  }, [location.search, currentPage, setCurrentPage]);

  // Эффект: при изменении фильтров или текущей страницы загружаем новые фильмы
  useEffect(() => {
    const fetchFilteredMovies = async () => {
      // Если фильтры не заданы — не делаем запрос
      if (!filters.year && !filters.genre && !filters.rating) return;

      try {
        const data = await getFilteredMovies(filters, currentPage); // Загружаем фильмы по фильтрам
        setResults(data.results); // Сохраняем полученные фильмы
        setTotalPages(Math.min(data.total_pages, MAX_PAGES)); // Устанавливаем общее количество страниц (не более MAX_PAGES)
      } catch (error) {
        console.error("Ошибка при фильтрации фильмов:", error); // Вывод ошибки в консоль
        setResults([]); // Сброс результатов в случае ошибки
      }
    };

    fetchFilteredMovies(); // Вызываем загрузку фильмов
  }, [filters, currentPage, setResults, setTotalPages]);

  // Обработчик применения фильтров (при отправке формы)
  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault(); // Предотвращаем перезагрузку страницы

    // Проверка корректности рейтинга (от 0 до 10)
    const parsedRating =
      rating && parseFloat(rating) >= 0 && parseFloat(rating) <= 10
        ? rating
        : "";

    // Устанавливаем фильтры в Zustand
    setFilters({ year, genre, rating: parsedRating });
    setCurrentPage(1); // Сбрасываем страницу на первую
    navigate(`/?page=1`); // Обновляем URL
  };

  // Обработчик сброса всех фильтров
  const resetFilters = () => {
    setGenre("");
    setYear("");
    setRating("");
    setFilters({ year: "", genre: "", rating: "" }); // Очищаем фильтры
    setResults([]); // Сброс результатов
    setCurrentPage(1); // Сбрасываем страницу
    navigate(`/?page=1`); // Обновляем URL
  };

  // Переключение видимости формы фильтров
  const toggleFilters = () => {
    setIsFiltersVisible((prev) => !prev); // Инвертируем флаг
  };

  // Возвращаем JSX
  return (
    <div className="movie-filters-container">
      {/* Кнопка для показа/скрытия формы фильтров */}
      <button onClick={toggleFilters} className="toggle-filters-button">
        {isFiltersVisible ? "Скрыть фильтры" : "Показать фильтры"}
      </button>

      {/* Форма фильтров — отображается, если isFiltersVisible === true */}
      <form
        onSubmit={handleFilter}
        className={`movie-filters ${isFiltersVisible ? "visible" : ""}`}
      >
        {/* Фильтр по жанру */}
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

        {/* Фильтр по году выпуска */}
        <div className="filter-group">
          <label htmlFor="year">Год выпуска:</label>
          <input
            id="year"
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="Например, 2023"
            min="1900"
            max={new Date().getFullYear()} // Ограничение до текущего года
          />
        </div>

        {/* Фильтр по рейтингу */}
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
            step="0.1" // Можно вводить десятичные значения
          />
        </div>

        {/* Кнопки управления фильтрами */}
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
