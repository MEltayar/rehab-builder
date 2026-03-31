import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { db } from './db';
import { seedDatabase } from './db/seed';

// Apply stored theme before React mounts to prevent flash
async function bootstrap() {
  try {
    const settings = await db.settings.get(1);
    if (settings?.darkMode) {
      document.documentElement.classList.add('dark');
    }
  } catch {
    // If DB read fails, proceed with default light theme
  }

  await seedDatabase();

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

bootstrap();
