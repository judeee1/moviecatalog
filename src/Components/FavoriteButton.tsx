import { motion } from 'framer-motion';
import { FavoriteButtonProps } from '../Types/Types';
import { useFavoritesStore } from '../Store/useFavoritesStore';

// Компонент кнопки "Избранное", принимает фильм как пропс
const FavoriteButton: React.FC<FavoriteButtonProps> = ({ movie }) => {
  const { isFavorite, addFavorite, removeFavorite } = useFavoritesStore(); // Методы для работы с избранным
  const favorite = isFavorite(movie.id); // Проверяем, добавлен ли фильм в избранное

  // Обработчик клика: добавляет или удаляет фильм из избранного
  const handleToggleFavorite = (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault(); //Предотвращение стандартного поведения
    if (favorite) {
      removeFavorite(movie.id);
    } else {
      addFavorite(movie);
    }
  };

  return (
    <button
      className={`favorite-button ${favorite ? 'favorite-active' : ''}`}
      onClick={handleToggleFavorite}
      aria-label={favorite ? 'Удалить из избранного' : 'Добавить в избранное'}
    >
      {/* Анимированная иконка сердца */}
      <motion.svg
        key={favorite ? 'active' : 'inactive'}
        className="favorite-icon"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        initial={{ fill: 'none', stroke: '#ffffff' }}
        animate={{
          fill: favorite ? 'hsl(358, 100%, 50%)' : 'none',
          stroke: favorite ? 'hsl(358, 100%, 50%)' : '#ffffff',
        }}
        transition={{ duration: 0.3 }}
      >
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </motion.svg>
    </button>
  );
};

export default FavoriteButton;
