import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Event {
  id: string;
  name: string;
  start: string;
  end: string;
  repeat: string;
  date: string;
}

interface EventsState {
  events: Event[];
}

const initialState: EventsState = {
  events: [],
};

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    setEvents: (state, action: PayloadAction<Event[]>) => {
      state.events = action.payload;
    },
    addEvent: (state, action: PayloadAction<Event>) => {
      state.events.push(action.payload);
    },
    editEvent: (state, action: PayloadAction<Event>) => {
      const index = state.events.findIndex(ev => ev.id === action.payload.id);
      if (index !== -1) {
        state.events[index] = action.payload;
      }
    },
    deleteEvent: (state, action: PayloadAction<string>) => {
      state.events = state.events.filter(ev => ev.id !== action.payload);
    },
  },
});

export const { setEvents, addEvent, editEvent, deleteEvent } = eventsSlice.actions;
export default eventsSlice.reducer;
