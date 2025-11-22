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
import { loginUser } from '../../services/api';
import { storeTokens } from '../../services/auth/tokenManager';
import { useAuth } from '../../context/AuthContext';

const LoginScreen = ({ navigation }) => {
  const [loginMethod, setLoginMethod] = useState('email'); // 'email' or 'mobile'
  const [formData, setFormData] = useState({
    email: '',
    mobile: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  // Basic validation
  const validateForm = () => {
    if (loginMethod === 'email') {
      if (!formData.email.trim()) {
        Toast.show({
          type: 'error',
          text1: 'Validation Error',
          text2: 'Please enter your email address'
        });
        return false;
      }
    } else {
      if (!formData.mobile.trim()) {
        Toast.show({
          type: 'error',
          text1: 'Validation Error',
          text2: 'Please enter your mobile number'
        });
        return false;
      }
      if (formData.mobile.length < 10) {
        Toast.show({
          type: 'error',
          text1: 'Validation Error',
          text2: 'Please enter a valid mobile number'
        });
        return false;
      }
    }
    
    if (!formData.password) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please enter your password'
      });
      return false;
    }
    return true;
  };

  // Handle login
  const handleLogin = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const credentials = loginMethod === 'email' 
        ? {
            email: formData.email.trim().toLowerCase(),
            password: formData.password
          }
        : {
            mobile: formData.mobile.trim(),
            password: formData.password
          };

      const result = await loginUser(credentials);
      
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
            text1: 'Welcome Back!',
            text2: 'Login successful'
          });
          
          // Navigate to main app after storing tokens
          setTimeout(() => {
            navigation.navigate('MainApp');
          }, 1500);
        } else {
          Toast.show({
            type: 'error',
            text1: 'Login Failed',
            text2: 'Failed to store authentication data'
          });
        }
      } else {
        Toast.show({
          type: 'error',
          text1: 'Login Failed',
          text2: result.error?.message || 'Invalid credentials'
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

          {/* Login Form */}
          <View style={styles.formContainer}>
            <Text style={styles.title}>Welcome Back</Text>
            
            {/* Login Method Toggle */}
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[styles.toggleButton, loginMethod === 'email' && styles.toggleButtonActive]}
                onPress={() => setLoginMethod('email')}
                disabled={isLoading}
              >
                <Text style={[styles.toggleButtonText, loginMethod === 'email' && styles.toggleButtonTextActive]}>
                  Email
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleButton, loginMethod === 'mobile' && styles.toggleButtonActive]}
                onPress={() => setLoginMethod('mobile')}
                disabled={isLoading}
              >
                <Text style={[styles.toggleButtonText, loginMethod === 'mobile' && styles.toggleButtonTextActive]}>
                  Mobile
                </Text>
              </TouchableOpacity>
            </View>
            
            {/* Email/Mobile Input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder={loginMethod === 'email' ? "Email address" : "Mobile number"}
                placeholderTextColor="#9CA3AF"
                value={loginMethod === 'email' ? formData.email : formData.mobile}
                onChangeText={(value) => setFormData(prev => ({ 
                  ...prev, 
                  [loginMethod]: value 
                }))}
                keyboardType={loginMethod === 'email' ? "email-address" : "phone-pad"}
                autoCapitalize="none"
                editable={!isLoading}
                maxLength={loginMethod === 'mobile' ? 10 : undefined}
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

            {/* Login Button */}
            <TouchableOpacity 
              style={[styles.loginButton, isLoading && styles.loginButtonDisabled]} 
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#3B58EB" />
              ) : (
                <Text style={styles.loginButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            {/* Signup Link */}
            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Signup')} disabled={isLoading}>
                <Text style={styles.signupLink}>Create Account</Text>
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
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  toggleButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  toggleButtonTextActive: {
    color: colors.white,
    fontWeight: '600',
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
  loginButton: {
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#3B58EB',
    fontSize: 16,
    fontWeight: '600',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
  },
  signupText: {
    color: '#E0E7FF',
    fontSize: 14,
  },
  signupLink: {
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

export default LoginScreen;
