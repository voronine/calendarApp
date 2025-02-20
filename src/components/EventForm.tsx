import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  StyleSheet,
  Modal,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import CustomSelect from './CustomSelect';

interface EventFormProps {
  eventName: string;
  setEventName: (name: string) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  startTime: string;
  setStartTime: (time: string) => void;
  endTime: string;
  setEndTime: (time: string) => void;
  repeatOption: string;
  setRepeatOption: (repeat: string) => void;
  onSave: () => void;
}

const formatDisplayDate = (date: string) => {
  if (!date) return 'Select Date';
  return format(new Date(date), 'MMM d, yyyy');
};

const formatDisplayTime = (date: string, time: string) => {
  if (!date || !time) return 'Select Time';
  return format(new Date(`${date} ${time}`), 'hh:mm a');
};

const EventForm: React.FC<EventFormProps> = ({
  eventName,
  setEventName,
  selectedDate,
  setSelectedDate,
  startTime,
  setStartTime,
  endTime,
  setEndTime,
  repeatOption,
  setRepeatOption,
  onSave,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');
  const [currentField, setCurrentField] = useState<'date' | 'startTime' | 'endTime' | null>(null);

  const openPicker = (field: 'date' | 'startTime' | 'endTime', mode: 'date' | 'time') => {
    setCurrentField(field);
    setPickerMode(mode);
    setShowPicker(true);
  };

  const onChange = (event: any, selected?: Date) => {
    if (event.type === 'dismissed' || !selected) {
      setShowPicker(false);
      setCurrentField(null);
      return;
    }
    if (currentField === 'date') {
      setSelectedDate(format(selected, 'yyyy-MM-dd'));
    } else if (currentField === 'startTime') {
      setStartTime(format(selected, 'HH:mm'));
    } else if (currentField === 'endTime') {
      setEndTime(format(selected, 'HH:mm'));
    }
    setShowPicker(false);
    setCurrentField(null);
  };

  const getDateValue = () => (selectedDate ? new Date(selectedDate) : new Date());
  const getStartTimeValue = () =>
    startTime ? new Date(`${selectedDate} ${startTime}`) : new Date();
  const getEndTimeValue = () =>
    endTime ? new Date(`${selectedDate} ${endTime}`) : new Date();

  return (
    <View style={styles.container}>
            <View style={styles.radioRow}>
        <Text style={styles.radioIcon}>●</Text>
        <Text style={styles.radioText}>Create New Event</Text>
      </View>
      
      <Text style={styles.label}>Event Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Every Name"
        value={eventName}
        onChangeText={setEventName}
      />

      <Text style={styles.label}>Starts</Text>
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.pickerButton, { marginRight: 8 }]}
          onPress={() => openPicker('date', 'date')}
        >
          <Text style={styles.pickerText}>{formatDisplayDate(selectedDate)}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.pickerButton}
          onPress={() => openPicker('startTime', 'time')}
        >
          <Text style={styles.pickerText}>{formatDisplayTime(selectedDate, startTime)}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Ends</Text>
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.pickerButton, { marginRight: 8 }]}
          onPress={() => openPicker('date', 'date')}
        >
          <Text style={styles.pickerText}>{formatDisplayDate(selectedDate)}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.pickerButton}
          onPress={() => openPicker('endTime', 'time')}
        >
          <Text style={styles.pickerText}>{formatDisplayTime(selectedDate, endTime)}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Repeat</Text>
      <CustomSelect
        value={repeatOption}
        onValueChange={setRepeatOption}
        options={['Weekly', 'Bi-weekly', 'Monthly', 'Not repeat']}
      />

      <TouchableOpacity style={styles.saveButton} onPress={onSave}>
        <Text style={styles.saveButtonText}>SAVE</Text>
      </TouchableOpacity>

      {showPicker && (
        <Modal transparent animationType="fade">
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowPicker(false)}
          >
            <View style={styles.modalContainer}>
              <DateTimePicker
                value={
                  currentField === 'date'
                    ? getDateValue()
                    : currentField === 'startTime'
                    ? getStartTimeValue()
                    : getEndTimeValue()
                }
                mode={pickerMode}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onChange}
              />
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 5,
    paddingHorizontal: 20,
  },
  label: {
    marginBottom: 5,
    fontSize: 16,
    color: '#555',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  pickerButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  pickerText: {
    fontSize: 16,
    color: '#333',
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
  },
  radioIcon: {
    marginRight: 8,
    fontSize: 14,
    color: '#F6AE2D',
  },
  radioText: {
    fontSize: 16,
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#F6AE2D',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
  },
});

export default EventForm;
