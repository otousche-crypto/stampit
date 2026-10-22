import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router'
import { FluidProvider } from '@/lib/fluid-provider'
import { Home } from '@/app/routes/Home'
import { AppearanceSwitch } from '@/app/AppearanceSwitch'

// The editor carries most of the UI kit: load it only on /create.
const Create = lazy(() => import('@/app/routes/Create').then((m) => ({ default: m.Create })))

export function App() {
  return (
    <FluidProvider>
      <BrowserRouter>
        <AppearanceSwitch />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/create"
            element={
              <Suspense fallback={<div className="h-dvh bg-background" aria-busy="true" />}>
                <Create />
              </Suspense>
            }
          />
          <Route path="*" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </FluidProvider>
  )
}
