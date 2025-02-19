import React, { useState, useEffect } from 'react';
import { 
  SafeAreaView, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  TouchableWithoutFeedback,
  Keyboard,
  Alert, 
  Platform,
  FlatList,
  ScrollView,
  StyleSheet
} from 'react-native';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { configureStore, createSlice } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Calendar } from 'react-native-calendars';
import { 
  format, 
  parse, 
  isBefore, 
  parseISO, 
  addDays, 
  startOfWeek, 
  isSameHour, 
  addHours 
} from 'date-fns';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// --------------------- Redux Slice ---------------------
const eventsSlice = createSlice({
  name: 'events',
  initialState: [
    { 
      id: '1', 
      name: 'Встреча с клиентом', 
      start: format(new Date(), 'yyyy-MM-dd') + ' 10:00', 
      end: format(new Date(), 'yyyy-MM-dd') + ' 11:00', 
      repeat: 'Every Week', 
      date: format(new Date(), 'yyyy-MM-dd') 
    },
    { 
      id: '2', 
      name: 'Обед', 
      start: format(new Date(), 'yyyy-MM-dd') + ' 12:30', 
      end: format(new Date(), 'yyyy-MM-dd') + ' 13:30', 
      repeat: 'Every Week', 
      date: format(new Date(), 'yyyy-MM-dd') 
    },
  ],
  reducers: {
    setEvents: (state, action) => action.payload,
    addEvent: (state, action) => {
      state.push(action.payload);
    },
    editEvent: (state, action) => {
      const index = state.findIndex(ev => ev.id === action.payload.id);
      if (index !== -1) {
        state[index] = action.payload;
      }
    },
    deleteEvent: (state, action) => state.filter(ev => ev.id !== action.payload)
  }
});
const { setEvents, addEvent, editEvent, deleteEvent } = eventsSlice.actions;
const store = configureStore({
  reducer: {
    events: eventsSlice.reducer,
  },
});

// Функция-заготовка для планирования уведомлений
const scheduleNotification = (eventData) => {
  console.log('Schedule notification for', eventData);
};

// --------------------- CustomSelect ---------------------
// Самодельный компонент селекта с выпадающим списком, который открывается вверх
function CustomSelect({ value, onValueChange, options }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.customSelectContainer}>
      <TouchableOpacity onPress={() => setOpen(!open)} style={styles.customSelect}>
        <Text style={styles.customSelectText}>{value}</Text>
        <Text style={styles.customSelectArrow}>{open ? '▲' : '▼'}</Text>
      </TouchableOpacity>
      {open && (
        <View style={styles.customSelectDropdown}>
          {options.map(opt => (
            <TouchableOpacity 
              key={opt} 
              onPress={() => { 
                onValueChange(opt); 
                setOpen(false);
              }}
              style={styles.customSelectOptionContainer}
            >
              <Text style={styles.customSelectOption}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

// --------------------- MainScreen ---------------------
function MainScreen({ navigation, route }) {
  const dispatch = useDispatch();
  const events = useSelector(state => state.events);

  // Выбранная дата (по умолчанию – сегодня)
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  // Режим отображения: 'calendar' или 'day'
  const [viewMode, setViewMode] = useState('calendar');

  // Параметры события
  const [eventName, setEventName] = useState('');
  // Редактируемая дата (YYYY-MM-DD) и отдельные инпуты для времени
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
  const [editingEventId, setEditingEventId] = useState(null);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem('@events_v2');
        if (jsonValue != null) {
          dispatch(setEvents(JSON.parse(jsonValue)));
        }
      } catch (error) {
        console.error('Ошибка загрузки событий:', error);
      }
    };
    loadEvents();
  }, [dispatch]);

  useEffect(() => {
    const saveEvents = async () => {
      try {
        await AsyncStorage.setItem('@events_v2', JSON.stringify(events));
      } catch (error) {
        console.error('Ошибка сохранения событий:', error);
      }
    };
    saveEvents();
  }, [events]);

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

  useEffect(() => {
    if (route.params?.editEvent) {
      const { id, name, start, end, repeat, date } = route.params.editEvent;
      setEditingEventId(id);
      setEventName(name);
      const sTime = start && start.split(' ')[1] ? start.split(' ')[1] : '15:00';
      const eTime = end && end.split(' ')[1] ? end.split(' ')[1] : '15:00';
      setSelectedDate(date || format(new Date(), 'yyyy-MM-dd'));
      setStartTime(sTime);
      setEndTime(eTime);
      setRepeatOption(repeat || 'Every Day');
      setIsEditing(true);
    }
  }, [route.params]);

  useEffect(() => {
    setIsEditing(false);
    setEditingEventId(null);
    setEventName('');
  }, [viewMode]);

  useEffect(() => {
    if (viewMode === 'day') {
      if (selectedDate === format(new Date(), 'yyyy-MM-dd')) {
        setStartTime(format(new Date(), 'HH:00'));
        setEndTime(format(addHours(new Date(), 1), 'HH:00'));
      } else {
        setStartTime('15:00');
        setEndTime('15:00');
      }
    }
  }, [viewMode, selectedDate]);

  const handleSaveEvent = () => {
    if (!eventName.trim()) {
      Alert.alert('Ошибка', 'Введите название события');
      return;
    }
    const fullStart = `${selectedDate} ${startTime}`;
    const fullEnd = `${selectedDate} ${endTime}`;
    const start = parse(fullStart, 'yyyy-MM-dd HH:mm', new Date());
    const end = parse(fullEnd, 'yyyy-MM-dd HH:mm', new Date());
    const now = new Date();
    if (!isSameHour(start, now) && isBefore(start, now)) {
      Alert.alert('Ошибка', 'Дата и время начала не могут быть в прошлом');
      return;
    }
    if (isBefore(end, start)) {
      Alert.alert('Ошибка', 'Дата и время окончания не могут быть раньше начала');
      return;
    }
    const eventData = {
      id: isEditing ? editingEventId : Date.now().toString(),
      name: eventName.trim(),
      start: fullStart,
      end: fullEnd,
      repeat: repeatOption,
      date: selectedDate,
    };
    if (isEditing) {
      dispatch(editEvent(eventData));
      Alert.alert('Успех', 'Событие обновлено!');
    } else {
      dispatch(addEvent(eventData));
      Alert.alert('Успех', 'Событие сохранено!');
      scheduleNotification(eventData);
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

  const handleDayPress = (day) => {
    setSelectedDate(day.dateString);
    if (day.dateString !== format(new Date(), 'yyyy-MM-dd')) {
      setStartTime('15:00');
      setEndTime('15:00');
    }
    setViewMode('day');
  };

  const handleDaySelect = (day) => {
    setSelectedDate(day.date);
    if (day.date !== format(new Date(), 'yyyy-MM-dd')) {
      setStartTime('15:00');
      setEndTime('15:00');
    }
  };

  const handlePrevDay = () => {
    const prevDay = format(addDays(parseISO(selectedDate), -1), 'yyyy-MM-dd');
    setSelectedDate(prevDay);
    if (prevDay !== format(new Date(), 'yyyy-MM-dd')) {
      setStartTime('15:00');
      setEndTime('15:00');
    }
  };

  const handleNextDay = () => {
    const nextDay = format(addDays(parseISO(selectedDate), 1), 'yyyy-MM-dd');
    setSelectedDate(nextDay);
    if (nextDay !== format(new Date(), 'yyyy-MM-dd')) {
      setStartTime('15:00');
      setEndTime('15:00');
    }
  };

  const handleDeleteEvent = (id) => {
    dispatch(deleteEvent(id));
    Alert.alert('Событие удалено');
  };

  const renderRightActions = (progress, dragX, item) => {
    return (
      <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteEvent(item.id)}>
        <Text style={styles.deleteButtonText}>🗑️</Text>
      </TouchableOpacity>
    );
  };

  const computeMarkedDates = () => {
    const marks = {};
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
        selectedDotColor: '#fff'
      };
    } else {
      marks[selectedDate] = { selected: true, selectedColor: '#F6AE2D', selectedDotColor: '#fff' };
    }
    return marks;
  };

  const renderCalendar = () => (
    <Calendar
      current={format(new Date(), 'yyyy-MM-dd')}
      onDayPress={handleDayPress}
      style={styles.calendar}
      markingType={'multi-dot'}
      markedDates={computeMarkedDates()}
      theme={{
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
      }}
    />
  );

  const renderDayDetail = () => {
    const dayEvents = events.filter(ev => ev.date === selectedDate);
    const weekStart = startOfWeek(parseISO(selectedDate), { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const dayDate = addDays(weekStart, i);
      return {
        date: format(dayDate, 'yyyy-MM-dd'),
        label: format(dayDate, 'EEE'),
      };
    });
    return (
      <View style={styles.dayDetailContainer}>
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => setViewMode('calendar')}>
            <Text style={styles.backButton}>{'< Back to Calendar'}</Text>
          </TouchableOpacity>
          <View style={styles.weekNavigationContainer}>
            <TouchableOpacity onPress={handlePrevDay}>
              <Text style={styles.arrowButton}>◀</Text>
            </TouchableOpacity>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              contentContainerStyle={styles.weekContainer}
            >
              {weekDays.map((day) => (
                <TouchableOpacity 
                  key={day.date} 
                  style={[styles.dayButton, selectedDate === day.date && styles.dayButtonActive]} 
                  onPress={() => handleDaySelect(day)}
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
            <TouchableOpacity onPress={handleNextDay}>
              <Text style={styles.arrowButton}>▶</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={{ height: 200 }}>
          <FlatList
            data={dayEvents}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Swipeable
                renderRightActions={(progress, dragX) => renderRightActions(progress, dragX, item)}
                onSwipeableWillOpen={() => handleDeleteEvent(item.id)}
                overshootRight={false}
              >
                <TouchableOpacity onPress={() => {
                  setEditingEventId(item.id);
                  setEventName(item.name);
                  const [sDate, sTime] = item.start.split(' ');
                  const [eDate, eTime] = item.end.split(' ');
                  setSelectedDate(item.date);
                  setStartTime(sTime);
                  setEndTime(eTime);
                  setRepeatOption(item.repeat);
                  setIsEditing(true);
                }}>
                  <View style={styles.eventItem}>
                    <Text style={styles.eventName}>{item.name}</Text>
                    <Text style={styles.eventTime}>{item.start} - {item.end}</Text>
                  </View>
                </TouchableOpacity>
              </Swipeable>
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No events for this day</Text>
              </View>
            }
          />
        </View>
      </View>
    );
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        <View style={styles.topSection}>
          {viewMode === 'calendar' ? renderCalendar() : renderDayDetail()}
        </View>
        <View style={[styles.formContainer, { marginTop: 5 }]}>
          <Text style={styles.label}>Event Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Name"
            value={eventName}
            onChangeText={setEventName}
          />
          <Text style={styles.label}>Starts</Text>
          <View style={styles.row}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="YYYY-MM-DD"
              value={selectedDate}
              onChangeText={setSelectedDate}
            />
            <TextInput
              style={[styles.input, { flex: 1, marginLeft: 10 }]}
              placeholder="HH:mm"
              value={startTime}
              onChangeText={setStartTime}
            />
          </View>
          <Text style={styles.label}>Ends</Text>
          <View style={styles.row}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="YYYY-MM-DD"
              value={selectedDate}
              onChangeText={setSelectedDate}
            />
            <TextInput
              style={[styles.input, { flex: 1, marginLeft: 10 }]}
              placeholder="HH:mm"
              value={endTime}
              onChangeText={setEndTime}
            />
          </View>
          <Text style={styles.label}>Repeat</Text>
          <CustomSelect 
            value={repeatOption} 
            onValueChange={setRepeatOption} 
            options={["Every Day", "Every Week", "Every Year"]} 
          />
        </View>
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveEvent}>
          <Text style={styles.saveButtonText}>{isEditing ? 'SAVE' : 'UPDATE'}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

// --------------------- Старый DayDetailScreen (сохранён, но не используется) ---------------------
function DayDetailScreen({ route, navigation }) {
  const { date } = route.params;
  const [currentDate, setCurrentDate] = useState(date);
  const events = useSelector(state => state.events);
  
  const dayEvents = events.filter(ev => ev.date === currentDate);
  const weekStart = startOfWeek(parseISO(currentDate), { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const dayDate = addDays(weekStart, i);
    return {
      date: format(dayDate, 'yyyy-MM-dd'),
      label: format(dayDate, 'EEE'),
    };
  });

  const handleDaySelect = (day) => {
    setCurrentDate(day.date);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>{'< Back'}</Text>
        </TouchableOpacity>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.weekContainer}
        >
          {weekDays.map((day) => (
            <TouchableOpacity 
              key={day.date} 
              style={[styles.dayButton, currentDate === day.date && styles.dayButtonActive]} 
              onPress={() => handleDaySelect(day)}
            >
              <Text style={[styles.dayLabel, currentDate === day.date && styles.dayLabelActive]}>
                {day.label}
              </Text>
              <Text style={[styles.dayDate, currentDate === day.date && styles.dayDateActive]}>
                {day.date.substring(8)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <View style={{ height: 150 }}>
        <FlatList
          data={dayEvents}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => navigation.navigate('Main', { editEvent: item })}>
              <View style={styles.eventItem}>
                <Text style={styles.eventName}>{item.name}</Text>
                <Text style={styles.eventTime}>{item.start} - {item.end}</Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No events for this day</Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

// --------------------- Навигация ---------------------
const Stack = createNativeStackNavigator();
function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Main">
        <Stack.Screen name="Main" component={MainScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// --------------------- Основное приложение ---------------------
// Оборачиваем всё приложение в GestureHandlerRootView для корректной работы жестов
export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <AppNavigator />
      </Provider>
    </GestureHandlerRootView>
  );
}

// --------------------- Стили ---------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 30,
  },
  calendar: {
    borderBottomWidth: 1,
    borderColor: '#eee',
    marginBottom: 10,
  },
  topSection: {
    flex: 1,
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
  headerContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc'
  },
  backButton: {
    color: '#007AFF',
    fontSize: 16,
    marginBottom: 5
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
  eventItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderColor: '#eee'
  },
  eventName: {
    fontSize: 16,
  },
  eventTime: {
    fontSize: 14,
    color: '#888',
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
  dayDetailContainer: {
    flex: 1,
  },
});
