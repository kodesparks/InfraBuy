import React from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import ErrorBoundary from './src/components/common/ErrorBoundary';
import { NavigationContainer } from '@react-navigation/native';
import { AppProvider } from './src/context/AppContext';

const App = () => {
  return (
    <AppProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </AppProvider>
  );
};

export default App;
