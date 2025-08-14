import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { obtenerEmpleadoPorId, actualizarEmpleado, Empleado } from '../../services/empleadosService';
import { actualizarUsuario, cambiarPasswordUsuario } from '../../services/usuarioService';
import apiClient from '../../apiClient';
import { 
  User, 
  Mail, 
  Briefcase,
  Phone,
  Edit3,
  Save,
  X,
  Key,
  Shield
} from 'lucide-react';
import styles from './Perfil.module.css';

/**
 * Componente Perfil de Usuario
 * 
 * @component Perfil
 * @description Página de perfil que permite a los usuarios ver y editar
 * su información personal, así como visualizar sus proyectos colaborativos.
 * 
 * Características principales:
 * - Formulario de edición de datos personales
 * - Sección de proyectos colaborativos colapsable
 * - Subida de avatar (simulada)
 * - Validación de campos
 * - Estados de carga
 * - Diseño responsive
 * - Información adicional del perfil
 * 
 * Funcionalidades:
 * - Editar nombre, email y información adicional
 * - Cambiar avatar del usuario
 * - Ver lista de proyectos en los que colabora
 * - Guardar cambios con validación
 * 
 * @returns {JSX.Element} Página de perfil del usuario
 */
const Perfil: React.FC = () => {
  // @context: Contexto de autenticación
  const { user } = useAuth();
  
  // @state: Datos del empleado
  const [empleado, setEmpleado] = useState<Empleado | null>(null);
  const [loadingEmpleado, setLoadingEmpleado] = useState(true);
  
  // @state: Estados de edición
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [emailValue, setEmailValue] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isSavingEmail, setIsSavingEmail] = useState(false);
  const [emailSuccessMessage, setEmailSuccessMessage] = useState('');

  // @state: Estados de edición de usuario (alias y contraseña)
  const [isEditingAlias, setIsEditingAlias] = useState(false);
  const [aliasValue, setAliasValue] = useState('');
  const [aliasError, setAliasError] = useState('');
  const [isSavingAlias, setIsSavingAlias] = useState(false);
  const [aliasSuccessMessage, setAliasSuccessMessage] = useState('');
  
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordSuccessMessage, setPasswordSuccessMessage] = useState('');

  /**
   * Cargar datos del empleado cuando el usuario esté disponible
   */
  useEffect(() => {
    const cargarDatosEmpleado = async () => {
      if (user && user.id_empleado && user.id_empleado > 0) {
        try {
          setLoadingEmpleado(true);
          // console.log('Usuario completo:', user);
          // console.log('ID empleado a buscar:', user.id_empleado);
          // console.log('Tipo de ID empleado:', typeof user.id_empleado);
          
          const datosEmpleado = await obtenerEmpleadoPorId(user.id_empleado);
          // console.log('Datos empleado obtenidos:', datosEmpleado);
          // console.log('Estructura completa del empleado:', JSON.stringify(datosEmpleado, null, 2));
          // console.log('ID del empleado obtenido:', datosEmpleado?.id_empleado);
          // console.log('Todas las propiedades del empleado:', Object.keys(datosEmpleado || {}));
          setEmpleado(datosEmpleado);
        } catch (error) {
          console.error('Error cargando datos del empleado:', error);
        } finally {
          setLoadingEmpleado(false);
        }
      } else {
        // console.log('Usuario sin id_empleado válido:', user);
        setLoadingEmpleado(false);
      }
    };

    if (user) {
      cargarDatosEmpleado();
    }
  }, [user]);

  /**
   * Inicia la edición del correo electrónico
   * @function startEmailEdit
   */
  const startEmailEdit = () => {
    setEmailValue(getEmail());
    setIsEditingEmail(true);
    setEmailError('');
    setEmailSuccessMessage('');
  };

  /**
   * Cancela la edición del correo electrónico
   * @function cancelEmailEdit
   */
  const cancelEmailEdit = () => {
    setIsEditingEmail(false);
    setEmailValue('');
    setEmailError('');
    setEmailSuccessMessage('');
  };

  /**
   * Valida el formato del email
   * @function validateEmail
   * @param {string} email - Email a validar
   * @returns {boolean} true si el email es válido
   */
  const validateEmail = (email: string): boolean => {
    if (!email.trim()) {
      setEmailError('El email es requerido');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Ingresa un email válido');
      return false;
    }
    
    setEmailError('');
    return true;
  };

  /**
   * Guarda los cambios del correo electrónico
   * @function saveEmailChanges
   */
  const saveEmailChanges = async () => {
    if (!validateEmail(emailValue)) return;
    
    if (!empleado) {
      setEmailError('No se encontró información del empleado');
      return;
    }
    
    setIsSavingEmail(true);
    
    try {
      // console.log('Actualizando correo del empleado:');
      // console.log('- Empleado completo:', empleado);
      // console.log('- ID empleado (id_empleado):', empleado.id_empleado);
      // console.log('- ID empleado (id):', (empleado as any).id);
      // console.log('- Todas las propiedades:', Object.keys(empleado));
      // console.log('- Tipo de ID:', typeof empleado.id_empleado);
      // console.log('- Nuevo correo:', emailValue);
      
      // Determinar qué campo usar para el ID
      const idEmpleado = empleado.id_empleado || (empleado as any).id;
      
      if (!idEmpleado) {
        throw new Error('No se encontró el ID del empleado en los datos cargados');
      }
      
      const datosActualizar = {
        id: idEmpleado,
        correo: emailValue
      };
      
      // console.log('Datos a enviar al backend:', JSON.stringify(datosActualizar, null, 2));
      
      try {
        // @api: Llamada real al endpoint para actualizar el empleado
        const empleadoActualizado = await actualizarEmpleado(datosActualizar);
        // console.log('Empleado actualizado exitosamente:', empleadoActualizado);
        
        // @update: Actualizar el estado local con los nuevos datos
        setEmpleado(empleadoActualizado);
        
      } catch (updateError) {
        // console.log('Error con "id", intentando con "id_empleado"...');
        
        // @fallback: Si falla con "id", intentar con "id_empleado"
        const datosAlternativos = {
          id_empleado: idEmpleado,
          correo: emailValue
        };
        
        // console.log('Datos alternativos a enviar:', JSON.stringify(datosAlternativos, null, 2));
        
        // Llamada directa al API client para probar
        const response = await apiClient.patch('/empleados/', datosAlternativos);
        const empleadoActualizado = response.data;
        
        // console.log('Empleado actualizado exitosamente con id_empleado:', empleadoActualizado);
        
        // @update: Actualizar el estado local con los nuevos datos
        setEmpleado(empleadoActualizado);
      }
      
      // @cleanup: Salir del modo edición
      setIsEditingEmail(false);
      setEmailError('');
      
      // @success: Mostrar mensaje de éxito
      setEmailSuccessMessage('Correo actualizado exitosamente');
      
      // @cleanup: Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => setEmailSuccessMessage(''), 3000);
      
    } catch (error) {
      console.error('Error actualizando correo del empleado:', error);
      
      // @error: Manejar diferentes tipos de errores
      if (error instanceof Error) {
        setEmailError(`Error al actualizar el correo: ${error.message}`);
      } else {
        setEmailError('Error al actualizar el correo. Intenta nuevamente.');
      }
      
    } finally {
      setIsSavingEmail(false);
    }
  };

  /**
   * Inicia la edición del alias de usuario
   */
  const startAliasEdit = () => {
    setAliasValue(user?.alias || '');
    setIsEditingAlias(true);
    setAliasError('');
    setAliasSuccessMessage('');
  };

  /**
   * Cancela la edición del alias
   */
  const cancelAliasEdit = () => {
    setIsEditingAlias(false);
    setAliasValue('');
    setAliasError('');
  };

  /**
   * Valida y guarda los cambios del alias
   */
  const saveAliasChanges = async () => {
    // @validation: Validar que el alias no esté vacío
    if (!aliasValue.trim()) {
      setAliasError('El alias no puede estar vacío');
      return;
    }

    // @validation: Validar longitud mínima
    if (aliasValue.trim().length < 3) {
      setAliasError('El alias debe tener al menos 3 caracteres');
      return;
    }

    if (!user?.id) {
      setAliasError('No se pudo identificar el usuario');
      return;
    }

    setIsSavingAlias(true);
    setAliasError('');

    try {
      // @api: Actualizar alias del usuario
      await actualizarUsuario(user.id, { alias: aliasValue.trim() });
      
      // @cleanup: Salir del modo edición
      setIsEditingAlias(false);
      setAliasError('');
      
      // @success: Mostrar mensaje de éxito
      setAliasSuccessMessage('Alias actualizado exitosamente');
      
      // @cleanup: Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => setAliasSuccessMessage(''), 3000);
      
    } catch (error) {
      console.error('Error actualizando alias:', error);
      
      // @error: Manejar diferentes tipos de errores
      if (error instanceof Error) {
        setAliasError(`Error al actualizar el alias: ${error.message}`);
      } else {
        setAliasError('Error al actualizar el alias. Intenta nuevamente.');
      }
      
    } finally {
      setIsSavingAlias(false);
    }
  };

  /**
   * Inicia la edición de la contraseña
   */
  const startPasswordEdit = () => {
    setIsEditingPassword(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
    setPasswordSuccessMessage('');
  };

  /**
   * Cancela la edición de la contraseña
   */
  const cancelPasswordEdit = () => {
    setIsEditingPassword(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
  };

  /**
   * Valida y guarda los cambios de contraseña
   */
  const savePasswordChanges = async () => {
    // @validation: Validar que todos los campos estén llenos
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Todos los campos son obligatorios');
      return;
    }

    // @validation: Validar que las contraseñas coincidan
    if (newPassword !== confirmPassword) {
      setPasswordError('Las contraseñas nuevas no coinciden');
      return;
    }

    // @validation: Validar longitud mínima
    if (newPassword.length < 6) {
      setPasswordError('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (!user?.id) {
      setPasswordError('No se pudo identificar el usuario');
      return;
    }

    setIsSavingPassword(true);
    setPasswordError('');

    try {
      // @api: Cambiar contraseña del usuario
      await cambiarPasswordUsuario(user.id, { password: newPassword });
      
      // @cleanup: Salir del modo edición y limpiar campos
      setIsEditingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordError('');
      
      // @success: Mostrar mensaje de éxito
      setPasswordSuccessMessage('Contraseña actualizada exitosamente');
      
      // @cleanup: Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => setPasswordSuccessMessage(''), 3000);
      
    } catch (error) {
      console.error('Error actualizando contraseña:', error);
      
      // @error: Manejar diferentes tipos de errores
      if (error instanceof Error) {
        setPasswordError(`Error al actualizar la contraseña: ${error.message}`);
      } else {
        setPasswordError('Error al actualizar la contraseña. Intenta nuevamente.');
      }
      
    } finally {
      setIsSavingPassword(false);
    }
  };

  /**
   * Obtiene el nombre completo para mostrar
   * @returns {string} Nombre completo del empleado o usuario
   */
  const getNombreCompleto = (): string => {
    if (empleado) {
      return `${empleado.nombre_pila} ${empleado.apellido_paterno} ${empleado.apellido_materno || ''}`.trim();
    }
    return user?.name || 'Usuario';
  };

  /**
   * Obtiene el email para mostrar
   * @returns {string} Email del empleado o usuario
   */
  const getEmail = (): string => {
    if (empleado) {
      return empleado.correo;
    }
    return user?.email || '';
  };

  /**
   * Obtiene información adicional del empleado
   * @returns {string} Información adicional como rol del usuario
   */
  const getInfoAdicional = (): string => {
    return user?.role || 'Empleado';
  };

  // @guard: Verificar que el usuario esté autenticado
  if (!user) {
    return (
      <div className={styles['perfil-container']}>
        <div className={styles['perfil-content']}>
          <div className={styles['error-state']}>
            <h1>Acceso Denegado</h1>
            <p>Debes iniciar sesión para ver tu perfil.</p>
          </div>
        </div>
      </div>
    );
  }

  // @guard: Mostrar estado de carga si aún se están cargando los datos del empleado
  if (loadingEmpleado) {
    return (
      <div className={styles['perfil-container']}>
        <div className={styles['perfil-content']}>
          <div className={styles['loading-state']}>
            <h1>Cargando perfil...</h1>
            <p>Obteniendo información del empleado.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles['perfil-container']}>
      <div className={styles['perfil-content']}>
        {/* @section: Header del perfil */}
        <div className={styles['perfil-header']}>
          <div className={styles['header-background']}></div>
          <div className={styles['header-content']}>
            <div className={styles['avatar-section']}>
              <div className={styles['avatar-container']}>
                {user.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.name}
                    className={styles['avatar-image']}
                  />
                ) : (
                  <div className={styles['avatar-placeholder']}>
                    <User size={32} />
                  </div>
                )}
              </div>
            </div>
            
            <div className={styles['user-info']}>
              {loadingEmpleado ? (
                <div>Cargando información del empleado...</div>
              ) : (
                <>
                  <h1 className={styles['user-name']}>{getNombreCompleto()}</h1>
                  <p className={styles['user-email']}>{getEmail()}</p>
                  {getInfoAdicional() && (
                    <p className={styles['user-role']}>
                      <Briefcase size={16} />
                      {getInfoAdicional()}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* @section: Información Personal - Solo visualización */}
        <div className={styles['perfil-info-section']}>
          <div className={styles['section-header']}>
            <h2 className={styles['section-title']}>
              <User size={20} />
              Información Personal
            </h2>
            <p className={styles['section-description']}>
              Información del empleado registrada en el sistema
            </p>
          </div>

          <div className={styles['info-grid']}>
            {/* @section: Información básica */}
            <div className={styles['info-row']}>
              <div className={styles['info-field']}>
                <div className={styles['field-label']}>
                  <User size={16} />
                  Nombre Completo
                </div>
                <div className={styles['field-value']}>
                  {getNombreCompleto()}
                </div>
              </div>

              <div className={styles['info-field']}>
                <div className={styles['field-label']}>
                  <Mail size={16} />
                  Correo Electrónico
                </div>
                
                {/* Mensaje de éxito */}
                {emailSuccessMessage && (
                  <div className={styles['field-success']}>
                    <Save size={14} />
                    {emailSuccessMessage}
                  </div>
                )}
                
                {isEditingEmail ? (
                  <div className={styles['field-edit-container']}>
                    <input
                      type="email"
                      value={emailValue}
                      onChange={(e) => setEmailValue(e.target.value)}
                      className={`${styles['field-edit-input']} ${emailError ? styles['input-error'] : ''}`}
                      placeholder="correo@ejemplo.com"
                      disabled={isSavingEmail}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          saveEmailChanges();
                        } else if (e.key === 'Escape') {
                          cancelEmailEdit();
                        }
                      }}
                    />
                    {emailError && (
                      <div className={styles['field-error']}>
                        {emailError}
                      </div>
                    )}
                    <div className={styles['field-edit-actions']}>
                      <button
                        onClick={saveEmailChanges}
                        disabled={isSavingEmail}
                        className={styles['field-save-btn']}
                        title="Guardar cambios"
                      >
                        <Save size={14} />
                        {isSavingEmail ? 'Guardando...' : 'Guardar'}
                      </button>
                      <button
                        onClick={cancelEmailEdit}
                        disabled={isSavingEmail}
                        className={styles['field-cancel-btn']}
                        title="Cancelar"
                      >
                        <X size={14} />
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={styles['field-value-container']}>
                    <div className={styles['field-value']}>
                      {getEmail() || 'No disponible'}
                    </div>
                    <button
                      onClick={startEmailEdit}
                      className={styles['field-edit-btn']}
                      title="Editar correo electrónico"
                    >
                      <Edit3 size={14} />
                      Editar
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* @section: Información adicional del empleado */}
            {empleado && empleado.celular && (
              <div className={styles['info-row']}>
                <div className={styles['info-field']}>
                  <div className={styles['field-label']}>
                    <Phone size={16} />
                    Teléfono de Contacto
                  </div>
                  <div className={styles['field-value']}>
                    {empleado.celular}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* @section: Configuración de Usuario */}
        <div className={styles['perfil-info-section']}>
          <div className={styles['section-header']}>
            <h2 className={styles['section-title']}>
              <Shield size={20} />
              Configuración de Usuario
            </h2>
            <p className={styles['section-description']}>
              Gestiona tu alias y contraseña de acceso al sistema
            </p>
          </div>

          <div className={styles['info-grid']}>
            {/* @section: Alias de usuario */}
            <div className={styles['info-row']}>
              <div className={styles['info-field']}>
                <div className={styles['field-label']}>
                  <User size={16} />
                  Alias de Usuario
                </div>
                {isEditingAlias ? (
                  <div className={styles['field-edit-container']}>
                    <input
                      type="text"
                      value={aliasValue}
                      onChange={(e) => setAliasValue(e.target.value)}
                      className={styles['field-edit-input']}
                      placeholder="Ingresa tu nuevo alias"
                      disabled={isSavingAlias}
                      maxLength={50}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          saveAliasChanges();
                        } else if (e.key === 'Escape') {
                          cancelAliasEdit();
                        }
                      }}
                    />
                    {aliasError && (
                      <div className={styles['field-error']}>
                        {aliasError}
                      </div>
                    )}
                    {aliasSuccessMessage && (
                      <div className={styles['field-success']}>
                        {aliasSuccessMessage}
                      </div>
                    )}
                    <div className={styles['field-edit-actions']}>
                      <button
                        onClick={saveAliasChanges}
                        disabled={isSavingAlias}
                        className={styles['field-save-btn']}
                        title="Guardar cambios"
                      >
                        <Save size={14} />
                        {isSavingAlias ? 'Guardando...' : 'Guardar'}
                      </button>
                      <button
                        onClick={cancelAliasEdit}
                        disabled={isSavingAlias}
                        className={styles['field-cancel-btn']}
                        title="Cancelar"
                      >
                        <X size={14} />
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={styles['field-value-container']}>
                    <div className={styles['field-value']}>
                      {user?.alias || 'No disponible'}
                    </div>
                    <button
                      onClick={startAliasEdit}
                      className={styles['field-edit-btn']}
                      title="Editar alias de usuario"
                    >
                      <Edit3 size={14} />
                      Editar
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* @section: Contraseña */}
            <div className={styles['info-row']}>
              <div className={styles['info-field']}>
                <div className={styles['field-label']}>
                  <Key size={16} />
                  Contraseña
                </div>
                {isEditingPassword ? (
                  <div className={styles['field-edit-container']}>
                    <div className={styles['password-fields']}>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className={styles['field-edit-input']}
                        placeholder="Contraseña actual"
                        disabled={isSavingPassword}
                      />
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className={styles['field-edit-input']}
                        placeholder="Nueva contraseña"
                        disabled={isSavingPassword}
                        minLength={6}
                      />
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={styles['field-edit-input']}
                        placeholder="Confirmar nueva contraseña"
                        disabled={isSavingPassword}
                        minLength={6}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            savePasswordChanges();
                          } else if (e.key === 'Escape') {
                            cancelPasswordEdit();
                          }
                        }}
                      />
                    </div>
                    {passwordError && (
                      <div className={styles['field-error']}>
                        {passwordError}
                      </div>
                    )}
                    {passwordSuccessMessage && (
                      <div className={styles['field-success']}>
                        {passwordSuccessMessage}
                      </div>
                    )}
                    <div className={styles['field-edit-actions']}>
                      <button
                        onClick={savePasswordChanges}
                        disabled={isSavingPassword}
                        className={styles['field-save-btn']}
                        title="Guardar nueva contraseña"
                      >
                        <Save size={14} />
                        {isSavingPassword ? 'Guardando...' : 'Guardar'}
                      </button>
                      <button
                        onClick={cancelPasswordEdit}
                        disabled={isSavingPassword}
                        className={styles['field-cancel-btn']}
                        title="Cancelar"
                      >
                        <X size={14} />
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={styles['field-value-container']}>
                    <div className={styles['field-value']}>
                      ••••••••••
                    </div>
                    <button
                      onClick={startPasswordEdit}
                      className={styles['field-edit-btn']}
                      title="Cambiar contraseña"
                    >
                      <Edit3 size={14} />
                      Cambiar
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Perfil;