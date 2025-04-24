import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaSearch, FaTimes } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles.css';

const EditMovie = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentMovie, setCurrentMovie] = useState(null);

  useEffect(() => {
    const savedMovies = JSON.parse(localStorage.getItem('movies') || '[]');
    const movieToEdit = savedMovies.find(m => m.id === parseInt(id));
    
    if (movieToEdit) {
      setCurrentMovie(movieToEdit);
      setSearchTerm(movieToEdit.titulo);
    } else {
      toast.error('Filme não encontrado');
      navigate('/');
    }
  }, [id, navigate]);

  const handleClose = () => {
    navigate('/');
  };

  const searchMovies = async (query) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=8554e1aec6355366edc776ec8b45f252&query=${encodeURIComponent(query)}&language=pt-BR`
      );
      const data = await response.json();
      setSuggestions(data.results || []);
    } catch (error) {
      console.error('Erro ao buscar filmes:', error);
      toast.error('Erro ao buscar filmes. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMovie = async (movie) => {
    try {
      const savedMovies = JSON.parse(localStorage.getItem('movies') || '[]');
      const updatedMovies = savedMovies.map(m => {
        if (m.id === parseInt(id)) {
          return {
            ...m,
            titulo: movie.title,
            ano: new Date(movie.release_date).getFullYear(),
            imagem: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
            descricao: movie.overview
          };
        }
        return m;
      });
      
      localStorage.setItem('movies', JSON.stringify(updatedMovies));
      
      toast.success('Filme atualizado com sucesso!');
      setTimeout(() => navigate('/'), 1500);
    } catch (error) {
      console.error('Erro ao atualizar filme:', error);
      toast.error('Erro ao atualizar o filme. Tente novamente.');
    }
  };

  if (!currentMovie) return null;

  return (
    <div className="modal-overlay">
      <motion.div
        className="modal-content"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
      >
        <button className="close-button" onClick={handleClose}>
          <FaTimes />
        </button>

        <div className="search-container">
          <h2>Editar Filme</h2>
          
          <div className="search-input-wrapper">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Buscar filme..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                searchMovies(e.target.value);
              }}
              className="search-input"
            />
          </div>

          {loading && (
            <div className="loading-spinner">
              <div className="spinner" />
            </div>
          )}

          <div className="current-movie">
            <img
              src={currentMovie.imagem}
              alt={currentMovie.titulo}
              className="current-poster"
            />
            <div className="current-info">
              <h3>{currentMovie.titulo}</h3>
              <p>{currentMovie.ano}</p>
            </div>
          </div>

          <div className="suggestions-list">
            {suggestions.map((movie) => (
              <motion.div
                key={movie.id}
                className="suggestion-item"
                onClick={() => handleSelectMovie(movie)}
                whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
              >
                {movie.poster_path && (
                  <img
                    src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                    alt={movie.title}
                    className="suggestion-poster"
                  />
                )}
                <div className="suggestion-info">
                  <h3>{movie.title}</h3>
                  <p>{new Date(movie.release_date).getFullYear()}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <ToastContainer
          position="top-right"
          autoClose={1500}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
      </motion.div>
    </div>
  );
};

export default EditMovie; 