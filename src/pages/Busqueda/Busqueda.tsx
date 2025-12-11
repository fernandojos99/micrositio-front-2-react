// src/pages/Busqueda/Busqueda.tsx
import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import SearchBar from '../../components/ui/Busqueda/SearchBar';
import { search, SearchResults, SearchScope } from '../../services/searchService';
import './Busqueda.css';

// Clave interna para manejar las secciones colapsables
type SectionKey =
  | 'proyectos'
  | 'secuencias'
  | 'testing_cards'
  | 'learning_cards'
  | 'agentes'
  | 'prompts';

const Busqueda: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [scope, setScope] = useState<SearchScope>('all');
  const [results, setResults] = useState<SearchResults>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [expandedSections, setExpandedSections] = useState<
    Partial<Record<SectionKey, boolean>>
  >({});

  const [searchParams] = useSearchParams(); // leemos ?q=&scope=

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
    await runSearch(searchTerm, scope);
  };

  const handleScopeChange = (newScope: SearchScope) => {
    setScope(newScope);
    if (hasSearched && searchTerm.trim()) {
      runSearch(searchTerm, newScope);
    }

    // Si no es "all", abrimos por defecto esa sección
    if (newScope !== 'all') {
      setExpandedSections(prev => ({
        ...prev,
        [newScope as SectionKey]: true,
      }));
    }
  };

  const toggleSection = (section: SectionKey) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Al cargar la página o cambiar los query params, sincronizamos estado
  useEffect(() => {
    const qParam = searchParams.get('q') || '';
    const scopeParam = (searchParams.get('scope') as SearchScope) || 'all';

    if (qParam) {
      console.log('🌐 Cargando búsqueda desde URL:', { qParam, scopeParam });
      setSearchTerm(qParam);
      setScope(scopeParam);
      runSearch(qParam, scopeParam);
    }
  }, [searchParams]);

  console.log('👀 Estado actual de results en render:', results);

  return (
    <div className="search-page">
      <h1 className="search-title">Búsqueda general</h1>
      <p className="search-subtitle">
        Busca en proyectos, secuencias, testing cards, learning cards, agentes y prompts desde un
        mismo lugar.
      </p>

      {/* Barra de búsqueda reutilizable */}
      <div className="searchbar-full">
        <div className="searchbar-full-input">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            onSubmit={handleSearch}
            placeholder="Buscar por proyecto, secuencia, testing card, learning card, agente o prompt..."
            disabled={isLoading}
          />
        </div>

        <button
          type="button"
          className="searchbar-full-button"
          onClick={handleSearch}
          disabled={isLoading || !searchTerm.trim()}
        >
          Buscar
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

      {/* DEBUG JSON (oculto, pero fácil de reactivar) */}
      {false && (
        <pre className="debug-json">
          {JSON.stringify(results, null, 2)}
        </pre>
      )}

      {error && <div className="search-error">{error}</div>}

      {!isLoading && hasSearched && !error && (
        <div className="search-results">

          {/* ================== PROYECTOS ================== */}
          {(scope === 'proyectos' || scope === 'all') && (
            <section className="search-section">
              <div className="search-section-header">
                <div>
                  <h2>Proyectos</h2>
                  <span className="search-section-count">
                    {(results.proyectos?.length || 0)} resultados
                  </span>
                </div>
                {results.proyectos && results.proyectos.length > 0 && (
                  <button
                    type="button"
                    className="search-section-toggle"
                    onClick={() => toggleSection('proyectos')}
                  >
                    {expandedSections.proyectos ? 'Ocultar' : 'Ver más'}
                  </button>
                )}
              </div>

              {expandedSections.proyectos && results.proyectos && results.proyectos.length > 0 && (
                <div className="search-cards-grid">
                  {results.proyectos.map(p => (
                    <Link
                      key={p.id_proyecto}
                      to={`/proyectos/${p.id_proyecto}`}
                      className="search-card search-card--proyecto search-card--clickable"
                    >
                      <span className="search-card-type">Proyecto</span>
                      <h3 className="search-card-title">{p.titulo}</h3>
                      {p.descripcion && (
                        <p className="search-card-text">
                          {p.descripcion}
                        </p>
                      )}
                      {p.estado && (
                        <span className="search-card-chip">
                          {p.estado}
                        </span>
                      )}
                      <span className="search-card-link-hint">Ver detalle →</span>
                    </Link>
                  ))}
                </div>
              )}

              {(!results.proyectos || results.proyectos.length === 0) && (
                <p className="search-empty">Sin resultados de proyectos.</p>
              )}
            </section>
          )}

          {/* ================== SECUENCIAS ================== */}
          {(scope === 'secuencias' || scope === 'all') && (
            <section className="search-section">
              <div className="search-section-header">
                <div>
                  <h2>Secuencias</h2>
                  <span className="search-section-count">
                    {(results.secuencias?.length || 0)} resultados
                  </span>
                </div>
                {results.secuencias && results.secuencias.length > 0 && (
                  <button
                    type="button"
                    className="search-section-toggle"
                    onClick={() => toggleSection('secuencias')}
                  >
                    {expandedSections.secuencias ? 'Ocultar' : 'Ver más'}
                  </button>
                )}
              </div>

              {expandedSections.secuencias &&
                results.secuencias &&
                results.secuencias.length > 0 && (
                  <div className="search-cards-grid">
                    {results.secuencias.map(s => (
                      <div
                        key={s.id_secuencia}
                        className="search-card search-card--secuencia"
                      >
                        <span className="search-card-type">
                          {s.proyecto?.titulo
                            ? `Secuencia · ${s.proyecto.titulo}`
                            : 'Secuencia'}
                        </span>

                        <h3 className="search-card-title">{s.nombre}</h3>

                        {s.descripcion && (
                          <p className="search-card-text">{s.descripcion}</p>
                        )}

                        {/* ================== METADATA NUEVO ================== */}
                        <div className="search-card-meta">
                          {/* Fila 1: estado */}
                          <div className="search-card-meta-row">
                            {s.estado && (
                              <span className="search-card-chip search-card-chip--status">
                                {s.estado}
                              </span>
                            )}
                          </div>

                          {/* Fila 2: proyecto asociado */}
                          <div className="search-card-meta-row">
                            {s.proyecto?.titulo && (
                              <Link
                                to={`/proyectos/${s.proyecto.id_proyecto}`}
                                className="search-card-chip search-card-chip--link"
                              >
                                Proyecto: {s.proyecto.titulo}
                              </Link>
                            )}
                          </div>
                        </div>
                        {/* ================== FIN METADATA NUEVO ================== */}
                      </div>
                    ))}
                  </div>
              )}

              {(!results.secuencias || results.secuencias.length === 0) && (
                <p className="search-empty">Sin resultados de secuencias.</p>
              )}
            </section>
          )}

          {/* ================== TESTING CARDS ================== */}
          {(scope === 'testing_cards' || scope === 'all') && (
            <section className="search-section">
              <div className="search-section-header">
                <div>
                  <h2>Testing cards</h2>
                  <span className="search-section-count">
                    {(results.testing_cards?.length || 0)} resultados
                  </span>
                </div>
                {results.testing_cards && results.testing_cards.length > 0 && (
                  <button
                    type="button"
                    className="search-section-toggle"
                    onClick={() => toggleSection('testing_cards')}
                  >
                    {expandedSections.testing_cards ? 'Ocultar' : 'Ver más'}
                  </button>
                )}
              </div>

              {expandedSections.testing_cards &&
                results.testing_cards &&
                results.testing_cards.length > 0 && (
                  <div className="search-cards-grid">
                    {results.testing_cards.map(tc => (
                      <div
                        key={tc.id_testing_card}
                        className="search-card search-card--testing"
                      >
                        <span className="search-card-type">
                          Testing card
                        </span>

                        <h3 className="search-card-title">{tc.titulo}</h3>

                        {tc.hipotesis && (
                          <p className="search-card-text">
                            {tc.hipotesis}
                          </p>
                        )}

                        {/* ================== METADATA NUEVO ================== */}
                        <div className="search-card-meta">
                          {/* Fila 1: estado + secuencia */}
                          <div className="search-card-meta-row">
                            {tc.status && (
                              <span className="search-card-chip search-card-chip--status">
                                {tc.status}
                              </span>
                            )}

                            {tc.secuencia?.nombre && (
                              <Link
                                to={`/secuencias/${tc.secuencia.id_secuencia}`}
                                className="search-card-chip search-card-chip--link"
                              >
                                Secuencia: {tc.secuencia.nombre}
                              </Link>
                            )}
                          </div>

                          {/* Fila 2: proyecto de la secuencia */}
                          <div className="search-card-meta-row">
                            {tc.secuencia?.proyecto?.titulo && (
                              <Link
                                to={`/proyectos/${tc.secuencia.proyecto.id_proyecto}`}
                                className="search-card-chip search-card-chip--link"
                              >
                                Proyecto: {tc.secuencia.proyecto.titulo}
                              </Link>
                            )}
                          </div>

                          {/* Fila 3: responsable */}
                          <div className="search-card-meta-row">
                            {tc.responsable && (
                              <span className="search-card-chip">
                                Resp.: {tc.responsable.nombre_pila}{' '}
                                {tc.responsable.apellido_paterno}
                              </span>
                            )}
                          </div>
                        </div>
                        {/* ================== FIN METADATA NUEVO ================== */}
                      </div>
                    ))}
                  </div>
              )}

              {(!results.testing_cards || results.testing_cards.length === 0) && (
                <p className="search-empty">Sin resultados de testing cards.</p>
              )}
            </section>
          )}

          {/* ================== LEARNING CARDS ================== */}
          {(scope === 'learning_cards' || scope === 'all') && (
            <section className="search-section">
              <div className="search-section-header">
                <div>
                  <h2>Learning cards</h2>
                  <span className="search-section-count">
                    {(results.learning_cards?.length || 0)} resultados
                  </span>
                </div>
                {results.learning_cards && results.learning_cards.length > 0 && (
                  <button
                    type="button"
                    className="search-section-toggle"
                    onClick={() => toggleSection('learning_cards')}
                  >
                    {expandedSections.learning_cards ? 'Ocultar' : 'Ver más'}
                  </button>
                )}
              </div>

              {expandedSections.learning_cards &&
                results.learning_cards &&
                results.learning_cards.length > 0 && (
                  <div className="search-cards-grid">
                    {results.learning_cards.map(lc => (
                      <div
                        key={lc.id_learning_card}
                        className="search-card search-card--learning"
                      >
                        <span className="search-card-type">
                          Learning card
                        </span>

                        <h3 className="search-card-title">
                          {lc.resultado || 'Learning card'}
                        </h3>

                        {lc.hallazgo && (
                          <p className="search-card-text">
                            {lc.hallazgo}
                          </p>
                        )}

                        {/* ================== METADATA NUEVO ================== */}
                        <div className="search-card-meta">
                          {/* Fila 1: estado */}
                          <div className="search-card-meta-row">
                            {lc.estado && (
                              <span className="search-card-chip search-card-chip--status">
                                {lc.estado}
                              </span>
                            )}
                          </div>

                          {/* Fila 2: proyecto + secuencia */}
                          <div className="search-card-meta-row">
                            {lc.testing_card?.secuencia?.proyecto?.titulo && (
                              <Link
                                to={`/proyectos/${lc.testing_card.secuencia.proyecto.id_proyecto}`}
                                className="search-card-chip search-card-chip--link"
                              >
                                Proyecto: {lc.testing_card.secuencia.proyecto.titulo}
                              </Link>
                            )}

                            {lc.testing_card?.secuencia?.nombre && (
                              <Link
                                to={`/secuencias/${lc.testing_card.secuencia.id_secuencia}`}
                                className="search-card-chip search-card-chip--link"
                              >
                                Secuencia: {lc.testing_card.secuencia.nombre}
                              </Link>
                            )}
                          </div>

                          {/* Fila 3: testing card origen + responsable */}
                          <div className="search-card-meta-row">
                            {lc.testing_card?.titulo && (
                              <span className="search-card-chip">
                                TC: {lc.testing_card.titulo}
                              </span>
                            )}

                            {lc.testing_card?.responsable && (
                              <span className="search-card-chip">
                                Resp.: {lc.testing_card.responsable.nombre_pila}{' '}
                                {lc.testing_card.responsable.apellido_paterno}
                              </span>
                            )}
                          </div>
                        </div>
                        {/* ================== FIN METADATA NUEVO ================== */}
                      </div>
                    ))}
                  </div>
              )}

              {(!results.learning_cards || results.learning_cards.length === 0) && (
                <p className="search-empty">Sin resultados de learning cards.</p>
              )}
            </section>
          )}

          {/* ================== AGENTES ================== */}
          {(scope === 'agentes' || scope === 'all') && (
            <section className="search-section">
              <div className="search-section-header">
                <div>
                  <h2>Agentes</h2>
                  <span className="search-section-count">
                    {(results.agentes?.length || 0)} resultados
                  </span>
                </div>
                {results.agentes && results.agentes.length > 0 && (
                  <button
                    type="button"
                    className="search-section-toggle"
                    onClick={() => toggleSection('agentes')}
                  >
                    {expandedSections.agentes ? 'Ocultar' : 'Ver más'}
                  </button>
                )}
              </div>

              {expandedSections.agentes &&
                results.agentes &&
                results.agentes.length > 0 && (
                  <div className="search-cards-grid">
                    {results.agentes.map(a => (
                      <Link
                        key={a.id_agente}
                        to={`/agentes/${a.id_agente}`}
                        className="search-card search-card--agente search-card--clickable"
                      >
                        <span className="search-card-type">Agente</span>
                        <h3 className="search-card-title">{a.nombre}</h3>
                        {a.descripcion && (
                          <p className="search-card-text">
                            {a.descripcion}
                          </p>
                        )}
                        <span className="search-card-link-hint">Abrir agente →</span>
                      </Link>
                    ))}
                  </div>
              )}

              {(!results.agentes || results.agentes.length === 0) && (
                <p className="search-empty">Sin resultados de agentes.</p>
              )}
            </section>
          )}

          {/* ================== PROMPTS ================== */}
          {(scope === 'prompts' || scope === 'all') && (
            <section className="search-section">
              <div className="search-section-header">
                <div>
                  <h2>Prompts</h2>
                  <span className="search-section-count">
                    {(results.prompts?.length || 0)} resultados
                  </span>
                </div>
                {results.prompts && results.prompts.length > 0 && (
                  <button
                    type="button"
                    className="search-section-toggle"
                    onClick={() => toggleSection('prompts')}
                  >
                    {expandedSections.prompts ? 'Ocultar' : 'Ver más'}
                  </button>
                )}
              </div>

              {expandedSections.prompts &&
                results.prompts &&
                results.prompts.length > 0 && (
                  <div className="search-cards-grid">
                    {results.prompts.map(pr => (
                      <div
                        key={pr.id_prompt}
                        className="search-card search-card--prompt"
                      >
                        <h3 className="search-card-title">{pr.titulo}</h3>
                        {pr.descripcion && (
                          <p className="search-card-text">
                            {pr.descripcion}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
              )}

              {(!results.prompts || results.prompts.length === 0) && (
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
