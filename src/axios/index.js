import axios from 'axios'
import router from '@/router'

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // Include credentials in the request headers
  withXSRFToken: true, // Include XSRF-TOKEN header in the request headers
})

const axiosCSRF = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL.replace('/api', ''),
  withCredentials: true, // Include credentials in the request headers
  withXSRFToken: true, // Include XSRF-TOKEN header in the request headers
})

/**
 * Helper per eseguire una richiesta protetta da CSRF
 * @param {Function} callback - Una funzione che ritorna una Promise (es. una richiesta axiosClient)
 * @returns {Promise}
 */
const withCSRF = (callback) => {
  return axiosCSRF.get('/sanctum/csrf-cookie').then(callback)
}

// axiosClient.interceptors.request.use((config) => {
//   config.headers.Authorization = `Bearer ${localStorage.getItem('token')}`

//   return config
// })

axiosClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      router.push({ name: 'Home' })
    }
    throw error
  },
)

export { axiosClient, axiosCSRF, withCSRF }
