import React from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import ErrorBoundary from './src/components/common/ErrorBoundary';
import { NavigationContainer } from '@react-navigation/native';
import { AppProvider } from './src/context/AppContext';
import { AuthProvider } from './src/context/AuthContext';
import { OrderProvider } from './src/context/OrderContext';
import Toast from 'react-native-toast-message';

const App = () => {
  return (
    <AuthProvider>
      <AppProvider>
        <OrderProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
          <Toast />
        </OrderProvider>
      </AppProvider>
    </AuthProvider>
  );
};

export default App;
