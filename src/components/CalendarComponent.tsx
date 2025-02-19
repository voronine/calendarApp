import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';

interface CalendarComponentProps {
  currentDate: string;
  onDayPress: (day: { dateString: string }) => void;
  markedDates: { [key: string]: any };
}

const CalendarComponent: React.FC<CalendarComponentProps> = ({ currentDate, onDayPress, markedDates }) => {
  const theme = {
    backgroundColor: '#ffffff',
    calendarBackground: '#ffffff',
    textSectionTitleColor: '#b6c1cd',
    selectedDayBackgroundColor: '#F6AE2D',
    selectedDayTextColor: '#ffffff',
    dayTextColor: '#2d4150',
    todayTextColor: '#F6AE2D',
    arrowColor: '#F6AE2D',
    monthTextColor: '#2d4150',
    textDayFontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    textMonthFontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    textDayHeaderFontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    textDayFontSize: 16,
    textMonthFontSize: 16,
    textDayHeaderFontSize: 14,
  };

  return (
    <Calendar
      current={currentDate}
      onDayPress={onDayPress}
      style={styles.calendar}
      markingType={'multi-dot'}
      markedDates={markedDates}
      theme={theme}
    />
  );
};

const styles = StyleSheet.create({
  calendar: {
    borderBottomWidth: 1,
    borderColor: '#eee',
    marginBottom: 10,
  },
});

export default CalendarComponent;
