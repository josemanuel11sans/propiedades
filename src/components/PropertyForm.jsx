"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { X, Plus, Upload } from "lucide-react"
import { api } from "../services/api"

export function PropertyForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = !!id

  const [formData, setFormData] = useState({
    ubicacion: "",
    precio: "",
    caracteristicas: [""],
    disponible: true,
    imagenes: [],
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [imageFiles, setImageFiles] = useState([])
  const [imagePreviewUrls, setImagePreviewUrls] = useState([])

  useEffect(() => {
    if (isEditing) {
      fetchProperty()
    }
  }, [id])

  const fetchProperty = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/inmuebles/${id}`)
      const property = response.data

      setFormData({
        ubicacion: property.ubicacion,
        precio: property.precio,
        caracteristicas: property.caracteristicas.length > 0 ? property.caracteristicas : [""],
        disponible: property.disponible,
        imagenes: property.imagenes || [],
      })

      setImagePreviewUrls(property.imagenes || [])
      setError(null)
    } catch (err) {
      setError("Error loading property. Please try again.")
      console.error("Error fetching property:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  const handleFeatureChange = (index, value) => {
    const updatedFeatures = [...formData.caracteristicas]
    updatedFeatures[index] = value
    setFormData({
      ...formData,
      caracteristicas: updatedFeatures,
    })
  }

  const addFeatureField = () => {
    setFormData({
      ...formData,
      caracteristicas: [...formData.caracteristicas, ""],
    })
  }

  const removeFeatureField = (index) => {
    const updatedFeatures = formData.caracteristicas.filter((_, i) => i !== index)
    setFormData({
      ...formData,
      caracteristicas: updatedFeatures,
    })
  }

  const removeImage = (index) => {
    const updatedImages = formData.imagenes.filter((_, i) => i !== index)
    const updatedPreviews = imagePreviewUrls.filter((_, i) => i !== index)
    const updatedFiles = imageFiles.filter((_, i) => i !== index)

    setFormData({
      ...formData,
      imagenes: updatedImages,
    })
    setImagePreviewUrls(updatedPreviews)
    setImageFiles(updatedFiles)
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)

    if (files.length === 0) return

    const newFiles = [...imageFiles, ...files]
    setImageFiles(newFiles)

    // Create preview URLs for the new images
    const newPreviewUrls = files.map((file) => URL.createObjectURL(file))
    setImagePreviewUrls([...imagePreviewUrls, ...newPreviewUrls])
  }

  const uploadImages = async (propertyId) => {
    if (imageFiles.length === 0) return []

    const formData = new FormData()
    imageFiles.forEach((file) => {
        formData.append("imagenes", file)
    })

    try {
        const response = await api.post(`/inmuebles/${propertyId}/imagenes`, formData, {
            headers: { "Content-Type": "multipart/form-data" }
        })
        return response.data.imagenes // Retorna los IDs de las imágenes
    } catch (err) {
        console.error("Error uploading images:", err)
        throw new Error("Failed to upload images")
    }
}

const handleSubmit = async (e) => {
    e.preventDefault()
    try {
        setLoading(true)
        setError(null)

        if (!formData.ubicacion || !formData.precio) {
            setError("Please fill in all required fields")
            setLoading(false)
            return
        }

        const filteredFeatures = formData.caracteristicas.filter((feature) => feature.trim() !== "")

        const propertyData = {
            ...formData,
            precio: Number(formData.precio),
            caracteristicas: filteredFeatures,
        }

        let propertyId = id
        if (!isEditing) {
            const response = await api.post("/inmuebles", propertyData)
            propertyId = response.data._id
        } else {
            await api.put(`/inmuebles/${id}`, propertyData)
        }

        if (imageFiles.length > 0) {
            const uploadedImages = await uploadImages(propertyId)
            await api.put(`/inmuebles/${propertyId}`, {
                imagenes: [...formData.imagenes, ...uploadedImages]
            })
        }

        navigate("/properties")
    } catch (err) {
        setError("Error saving property. Please try again.")
        console.error("Error saving property:", err)
    } finally {
        setLoading(false)
    }
}

  if (loading && isEditing) {
    return <div className="loading">Loading property data...</div>
  }

  return (
    <div className="property-form-container">
      <h1>{isEditing ? "Edit Property" : "Add New Property"}</h1>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="property-form">
        <div className="form-group">
          <label htmlFor="ubicacion">Location *</label>
          <input
            type="text"
            id="ubicacion"
            name="ubicacion"
            value={formData.ubicacion}
            onChange={handleChange}
            required
            placeholder="Enter property address"
          />
        </div>

        <div className="form-group">
          <label htmlFor="precio">Price (MXN) *</label>
          <input
            type="number"
            id="precio"
            name="precio"
            value={formData.precio}
            onChange={handleChange}
            required
            min="0"
            placeholder="Enter monthly rent"
          />
        </div>

        <div className="form-group">
          <label>Features</label>
          {formData.caracteristicas.map((feature, index) => (
            <div key={index} className="feature-input">
              <input
                type="text"
                value={feature}
                onChange={(e) => handleFeatureChange(index, e.target.value)}
                placeholder="Enter a feature"
              />
              {formData.caracteristicas.length > 1 && (
                <button type="button" className="remove-btn" onClick={() => removeFeatureField(index)}>
                  <X className="icon" />
                </button>
              )}
            </div>
          ))}
          <button type="button" className="add-btn" onClick={addFeatureField}>
            <Plus className="icon" />
            Add Feature
          </button>
        </div>

        <div className="form-group">
          <label>Availability</label>
          <div className="checkbox-group">
            <input
              type="checkbox"
              id="disponible"
              name="disponible"
              checked={formData.disponible}
              onChange={handleChange}
            />
            <label htmlFor="disponible">Property is available for rent</label>
          </div>
        </div>

        <div className="form-group">
          <label>Images</label>
          <div className="image-upload-container">
            <label className="image-upload-label">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="image-upload-input"
              />
              <div className="upload-placeholder">
                <Upload className="icon" />
                <span>Click to upload images</span>
              </div>
            </label>
          </div>

          {imagePreviewUrls.length > 0 && (
            <div className="image-previews">
              {imagePreviewUrls.map((url, index) => (
                <div key={index} className="image-preview-item">
                  <img src={url || "/placeholder.svg"} alt={`Preview ${index + 1}`} />
                  <button type="button" className="remove-image-btn" onClick={() => removeImage(index)}>
                    <X className="icon" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate("/properties")}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Saving..." : isEditing ? "Update Property" : "Create Property"}
          </button>
        </div>
      </form>
    </div>
  )
}

