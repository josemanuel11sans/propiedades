"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Search, Filter, Trash2, Edit, Eye } from "lucide-react"
import { api } from "../services/api"

export function PropertyList() {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState({
    disponible: "all",
    minPrice: "",
    maxPrice: "",
  })
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchProperties()
  }, [])

  const fetchProperties = async () => {
    try {
      setLoading(true)
      const response = await api.get("/inmuebles")
      setProperties(response.data)
      setError(null)
    } catch (err) {
      setError("Error al cargar las propiedades. Intente de nuevo.")
      console.error("Error fetching properties:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de querer eliminar esta propiedad?")) {
      try {
        await api.delete(`/inmuebles/${id}`)
        setProperties(properties.filter((property) => property._id !== id))
      } catch (err) {
        setError("Error al eliminar la propiedad. Intente de nuevo.")
        console.error("Error deleting property:", err)
      }
    }
  }

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters({
      ...filters,
      [name]: value,
    })
  }

  const toggleFilters = () => {
    setShowFilters(!showFilters)
  }

  const filteredProperties = properties.filter((property) => {
    // Search filter
    const matchesSearch = property.ubicacion.toLowerCase().includes(searchTerm.toLowerCase())

    // Availability filter
    const matchesAvailability =
      filters.disponible === "all" ||
      (filters.disponible === "available" && property.disponible) ||
      (filters.disponible === "rented" && !property.disponible)

    // Price filter
    const matchesMinPrice = !filters.minPrice || property.precio >= Number(filters.minPrice)
    const matchesMaxPrice = !filters.maxPrice || property.precio <= Number(filters.maxPrice)

    return matchesSearch && matchesAvailability && matchesMinPrice && matchesMaxPrice
  })

  return (
    <div className="property-list-container">
      <div className="list-header">
        <h1>Propiedades</h1>
        <Link to="/properties/new" className="btn btn-primary">
          Agregar nueva propiedad
        </Link>
      </div>

      <div className="search-filter-container">
        <div className="search-bar">
          <Search className="search-icon" />
          <input type="text" placeholder="Buscar por ubicación..." value={searchTerm} onChange={handleSearchChange} />
        </div>

        <button className="filter-toggle" onClick={toggleFilters}>
          <Filter className="filter-icon" />
          <span>Filtros</span>
        </button>
      </div>

      {showFilters && (
        <div className="filters-panel">
          <div className="filter-group">
            <label>Disponibilidad</label>
            <select name="disponible" value={filters.disponible} onChange={handleFilterChange}>
              <option value="all">Todas</option>
              <option value="available">Disponibles</option>
              <option value="rented">Rentadas</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Rango de Precio</label>
            <div className="price-inputs">
              <input
                type="number"
                name="minPrice"
                placeholder="Min"
                value={filters.minPrice}
                onChange={handleFilterChange}
              />
              <span>a</span>
              <input
                type="number"
                name="maxPrice"
                placeholder="Max"
                value={filters.maxPrice}
                onChange={handleFilterChange}
              />
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading">Cargando propiedades...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <>
          <div className="results-count">
            Mostrando {filteredProperties.length} de {properties.length} propiedades
          </div>

          <div className="property-table-container">
            <table className="property-table">
              <thead>
                <tr>
                  <th>Ubicación</th>
                  <th>Precio</th>
                  <th>Características</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredProperties.map((property) => (
                  <tr key={property._id}>
                    <td>{property.ubicacion}</td>
                    <td>${property.precio.toLocaleString()} MXN</td>
                    <td>
                      <div className="features-cell">
                        {property.caracteristicas.slice(0, 2).map((feature, index) => (
                          <span key={index} className="feature-tag">
                            {feature}
                          </span>
                        ))}
                        {property.caracteristicas.length > 2 && (
                          <span className="feature-more">+{property.caracteristicas.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${property.disponible ? "available" : "rented"}`}>
                        {property.disponible ? "Disponible" : "Rentada"}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <Link to={`/properties/${property._id}`} className="btn-icon" title="View">
                          <Eye className="icon" />
                        </Link>
                        <Link to={`/properties/edit/${property._id}`} className="btn-icon" title="Edit">
                          <Edit className="icon" />
                        </Link>
                        <button className="btn-icon delete" onClick={() => handleDelete(property._id)} title="Delete">
                          <Trash2 className="icon" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredProperties.length === 0 && (
            <div className="no-results">
              <p>No se encontraron propiedades con los criterios especificados</p>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setSearchTerm("")
                  setFilters({
                    disponible: "all",
                    minPrice: "",
                    maxPrice: "",
                  })
                }}
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

