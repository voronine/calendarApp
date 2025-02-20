import eventsReducer, { addEvent, editEvent, deleteEvent, Event } from './eventsSlice';

describe('eventsSlice', () => {
  const initialState = { events: [] };

  it('should add an event', () => {
    const newEvent: Event = {
      id: '1',
      name: 'Test Event',
      start: '2025-03-01 10:00',
      end: '2025-03-01 11:00',
      repeat: 'Weekly',
      date: '2025-03-01',
    };

    const state = eventsReducer(initialState, addEvent(newEvent));
    expect(state.events).toHaveLength(1);
    expect(state.events[0]).toEqual(newEvent);
  });

  it('should edit an event', () => {
    const existingEvent: Event = {
      id: '1',
      name: 'Old Name',
      start: '2025-03-01 10:00',
      end: '2025-03-01 11:00',
      repeat: 'Weekly',
      date: '2025-03-01',
    };
    const modifiedEvent = { ...existingEvent, name: 'New Name' };

    const stateWithEvent = { events: [existingEvent] };
    const state = eventsReducer(stateWithEvent, editEvent(modifiedEvent));
    expect(state.events[0].name).toBe('New Name');
  });

  it('should delete an event', () => {
    const existingEvent: Event = {
      id: '1',
      name: 'Event to delete',
      start: '2025-03-01 10:00',
      end: '2025-03-01 11:00',
      repeat: 'Weekly',
      date: '2025-03-01',
    };

    const stateWithEvent = { events: [existingEvent] };
    const state = eventsReducer(stateWithEvent, deleteEvent('1'));
    expect(state.events).toHaveLength(0);
  });
});
