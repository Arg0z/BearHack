import axios from 'axios'

// Create an instance of axios with the base URl
const api = axios.create({
    baseURL: 'http://localhost:8000' // Can change URL
})

export default api;