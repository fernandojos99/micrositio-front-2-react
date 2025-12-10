// src/components/ui/Busqueda/SearchBar.tsx  (o donde lo tengas)
import React from 'react';
import { Search } from 'lucide-react';
import styles from './SearchBar.module.css';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  disabled?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onSubmit,
  placeholder = 'Buscar...',
  disabled = false,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (onSubmit && e.key === 'Enter') {
      e.preventDefault();
      console.log('⏎ Enter en SearchBar, llamando a onSubmit');
      onSubmit();
    }
  };

  return (
    <div className={styles.searchContainer}>
      <Search size={20} className={styles.searchIcon} />
      <input
        type="text"
        value={value}
        onChange={(e) => {
          console.log('Buscando:', e.target.value);
          onChange(e.target.value);
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={styles.searchInput}
        disabled={disabled}
      />
    </div>
  );
};

export default SearchBar;
