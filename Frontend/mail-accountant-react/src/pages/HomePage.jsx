import './HomePage.css'
import React, { useEffect, useState } from 'react';
import { Button } from "@mui/material";
import SpendingTable from '../components/SpendingTable';
import Selector from '../components/Selector';
import api from '../api.js'; // Assuming you have an axios instance set up here

export default function HomePage() {
    const email = sessionStorage.getItem("email");
    const [receipts, setReceipts] = useState({});
    const [selectedYear, setSelectedYear] = useState(''); // State to hold the selected year
    
    const fetchReceipts = async () => {
        try {
            // Retrieve access token
            const authToken = sessionStorage.getItem("authToken");

            if (!authToken) {
                console.error("Access token not found.");
                return;
            }

            // Calculate start and end dates for the API call
            const currentDate = new Date();
            const endDateTimestamp = Math.floor(currentDate.getTime() / 1000); // Current date in seconds
            console.log("end date: " + endDateTimestamp)

            const oneMonthAgoDate = new Date();
            oneMonthAgoDate.setMonth(currentDate.getMonth() - 1);
            const startDateTimestamp = Math.floor(oneMonthAgoDate.getTime() / 1000); // One month ago in seconds
            console.log("start date: " + startDateTimestamp);

            // Make the API call with start and end dates
            const response = await api.get('/emails/receipts', {
                params: {
                    access_token: authToken,
                    start: startDateTimestamp,
                    end: endDateTimestamp,
                },
            });

            setReceipts(response.data.receipts);
            sessionStorage.setItem('receipts', response.data);
            console.log(response.data);

        } catch (error) {
            console.error("Error fetching receipts:", error);
        }
    };
    
    // Callback function to handle year selection
    const handleYearChange = (year) => {
        setSelectedYear(year);
        // Trigger a re-sort of the fetched receipts
        if (receipts && receipts.length > 0) {
            const sortedReceipts = sortReceiptsByYear(receipts, year);
            // Update the state to display the sorted receipts
            // setReceipts(sortedReceipts);
            console.log("Receipts sorted by year:", sortedReceipts);
        }
    };

    // Function to sort receipts by year (example - adjust based on your data structure)
    const sortReceiptsByYear = (receipts, year) => {
        return receipts.sort((a, b) => {
            // Assuming your receipt object has a date property that can be parsed
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            const yearA = dateA.getFullYear();
            const yearB = dateB.getFullYear();

            if (yearA === parseInt(year) && yearB !== parseInt(year)) {
                return -1; // a comes first if it's in the selected year
            } else if (yearA !== parseInt(year) && yearB === parseInt(year)) {
                return 1; // b comes first if it's in the selected year
            } else {
                // If both are in the selected year or both are not, maintain original order
                return 0;
            }
        });
    };

    return (
        <div className='HomePage'>
            <nav className='Navbar' style={{}}>
                <h2 style={{ display: 'flex', placeItems: 'center' }}>
                    Welcome back,
                    <div style={{ marginLeft: '0.5rem', color: 'aquamarine' }}>{email.substring(0, email.indexOf("@"))}</div>
                </h2>
            </nav>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {/* Pass the callback to Selector */}
                <Selector onYearChange={handleYearChange} />
                <Button onClick={fetchReceipts} variant="contained" color="primary" startIcon={''}>
                    Fetch Latest Data
                </Button>
            </div>

            <SpendingTable receipts={receipts} /> {/* Pass receipts to SpendingTable */}
        </div>
    );
}