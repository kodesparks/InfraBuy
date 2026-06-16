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
  Platform,
  Image
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Toast from 'react-native-toast-message';
import { colors, spacing, borderRadius } from '../../assets/styles/global';
import { registerUser } from '../../services/api';
import { storeTokens } from '../../services/auth/tokenManager';
import { useAuth } from '../../context/AuthContext';
import Icon from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';

const SignupScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    address: '',
    pincode: '',
    companyName: '',
    gstNumber: '',
    contractId: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();

  // Basic validation
  const validateForm = () => {
    if (!formData.name.trim()) {
      Toast.show({
        type: 'error',
        text1: t('Validation Error'),
        text2: t('Please enter your full name')
      });
      return false;
    }
    if (!formData.email.trim()) {
      Toast.show({
        type: 'error',
        text1: t('Validation Error'),
        text2: t('Please enter your email')
      });
      return false;
    }
    if (!formData.phone.trim()) {
      Toast.show({
        type: 'error',
        text1: t('Validation Error'),
        text2: t('Please enter your phone number')
      });
      return false;
    }
    if (!formData.password) {
      Toast.show({
        type: 'error',
        text1: t('Validation Error'),
        text2: t('Please enter a password')
      });
      return false;
    }
    if (!formData.address.trim()) {
      Toast.show({
        type: 'error',
        text1: t('Validation Error'),
        text2: t('Please enter your address')
      });
      return false;
    }
    if (!formData.pincode.trim()) {
      Toast.show({
        type: 'error',
        text1: t('Validation Error'),
        text2: t('Please enter your pincode')
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
        companyName: formData.companyName.trim(),
        gstNumber: formData.gstNumber.trim(),
        contractId: formData.contractId.trim()
      };

      const result = await registerUser(userData);

      if (result.success) {
        // Customer signup may require email verification – do NOT auto-login
        if (result.requiresVerification === true) {
          Toast.show({
            type: 'success',
            text1: t('Verify your email'),
            text2: t('Check your email for a verification link or code.')
          });
          navigation.navigate('VerifyEmail', { email: formData.email.trim().toLowerCase(), phone: formData.phone.trim() });
          return;
        }

        // Non-customer or no verification: store tokens and go to home
        if (result.data?.accessToken && result.data?.refreshToken) {
          const stored = await storeTokens(
            result.data.accessToken,
            result.data.refreshToken,
            result.data.user
          );
          if (stored) {
            login(result.data.user);
            Toast.show({ type: 'success', text1: t('Success!'), text2: t('Account created successfully!') });
            setTimeout(() => navigation.navigate('MainApp'), 1500);
          } else {
            Toast.show({ type: 'error', text1: t('Signup Failed'), text2: t('Failed to store authentication data') });
          }
        } else {
          Toast.show({ type: 'error', text1: t('Signup Failed'), text2: t('Unexpected response. Please try again.') });
        }
      } else {
        Toast.show({
          type: 'error',
          text1: t('Signup Failed'),
          text2: result.error?.message || t('Failed to create account')
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: t('Error'),
        text2: t('Something went wrong. Please try again.')
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
          <View style={styles.logoSection}>
            <Image
              source={require('../../assets/images/logo_new.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <Text style={styles.tagline}>{t('Building Materials Expert')}</Text>
          </View>

          {/* Signup Form */}
          <View style={styles.formContainer}>
            <Text style={styles.title}>{t('Create Account')}</Text>

            {/* Full Name Input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder={t('Full Name')}
                placeholderTextColor="rgba(255, 255, 255, 0.8)"
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
                placeholder={t('Company Name (Optional)')}
                placeholderTextColor="rgba(255, 255, 255, 0.8)"
                value={formData.companyName}
                onChangeText={(value) => setFormData(prev => ({ ...prev, companyName: value }))}
                autoCapitalize="words"
                editable={!isLoading}
              />
            </View>

            {/* GST Number Input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder={t('GST Number (Optional)')}
                placeholderTextColor="rgba(255, 255, 255, 0.8)"
                value={formData.gstNumber}
                onChangeText={(value) => setFormData(prev => ({ ...prev, gstNumber: value }))}
                autoCapitalize="characters"
                maxLength={15}
                editable={!isLoading}
              />
            </View>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder={t('Email address')}
                placeholderTextColor="rgba(255, 255, 255, 0.8)"
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
                placeholder={t('Phone number (10 digits)')}
                placeholderTextColor="rgba(255, 255, 255, 0.8)"
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
                placeholder={t('Address')}
                placeholderTextColor="rgba(255, 255, 255, 0.8)"
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
                placeholder={t('Pincode')}
                placeholderTextColor="rgba(255, 255, 255, 0.8)"
                value={formData.pincode}
                onChangeText={(value) => setFormData(prev => ({ ...prev, pincode: value }))}
                keyboardType="numeric"
                maxLength={6}
                editable={!isLoading}
              />
            </View>

            {/* Contract ID Input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder={t('Contract ID')}
                placeholderTextColor="rgba(255, 255, 255, 0.8)"
                value={formData.contractId}
                onChangeText={(value) => setFormData(prev => ({ ...prev, contractId: value }))}
                editable={!isLoading}
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

            {/* Signup Button */}
            <TouchableOpacity
              style={[styles.signupButton, isLoading && styles.signupButtonDisabled]}
              onPress={handleSignup}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#3B58EB" />
              ) : (
                <Text style={styles.signupButtonText}>{t('Create Account')}</Text>
              )}
            </TouchableOpacity>

            {/* Login Link */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>{t('Already have an account? ')}</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')} disabled={isLoading}>
                <Text style={styles.loginLink}>{t('Sign In')}</Text>
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
  logoSection: {
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
  signupButton: {
    backgroundColor: '#ffffff',
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
    color: '#ffffff',
    fontSize: 14,
  },
  loginLink: {
    color: '#ffffff',
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


