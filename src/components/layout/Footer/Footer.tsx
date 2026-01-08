import React from 'react';
import styles from './Footer.module.css';
import irisLogo from '../../../logoIRIS.png';

const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles['footer-content']}>
        <div className={styles['footer-main']}>
          <div className={styles['footer-logo']}>
            <img 
              src={irisLogo} 
              alt="Iris StartUp Lab Logo" 
              className={styles['logo-image']}
            />
          </div>
          
          <div className={styles['footer-sections']}>
            <div>
              <h3 className={styles['footer-section-title']}>
                Recursos
              </h3>
              <p className={styles['footer-section-text']}>
                Información para ser completada posteriormente sobre recursos disponibles
                en nuestra plataforma.
              </p>
            </div>
            
            <div>
              <h3 className={styles['footer-section-title']}>
                Soporte
              </h3>
              <p className={styles['footer-section-text']}>
                Información para ser completada posteriormente sobre opciones de
                soporte y contacto.
              </p>
            </div>
          </div>
        </div>
        
        <div className={styles['footer-bottom']}>
          &copy; {new Date().getFullYear()} Innovative Repository. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
};

export default Footer;