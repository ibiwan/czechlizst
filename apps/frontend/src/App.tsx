import { useEffect, useState } from 'react';
import { useHealthQuery } from './api';
import { MainPage } from './components/MainPage';

function useHashPath() {
  const [hash, setHash] = useState(() => window.location.hash || '#/');

  useEffect(() => {
    function onHashChange() {
      setHash(window.location.hash || '#/');
    }

    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  return hash;
}

function MetaPage() {
  const healthQuery = useHealthQuery();

  return (
    <main className="app-shell" data-testid="meta-page">
      <section className="panel" data-testid="meta-panel-info">
        <h1 className="panel-title" data-testid="meta-title">
          Projects and Tasks
        </h1>
        <p className="meta-copy">
          This page keeps app title and diagnostics. Main interface intentionally hides it.
        </p>
      </section>

      <section className="panel" data-testid="meta-panel-health">
        <h2 className="panel-title" data-testid="health-title">
          Backend health
        </h2>
        {healthQuery.isLoading && <p data-testid="health-status-loading">Checking health...</p>}
        {healthQuery.error && <p data-testid="health-status-error">Backend unavailable</p>}
        {healthQuery.data && <p data-testid="health-status-ok">Service healthy</p>}
      </section>
    </main>
  );
}

export default function App() {
  const hash = useHashPath();

  if (hash === '#/meta') {
    return <MetaPage />;
  }

  return <MainPage />;
}
