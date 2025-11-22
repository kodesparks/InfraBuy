import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Toast from 'react-native-toast-message';
import { colors, spacing, borderRadius } from '../../assets/styles/global';
import { registerUser } from '../../services/api';
import { storeTokens } from '../../services/auth/tokenManager';
import { useAuth } from '../../context/AuthContext';

const SignupScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    address: '',
    pincode: '',
    companyName: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  // Basic validation
  const validateForm = () => {
    if (!formData.name.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please enter your full name'
      });
      return false;
    }
    if (!formData.email.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please enter your email'
      });
      return false;
    }
    if (!formData.phone.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please enter your phone number'
      });
      return false;
    }
    if (!formData.password) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please enter a password'
      });
      return false;
    }
    if (!formData.address.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please enter your address'
      });
      return false;
    }
    if (!formData.pincode.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please enter your pincode'
      });
      return false;
    }
    return true;
  };

  // Handle signup
  const handleSignup = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const userData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        password: formData.password,
        address: formData.address.trim(),
        pincode: formData.pincode.trim(),
        companyName: formData.companyName.trim()
      };

      const result = await registerUser(userData);
      
      if (result.success) {
        // Store tokens and user data
        const stored = await storeTokens(
          result.data.accessToken,
          result.data.refreshToken,
          result.data.user
        );

        if (stored) {
          // Update auth context
          login(result.data.user);
          
          Toast.show({
            type: 'success',
            text1: 'Success!',
            text2: 'Account created successfully!'
          });
          
          // Navigate to main app after storing tokens
          setTimeout(() => {
            navigation.navigate('MainApp');
          }, 1500);
        } else {
          Toast.show({
            type: 'error',
            text1: 'Signup Failed',
            text2: 'Failed to store authentication data'
          });
        }
      } else {
        Toast.show({
          type: 'error',
          text1: 'Signup Failed',
          text2: result.error?.message || 'Failed to create account'
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Something went wrong. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={['#723FED', '#3B58EB']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <Text style={styles.logo}>infraXpert</Text>
            <Text style={styles.tagline}>Building Materials Expert</Text>
          </View>

          {/* Signup Form */}
          <View style={styles.formContainer}>
            <Text style={styles.title}>Create Account</Text>
            
            {/* Full Name Input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor="#9CA3AF"
                value={formData.name}
                onChangeText={(value) => setFormData(prev => ({ ...prev, name: value }))}
                autoCapitalize="words"
                editable={!isLoading}
              />
            </View>
            
            {/* Company Name Input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Company Name (Optional)"
                placeholderTextColor="#9CA3AF"
                value={formData.companyName}
                onChangeText={(value) => setFormData(prev => ({ ...prev, companyName: value }))}
                autoCapitalize="words"
                editable={!isLoading}
              />
            </View>
            
            {/* Email Input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Email address"
                placeholderTextColor="#9CA3AF"
                value={formData.email}
                onChangeText={(value) => setFormData(prev => ({ ...prev, email: value }))}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLoading}
              />
            </View>
            
            {/* Phone Input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Phone number (10 digits)"
                placeholderTextColor="#9CA3AF"
                value={formData.phone}
                onChangeText={(value) => setFormData(prev => ({ ...prev, phone: value }))}
                keyboardType="phone-pad"
                maxLength={10}
                editable={!isLoading}
              />
            </View>

            {/* Address Input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Address"
                placeholderTextColor="#9CA3AF"
                value={formData.address}
                onChangeText={(value) => setFormData(prev => ({ ...prev, address: value }))}
                multiline
                numberOfLines={2}
                editable={!isLoading}
              />
            </View>

            {/* Pincode Input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Pincode"
                placeholderTextColor="#9CA3AF"
                value={formData.pincode}
                onChangeText={(value) => setFormData(prev => ({ ...prev, pincode: value }))}
                keyboardType="numeric"
                maxLength={6}
                editable={!isLoading}
              />
            </View>
            
            {/* Password Input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#9CA3AF"
                value={formData.password}
                onChangeText={(value) => setFormData(prev => ({ ...prev, password: value }))}
                secureTextEntry
                editable={!isLoading}
              />
            </View>

            {/* Signup Button */}
            <TouchableOpacity 
              style={[styles.signupButton, isLoading && styles.signupButtonDisabled]} 
              onPress={handleSignup}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#3B58EB" />
              ) : (
                <Text style={styles.signupButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            {/* Login Link */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')} disabled={isLoading}>
                <Text style={styles.loginLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Trusted by construction professionals across India
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingTop: 80,
    paddingBottom: 40,
  },
  logoSection: {
    alignItems: 'center',
  },
  logo: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.white,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: colors.white,
    opacity: 0.9,
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 20,
    padding: 30,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
    textAlign: 'center',
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 15,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 0,
    color: colors.white,
  },
  signupButton: {
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  signupButtonDisabled: {
    opacity: 0.7,
  },
  signupButtonText: {
    color: '#3B58EB',
    fontSize: 16,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
  },
  loginText: {
    color: '#E0E7FF',
    fontSize: 14,
  },
  loginLink: {
    color: '#E0E7FF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    textAlign: 'center',
  },
});

export default SignupScreen;
