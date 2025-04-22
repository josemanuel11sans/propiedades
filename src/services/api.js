import axios from "axios"
export const API_URL = "https://h4xrsaezrh.execute-api.us-east-1.amazonaws.com" //"http://localhost:3000"

// Create an axios instance with default config
export const api = axios.create({
  baseURL: "https://h4xrsaezrh.execute-api.us-east-1.amazonaws.com", // "http://localhost:3000", // Update this to match your Express backend URL
  headers: {
    "Content-Type": "application/json",
  },
})

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    // You can add auth tokens here if needed
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Add a response interceptor
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Handle common errors here
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error("API Error:", error.response.data)
    } else if (error.request) {
      // The request was made but no response was received
      console.error("Network Error:", error.request)
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Request Error:", error.message)
    }
    return Promise.reject(error)
  },
)

export const createRentalRequest = async (id, requestData) => {
  try {
    const response = await axios.post(`${API_URL}/inmuebles/${id}/solicitudes_renta`, requestData)
    return response.data
  } catch (error) {
    console.error(`Error creating rental request for inmueble with id ${id}:`, error)
    throw error
  }
}

export const fetchRentalRequests = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/inmuebles/${id}/solicitudes_renta`)
    return response.data
  } catch (error) {
    console.error(`Error fetching rental requests for inmueble with id ${id}:`, error)
    throw error
  }
}

export const createReview = async (id, reviewData) => {
  try {
    const response = await axios.post(`${API_URL}/inmuebles/${id}/resenas`, reviewData)
    return response.data
  } catch (error) {
    console.error(`Error creating review for inmueble with id ${id}:`, error)
    throw error
  }
}

// export const fetchReviews = async (id) => {
//   try {
//     const response = await axios.get(`${API_URL}/inmuebles/${id}/resenas`)
//     return response.data
//   } catch (error) {
//     console.error(`Error fetching reviews for inmueble with id ${id}:`, error)
//     throw error
//   }
// }


export const deleteInmueble = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/inmuebles/${id}`)
    return response.data
  } catch (error) {
    console.error(`Error deleting inmueble with id ${id}:`, error)
    throw error
  }
}
export const fetchInmuebleById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/inmuebles/${id}`)
    return response.data
  } catch (error) {
    console.error(`Error fetching inmueble with id ${id}:`, error)
    throw error
  }
}

export const fetchImagenes = async (ids) => {
  try {
    //para más de una imagen, se hace un request por cada id
    const requests = ids.map(id => axios.get(`${API_URL}/imagenes/${id}`));
    const responses = await Promise.all(requests);
    return responses.map(res => res.data); 
  } catch (error) {
    console.error("Error fetching imagenes:", error);
    throw error;
  }
};
