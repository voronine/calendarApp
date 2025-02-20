Calendar Event Scheduling App Documentation
Overview
The Calendar Event Scheduling App is a mobile scheduling application that allows users to create, manage, and repeat events. The app displays a calendar where users can select specific dates to view events. Users can:

Create a new event:
Enter an event name, set start and end times, and choose a repeat option. Available repeat options are "Weekly," "Bi-weekly," "Monthly," and "No Repeat." The event is confirmed by clicking the "SAVE" button.
Edit an existing event:
Modify the event name, time, or repeat option.
Delete an event:
Remove an event by swiping left on the event item.
View events:
Dates with scheduled events are highlighted in the calendar.
Event data is stored locally using Redux, redux‑persist, and Async Storage, ensuring that event information is retained even after the app is restarted.

Application Architecture
2.1. Entry Point (App.tsx)
The application is bootstrapped in the main component, where several wrapper components are used:

GestureHandlerRootView: Ensures proper handling of gestures.
Redux Provider: Supplies the Redux store to all child components.
PersistGate: Delays rendering until the persisted state (stored in Async Storage) is rehydrated.
AppNavigator: Manages navigation between different screens of the app.
2.2. Redux Store and Persistence
In the store.ts file, the Redux store is created using Redux Toolkit:

redux‑persist and Async Storage: The state is saved and restored across sessions.
persistConfig: Configures redux‑persist with a key and Async Storage as the storage engine.
persistReducer: Wraps the events reducer so that the state is persisted.
Middleware: Configured to ignore specific redux‑persist actions during serialization.
Persistor: Created for use in PersistGate to rehydrate state when the app launches.
2.3. Events Slice (eventsSlice.ts)
The events slice manages the events state. It includes:

Event Interface: Defines the structure of an event (id, name, start, end, repeat, date).
Initial State: Starts with an empty events list.
Reducers:
setEvents: Sets the complete list of events.
addEvent: Adds a new event to the list.
editEvent: Finds an event by id and updates it.
deleteEvent: Removes an event by id.
2.4. Main Screen (MainScreen.tsx)
The MainScreen component implements the core functionality:

Calendar and Day Views:
In "calendar" mode, the app displays a calendar (using CalendarComponent) with highlighted dates that have events. The header shows the current month (e.g., "February 2025"). When a user taps a date, the view switches to the detailed "day" view.

Event Form and List:
The EventForm component allows users to create or edit events. Users enter an event name, choose a date, set start and end times, and select a repeat option. The handleSaveEvent function gathers data from the form, constructs an event object (with complete start/end times), and dispatches an action (add or edit) to update the Redux store. After saving, the form fields are reset and the view mode switches to "day."

Event Deletion:
The EventList component displays events for the selected day. Deletion is implemented via a swipe gesture (using react-native-swipe-gestures) that triggers the deletion of an event.

Default Time Updates:
A useEffect hook automatically updates the default start and end times for new events on the current day at regular intervals.

Marked Dates:
The computeMarkedDates function aggregates events by date and prepares an object with markers that is passed to CalendarComponent to visually highlight dates with events.

How to Use the App
Viewing the Calendar
Upon launching the app, the calendar view is displayed with a header showing the current month (e.g., "February 2025").
Tapping on a date switches the view to show the events scheduled for that day.
Creating a New Event
In the day view, a form is provided at the bottom.
Enter the event name in the "Every Name" input field.
Adjust the start and end times as needed (defaults update automatically for today's date).
Choose a repeat option from the available choices: "Weekly," "Bi-weekly," "Monthly," or "No Repeat."
Press the "SAVE" button to create the event.
After saving, the form resets and the new event appears in the day's list.
Editing an Event
Tap on an event from the list to open the edit form with pre-filled data.
Modify the event details and press "SAVE" to update the event.
Deleting an Event
Swipe left on an event in the list to trigger its deletion.
An alert ("Event deleted") confirms that the event has been removed.
Data Persistence
Events are stored locally using Redux, redux‑persist, and Async Storage, so event data remains available even after restarting the app.
Restrictions
Users cannot create or manage events in the past (though they can view them).
Overlapping events (with conflicting time slots) are not allowed.
Running Tests
The application includes tests that cover:

Redux Slice Logic:
Unit tests for adding, editing, and deleting events.
MainScreen Functionality:
Component tests that verify the correct display of the header (e.g., "February 2025"), switching between calendar and day views, and the proper functioning of the event form.
To run tests, execute:

bash
Копировать
npm test
Libraries and Technologies Used
React Native (Expo): For building a cross-platform mobile application.
TypeScript: Provides strict type checking for improved maintainability.
Redux & Redux Toolkit: For state management.
redux‑persist & Async Storage: For persisting Redux state locally.
React Native Gesture Handler: For handling touch gestures.
React Navigation: For managing navigation between screens.
Date-fns: For formatting and manipulating dates.
react-native-calendars: For displaying the calendar with marked dates.
react-native-swipe-gestures: For implementing swipe gestures for event deletion.
Jest & jest-expo: For running tests.
@testing-library/react-native: For rendering components and simulating user interactions in tests.
Conclusion
The Calendar Event Scheduling App allows users to effectively manage their schedules by creating, editing, and deleting events with various repeat options (including an option for no repetition). Built with React Native (Expo) and TypeScript, the app uses Redux for state management and redux‑persist with Async Storage for data persistence. Comprehensive tests ensure that key functionality works reliably. This documentation provides clear instructions on how to use the app, its internal architecture, and the technologies employed, making it easier for future developers to understand and maintain the project.