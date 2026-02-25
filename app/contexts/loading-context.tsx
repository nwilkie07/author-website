import React from 'react'

type LoadingContextValue = {
  isLoading: (key: string) => boolean
  start: (key: string) => void
  stop: (key: string) => void
  run: <T>(key: string, fn: () => Promise<T>) => Promise<T>
}

const LoadingContext = React.createContext<LoadingContextValue | undefined>(undefined)

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Track loading counts per key
  const [counts, setCounts] = React.useState<Record<string, number>>({})

  const start = (key: string) => {
    setCounts((c) => ({ ...c, [key]: (c[key] ?? 0) + 1 }))
  }

  const stop = (key: string) => {
    setCounts((c) => ({ ...c, [key]: Math.max((c[key] ?? 0) - 1, 0) }))
  }

  const isLoading = (key: string) => {
    return (counts[key] ?? 0) > 0
  }

  const run = async <T,>(key: string, fn: () => Promise<T>): Promise<T> => {
    start(key)
    try {
      return await fn()
    } finally {
      stop(key)
    }
  }

  const value = { isLoading, start, stop, run }
  return <LoadingContext.Provider value={value}>{children}</LoadingContext.Provider>
}

export const useLoading = (): LoadingContextValue => {
  const ctx = React.useContext(LoadingContext)
  if (!ctx) throw new Error('useLoading must be used within a LoadingProvider')
  return ctx
}

export default LoadingContext
