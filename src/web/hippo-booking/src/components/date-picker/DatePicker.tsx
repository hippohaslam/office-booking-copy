import DatePicker from "react-datepicker";
import "./DatePicker.scss";

type datePickerProps = {
  selectedDate: Date;
  inputOnChange: (date: Date | null) => void;
  adjustDate: (direction: "next" | "previous" | "today") => void;
  minDate?: Date | undefined;
  maxDate?: Date | undefined;
};

const CustomDatePicker = ({ selectedDate, inputOnChange, adjustDate, minDate, maxDate }: datePickerProps) => {
  const changeDate = (direction: "next" | "previous" | "today") => {
      if (direction === "next" &&
          maxDate != null &&
          selectedDate >= new Date(maxDate.setDate(maxDate.getDate() - 1))) {
          return;
      }
      if (direction === "previous" && minDate != null && selectedDate <= minDate) {
          return;
      }
      adjustDate(direction);
  }
  return (
    <div className='date-container'>
      <label id='date-picker-label'>Choose a date: </label>
      <div className='date-controls'>
        <button
          type='button'
          className='date-control date-button previous'
          aria-label='previous date'
          title='Previous date'
          onClick={() => changeDate("previous")}
        />
        <button
          type='button'
          className='date-control date-button today'
          aria-label='today'
          title='Today'
          onClick={() => changeDate("today")}
        >
          Today
        </button>
        <DatePicker
          minDate={minDate}
          maxDate={maxDate}
          wrapperClassName="date-input-wrapper"
          selected={selectedDate}
          onChange={inputOnChange}
          ariaLabelledBy='date-picker-label'
          showIcon
          toggleCalendarOnIconClick
          todayButton='Today'
          dateFormat={"dd/MM/yyyy"}
          icon={
            <svg xmlns='http://www.w3.org/2000/svg' height='20px' viewBox='0 -960 960 960' width='20px' fill='#000000'>
              <path d='M216-96q-29.7 0-50.85-21.5Q144-139 144-168v-528q0-29 21.15-50.5T216-768h72v-96h72v96h240v-96h72v96h72q29.7 0 50.85 21.5Q816-725 816-696v528q0 29-21.15 50.5T744-96H216Zm0-72h528v-360H216v360Zm0-432h528v-96H216v96Zm0 0v-96 96Zm264.21 216q-15.21 0-25.71-10.29t-10.5-25.5q0-15.21 10.29-25.71t25.5-10.5q15.21 0 25.71 10.29t10.5 25.5q0 15.21-10.29 25.71t-25.5 10.5Zm-156 0q-15.21 0-25.71-10.29t-10.5-25.5q0-15.21 10.29-25.71t25.5-10.5q15.21 0 25.71 10.29t10.5 25.5q0 15.21-10.29 25.71t-25.5 10.5Zm312 0q-15.21 0-25.71-10.29t-10.5-25.5q0-15.21 10.29-25.71t25.5-10.5q15.21 0 25.71 10.29t10.5 25.5q0 15.21-10.29 25.71t-25.5 10.5Zm-156 144q-15.21 0-25.71-10.29t-10.5-25.5q0-15.21 10.29-25.71t25.5-10.5q15.21 0 25.71 10.29t10.5 25.5q0 15.21-10.29 25.71t-25.5 10.5Zm-156 0q-15.21 0-25.71-10.29t-10.5-25.5q0-15.21 10.29-25.71t25.5-10.5q15.21 0 25.71 10.29t10.5 25.5q0 15.21-10.29 25.71t-25.5 10.5Zm312 0q-15.21 0-25.71-10.29t-10.5-25.5q0-15.21 10.29-25.71t25.5-10.5q15.21 0 25.71 10.29t10.5 25.5q0 15.21-10.29 25.71t-25.5 10.5Z' />
            </svg>
          }
          className='date-control date-input'
          calendarIconClassName='date-input-icon'
          calendarStartDay={1}
        />
        <button
          type='button'
          className='date-control date-button next'
          aria-label='next date'
          title='Next date'
          onClick={() => changeDate("next")}
        />
      </div>
    </div>
  );
};

export default CustomDatePicker;
