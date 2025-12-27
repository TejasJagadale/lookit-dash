import * as React from "react";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

export default function BasicDateCalendar({
  onformat = "DD-MM-YYYY",
  onDate,
  onview,
  onopen,
  value,
}) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        value={value ? dayjs(value, onformat) : null}
        onChange={(newValue) => {
          if (!newValue) return;

          // 🔥 FORCE FORMAT HERE
          const formattedDate = dayjs(newValue).format(onformat);
          onDate(formattedDate);
        }}
        format={onformat}        // ✅ VERY IMPORTANT
        views={onview}
        openTo={onopen}
        slotProps={{
          textField: {
            fullWidth: true,
          },
        }}
      />
    </LocalizationProvider>
  );
}
