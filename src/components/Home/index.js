import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaEdit, FaSearch, FaFilter, FaHeart, FaRegHeart, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './styles.css';

const DeleteButton = ({ onClick }) => (
  <motion.div
    onClick={onClick}
    className="delete-button"
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
  >
    <FaTimes />
  </motion.div>
);

const FavoriteButton = ({ isFavorite, onClick }) => (
  <motion.div
    onClick={onClick}
    className="favorite-button"
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
  >
    {isFavorite ? <FaHeart /> : <FaRegHeart />}
  </motion.div>
);

const MovieCard = ({ movie, onDelete, onToggleFavorite }) => (
  <motion.div
    className="movie-card"
    whileHover={{ scale: 1.02, y: -5 }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
  >
    <div className="movie-image">
      <img src={movie.imagem || 'https://via.placeholder.com/300x450'} alt={movie.titulo} />
      <DeleteButton onClick={() => onDelete(movie.id)} />
      <FavoriteButton 
        isFavorite={movie.favorito} 
        onClick={() => onToggleFavorite(movie.id)} 
      />
    </div>
    <div className="movie-info">
      <h3>{movie.titulo}</h3>
      <p className="movie-year">{movie.ano || 'Ano não especificado'}</p>
      <div className="movie-actions">
        <Link to={`/edit/${movie.id}`} className="edit-link">
          <motion.button
            className="edit-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaEdit /> Editar
          </motion.button>
        </Link>
      </div>
    </div>
  </motion.div>
);

const Home = () => {
  const [movies, setMovies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [sortBy, setSortBy] = useState('title');
  const [showFavorites, setShowFavorites] = useState(false);

  useEffect(() => {
    const savedMovies = JSON.parse(localStorage.getItem('movies') || '[]');
    setMovies(savedMovies);
  }, []);

  const handleDelete = (movieId) => {
    if (window.confirm('Tem certeza que deseja excluir este filme?')) {
      const updatedMovies = movies.filter(movie => movie.id !== movieId);
      setMovies(updatedMovies);
      localStorage.setItem('movies', JSON.stringify(updatedMovies));
      toast.success('Filme excluído com sucesso!');
    }
  };

  const handleToggleFavorite = (movieId) => {
    const updatedMovies = movies.map(movie => 
      movie.id === movieId ? { ...movie, favorito: !movie.favorito } : movie
    );
    setMovies(updatedMovies);
    localStorage.setItem('movies', JSON.stringify(updatedMovies));
    toast.success('Favorito atualizado!');
  };

  const filteredMovies = movies
    .filter(movie => {
      const matchesSearch = movie.titulo.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesYear = filterYear === '' || String(movie.ano) === filterYear;
      const matchesFavorites = !showFavorites || movie.favorito;
      return matchesSearch && matchesYear && matchesFavorites;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.titulo.localeCompare(b.titulo);
        case 'year':
          return (b.ano || 0) - (a.ano || 0);
        default:
          return 0;
      }
    });

  const years = [...new Set(movies.map(movie => movie.ano).filter(Boolean))].sort((a, b) => b - a);

  return (
    <motion.div 
      className="home-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <header className="home-header">
        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Filmaria Queiroz
        </motion.h1>
        <div className="header-actions">
          <button 
            className={`favorites-toggle ${showFavorites ? 'active' : ''}`}
            onClick={() => setShowFavorites(!showFavorites)}
          >
            {showFavorites ? <FaHeart /> : <FaRegHeart />}
            {showFavorites ? 'Mostrar Todos' : 'Favoritos'}
          </button>
          <Link to="/add" className="add-link">
            <motion.button
              className="add-movie-button"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <FaPlus /> Adicionar Filme
            </motion.button>
          </Link>
        </div>
      </header>

      <motion.div 
        className="filters-container"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className="search-box">
          <FaSearch />
          <input
            type="text"
            placeholder="Buscar filmes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-controls">
          <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)}>
            <option value="">Todos os anos</option>
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="title">Ordenar por título</option>
            <option value="year">Ordenar por ano</option>
          </select>
        </div>
      </motion.div>

      <motion.div 
        className="movies-grid"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <AnimatePresence>
          {filteredMovies.map((movie) => (
            <MovieCard 
              key={movie.id} 
              movie={movie} 
              onDelete={handleDelete}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default Home; 
