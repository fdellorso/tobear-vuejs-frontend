import axios from 'axios'
import router from '@/router'

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // Include credentials in the request headers
  withXSRFToken: true, // Include XSRF-TOKEN header in the request headers
})

const axiosCSRF = axios.create({
  baseURL: '', // es. https://tobearapi.rf.gd
  withCredentials: true, // Include credentials in the request headers
  withXSRFToken: true, // Include XSRF-TOKEN header in the request headers
})

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
      router.push({ name: 'Login' })
    }
    throw error
  },
)

export { axiosClient, axiosCSRF }
