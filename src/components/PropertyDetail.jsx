
import { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { MapPin, DollarSign, Home, Calendar, User, Star, Edit, Trash2, ChevronLeft, ChevronRight, Check, X, MessageSquare } from 'lucide-react'
import { 
  fetchInmuebleById, 
  deleteInmueble, 
  createRentalRequest, 
  fetchRentalRequests, 
  createReview, 
  fetchReviews 
} from "../services/api"

export default function PropertyDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [property, setProperty] = useState(null)
  const [rentalRequests, setRentalRequests] = useState([])
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("details")
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  
  // Form states
  const [reviewForm, setReviewForm] = useState({
    inquilino_id: '64f5a53d1234567890abcdef', // ID de ejemplo, debería ser el ID del usuario actual
    calificacion: 5,
    comentario: ''
  })
  
  const [requestSubmitting, setRequestSubmitting] = useState(false)
  const [reviewSubmitting, setReviewSubmitting] = useState(false)

  useEffect(() => {
    fetchPropertyData()
  }, [id])

  const fetchPropertyData = async () => {
    try {
      setLoading(true)
      const propertyData = await fetchInmuebleById(id)
  
      // Convertir imágenes almacenadas en MongoDB a URLs utilizables
      if (propertyData.imagenes && propertyData.imagenes.length > 0) {
        propertyData.imagenes = propertyData.imagenes.map(img => `data:image/jpeg;base64,${img}`)
      }
  
      setProperty(propertyData)
  
      // Fetch rental requests
      const requestsData = await fetchRentalRequests(id)
      setRentalRequests(requestsData)
  
      // Fetch reviews
      const reviewsData = await fetchReviews(id)
      setReviews(reviewsData)
  
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

  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    
    if (!reviewForm.comentario.trim()) {
      alert('Por favor, escriba un comentario para su reseña')
      return
    }
    
    try {
      setReviewSubmitting(true)
      await createReview(id, reviewForm)
      
      // Refresh reviews
      const reviewsData = await fetchReviews(id)
      setReviews(reviewsData)
      
      // Reset form
      setReviewForm({
        ...reviewForm,
        comentario: '',
        calificacion: 5
      })
      
      alert('Reseña enviada con éxito')
    } catch (err) {
      setError("Error al enviar la reseña. Por favor, intente de nuevo más tarde.")
      console.error("Error creating review:", err)
    } finally {
      setReviewSubmitting(false)
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
              <DollarSign className="icon" />
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

          {property.disponible && (
            <div className="rental-request-action">
              <button 
                className="btn btn-primary btn-lg" 
                onClick={handleRentalRequest}
                disabled={requestSubmitting}
              >
                {requestSubmitting ? 'Enviando solicitud...' : 'Solicitar Renta'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="detail-tabs">
        <button
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
        </button>
        <button
          className={`tab-button ${activeTab === "reviews" ? "active" : ""}`}
          onClick={() => setActiveTab("reviews")}
        >
          Reseñas ({reviews ? reviews.length : 0})
        </button>
      </div>

      <div className="tab-content">
        {activeTab === "details" && (
          <div className="details-tab">
            <h2>Detalles del Inmueble</h2>
            <p>
              Este inmueble está ubicado en {property.ubicacion} y actualmente está
              {property.disponible ? " disponible para renta" : " no disponible"}.
            </p>
            <p>El precio de renta mensual es de ${property.precio.toLocaleString()} MXN.</p>
          </div>
        )}

        {activeTab === "contracts" && (
          <div className="contracts-tab">
            <h2>Contratos</h2>
            {property.contratos && property.contratos.length > 0 ? (
              <div className="contracts-list">
                {property.contratos.map((contract, index) => (
                  <div key={index} className="contract-card">
                    <div className="contract-header">
                      <h3>Contrato #{index + 1}</h3>
                      <span className={`contract-status ${contract.estado}`}>
                        {contract.estado.charAt(0).toUpperCase() + contract.estado.slice(1)}
                      </span>
                    </div>
                    <div className="contract-details">
                      <div className="detail-row">
                        <span className="label">ID Inquilino:</span>
                        <span className="value">{contract.inquilino_id}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Período:</span>
                        <span className="value">
                          {new Date(contract.fecha_inicio).toLocaleDateString()} -
                          {new Date(contract.fecha_fin).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Renta Mensual:</span>
                        <span className="value">${contract.monto_renta.toLocaleString()} MXN</span>
                      </div>
                    </div>

                    <div className="payments-section">
                      <h4>Pagos de Renta</h4>
                      {contract.pagos_renta && contract.pagos_renta.length > 0 ? (
                        <table className="payments-table">
                          <thead>
                            <tr>
                              <th>Fecha</th>
                              <th>Monto</th>
                              <th>Estado</th>
                            </tr>
                          </thead>
                          <tbody>
                            {contract.pagos_renta.map((payment, payIndex) => (
                              <tr key={payIndex}>
                                <td>{new Date(payment.fecha).toLocaleDateString()}</td>
                                <td>${payment.monto.toLocaleString()} MXN</td>
                                <td>
                                  <span className={`payment-status ${payment.estado}`}>
                                    {payment.estado.charAt(0).toUpperCase() + payment.estado.slice(1)}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <p className="no-data">No hay pagos registrados aún</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data">No hay contratos disponibles para este inmueble</p>
            )}
          </div>
        )}

        {activeTab === "requests" && (
          <div className="requests-tab">
            <h2>Solicitudes de Renta</h2>
            {rentalRequests && rentalRequests.length > 0 ? (
              <div className="requests-list">
                {rentalRequests.map((request, index) => (
                  <div key={index} className="request-card">
                    <div className="request-header">
                      <div className="request-meta">
                        <User className="icon" />
                        <span>ID Inquilino: {request.inquilino_id}</span>
                      </div>
                      <span className={`request-status ${request.estado}`}>
                        {request.estado.charAt(0).toUpperCase() + request.estado.slice(1)}
                      </span>
                    </div>
                    <div className="request-body">
                      <div className="detail-row">
                        <span className="label">Fecha de Solicitud:</span>
                        <span className="value">{new Date(request.fecha_solicitud).toLocaleDateString()}</span>
                      </div>
                    </div>
                    {request.estado === 'pendiente' && (
                      <div className="request-actions">
                        <button className="btn btn-success">
                          <Check className="icon" />
                          Aprobar
                        </button>
                        <button className="btn btn-danger">
                          <X className="icon" />
                          Rechazar
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data">No hay solicitudes de renta para este inmueble</p>
            )}
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="reviews-tab">
            <h2>Reseñas</h2>
            
            <div className="add-review-form">
              <h3>Agregar Reseña</h3>
              <form onSubmit={handleReviewSubmit}>
                <div className="form-group">
                  <label>Calificación:</label>
                  <div className="rating-input">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`star ${i < reviewForm.calificacion ? "filled" : ""}`}
                        onClick={() => setReviewForm({...reviewForm, calificacion: i + 1})}
                      />
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="comentario">Comentario:</label>
                  <textarea
                    id="comentario"
                    value={reviewForm.comentario}
                    onChange={(e) => setReviewForm({...reviewForm, comentario: e.target.value})}
                    required
                    placeholder="Comparta su experiencia con este inmueble..."
                  />
                </div>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={reviewSubmitting}
                >
                  {reviewSubmitting ? 'Enviando...' : 'Enviar Reseña'}
                </button>
              </form>
            </div>
            
            <div className="reviews-list">
              <h3>Reseñas Anteriores</h3>
              {reviews && reviews.length > 0 ? (
                <div className="reviews-grid">
                  {reviews.map((review, index) => (
                    <div key={index} className="review-card">
                      <div className="review-header">
                        <div className="reviewer">
                          <User className="icon" />
                          <span>ID Inquilino: {review.inquilino_id}</span>
                        </div>
                        <div className="rating">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`star ${i < review.calificacion ? "filled" : ""}`}
                            />
                          ))}
                          <span>{review.calificacion.toFixed(1)}</span>
                        </div>
                      </div>
                      <div className="review-body">
                        <MessageSquare className="icon" />
                        <p>{review.comentario}</p>
                      </div>
                      <div className="review-footer">
                        <Calendar className="icon" />
                        <span>{new Date(review.fecha).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-data">No hay reseñas para este inmueble</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
