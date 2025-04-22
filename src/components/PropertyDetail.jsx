import { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { MapPin, DollarSign, Home, Calendar, User, Edit, Trash2, ChevronLeft, ChevronRight, Check, CircleDollarSign } from 'lucide-react'
import {
  fetchInmuebleById,
  deleteInmueble,
  createRentalRequest,
  fetchRentalRequests,
  fetchImagenes
} from "../services/api"
import { API_URL } from "../services/api.js"

export default function PropertyDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [property, setProperty] = useState(null)
  const [rentalRequests, setRentalRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("details")
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const [requestSubmitting, setRequestSubmitting] = useState(false)

  useEffect(() => {
    fetchPropertyData()
  }, [id])

  const fetchPropertyData = async () => {
    try {
      setLoading(true)
      const propertyData = await fetchInmuebleById(id)
      fetchImagenes(propertyData.imagenes).then((imagenes) => {
        propertyData.imagenes = imagenes.map(img => img.imageUrl)
        setProperty(propertyData)
      }).catch((error) => {
        console.error("Error fetching images:", error)
        setError("Error al cargar las imágenes del inmueble.")
      })
      setProperty(propertyData)

      // Fetch rental requests
      const requestsData = await fetchRentalRequests(id)
      setRentalRequests(requestsData)

      setError(null)
    } catch (err) {
      setError("Error al cargar los datos del inmueble. Por favor, intente de nuevo más tarde.")
      console.error("Error fetching property data:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (window.confirm("¿Está seguro de que desea eliminar este inmueble?")) {
      try {
        await deleteInmueble(id)
        navigate("/properties")
      } catch (err) {
        setError("Error al eliminar el inmueble. Por favor, intente de nuevo más tarde.")
        console.error("Error deleting property:", err)
      }
    }
  }

  const handleRentalRequest = async () => {
    try {
      setRequestSubmitting(true)
      const requestData = {
        inquilino_id: '64f5a53d1234567890abcdef', // ID de ejemplo, debería ser el ID del usuario actual
        estado: 'pendiente'
      }

      await createRentalRequest(id, requestData)

      // Refresh rental requests
      const requestsData = await fetchRentalRequests(id)
      setRentalRequests(requestsData)

      alert('Solicitud de renta enviada con éxito')
      setActiveTab('requests')
    } catch (err) {
      setError("Error al enviar la solicitud de renta. Por favor, intente de nuevo más tarde.")
      console.error("Error creating rental request:", err)
    } finally {
      setRequestSubmitting(false)
    }
  }

  const nextImage = () => {
    if (property?.imagenes?.length > 0) {
      setCurrentImageIndex((currentImageIndex + 1) % property.imagenes.length)
    }
  }

  const prevImage = () => {
    if (property?.imagenes?.length > 0) {
      setCurrentImageIndex((currentImageIndex - 1 + property.imagenes.length) % property.imagenes.length)
    }
  }

  if (loading) {
    return <div className="loading">Cargando detalles del inmueble...</div>
  }

  if (error) {
    return <div className="error-message">{error}</div>
  }

  if (!property) {
    return <div className="not-found">Inmueble no encontrado</div>
  }

  return (
    <div className="property-detail-container">
      <div className="detail-header">
        <Link to="/properties" className="back-link">
          <ChevronLeft className="icon" />
          Volver a Propiedades
        </Link>
        <div className="header-actions">
          <Link to={`/properties/edit/${id}`} className="btn btn-secondary">
            <Edit className="icon" />
            Editar
          </Link>
          <button className="btn btn-danger" onClick={handleDelete}>
            <Trash2 className="icon" />
            Eliminar
          </button>
        </div>
      </div>

      <div className="property-overview">
        <div className="image-gallery">
          {property.imagenes && property.imagenes.length > 0 ? (
            <>
              <div className="main-image">
                <img src={property.imagenes[currentImageIndex]} alt={property.ubicacion} />
                {property.imagenes.length > 1 && (
                  <>
                    <button className="gallery-nav prev" onClick={prevImage}>
                      <ChevronLeft className="icon" />
                    </button>
                    <button className="gallery-nav next" onClick={nextImage}>
                      <ChevronRight className="icon" />
                    </button>
                  </>
                )}
                <div className="image-counter">
                  {currentImageIndex + 1} / {property.imagenes.length}
                </div>
              </div>
            </>
          ) : (
            <div className="no-image">
              <Home className="placeholder-icon" />
              <p>No hay imágenes disponibles</p>
            </div>
          )}
        </div>

        <div className="property-summary">
          <div className={`status-badge-large ${property.disponible ? 'available' : 'unavailable'}`}>
            {property.disponible ? "Disponible" : "No Disponible"}
          </div>
          <h1>{property.ubicacion}</h1>

          <div className="property-meta">
            <div className="meta-item">
              <MapPin className="icon" />
              <span>{property.ubicacion}</span>
            </div>
            <div className="meta-item">
              <CircleDollarSign className="icon" />
              <span className="price">${property.precio.toLocaleString()} MXN</span>
            </div>
          </div>

          <div className="features-list">
            <h3>Características</h3>
            {property.caracteristicas && property.caracteristicas.length > 0 ? (
              <ul>
                {property.caracteristicas.map((feature, index) => (
                  <li key={index}>
                    <Check className="icon" />
                    {feature}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No hay características especificadas</p>
            )}
          </div>
        </div>
      </div>

      <div className="detail-tabs">
        {/*<button
          className={`tab-button ${activeTab === "details" ? "active" : ""}`}
          onClick={() => setActiveTab("details")}
        >
          Detalles
        </button>
        <button
          className={`tab-button ${activeTab === "contracts" ? "active" : ""}`}
          onClick={() => setActiveTab("contracts")}
        >
          Contratos ({property.contratos ? property.contratos.length : 0})
        </button>
        <button
          className={`tab-button ${activeTab === "requests" ? "active" : ""}`}
          onClick={() => setActiveTab("requests")}
        >
          Solicitudes ({rentalRequests ? rentalRequests.length : 0})
        </button>*/}
      </div>
    </div>
  )
}
