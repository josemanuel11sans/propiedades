import { Link } from "react-router-dom"
import { Home, Building, Plus, User } from "lucide-react"

export function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Building className="icon" />
        <h1>PropManager</h1>
      </div>
      <ul className="navbar-menu">
        <li>
          <Link to="/" className="navbar-item">
            <Home className="icon" />
            <span>Home</span>
          </Link>
        </li>
        <li>
          <Link to="/properties" className="navbar-item">
            <Building className="icon" />
            <span>Properties</span>
          </Link>
        </li>
        <li>
          <Link to="/properties/new" className="navbar-item">
            <Plus className="icon" />
            <span>Add Property</span>
          </Link>
        </li>
        {/* <li>
          <Link to="/profile" className="navbar-item">
            <User className="icon" />
            <span>Profile</span>
          </Link>
        </li> */}
      </ul>
    </nav>
  )
}

