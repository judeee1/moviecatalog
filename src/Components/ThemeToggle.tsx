import React from 'react';
import { motion } from 'framer-motion';
import { useThemeStore } from '../Store/useThemeStore';

// Компонент переключения темы
const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle"
      title={`Переключить на ${theme === 'dark' ? 'светлую' : 'темную'} тему`}
    >
      <motion.div
        className="toggle-track"
        initial={false}
        animate={{ backgroundColor: theme === 'dark' ? '#ffffff' : '#333333' }} // Меняем цвет фона
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="toggle-thumb"
          animate={{ x: theme === 'dark' ? 0 : 20 }} // Сдвиг переключателя
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        />
      </motion.div>
    </button>
  );
};

export default ThemeToggle;
