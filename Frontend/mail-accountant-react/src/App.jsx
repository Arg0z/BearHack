import { useState } from 'react'
import './App.css'
import { HashRouter, Routes, Route } from 'react-router-dom'
import { Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage'
import HomePage from './Pages/HomePage'

// Check if the user is authenticated
const isAuthenticated = () => {
  return localStorage.getItem("authToken") !== null;  // Check if authToken is in localStorage
};


function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path='/' element={<LandingPage />}/>
        <Route
          path="/home"
          element={isAuthenticated() ? <HomePage /> : <Navigate to="/" />} // If not authenticated, redirect to Landing
        />
      </Routes>
    </HashRouter>
  )
}

export default App
