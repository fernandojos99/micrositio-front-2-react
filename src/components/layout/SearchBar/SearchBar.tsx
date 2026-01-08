// src/components/layout/SearchBar/SearchBar.tsx
import React, { useState } from 'react';
import { Search, Bot } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './SearchBar.module.css';

const SearchBar: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    console.log('🔎 Barra superior, buscando:', searchQuery);

    // Redirige a /buscar con el término y scope=all
    navigate(
      `/buscar?q=${encodeURIComponent(searchQuery.trim())}&scope=all`
    );
  };

  return (
    <div className={styles['search-container']}>
      <div className={styles['search-content']}>
        <form 
          onSubmit={handleSearch} 
          className={styles['search-form']}
        >
          <div className={styles['search-input-container']}>
            <div className={styles['search-icon']}>
              <Search />
            </div>
            <input
              type="search"
              className={styles['search-input']}
              placeholder="Buscar recursos, lecciones, prompts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              required
            />
            <button
              type="submit"
              className={styles['search-button']}
            >
              Buscar
            </button>
          </div>
        </form>
        
        <Link
          to="/agentes"
          className={styles['assistant-button']}
        >
          <Bot className={styles['assistant-icon']} />
          <span>Asistente</span>
        </Link>
      </div>
    </div>
  );
};

export default SearchBar;