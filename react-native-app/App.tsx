import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StartScreen } from './src/screens/StartScreen';
import { BuildingList } from './src/screens/BuildingList';
import { FloorList } from './src/screens/FloorList';
import { RoomList } from './src/screens/RoomList';
import { RoomDetail } from './src/screens/RoomDetail';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <Stack.Navigator 
        initialRouteName="Start"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Start" component={StartScreen} />
        <Stack.Screen name="Buildings" component={BuildingList} />
        <Stack.Screen name="Floors" component={FloorList} />
        <Stack.Screen name="Rooms" component={RoomList} />
        <Stack.Screen name="RoomDetail" component={RoomDetail} />
      </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
