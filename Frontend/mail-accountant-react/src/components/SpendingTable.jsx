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

function createData(name, calories, fat) {
  return {
    name,
    calories,
    fat,
    history: [
      {
        date: '2020-01-05',
        customerId: '11091700',
        amount: 3,
      },
      {
        date: '2020-01-02',
        customerId: 'Anonymous',
        amount: 1,
      },
    ],
  };
}

function Row(props) {
  const { row } = props;
  const [open, setOpen] = React.useState(false);

  let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

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
        <TableCell align="right">{row.calories}</TableCell>
        <TableCell align="right">{row.fat}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={4}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Table size="small" aria-label="purchases">
                <TableHead>
                </TableHead>
                <TableBody>
                    <EnhancedTable month={''} receipts={''}/>
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

Row.propTypes = {
  row: PropTypes.shape({
    calories: PropTypes.number.isRequired,
    carbs: PropTypes.number.isRequired,
    fat: PropTypes.number.isRequired,
    history: PropTypes.arrayOf(
      PropTypes.shape({
        amount: PropTypes.number.isRequired,
        customerId: PropTypes.string.isRequired,
        date: PropTypes.string.isRequired,
      }),
    ).isRequired,
    name: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
  }).isRequired,
};

const rows = [
    createData('January', 2100.11, 'Groceries'),
    createData('February', 1050.20, 'Tech Accessories'),
    createData('March', 4601.03, 'Appliances'),
    createData('April', 1550.85, 'Dining Out'),
    createData('May', 2800.50, 'Travel'),
    createData('June', 1200.00, 'Clothing'),
    createData('July', 950.75, 'Entertainment'),
    createData('August', 1800.90, 'Home Improvement'),
    createData('September', 2500.00, 'Groceries'),
    createData('October', 1400.60, 'Gifts'),
    createData('November', 3200.40, 'Electronics'),
    createData('December', 5100.00, 'Gifts')
];

export default function SpendingTable({receipts}) {
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
            {rows.map((row) => (
                <Row key={row.name} row={row} />
            ))}
            </TableBody>
        </Table>
        </TableContainer>
    </div>
  );
}
