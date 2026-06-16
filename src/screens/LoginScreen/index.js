import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Toast from 'react-native-toast-message';
import { colors, spacing, borderRadius } from '../../assets/styles/global';
import { loginUser } from '../../services/api';
import { storeTokens } from '../../services/auth/tokenManager';
import { useAuth } from '../../context/AuthContext';
import * as Keychain from 'react-native-keychain';
import Icon from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';

const LoginScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [loginMethod, setLoginMethod] = useState('mobile'); // 'email' or 'mobile'
  const [formData, setFormData] = useState({
    email: '',
    mobile: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [hasSavedCredentials, setHasSavedCredentials] = useState(false);
  const { login, checkAuthStatus } = useAuth();

  // Check for biometric support and saved credentials on mount
  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  const checkBiometricAvailability = async () => {
    try {
      const biometryType = await Keychain.getSupportedBiometryType();
      if (biometryType) {
        setIsBiometricSupported(true);
        // Check if there are credentials saved
        const credentials = await Keychain.getGenericPassword();
        if (credentials) {
          setHasSavedCredentials(true);
          // Auto-trigger biometric login
          handleBiometricLogin(credentials);
        }
      }
    } catch (error) {
      console.log('Error checking biometrics:', error);
    }
  };

  // Re-check auth status when screen is focused (e.g., after token expiration)
  useFocusEffect(
    React.useCallback(() => {
      checkAuthStatus();
    }, [checkAuthStatus])
  );

  // Basic validation
  const validateForm = () => {
    if (loginMethod === 'email') {
      if (!formData.email.trim()) {
        Toast.show({
          type: 'error',
          text1: t('Validation Error'),
          text2: t('Please enter your email address')
        });
        return false;
      }
    } else {
      if (!formData.mobile.trim()) {
        Toast.show({
          type: 'error',
          text1: t('Validation Error'),
          text2: t('Please enter your mobile number')
        });
        return false;
      }
      if (formData.mobile.length < 10) {
        Toast.show({
          type: 'error',
          text1: t('Validation Error'),
          text2: t('Please enter a valid mobile number')
        });
        return false;
      }
    }

    if (!formData.password) {
      Toast.show({
        type: 'error',
        text1: t('Validation Error'),
        text2: t('Please enter your password')
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
          phone: String(formData.mobile.trim()),
          password: formData.password
        };

      console.log('🔑 LOGIN PAYLOAD:', JSON.stringify(credentials));
      const result = await loginUser(credentials);
      console.log('🔑 LOGIN RESULT:', JSON.stringify(result));

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
            text1: t('Welcome Back!'),
            text2: t('Login successful')
          });

          // Navigate to main app after storing tokens
          setTimeout(() => {
            navigation.navigate('MainApp');
          }, 1500);
        } else {
          Toast.show({
            type: 'error',
            text1: t('Login Failed'),
            text2: t('Failed to store authentication data')
          });
        }
      } else {
        Toast.show({
          type: 'error',
          text1: t('Login Failed'),
          text2: result.error?.message || t('Invalid credentials')
        });
      }
    } catch (error) {
      console.log('🔑 LOGIN EXCEPTION:', error?.message, error?.stack, JSON.stringify(error));
      Toast.show({
        type: 'error',
        text1: t('Error'),
        text2: error?.message || t('Something went wrong. Please try again.')
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometricLogin = async (preloadedCredentials = null) => {
    try {
      // Retrieve the credentials from keychain if not provided
      const credentials = preloadedCredentials || await Keychain.getGenericPassword({
        authenticationPrompt: {
          title: t('Authentication Required'),
          subtitle: t('Log in using your biometric credentials'),
        },
      });

      if (credentials) {
        setIsLoading(true);
        // Determine login method from saved username (if it has @ it's email)
        const isEmail = credentials.username.includes('@');

        const loginPayload = isEmail
          ? { email: credentials.username, password: credentials.password }
          : { phone: String(credentials.username), password: credentials.password };

        const result = await loginUser(loginPayload);

        if (result.success) {
          const stored = await storeTokens(
            result.data.accessToken,
            result.data.refreshToken,
            result.data.user
          );

          if (stored) {
            login(result.data.user);
            Toast.show({
              type: 'success',
              text1: t('Welcome Back!'),
              text2: t('Biometric login successful')
            });

            setTimeout(() => {
              navigation.navigate('MainApp');
            }, 1000);
          } else {
            Toast.show({ type: 'error', text1: t('Error'), text2: t('Failed to store authentication data') });
            setIsLoading(false);
          }
        } else {
          Toast.show({ type: 'error', text1: t('Login Failed'), text2: result.error?.message || t('Invalid credentials') });
          setIsLoading(false);
        }
      } else {
        Toast.show({ type: 'error', text1: t('Authentication Failed'), text2: t('Could not retrieve biometric credentials') });
      }
    } catch (error) {
      console.log('Biometric login error:', error);
      // User cancelled or biometric failed
      if (error.message && !error.message.includes('User canceled')) {
        Toast.show({ type: 'error', text1: t('Authentication Failed'), text2: t('Biometric verification failed') });
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={colors.primaryGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo Section */}
          <View style={styles.headerContainer}>
            <Image
              source={require('../../assets/images/logo_new.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <Text style={styles.tagline}>{t('Building Materials Expert')}</Text>
          </View>

          {/* Login Form */}
          <View style={styles.formContainer}>
            <Text style={styles.title}>{t('Welcome Back')}</Text>

            {/* Login Method Toggle */}
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[styles.toggleButton, loginMethod === 'email' && styles.toggleButtonActive]}
                onPress={() => setLoginMethod('email')}
                disabled={isLoading}
              >
                <Text style={[styles.toggleButtonText, loginMethod === 'email' && styles.toggleButtonTextActive]}>
                  {t('Email')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleButton, loginMethod === 'mobile' && styles.toggleButtonActive]}
                onPress={() => setLoginMethod('mobile')}
                disabled={isLoading}
              >
                <Text style={[styles.toggleButtonText, loginMethod === 'mobile' && styles.toggleButtonTextActive]}>
                  {t('Mobile')}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Email/Mobile Input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder={loginMethod === 'email' ? t('Email address') : t('Mobile number')}
                placeholderTextColor="rgba(255, 255, 255, 0.8)"
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
            <View style={[styles.inputContainer, styles.passwordContainer]}>
              <TextInput
                style={styles.passwordInput}
                placeholder={t('Password')}
                placeholderTextColor="rgba(255, 255, 255, 0.8)"
                value={formData.password}
                onChangeText={(value) => setFormData(prev => ({ ...prev, password: value }))}
                secureTextEntry={!showPassword}
                editable={!isLoading}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                <Icon name={showPassword ? "eye" : "eye-off"} size={20} color="rgba(255, 255, 255, 0.8)" />
              </TouchableOpacity>
            </View>

            {/* Forgot Password Link */}
            <TouchableOpacity
              style={styles.forgotPasswordContainer}
              onPress={() => navigation.navigate('ForgotPassword', { initialMethod: loginMethod })}
              disabled={isLoading}
            >
              <Text style={styles.forgotPasswordText}>{t('Forgot Password?')}</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#3B58EB" />
              ) : (
                <Text style={styles.loginButtonText}>{t('Sign In')}</Text>
              )}
            </TouchableOpacity>

            {/* Biometric Login Button */}
            {isBiometricSupported && hasSavedCredentials && (
              <TouchableOpacity
                style={styles.biometricButton}
                onPress={handleBiometricLogin}
                disabled={isLoading}
              >
                <Icon name="finger-print-outline" size={24} color="#ffffff" style={styles.biometricIcon} />
                <Text style={styles.biometricButtonText}>{t('Login with Biometrics')}</Text>
              </TouchableOpacity>
            )}

            {/* Signup Link */}
            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>{t("Don't have an account? ")}</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Signup')} disabled={isLoading}>
                <Text style={styles.signupLink}>{t('Create Account')}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {t('Trusted by construction professionals across India')}
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
  headerContainer: {
    alignItems: 'center',
  },
  logoImage: {
    height: 38,
    width: 170,
    marginBottom: spacing.xs,
  },
  tagline: {
    fontSize: 16,
    color: '#ffffff',
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
    color: '#ffffff',
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
    color: '#ffffff',
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
    color: '#ffffff',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 12,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 0,
    color: '#ffffff',
  },
  eyeIcon: {
    padding: 14,
  },
  loginButton: {
    backgroundColor: '#ffffff',
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
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 20,
    marginTop: 5,
  },
  forgotPasswordText: {
    color: '#E0E7FF',
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    textAlign: 'center',
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  biometricButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  biometricIcon: {
    marginRight: 10,
  }
});

export default LoginScreen;


