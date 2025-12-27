import React from 'react';
import { DatePicker } from 'antd';
const { RangePicker } = DatePicker;
const getYearMonth = date => date.year() * 12 + date.month();

// Disabled 7 days from the selected date
const disabled7DaysDate = (current, { from, type }) => {
  if (from) {
    const minDate = from.add(-6, 'days');
    const maxDate = from.add(6, 'days');
    switch (type) {
      case 'year':
        return current.year() < minDate.year() || current.year() > maxDate.year();
      case 'month':
        return (
          getYearMonth(current) < getYearMonth(minDate) ||
          getYearMonth(current) > getYearMonth(maxDate)
        );
      default:
        return Math.abs(current.diff(from, 'days')) >= 7;
    }
  }
  return false;
};

const AntDatePicker = ({ onDate }) => (
  <RangePicker
    style={{ width: '100%' }}
    disabledDate={disabled7DaysDate}
    onChange={(dates, dateStrings) => { onDate(`${dateStrings?.[0]}/${dateStrings?.[1]}`); }}
  />
);
export default AntDatePicker;