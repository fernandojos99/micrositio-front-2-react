// src/pages/Busqueda/Busqueda.tsx
import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import SearchBar from '../../components/ui/Busqueda/SearchBar';
import { search, SearchResults, SearchScope } from '../../services/searchService';
import './Busqueda.css';

const Busqueda: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [scope, setScope] = useState<SearchScope>('all');
  const [results, setResults] = useState<SearchResults>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const [searchParams] = useSearchParams(); // 👈 leemos ?q=&scope=

  // Función reutilizable que hace la llamada al backend
  const runSearch = async (qValue: string, scopeValue: SearchScope) => {
    if (!qValue.trim()) {
      console.log('⚠️ runSearch: término vacío, no busco');
      return;
    }

    console.log('🚀 runSearch ejecutado:', { qValue, scopeValue });

    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const data = await search(qValue.trim(), scopeValue);
      console.log('✅ runSearch: resultados recibidos', data);
      setResults(data);
    } catch (err) {
      console.error('❌ Error en búsqueda:', err);
      setError('Ocurrió un error al realizar la búsqueda. Intenta nuevamente.');
      setResults({});
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    // usa el estado actual de la página
    await runSearch(searchTerm, scope);
  };

  const handleScopeChange = (newScope: SearchScope) => {
    setScope(newScope);
    if (hasSearched && searchTerm.trim()) {
      runSearch(searchTerm, newScope);
    }
  };

  // 👇 Al cargar la página o cambiar los query params, sincronizamos estado
  useEffect(() => {
    const qParam = searchParams.get('q') || '';
    const scopeParam = (searchParams.get('scope') as SearchScope) || 'all';

    if (qParam) {
      console.log('🌐 Cargando búsqueda desde URL:', { qParam, scopeParam });
      setSearchTerm(qParam);
      setScope(scopeParam);
      runSearch(qParam, scopeParam);
    }
  }, [searchParams]); // se dispara cuando vienes de la barra superior

  console.log('👀 Estado actual de results en render:', results);

  return (
    <div className="search-page">
      <h1 className="search-title">Búsqueda general</h1>
      <p className="search-subtitle">
        Busca en proyectos, secuencias, testing cards, learning cards, agentes y prompts desde un mismo lugar.
      </p>

      {/* Barra de búsqueda reutilizable */}
      <div className="search-bar">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          onSubmit={handleSearch}
          placeholder="Buscar por proyecto, secuencia, testing card, learning card, agente o prompt..."
          disabled={isLoading}
        />
        <button
          type="button"
          className="search-button"
          onClick={handleSearch}
          disabled={isLoading || !searchTerm.trim()}
        >
          {isLoading ? 'Buscando...' : 'Buscar'}
        </button>
      </div>

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
          onClick={() => handleScopeChange('secuencias')}
          className={scope === 'secuencias' ? 'active' : ''}
        >
          Secuencias
        </button>
        <button
          type="button"
          onClick={() => handleScopeChange('testing_cards')}
          className={scope === 'testing_cards' ? 'active' : ''}
        >
          Testing cards
        </button>
        <button
          type="button"
          onClick={() => handleScopeChange('learning_cards')}
          className={scope === 'learning_cards' ? 'active' : ''}
        >
          Learning cards
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

      {/* DEBUG: JSON */}
      <pre className="debug-json">
        {JSON.stringify(results, null, 2)}
      </pre>

      {error && <div className="search-error">{error}</div>}

      {!isLoading && hasSearched && !error && (
        <div className="search-results">
          {(scope === 'proyectos' || scope === 'all') && (
            <section>
              <h2>Proyectos</h2>
              {results.proyectos && results.proyectos.length > 0 ? (
                <ul>
                  {results.proyectos.map((p) => (
                    <li key={p.id_proyecto}>
                      <Link to={`/proyectos/${p.id_proyecto}`}>
                        {p.titulo /* 👈 la columna real de la BD */}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="search-empty">Sin resultados de proyectos.</p>
              )}
            </section>
          )}

          {(scope === 'secuencias' || scope === 'all') && (
            <section>
              <h2>Secuencias</h2>
              {results.secuencias && results.secuencias.length > 0 ? (
                <ul>
                  {results.secuencias.map((s) => (
                    <li key={s.id_secuencia}>
                      <span>{s.nombre}</span>{' '}
                      {s.descripcion && <small>— {s.descripcion}</small>}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="search-empty">Sin resultados de secuencias.</p>
              )}
            </section>
          )}

          {(scope === 'testing_cards' || scope === 'all') && (
            <section>
              <h2>Testing cards</h2>
              {results.testing_cards && results.testing_cards.length > 0 ? (
                <ul>
                  {results.testing_cards.map((tc) => (
                    <li key={tc.id_testing_card}>
                      <span>{tc.titulo}</span>
                      {tc.hipotesis && <small> — {tc.hipotesis}</small>}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="search-empty">Sin resultados de testing cards.</p>
              )}
            </section>
          )}

          {(scope === 'learning_cards' || scope === 'all') && (
            <section>
              <h2>Learning cards</h2>
              {results.learning_cards && results.learning_cards.length > 0 ? (
                <ul>
                  {results.learning_cards.map((lc) => (
                    <li key={lc.id_learning_card}>
                      <span>{lc.resultado || 'Learning card'}</span>
                      {lc.hallazgo && <small> — {lc.hallazgo}</small>}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="search-empty">Sin resultados de learning cards.</p>
              )}
            </section>
          )}

          {(scope === 'agentes' || scope === 'all') && (
            <section>
              <h2>Agentes</h2>
              {results.agentes && results.agentes.length > 0 ? (
                <ul>
                  {results.agentes.map((a) => (
                    <li key={a.id_agente}>
                      <Link to={`/agentes/${a.id_agente}`}>
                        {a.nombre}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="search-empty">Sin resultados de agentes.</p>
              )}
            </section>
          )}

          {(scope === 'prompts' || scope === 'all') && (
            <section>
              <h2>Prompts</h2>
              {results.prompts && results.prompts.length > 0 ? (
                <ul>
                  {results.prompts.map((pr) => (
                    <li key={pr.id_prompt}>
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
