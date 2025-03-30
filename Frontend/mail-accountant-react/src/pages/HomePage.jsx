import './HomePage.css'

import { Button } from "@mui/material";
import SpendingTable from '../components/SpendingTable'
import Selector from '../components/Selector';

export default function HomePage() {
    const email = sessionStorage.getItem("email");
    return (
        <div className='HomePage'>
            <nav className='Navbar' style={{}}>
                <h2 style={{display: 'flex', flex: 'inline-flex', placeItems: 'center'}}>
                    Welcome back,  
                    <div style={{marginLeft: '0.5rem', color: 'aquamarine'}}>{email.substring(0, email.indexOf("@"))}</div>
                </h2>
                <Button variant="contained" color="primary" startIcon={''}>Fetch Latest Data</Button>
            </nav>

            <Selector/>

            <SpendingTable />
        </div>
    )
}