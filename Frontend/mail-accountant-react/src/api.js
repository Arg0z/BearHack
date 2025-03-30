import axios from 'axios'

// Create an instance of axios with the base URl
const api = axios.create({
    baseURL: 'https://127.0.0.1:8000' // Can change URL
})

export default api;