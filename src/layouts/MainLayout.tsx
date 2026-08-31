import { Link, Outlet } from 'react-router-dom'

function MainLayout() {
  return (
    <div>
      <h1>Main Layout</h1>

      <nav>
        <Link to="/">Dashboard</Link>
        <Link to="/helpdesk">Helpdesk</Link>
      </nav>

      <Outlet />
    </div>
  )
}

export default MainLayout