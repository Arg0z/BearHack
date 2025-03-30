import './LandingPage.css'

import { GoogleLogin } from "@react-oauth/google"
import * as React from 'react';
import Button from '@mui/material/Button';
import GoogleIcon from '@mui/icons-material/Google';

export default function LandingPage() {
    return (
        <div className="LandingPage">
            {/* <GoogleLogin style={{color: 'black'}}
                onSuccess={(credentialResponse) => console.log(credentialResponse)} 
                onError={() => console.log("Login failed.")}/> */}
            <div>
                <h1>Welcome to Horosho Poshla!</h1>
                <h3>Your personal Email AI Accountant.</h3>
            </div>
            <Button href='https://127.0.0.1:8000/auth/login' variant="contained" color="success" startIcon={<GoogleIcon />}>Login with Google</Button>
        </div>
    )
}