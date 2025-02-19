import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Event } from '../store/eventsSlice';

interface EventItemProps {
  event: Event;
  onEdit: (event: Event) => void;
  onDelete: (id: string) => void;
}

const EventItem: React.FC<EventItemProps> = ({ event, onEdit, onDelete }) => {
  const renderRightActions = () => (
    <TouchableOpacity style={styles.deleteButton} onPress={() => onDelete(event.id)}>
      <Text style={styles.deleteButtonText}>🗑️</Text>
    </TouchableOpacity>
  );

  return (
    <Swipeable
      renderRightActions={renderRightActions}
      onSwipeableWillOpen={() => onDelete(event.id)}
      overshootRight={false}
    >
      <TouchableOpacity onPress={() => onEdit(event)}>
        <View style={styles.eventItem}>
          <Text style={styles.eventName}>{event.name}</Text>
          <Text style={styles.eventTime}>{event.start} - {event.end}</Text>
        </View>
      </TouchableOpacity>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  eventItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  eventName: {
    fontSize: 16,
  },
  eventTime: {
    fontSize: 14,
    color: '#888',
  },
  deleteButton: {
    backgroundColor: '#F6AE2D',
    justifyContent: 'center',
    alignItems: 'flex-end',
    padding: 20,
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default EventItem;
