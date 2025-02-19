import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Event {
  id: string;
  name: string;
  start: string;
  end: string;
  repeat: string;
  date: string;
}

const initialState: Event[] = [];

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    setEvents: (state, action: PayloadAction<Event[]>) => action.payload,
    addEvent: (state, action: PayloadAction<Event>) => {
      state.push(action.payload);
    },
    editEvent: (state, action: PayloadAction<Event>) => {
      const index = state.findIndex(ev => ev.id === action.payload.id);
      if (index !== -1) {
        state[index] = action.payload;
      }
    },
    deleteEvent: (state, action: PayloadAction<string>) =>
      state.filter(ev => ev.id !== action.payload),
  },
});

export const { setEvents, addEvent, editEvent, deleteEvent } = eventsSlice.actions;
export default eventsSlice.reducer;
