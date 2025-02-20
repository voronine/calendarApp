module.exports = {
    preset: 'jest-expo',
    setupFilesAfterEnv: [
      '@testing-library/jest-native/extend-expect',
      '<rootDir>/jest.setup.js'
    ],
    transform: {
      '^.+\\.[jt]sx?$': 'babel-jest',
    },
    transformIgnorePatterns: [
      "node_modules/(?!(react-native|expo|expo-modules-core|@react-native|react-native-community/datetimepicker|react-navigation|@react-navigation|react-redux|react-native-calendars|react-native-swipe-gestures)/)"
    ],
  };
  