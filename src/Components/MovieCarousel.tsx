import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import MovieCard from './MovieCard';
import { MovieCarouselProps } from '../Types/Types';

// Компонент карусели фильмов, принимает массив фильмов как пропс
const MovieCarousel: React.FC<MovieCarouselProps> = ({ movies }) => {
  const [index] = useState(0); // Индекс активного элемента
  const carouselRef = useRef<HTMLUListElement>(null); // Ссылка на список карусели

  return (
    <div className="movie-carousel">
      <h2 className="carousel-title">Похожие фильмы</h2>
      {movies.length > 0 ? (
        <>
          {/* Список фильмов с анимацией появления */}
          <motion.ul
            ref={carouselRef}
            className="carousel-list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {movies.map((movie, i) => (
              // Элемент карусели с анимацией сдвига
              <motion.li
                key={movie.id}
                className={`carousel-item ${index === i ? 'active' : ''}`}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <MovieCard movie={movie} /> {/* Карточка фильма */}
              </motion.li>
            ))}
          </motion.ul>
        </>
      ) : (
        <p className="no-movies-text">Похожих фильмов не найдено</p> // Сообщение, если фильмов нет
      )}
    </div>
  );
};

export default MovieCarousel;
