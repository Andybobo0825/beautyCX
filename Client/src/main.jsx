import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '/api';

function App() {
  const [apiStatus, setApiStatus] = useState('checking');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch(`${apiBaseUrl}/health`)
      .then((response) => response.json())
      .then((body) => setApiStatus(body.status ?? 'unknown'))
      .catch(() => setApiStatus('unreachable'));

    fetch(`${apiBaseUrl}/products/stats`)
      .then((response) => response.json())
      .then(setStats)
      .catch(() => setStats(null));
  }, []);

  return (
    <main className="shell">
      <section className="card">
        <p className="eyebrow">beautyCX</p>
        <h1>Container-ready beauty customer experience platform</h1>
        <p>
          作品集展示版已將原始 RDS SQL Server 備份轉為 SQLite snapshot，並透過 ECS CI/CD 部署。
        </p>
        <dl className="status-grid">
          <div>
            <dt>Frontend</dt>
            <dd>ready</dd>
          </div>
          <div>
            <dt>API</dt>
            <dd>{apiStatus}</dd>
          </div>
          <div>
            <dt>Products</dt>
            <dd>{stats?.products ?? '—'}</dd>
          </div>
          <div>
            <dt>Price records</dt>
            <dd>{stats ? stats.currentPrices + stats.priceHistory : '—'}</dd>
          </div>
        </dl>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
