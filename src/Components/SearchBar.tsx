import { useState, useEffect } from "react"; // Импорт хуков React для состояния и эффектов
import { motion, AnimatePresence } from "framer-motion"; // Импорт компонентов для анимаций
import { searchMovies } from "../Services/movieService"; // Импорт функции поиска фильмов
import { useSearchStore } from "../Store/useSearchStore"; // Импорт хранилища Zustand для поиска

// Компонент строки поиска
const SearchBar: React.FC = () => {
  // Извлекаем данные и методы из хранилища Zustand
  const { query, setQuery, setResults, clearSearch } = useSearchStore();
  // Локальное состояние для загрузки и ошибок
  const [loading, setLoading] = useState<boolean>(false); // Флаг загрузки
  const [error, setError] = useState<string | null>(null); // Сообщение об ошибке

  // Эффект для выполнения поиска с задержкой (debounce)
  useEffect(() => {
    // Функция для получения результатов поиска
    const fetchSearchResults = async () => {
      if (!query.trim()) {
        // Если запрос пустой, очищаем результаты и сбрасываем состояние
        setResults([]);
        setLoading(false);
        setError(null);
        return;
      }

      setLoading(true); // Включаем индикатор загрузки
      setError(null); // Сбрасываем ошибку

      try {
        // Выполняем поиск через API
        const data = await searchMovies(query);
        setResults(data.results || []); // Сохраняем результаты поиска в хранилище
      } catch (err) {
        // Обрабатываем ошибку поиска
        setError("Не удалось выполнить поиск.");
        setResults([]);
      } finally {
        setLoading(false); // Выключаем индикатор загрузки
      }
    };

    // Задержка 300 мс для предотвращения частых запросов
    const debounce = setTimeout(() => {
      fetchSearchResults();
    }, 300);

    // Очистка таймера при изменении query
    return () => clearTimeout(debounce);
  }, [query, setResults]); // Зависимости эффекта

  // Обработчик очистки поиска
  const handleClear = () => {
    clearSearch(); // Сбрасываем поиск в хранилище
  };

  return (
    // Контейнер для формы поиска
    <div className="search-container">
      {/* Форма поиска, предотвращаем отправку */}
      <form className="search-form" onSubmit={(e) => e.preventDefault()}>
        {/* Обёртка для поля ввода и кнопки очистки */}
        <div className="search-input-wrapper">
          {/* Анимированное поле ввода */}
          <motion.input
            type="text"
            value={query} // Значение из хранилища
            onChange={(e) => setQuery(e.target.value)} // Обновляем запрос
            placeholder="Введите название фильма..." // Подсказка
            className="search-input"
            initial={{ opacity: 0, y: -20 }} // Начальная анимация
            animate={{ opacity: 1, y: 0 }} // Конечная анимация
            transition={{ duration: 0.5 }} // Длительность анимации
          />
          {/* Анимированная кнопка очистки, показывается при наличии запроса */}
          <AnimatePresence>
            {query && (
              <motion.button
                type="button"
                onClick={handleClear} // Очищаем поиск
                className="clear-button"
                title="Очистить поиск"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ duration: 0.2 }}
              >
                ✕
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </form>

      {/* Анимированные сообщения о загрузке и ошибке */}
      <AnimatePresence>
        {loading && (
          <motion.p
            className="loading-text"
            initial={{ opacity: 0 }} // Начальная анимация
            animate={{ opacity: 1 }} // Конечная анимация
            exit={{ opacity: 0 }} // Анимация исчезновения
            transition={{ duration: 0.3 }} // Длительность анимации
          >
            Загрузка...
          </motion.p>
        )}
        {error && (
          <motion.p
            className="error-text"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;
