import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers';
// import dayjs from "dayjs";

export default function BasicDateCalendar({ onformat, onDate, onview, onopen }) {

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker onChange={(e) => { onDate(e.format(`${onformat}`)) }} views={onview} openTo={onopen} />
    </LocalizationProvider>
  );
}