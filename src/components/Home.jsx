"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Building, DollarSign, Users, Star } from "lucide-react"
import { api } from "../services/api"

export function Home() {
  const [stats, setStats] = useState({
    totalProperties: 0,
    availableProperties: 0,
    activeContracts: 0,
    pendingRequests: 0,
  })

  const [featuredProperties, setFeaturedProperties] = useState([])

  useEffect(() => {
    // Fetch properties for stats and featured listings
    const fetchData = async () => {
      try {
        const response = await api.get("/inmuebles")
        const properties = response.data

        setFeaturedProperties(properties.slice(0, 3))

        setStats({
          totalProperties: properties.length,
          availableProperties: properties.filter((p) => p.disponible).length,
          activeContracts: properties.reduce(
            (acc, p) => acc + p.contratos.filter((c) => c.estado === "activo").length,
            0,
          ),
          pendingRequests: properties.reduce(
            (acc, p) => acc + p.solicitudes_renta.filter((s) => s.estado === "pendiente").length,
            0,
          ),
        })
      } catch (error) {
        console.error("Error fetching data:", error)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="home-container">
      <section className="hero">
        <h1>Sistema de gestión de propiedades</h1>
        <p>Administre sus propiedades, contratos e inquilinos en un solo lugar</p>
        <Link to="/properties" className="btn btn-primary">
          Ver propiedades
        </Link>
      </section>

      <section className="stats-section">
        <h2>Descripción general del panel de control</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <Building className="stat-icon" />
            <div className="stat-content">
              <h3>{stats.totalProperties}</h3>
              <p>Propiedades totales</p>
            </div>
          </div>
          <div className="stat-card">
            <DollarSign className="stat-icon" />
            <div className="stat-content">
              <h3>{stats.availableProperties}</h3>
              <p>Propiedades disponibles</p>
            </div>
          </div>
          {/* <div className="stat-card">
            <Users className="stat-icon" />
            <div className="stat-content">
              <h3>{stats.activeContracts}</h3>
              <p>Contratos activos</p>
            </div>
          </div> */}
          <div className="stat-card">
            <Star className="stat-icon" />
            <div className="stat-content">
              <h3>{stats.pendingRequests}</h3>
              <p>Solicitudes pendientes</p>
            </div>
          </div>
        </div>
      </section>

      <section className="featured-section">
        <h2>Propiedades Destacadas</h2>
        <div className="property-grid">
          {featuredProperties.map((property) => (
            <div key={property._id} className="property-card">
              <div className="property-image">
                {property.imagenes && property.imagenes.length > 0 ? (
                  <img src={property.imagenes[0] || "/placeholder.svg"} alt={property.ubicacion} />
                ) : (
                  <div className="placeholder-image">No Image</div>
                )}
                <div className="property-badge">{property.disponible ? "Available" : "Rented"}</div>
              </div>
              <div className="property-content">
                <h3>{property.ubicacion}</h3>
                <p className="property-price">${property.precio.toLocaleString()} MXN</p>
                <div className="property-features">
                  {property.caracteristicas.slice(0, 3).map((feature, index) => (
                    <span key={index} className="feature-tag">
                      {feature}
                    </span>
                  ))}
                </div>
                <Link to={`/properties/${property._id}`} className="btn btn-secondary">
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
        {featuredProperties.length === 0 && (
          <p className="no-data">No hay propiedades disponibles. ¡Añade tu primera propiedad!</p>
        )}
        <div className="view-all">
          <Link to="/properties" className="btn btn-outline">
            Ver todas las propiedades
          </Link>
        </div>
      </section>
    </div>
  )
}

