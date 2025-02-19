import React, { useState, useEffect } from 'react';
import { 
  SafeAreaView, 
  TouchableWithoutFeedback, 
  Keyboard, 
  StyleSheet, 
  View, 
  TouchableOpacity, 
  Text 
} from 'react-native';
import { GestureHandlerRootView, ScrollView } from 'react-native-gesture-handler';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { format, parseISO, addDays, startOfWeek, addHours } from 'date-fns';

import { store } from './store/store';
import { setEvents, addEvent, editEvent, deleteEvent, Event } from './store/eventsSlice';
import CalendarComponent from './components/CalendarComponent';
import EventForm from './components/EventForm';
import EventList from './components/EventList';

const Stack = createNativeStackNavigator();

const MainScreen: React.FC = () => {
  const dispatch = useDispatch();
  const events = useSelector((state: any) => state.events) as Event[];

  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [viewMode, setViewMode] = useState<'calendar' | 'day'>('calendar');

  const [eventName, setEventName] = useState('');
  const [startTime, setStartTime] = useState(
    selectedDate === format(new Date(), 'yyyy-MM-dd')
      ? format(new Date(), 'HH:00')
      : '15:00'
  );
  const [endTime, setEndTime] = useState(
    selectedDate === format(new Date(), 'yyyy-MM-dd')
      ? format(addHours(new Date(), 1), 'HH:00')
      : '15:00'
  );
  const [repeatOption, setRepeatOption] = useState('Every Day');
  const [isEditing, setIsEditing] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  useEffect(() => {
    const updateDefaultTimes = () => {
      const now = new Date();
      const todayStr = format(now, 'yyyy-MM-dd');
      if (selectedDate === todayStr && !isEditing) {
        setStartTime(format(now, 'HH:00'));
        setEndTime(format(addHours(now, 1), 'HH:00'));
      }
    };
    updateDefaultTimes();
    const interval = setInterval(updateDefaultTimes, 60000);
    return () => clearInterval(interval);
  }, [selectedDate, isEditing]);

  const handleSaveEvent = () => {
    if (!eventName.trim()) return alert('Please enter event name');
    const fullStart = `${selectedDate} ${startTime}`;
    const fullEnd = `${selectedDate} ${endTime}`;
    const newEvent: Event = {
      id: isEditing && editingEventId ? editingEventId : Date.now().toString(),
      name: eventName.trim(),
      start: fullStart,
      end: fullEnd,
      repeat: repeatOption,
      date: selectedDate,
    };
    if (isEditing) {
      dispatch(editEvent(newEvent));
    } else {
      dispatch(addEvent(newEvent));
    }
    setEventName('');
    if (selectedDate === format(new Date(), 'yyyy-MM-dd')) {
      setStartTime(format(new Date(), 'HH:00'));
      setEndTime(format(addHours(new Date(), 1), 'HH:00'));
    } else {
      setStartTime('15:00');
      setEndTime('15:00');
    }
    setRepeatOption('Every Day');
    setIsEditing(false);
    setEditingEventId(null);
  };

  const handleDeleteEvent = (id: string) => {
    dispatch(deleteEvent(id));
    alert('Event deleted');
  };

  const computeMarkedDates = () => {
    const marks: { [key: string]: any } = {};
    events.forEach(ev => {
      if (!marks[ev.date]) {
        marks[ev.date] = { dots: [{ key: 'event', color: '#F6AE2D' }] };
      }
    });
    if (marks[selectedDate]) {
      marks[selectedDate] = {
        ...marks[selectedDate],
        selected: true,
        selectedColor: '#F6AE2D',
        selectedDotColor: '#fff',
      };
    } else {
      marks[selectedDate] = {
        selected: true,
        selectedColor: '#F6AE2D',
        selectedDotColor: '#fff',
      };
    }
    return marks;
  };

  const renderCalendarView = () => (
    <CalendarComponent
      currentDate={selectedDate}
      onDayPress={(day) => {
        setSelectedDate(day.dateString);
        setViewMode('day');
      }}
      markedDates={computeMarkedDates()}
    />
  );

  const renderDayDetailView = () => {
    const weekStart = startOfWeek(parseISO(selectedDate), { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const dayDate = addDays(weekStart, i);
      return {
        date: format(dayDate, 'yyyy-MM-dd'),
        label: format(dayDate, 'EEE'),
      };
    });
    const dayEvents = events.filter(ev => ev.date === selectedDate);
    return (
      <View style={{ flex: 1 }}>
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => setViewMode('calendar')}>
            <Text style={styles.backButton}>{'< Back to Calendar'}</Text>
          </TouchableOpacity>
          <View style={styles.weekNavigationContainer}>
            <TouchableOpacity onPress={() => setSelectedDate(format(addDays(parseISO(selectedDate), -1), 'yyyy-MM-dd'))}>
              <Text style={styles.arrowButton}>◀</Text>
            </TouchableOpacity>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.weekContainer}>
              {weekDays.map((day) => (
                <TouchableOpacity
                  key={day.date}
                  style={[
                    styles.dayButton,
                    selectedDate === day.date && styles.dayButtonActive,
                  ]}
                  onPress={() => setSelectedDate(day.date)}
                >
                  <Text style={[styles.dayLabel, selectedDate === day.date && styles.dayLabelActive]}>
                    {day.label}
                  </Text>
                  <Text style={[styles.dayDate, selectedDate === day.date && styles.dayDateActive]}>
                    {day.date.substring(8)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity onPress={() => setSelectedDate(format(addDays(parseISO(selectedDate), 1), 'yyyy-MM-dd'))}>
              <Text style={styles.arrowButton}>▶</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={{ height: 200 }}>
          <EventList 
            events={dayEvents} 
            onEdit={(event) => {
              setEditingEventId(event.id);
              setEventName(event.name);
              const [sDate, sTime] = event.start.split(' ');
              const [eDate, eTime] = event.end.split(' ');
              setSelectedDate(event.date);
              setStartTime(sTime);
              setEndTime(eTime);
              setRepeatOption(event.repeat);
              setIsEditing(true);
            }} 
            onDelete={handleDeleteEvent} 
          />
        </View>
      </View>
    );
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        <View style={styles.topSection}>
          {viewMode === 'calendar' ? renderCalendarView() : renderDayDetailView()}
        </View>
        <EventForm 
          eventName={eventName}
          setEventName={setEventName}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          startTime={startTime}
          setStartTime={setStartTime}
          endTime={endTime}
          setEndTime={setEndTime}
          repeatOption={repeatOption}
          setRepeatOption={setRepeatOption}
          onSave={handleSaveEvent}
        />
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator id={undefined} initialRouteName="Main" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={MainScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <AppNavigator />
      </Provider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 30,
  },
  topSection: {
    flex: 1,
  },
  headerContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  backButton: {
    color: '#007AFF',
    fontSize: 16,
    marginBottom: 5,
  },
  weekContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  weekNavigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  arrowButton: {
    fontSize: 20,
    color: '#007AFF',
    paddingHorizontal: 10,
  },
  dayButton: {
    alignItems: 'center',
    marginHorizontal: 10,
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
  },
  dayButtonActive: {
    backgroundColor: '#F6AE2D',
  },
  dayLabel: {
    fontSize: 16,
    color: '#333',
  },
  dayLabelActive: {
    color: '#fff',
  },
  dayDate: {
    fontSize: 14,
    color: '#555',
  },
  dayDateActive: {
    color: '#fff',
  },
  customSelectContainer: {
    position: 'relative',
    marginBottom: 5,
  },
  customSelect: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
    justifyContent: 'space-between',
  },
  customSelectText: {
    fontSize: 16,
    color: '#333',
  },
  customSelectArrow: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  customSelectDropdown: {
    position: 'absolute',
    bottom: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    zIndex: 10,
  },
  customSelectOptionContainer: {
    padding: 8,
  },
  customSelectOption: {
    fontSize: 16,
    color: '#333',
  },
  formContainer: {
    paddingHorizontal: 20,
    marginTop: 5,
  },
  label: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
    fontSize: 16,
    marginBottom: 5,
  },
  row: {
    flexDirection: 'row',
  },
  saveButton: {
    backgroundColor: '#F6AE2D',
    paddingVertical: 12,
    marginHorizontal: 20,
    marginTop: 30,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'flex-end',
    padding: 20,
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
  },
});
