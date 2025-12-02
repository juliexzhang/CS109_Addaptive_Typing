import React from 'react';
import { createRoot } from 'react-dom/client';
import AdaptiveTypingSystem from './App.jsx'; // matches the default export

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AdaptiveTypingSystem />
  </React.StrictMode>
);


