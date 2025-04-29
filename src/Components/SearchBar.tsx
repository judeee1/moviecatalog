import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { searchMovies } from '../Services/movieService';
import { useSearchStore } from '../Store/useSearchStore';

// Компонент строки поиска
const SearchBar: React.FC = () => {
  const { query, setQuery, setResults, clearSearch } = useSearchStore();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Выполняем поиск с задержкой
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query.trim()) {
        setResults([]);
        setLoading(false);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await searchMovies(query);
        setResults(data.results || []); // Сохраняем результаты поиска
      } catch (err) {
        setError('Не удалось выполнить поиск.');
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(() => {
      fetchSearchResults();
    }, 300);

    return () => clearTimeout(debounce);
  }, [query, setResults]);

  const handleClear = () => {
    clearSearch(); // Очищаем поиск
  };

  return (
    <div className="search-container">
      <form className="search-form" onSubmit={(e) => e.preventDefault()}>
        <div className="search-input-wrapper">
          <motion.input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Введите название фильма..."
            className="search-input"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          />
          <AnimatePresence>
            {query && (
              <motion.button
                type="button"
                onClick={handleClear}
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

      <AnimatePresence>
        {loading && (
          <motion.p
            className="loading-text"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
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
