// src/pages/Busqueda/Busqueda.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import SearchBar from '../../components/ui-propios/Busqueda/SearchBar';
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

  // runSearch se dispara desde tres sitios (el boton, el cambio de scope y el
  // efecto de los query params). Sin este contador, cambiar de termino antes
  // de que resolviera la busqueda anterior dejaba en pantalla los resultados
  // viejos, porque la respuesta tardia pisaba a la reciente. Cada llamada se
  // queda con su numero y solo escribe si sigue siendo la ultima.
  const ultimaBusqueda = useRef(0);

  // Función reutilizable que hace la llamada al backend
  const runSearch = async (qValue: string, scopeValue: SearchScope) => {
    if (!qValue.trim()) {
      return;
    }

    const idBusqueda = ++ultimaBusqueda.current;

    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const data = await search(qValue.trim(), scopeValue);
      if (idBusqueda !== ultimaBusqueda.current) return;
      setResults(data);
    } catch (err) {
      if (idBusqueda !== ultimaBusqueda.current) return;
      console.error('Error en búsqueda:', err);
      setError('Ocurrió un error al realizar la búsqueda. Intenta nuevamente.');
      setResults({});
    } finally {
      if (idBusqueda === ultimaBusqueda.current) setIsLoading(false);
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
      setSearchTerm(qParam);
      setScope(scopeParam);
      runSearch(qParam, scopeParam);
    }
  }, [searchParams]);

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
                    {results.secuencias.map(sec => (
                      <div key={sec.id_secuencia} className="search-card search-card--secuencia">
                        <div className="search-card-header">
                          <span className="search-card-kicker">SECUENCIA</span>
                          <h3 className="search-card-title">{sec.nombre}</h3>
                        </div>

                        {sec.descripcion && (
                          <p className="search-card-description">{sec.descripcion}</p>
                        )}

                        <div className="search-card-meta">
                          {/* línea 1: estado */}
                          {sec.estado && (
                            <span className="search-card-chip">
                              {sec.estado}
                            </span>
                          )}

                          {/* salto de línea para que lo demás no se junte con el estado */}
                          <br />

                          {/* línea 2: proyecto asociado (link a la página del proyecto) */}
                          {sec.proyecto?.id_proyecto && sec.proyecto?.titulo && (
                            <Link
                              to={`/proyectos/${sec.proyecto.id_proyecto}`}
                              className="search-card-chip search-card-chip--link"
                            >
                              Proyecto: {sec.proyecto.titulo}
                            </Link>
                          )}
                        </div>
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
                      <div key={tc.id_testing_card} className="search-card search-card--testing">
                        <div className="search-card-header">
                          <span className="search-card-kicker">TESTING CARD</span>
                          <h3 className="search-card-title">{tc.titulo}</h3>
                        </div>

                        {tc.hipotesis && (
                          <p className="search-card-description">{tc.hipotesis}</p>
                        )}

                        <div className="search-card-meta">
                          {/* línea 1: estado */}
                          {tc.status && (
                            <span className="search-card-chip">
                              {tc.status}
                            </span>
                          )}

                          <br />

                          {/* línea 2: proyecto de la secuencia (link) */}
                          {tc.secuencia?.proyecto?.id_proyecto &&
                            tc.secuencia?.proyecto?.titulo && (
                              <Link
                                to={`/proyectos/${tc.secuencia.proyecto.id_proyecto}`}
                                className="search-card-chip search-card-chip--link"
                              >
                                Proyecto: {tc.secuencia.proyecto.titulo}
                              </Link>
                            )}

                          {/* línea 2: secuencia asociada */}
                          {tc.secuencia?.nombre && (
                            <span className="search-card-chip">
                              Secuencia: {tc.secuencia.nombre}
                            </span>
                          )}

                          {/* línea 2: responsable */}
                          {tc.responsable && (
                            <span className="search-card-chip">
                              Resp.: {tc.responsable.nombre_pila}{' '}
                              {tc.responsable.apellido_paterno}
                            </span>
                          )}
                        </div>
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
                    {results.learning_cards.map((lc) => (
                      <div key={lc.id} className="search-card search-card--learning">
                        <div className="search-card-header">
                          <span className="search-card-kicker">LEARNING CARD</span>
                          <h3 className="search-card-title">
                            {lc.resultado || 'Learning card'}
                          </h3>
                        </div>

                        {lc.hallazgo && (
                          <p className="search-card-description">{lc.hallazgo}</p>
                        )}

                        <div className="search-card-meta">
                          {/* línea 1: estado */}
                          {lc.estado && (
                            <span className="search-card-chip">
                              {lc.estado}
                            </span>
                          )}

                          <br />

                          {/* línea 2: proyecto (desde la secuencia de la testing card) */}
                          {lc.testing_card?.secuencia?.proyecto?.id_proyecto &&
                            lc.testing_card?.secuencia?.proyecto?.titulo && (
                              <Link
                                to={`/proyectos/${lc.testing_card.secuencia.proyecto.id_proyecto}`}
                                className="search-card-chip search-card-chip--link"
                              >
                                Proyecto: {lc.testing_card.secuencia.proyecto.titulo}
                              </Link>
                            )}

                          {/* línea 2: secuencia asociada */}
                          {lc.testing_card?.secuencia?.nombre && (
                            <span className="search-card-chip">
                              Secuencia: {lc.testing_card.secuencia.nombre}
                            </span>
                          )}

                          {/* línea 2: testing card origen */}
                          {lc.testing_card?.titulo && (
                            <span className="search-card-chip">
                              TC: {lc.testing_card.titulo}
                            </span>
                          )}

                          {/* línea 2: responsable */}
                          {lc.testing_card?.responsable && (
                            <span className="search-card-chip">
                              Resp.: {lc.testing_card.responsable.nombre_pila}{' '}
                              {lc.testing_card.responsable.apellido_paterno}
                            </span>
                          )}
                        </div>
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
