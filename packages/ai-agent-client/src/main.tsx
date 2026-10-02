import React from 'react'
import ReactDOM from 'react-dom/client'
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary'
import { App } from './App.tsx'

function ErrorFallback({ error }: FallbackProps) {
  const err = error instanceof Error ? error : new Error(String(error))
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>Something went wrong!</h2>
      <pre style={{ color: 'red', textAlign: 'left' }}>
        {/* {err.message} */}
        {/* {'\n\n'} */}
        {err.stack}
      </pre>
      <button onClick={() => window.location.reload()}>Reload page</button>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <App />
  </ErrorBoundary>
)
