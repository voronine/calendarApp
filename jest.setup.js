jest.mock('@react-native-async-storage/async-storage', () =>
    require('@react-native-async-storage/async-storage/jest/async-storage-mock')
  );

  jest.mock('@react-native-community/datetimepicker', () => {
    const React = require('react');
    const { View, Text } = require('react-native');
    const DummyDateTimePicker = (props) => (
      <View {...props}>
        <Text>DateTimePicker Stub</Text>
      </View>
    );
    return DummyDateTimePicker;
  });
  
  