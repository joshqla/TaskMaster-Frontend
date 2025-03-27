import { useState } from 'react';
import { useTheme } from 'next-themes';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import Home from '@/pages/Home';
import { Button } from '@/components/ui/button';

function App() {
  const { setTheme, resolvedTheme } = useTheme();
  const [isLogin, setIsLogin] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

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
            <Button onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}>
              {resolvedTheme === 'dark' ? 'Claro' : 'Escuro'}
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
            <Button onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}>
              {resolvedTheme === 'dark' ? 'Claro' : 'Escuro'}
            </Button>
          </div>
          {isLogin ? <LoginPage onLoginSuccess={handleLoginSuccess} /> : <RegisterPage />}
        </>
      )}
    </div>
  );
}

export default App;