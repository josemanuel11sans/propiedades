import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { Home } from "./components/Home"
import { PropertyList } from "./components/PropertyList"
import  PropertyDetail  from "./components/PropertyDetail"
import { PropertyForm } from "./components/PropertyForm"
import { Navbar } from "./components/Navbar"
import "./App.css"

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <main className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/properties" element={<PropertyList />} />
            <Route path="/properties/:id" element={<PropertyDetail />} />
            <Route path="/properties/new" element={<PropertyForm />} />
            <Route path="/properties/edit/:id" element={<PropertyForm />} />
          </Routes>
        </main>
        <footer className="footer">
          <p>{/*© {new Date().getFullYear()}*/} PropManager</p>
        </footer>
      </div>
    </Router>
  )
}

export default App

