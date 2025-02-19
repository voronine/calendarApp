import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
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
  return (
    <View style={styles.container}>
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
        options={["Weekly", "Bi-weekly", "Monthly"]}
      />
      <TouchableOpacity style={styles.saveButton} onPress={onSave}>
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
    marginTop: 20,
    borderRadius: 30,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default EventForm;
