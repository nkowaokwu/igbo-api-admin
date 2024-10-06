import './services/firebase';
import '@heartexlabs/label-studio/build/static/css/main.css';
import 'react-phone-input-2/lib/style.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);
