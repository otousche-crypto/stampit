import { BrowserRouter, Route, Routes } from 'react-router'
import { FluidProvider } from '@/lib/fluid-provider'
import { Home } from '@/app/routes/Home'
import { Create } from '@/app/routes/Create'

export function App() {
  return (
    <FluidProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<Create />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </FluidProvider>
  )
}
