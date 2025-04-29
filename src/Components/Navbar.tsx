import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import logo from '../Assets/logo.png';
import { useSearchStore } from '../Store/useSearchStore';
import ThemeToggle from '../Components/ThemeToggle';

// Компонент навигационной панели
const Navbar = () => {
  const { clearSearch } = useSearchStore();
  const navigate = useNavigate();

  // Обработчик клика по логотипу
  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    clearSearch(); // Очищаем поиск
    navigate('/?page=1'); // Переходим на первую страницу
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <NavLink to="/" className="navbar-logo" onClick={handleLogoClick}>
          <img
            src={logo}
            alt="Логотип КиноКаталога"
            className="navbar-logo-icon"
            style={{ width: '40px', height: '40px' }}
          />
          <span className="navbar-logo-text">КиноКаталог</span>
        </NavLink>
        <ul className="navbar-menu">
          <li>
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? 'nav-link-active' : 'nav-link'
              }
            >
              Главная
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/favorites"
              className={({ isActive }) =>
                isActive ? 'nav-link-active' : 'nav-link'
              }
            >
              Избранное
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                isActive ? 'nav-link-active' : 'nav-link'
              }
            >
              О проекте
            </NavLink>
          </li>
        </ul>
        <ThemeToggle /> {/* Переключатель темы */}
      </div>
      <Outlet /> {/* Рендеринг дочерних маршрутов */}
    </nav>
  );
};

export default Navbar;
