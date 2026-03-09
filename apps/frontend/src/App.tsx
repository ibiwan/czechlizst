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
    <main className="app-shell">
      <section className="panel">
        <h1 className="panel-title">Projects and Tasks</h1>
        <p className="meta-copy">
          This page keeps app title and diagnostics. Main interface intentionally hides it.
        </p>
      </section>

      <section className="panel">
        <h2 className="panel-title">Backend health</h2>
        {healthQuery.isLoading && <p>Checking health...</p>}
        {healthQuery.error && <p>Backend unavailable</p>}
        {healthQuery.data && <p>Service healthy</p>}
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
