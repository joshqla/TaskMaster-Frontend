import { useState, useEffect } from 'react';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import Home from '@/pages/Home';
import { Button } from '@/components/ui/button';

function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const handleLoginSuccess = () => setIsAuthenticated(true);
  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {isAuthenticated ? (
        <>
          <div className="flex justify-between mb-4 p-4">
            <Button onClick={handleLogout}>Sair</Button>
            <Button onClick={() => setIsDarkMode(!isDarkMode)}>
              {isDarkMode ? 'Claro' : 'Escuro'}
            </Button>
          </div>
          <Home />
        </>
      ) : (
        <>
          <div className="flex justify-center space-x-4 mb-6 p-4">
            <Button onClick={() => setIsLogin(true)} variant={isLogin ? 'default' : 'outline'}>
              Login
            </Button>
            <Button onClick={() => setIsLogin(false)} variant={!isLogin ? 'default' : 'outline'}>
              Cadastro
            </Button>
            <Button onClick={() => setIsDarkMode(!isDarkMode)}>
              {isDarkMode ? 'Claro' : 'Escuro'}
            </Button>
          </div>
          {isLogin ? <LoginPage onLoginSuccess={handleLoginSuccess} /> : <RegisterPage />}
        </>
      )}
    </div>
  );
}

export default App;