// src/pages/Busqueda/Busqueda.tsx
import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { search, SearchResults, SearchScope } from '../../services/searchService';
import { Link } from 'react-router-dom';
import './Busqueda.css'; // opcional, o usa CSS Modules si prefieres

const Busqueda: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [scope, setScope] = useState<SearchScope>('all');
  const [results, setResults] = useState<SearchResults>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!searchTerm.trim()) return;

    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const data = await search(searchTerm.trim(), scope);
      setResults(data);
    } catch (err) {
      console.error('❌ Error en búsqueda:', err);
      setError('Ocurrió un error al realizar la búsqueda. Intenta nuevamente.');
      setResults({});
    } finally {
      setIsLoading(false);
    }
  };

  const handleScopeChange = (newScope: SearchScope) => {
    setScope(newScope);
    // opcional: relanzar búsqueda si ya se había buscado
    if (hasSearched && searchTerm.trim()) {
      handleSearch();
    }
  };

  return (
    <div className="search-page">
      <h1 className="search-title">Búsqueda general</h1>
      <p className="search-subtitle">
        Busca en proyectos, agentes y prompts desde un mismo lugar.
      </p>

      {/* Barra de búsqueda (patrón similar a AssignEmployeeModal) */}
      <form className="search-bar" onSubmit={handleSearch}>
        <Search size={20} className="search-icon" />
        <input
          type="text"
          placeholder="Buscar por nombre de proyecto, agente o título de prompt..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading || !searchTerm.trim()}>
          {isLoading ? 'Buscando...' : 'Buscar'}
        </button>
      </form>

      {/* Filtros de scope */}
      <div className="scope-tabs">
        <button
          type="button"
          onClick={() => handleScopeChange('all')}
          className={scope === 'all' ? 'active' : ''}
        >
          Todo
        </button>
        <button
          type="button"
          onClick={() => handleScopeChange('proyectos')}
          className={scope === 'proyectos' ? 'active' : ''}
        >
          Proyectos
        </button>
        <button
          type="button"
          onClick={() => handleScopeChange('agentes')}
          className={scope === 'agentes' ? 'active' : ''}
        >
          Agentes
        </button>
        <button
          type="button"
          onClick={() => handleScopeChange('prompts')}
          className={scope === 'prompts' ? 'active' : ''}
        >
          Prompts
        </button>
      </div>

      {/* Estado de error */}
      {error && <div className="search-error">{error}</div>}

      {/* Resultados */}
      {!isLoading && hasSearched && !error && (
        <div className="search-results">
          {/* Proyectos */}
          {(scope === 'proyectos' || scope === 'all') && (
            <section>
              <h2>Proyectos</h2>
              {results.proyectos && results.proyectos.length > 0 ? (
                <ul>
                  {results.proyectos.map((p) => (
                    <li key={p.id_proyecto}>
                      <Link to={`/proyectos/${p.id_proyecto}`}>
                        {p.nombre}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="search-empty">Sin resultados de proyectos.</p>
              )}
            </section>
          )}

          {/* Agentes */}
          {(scope === 'agentes' || scope === 'all') && (
            <section>
              <h2>Agentes</h2>
              {results.agentes && results.agentes.length > 0 ? (
                <ul>
                  {results.agentes.map((a) => (
                    <li key={a.id_agente}>
                      <Link to={`/agentes/${a.id_agente}`}>
                        {/* ajusta campo nombre completo según tu modelo */}
                        {a.nombre} {a.apellido}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="search-empty">Sin resultados de agentes.</p>
              )}
            </section>
          )}

          {/* Prompts */}
          {(scope === 'prompts' || scope === 'all') && (
            <section>
              <h2>Prompts</h2>
              {results.prompts && results.prompts.length > 0 ? (
                <ul>
                  {results.prompts.map((pr) => (
                    <li key={pr.id_prompt}>
                      {/* si tienes una página de detalle para prompts, enlázala aquí */}
                      <span>{pr.titulo}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="search-empty">Sin resultados de prompts.</p>
              )}
            </section>
          )}
        </div>
      )}
    </div>
  );
};

export default Busqueda;
