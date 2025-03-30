import './SpendingTable.css' 

import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

import EnhancedTable from './EnhancedTable';

// Helper function to group receipts by month
function groupReceiptsByMonth(receipts) {
  const monthMap = {};
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  // Ensure receipts is an array before trying to use forEach
  if (!Array.isArray(receipts)) {
    console.error("receipts is not an array:", receipts);
    return monthMap; // Return empty object if receipts is not an array
  }
  
  receipts.forEach(receipt => {
    if (receipt.date) {
      const date = new Date(receipt.date);
      const monthIndex = date.getMonth();
      const monthName = months[monthIndex];
      
      if (!monthMap[monthName]) {
        monthMap[monthName] = {
          receipts: [],
          totalSpent: 0
        };
      }
      
      monthMap[monthName].receipts.push(receipt);
      
      // Add to total if total is not null
      if (receipt.total && !isNaN(parseFloat(receipt.total))) {
        monthMap[monthName].totalSpent += parseFloat(receipt.total);
      }
    }
  });
  
  return monthMap;
}

function Row(props) {
  const { row, monthReceipts } = props;
  const [open, setOpen] = React.useState(false);

  return (
    <React.Fragment>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          {row.name}
        </TableCell>
        <TableCell align="right">${row.totalSpent.toFixed(2)}</TableCell>
        <TableCell align="right">{row.receiptsCount}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={4}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Details
              </Typography>
              <EnhancedTable month={row.name} receipts={monthReceipts[row.name]?.receipts || []} />
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

Row.propTypes = {
  row: PropTypes.shape({
    name: PropTypes.string.isRequired,
    totalSpent: PropTypes.number.isRequired,
    receiptsCount: PropTypes.number.isRequired,
  }).isRequired,
  monthReceipts: PropTypes.object.isRequired
};

// Mock data for initial rendering
const mockRows = [
  { name: 'January', totalSpent: 0, receiptsCount: 0 },
  { name: 'February', totalSpent: 0, receiptsCount: 0 },
  { name: 'March', totalSpent: 0, receiptsCount: 0 },
  { name: 'April', totalSpent: 0, receiptsCount: 0 },
  { name: 'May', totalSpent: 0, receiptsCount: 0 },
  { name: 'June', totalSpent: 0, receiptsCount: 0 },
  { name: 'July', totalSpent: 0, receiptsCount: 0 },
  { name: 'August', totalSpent: 0, receiptsCount: 0 },
  { name: 'September', totalSpent: 0, receiptsCount: 0 },
  { name: 'October', totalSpent: 0, receiptsCount: 0 },
  { name: 'November', totalSpent: 0, receiptsCount: 0 },
  { name: 'December', totalSpent: 0, receiptsCount: 0 }
];

export default function SpendingTable(props) {
  // Extract receipts from response.data if it exists, otherwise use props.receipts directly
  // This handles both cases: when receipts is passed directly or as part of response.data
  const receiptsData = props.response?.data?.receipts || props.receipts || [];
  
  // Log information for debugging
  console.log("Props received:", props);
  console.log("Extracted receipts data:", receiptsData);
  
  // Group receipts by month
  const monthReceipts = groupReceiptsByMonth(receiptsData);
  
  // Create rows from grouped data
  const rows = Object.keys(monthReceipts).map(month => ({
    name: month,
    totalSpent: monthReceipts[month].totalSpent,
    receiptsCount: monthReceipts[month].receipts.length
  }));

  // Use mock data if no real data is available
  const displayRows = rows.length > 0 ? rows : mockRows;

  return (
    <div style={{ display: 'flex', justifyContent: 'center', margin: 'auto', minWidth: '800px'}}>
      <TableContainer component={Paper} className='SpendingTable'>
        <Table aria-label="a dense table" size="small">
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>Month</TableCell>
              <TableCell align="right">Total Money Spent</TableCell>
              <TableCell align="right">Total Entries</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayRows.map((row) => (
              <Row 
                key={row.name} 
                row={row} 
                monthReceipts={rows.length > 0 ? monthReceipts : {}} 
              />
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center" style={{ padding: '20px' }}>
                  <Typography color="textSecondary">
                    {Array.isArray(receiptsData) && receiptsData.length === 0 
                      ? "No receipt data available" 
                      : ""}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}