import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { DrawingProvider } from './context/DrawingContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DrawingProvider>
      <App />
    </DrawingProvider>
  </StrictMode>,
)
