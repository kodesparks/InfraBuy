import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import styles from '../../assets/styles/signup';

const SignupScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loginId, setLoginId] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');

  const handleSignup = () => {
    if (!name || !phone || !loginId || !address) {
      setError('Please fill in all fields');
      return;
    }
    // Simulate signup (replace with API call)
    Alert.alert('Success', 'Account created! Please log in.');
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.profileIcon}>
            <Text style={styles.profileIconText}>👤</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerIcon}>
            <Text style={styles.headerIconText}>💬</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon}>
            <Text style={styles.headerIconText}>🔔</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon}>
            <Text style={styles.headerIconText}>🛒</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>Create Account</Text>
        
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputIcon}>👤</Text>
            <TextInput
              style={styles.input}
              placeholder="Name"
              value={name}
              onChangeText={setName}
              placeholderTextColor="#666666"
            />
          </View>
          
          <View style={styles.inputWrapper}>
            <Text style={styles.inputIcon}>📞</Text>
            <TextInput
              style={styles.input}
              placeholder="Phone number"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholderTextColor="#666666"
            />
          </View>
          
          <View style={styles.inputWrapper}>
            <Text style={styles.inputIcon}>🆔</Text>
            <TextInput
              style={styles.input}
              placeholder="Login ID"
              value={loginId}
              onChangeText={setLoginId}
              placeholderTextColor="#666666"
            />
          </View>
          
          <View style={styles.inputWrapper}>
            <Text style={styles.inputIcon}>📍</Text>
            <TextInput
              style={styles.input}
              placeholder="Address"
              value={address}
              onChangeText={setAddress}
              placeholderTextColor="#666666"
            />
          </View>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        
        <TouchableOpacity style={styles.button} onPress={handleSignup}>
          <Text style={styles.buttonText}>Register</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.link}>Already have an account? Sign in</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Text style={[styles.navIcon, styles.navIconActive]}>🏠</Text>
          <Text style={[styles.navText, styles.navTextActive]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>🛍️</Text>
          <Text style={styles.navText}>Shop</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default SignupScreen;
