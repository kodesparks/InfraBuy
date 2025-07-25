import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import styles from '../../assets/styles/login';

const LoginScreen = ({ navigation }) => {
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (!mobile || !otp) {
      setError('Please enter mobile number and OTP');
      return;
    }
    // Simulate OTP verification (replace with API call)
    Alert.alert('Success', 'Logged in!');
    navigation.navigate('Home'); // Navigate to HomeScreen (to be created)
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Mobile Number"
        value={mobile}
        onChangeText={setMobile}
        keyboardType="phone-pad"
      />
      <TextInput
        style={styles.input}
        placeholder="OTP"
        value={otp}
        onChangeText={setOtp}
        keyboardType="numeric"
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
        <Text style={styles.link}>Need an account? Sign up</Text>
      </TouchableOpacity>
    </View>
  );
};

export default LoginScreen;
