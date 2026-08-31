import { Routes, Route } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import Dashboard from '../pages/Dashboard'
import Helpdesk from '../pages/Helpdesk'

function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/helpdesk" element={<Helpdesk />} />
      </Route>
    </Routes>
  )
}

export default AppRoutes