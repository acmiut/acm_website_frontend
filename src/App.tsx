import { Toaster } from 'react-hot-toast'

import './App.css'

function App() {
  return (
    <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'rgba(9, 15, 29, 0.92)',
            border: '1px solid rgba(148, 163, 184, 0.22)',
            borderRadius: '16px',
            boxShadow: '0 18px 50px rgba(0, 0, 0, 0.34)',
            color: '#eef6ff',
            cursor: 'pointer',
            direction: 'rtl',
          },
        }}
      />
  )
}

export default App
