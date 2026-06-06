import { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from './hooks/useTheme';
import { AuthProvider } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import AppRoutes from './routes/AppRoutes';
import { UIProvider } from './contexts/UIContext';
import { Toaster } from './components/ui-shadcn2/toaster';

import { pingBackend } from './services/chatService';

function App() {

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const data = await pingBackend();

        console.log('Backend disponible');
        console.log(data.status);
        console.log(data.service);
      } catch (err) {
        console.error('Backend no disponible', err);
      }
    };

    checkBackend();
  }, []);

  return (
    <ThemeProvider>
      <UIProvider>
        <AuthProvider>
          <AppProvider>
            <Toaster />
            <Router>
              <AppRoutes />
            </Router>
          </AppProvider>
        </AuthProvider>
      </UIProvider>
    </ThemeProvider>
  );
}

export default App;