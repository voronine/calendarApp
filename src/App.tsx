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

import { store, persistor } from './store/store';
import { addEvent, editEvent, deleteEvent, Event } from './store/eventsSlice';
import CalendarComponent from './components/CalendarComponent';
import EventForm from './components/EventForm';
import EventList from './components/EventList';
import { PersistGate } from 'redux-persist/integration/react';

const Stack = createNativeStackNavigator();

const MainScreen: React.FC = () => {
  const dispatch = useDispatch();
  const events = useSelector((state: any) => state.events.events) as Event[];

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
  const [repeatOption, setRepeatOption] = useState('Weekly');
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
    setRepeatOption('Weekly');
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
              <View style={styles.squareButton}>
                <Text style={styles.squareBracket}>{'<'}</Text>
              </View>
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
              <View style={styles.squareButton}>
                <Text style={styles.squareBracket}>{'>'}</Text>
              </View>
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
      <Stack.Navigator
        id={undefined} 
        initialRouteName="Main"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Main" component={MainScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <AppNavigator />
          </PersistGate>
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
    color: '#F6AE2D',
    fontSize: 16,
    marginBottom: 5,
  },
  weekNavigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weekContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  dayButton: {
    alignItems: 'center',
    marginHorizontal: 3,
    minWidth: '12%',
    paddingHorizontal: 5,
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
  squareButton: {
    width: 23,
    height: 23,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    marginHorizontal: 3,
  },
  squareBracket: {
    color: '#F6AE2D',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
