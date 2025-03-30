import './Selector.css';
import * as React from 'react';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormHelperText from '@mui/material/FormHelperText';

export default function Selector() {
  const [year, setYear] = React.useState('');

  const handleChange = (event) => {
    setYear(event.target.value);
  };

  // Generate an array of years in descending order, up to the current year
  const startYear = 2000;
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - startYear + 1 }, (_, i) => currentYear - i);

  return (
    <div className="Selector">
      <FormControl
        required
        sx={{
          m: 1,
          minWidth: 150,
          color: 'whitesmoke',
          '& .MuiInputLabel-root': {
            color: 'whitesmoke',
          },
          '& .MuiSelect-select': {
            color: 'whitesmoke',
          },
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: 'whitesmoke',
            },
            '&:hover fieldset': {
              borderColor: 'whitesmoke',
            },
            '&.Mui-focused fieldset': {
              borderColor: 'whitesmoke',
            },
          },
          '& .MuiSvgIcon-root': {
            color: 'whitesmoke',
          },
          '& .MuiFormHelperText-root': {
            color: 'whitesmoke',
          },
        }}
      >
        <InputLabel id="demo-simple-select-required-label" sx={{ color: 'whitesmoke' }}>
          Year
        </InputLabel>
        <Select
          labelId="demo-simple-select-required-label"
          id="demo-simple-select-required"
          value={year}
          label="Year *"
          onChange={handleChange}
          sx={{  }}
        >
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
          {years.map((y) => (
            <MenuItem key={y} value={y}>
              {y}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
}