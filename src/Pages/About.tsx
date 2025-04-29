import { motion } from 'framer-motion';
import reactLogo from '../assets/react.svg';

const About = () => {
  return (
    <div className="about">
      <motion.img
        src={reactLogo}
        alt="React Logo"
        className="react-logo"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 5, ease: 'linear' }}
      />
      <h1>О проекте</h1>
      <p>Сделано с ❤️ Андреем и Никитой.</p>
      <p>Проект сделан на React + TypeScript + Vite + TMDB API.</p>
    </div>
  );
};

export default About;
