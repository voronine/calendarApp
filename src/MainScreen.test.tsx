import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { store } from './store/store';
import MainScreen from './MainScreen';

const renderWithProviders = (ui: React.ReactElement) => {
  return render(<Provider store={store}>{ui}</Provider>);
};

describe('MainScreen', () => {
  it('displays header correctly and switches modes', async () => {
    const { getByTestId, getByText } = renderWithProviders(<MainScreen />);
    const headerTitle = getByTestId('undefined.header.title');
    expect(headerTitle).toBeTruthy();
    expect(headerTitle.props.children).toMatch(/February 2025/i);
    fireEvent.press(getByText('15'));
    await waitFor(() => {
      expect(getByText(/Back to Calendar/i)).toBeTruthy();
    });
  });

  it('opens the event form and saves the event', async () => {
    const { getByPlaceholderText, getByText, findByText } = renderWithProviders(<MainScreen />);
    const eventInput = getByPlaceholderText(/Every Name/i);
    fireEvent.changeText(eventInput, 'New Event');
    const saveButton = getByText('SAVE');
    fireEvent.press(saveButton);
    const newEventElement = await findByText('New Event');
    expect(newEventElement).toBeTruthy();
  });
});
