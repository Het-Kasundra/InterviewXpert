
import { BrowserRouter } from 'react-router-dom';
import { useRoutes } from 'react-router-dom';
import routes from './router/config';
import { SessionProvider } from './contexts/SessionProvider';
import { ThemeProvider } from './contexts/ThemeProvider';
import { PortfolioProvider } from './contexts/PortfolioProvider';
import { ChallengeProvider } from './contexts/ChallengeProvider';

function AppRoutes() {
  const element = useRoutes(routes);
  return element;
}

function App() {
  return (
    <BrowserRouter basename={__BASE_PATH__}>
      <ThemeProvider>
        <SessionProvider>
          <PortfolioProvider>
            <ChallengeProvider>
              <AppRoutes />
            </ChallengeProvider>
          </PortfolioProvider>
        </SessionProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
