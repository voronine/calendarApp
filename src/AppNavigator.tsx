import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainScreen from './MainScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const navigatorId = 'MainStack';
   
  return (
    <NavigationContainer>
      <Stack.Navigator
        id={navigatorId as any}
        initialRouteName="Main"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Main" component={MainScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
