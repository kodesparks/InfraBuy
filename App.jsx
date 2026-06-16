import React from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import ErrorBoundary from './src/components/common/ErrorBoundary';
import { NavigationContainer } from '@react-navigation/native';
import { AppProvider } from './src/context/AppContext';
import { AuthProvider } from './src/context/AuthContext';
import { OrderProvider } from './src/context/OrderContext';
import { ThemeProvider } from './src/context/ThemeContext';
import Toast from 'react-native-toast-message';
import { navigationRef } from './src/services/navigation/navigationService';

const linking = {
  prefixes: ['infraxpert://'],
  config: {
    screens: {
      ResetPassword: 'reset-password',
    },
  },
};

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppProvider>
          <OrderProvider>
            <NavigationContainer linking={linking} ref={navigationRef}>
              <AppNavigator />
            </NavigationContainer>
            <Toast />
          </OrderProvider>
        </AppProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
