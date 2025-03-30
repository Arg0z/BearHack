import { useState } from 'react'
import './App.css'
import { HashRouter, Routes, Route } from 'react-router-dom'
import { Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage'
import HomePage from './pages/HomePage';

const isAuthenticated = () => {
  console.log("Checking authentication...");

  const params = new URLSearchParams(window.location.search);
  const urlAuthToken = params.get("access_token");
  const urlRefreshToken = params.get("refresh_token");
  const urlEmail = params.get("email");
  const urlExpiration = params.get("expires_at");

  console.log("URL Params:", { urlAuthToken, urlRefreshToken, urlEmail, urlExpiration });

  // Check if authentication parameters exist in the URL (fresh login)
  if (urlEmail && urlAuthToken && urlExpiration) {
    console.log("Saving new authentication data to sessionStorage...");
    sessionStorage.setItem("email", urlEmail);
    sessionStorage.setItem("authToken", urlAuthToken);
    sessionStorage.setItem("tokenExpiration", urlExpiration);
    sessionStorage.setItem("tokenRefresh", urlRefreshToken);
    return true;
  }

  // Retrieve locally stored token and expiration time
  const localToken = sessionStorage.getItem("authToken");
  const localTokenExpiration = sessionStorage.getItem("tokenExpiration");

  console.log("Local Storage Data:", { localToken, localTokenExpiration });

  // If no local token or expiration exists, return false
  if (!localToken || !localTokenExpiration) {
    console.log("No local token found. User needs to log in.");
    return false;
  }

  // Check if the local token has expired
  const now = Date.now() / 1000; // Current time in seconds
  console.log("Current Time:", now, "Token Expiration:", localTokenExpiration);

  if (now >= parseInt(localTokenExpiration)) {
    console.log("Token expired. Redirecting to login...");
    return false; // Token expired
  }

  console.log("Token is valid. User is authenticated.");
  return true; // Token is valid
};



function App() {
  return (
    <HashRouter>
      <Routes>
        {/* <Route path='/' element={<LandingPage />}/> */}
        <Route
          path="/"
          element={isAuthenticated() ? <HomePage /> : <LandingPage />} // If not authenticated, redirect to Landing
        />
      </Routes>
    </HashRouter>
  )
}

export default App
