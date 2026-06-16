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
import Icon from 'react-native-vector-icons/Feather';
import { colors, spacing } from '../../assets/styles/global';
import { forgotPassword, forgotPasswordMobile, verifyForgotOtp } from '../../services/api';
import { useTranslation } from 'react-i18next';

const ForgotPasswordScreen = ({ route, navigation }) => {
  const { t } = useTranslation();
  const initialMethod = route.params?.initialMethod || 'email';
  
  const [method, setMethod] = useState(initialMethod); // 'email' or 'mobile'
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  
  const [step, setStep] = useState(1); // step 1: enter email/phone, step 2: enter OTP (for mobile only)
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleEmailSubmit = async () => {
    if (!email.trim()) {
      Toast.show({
        type: 'error',
        text1: t('Validation Error'),
        text2: t('Please enter your email address')
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const result = await forgotPassword(email.trim());
      if (result.success) {
        setEmailSent(true);
        Toast.show({
          type: 'success',
          text1: t('Success'),
          text2: t('Reset link sent to your email')
        });
      } else {
        Toast.show({
          type: 'error',
          text1: t('Error'),
          text2: result.error?.message || t('Failed to send reset link')
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: t('Error'),
        text2: error.message || t('Something went wrong')
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneSubmit = async () => {
    if (!phone.trim()) {
      Toast.show({
        type: 'error',
        text1: t('Validation Error'),
        text2: t('Please enter your mobile number')
      });
      return;
    }
    if (phone.trim().length < 10) {
      Toast.show({
        type: 'error',
        text1: t('Validation Error'),
        text2: t('Please enter a valid 10-digit mobile number')
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await forgotPasswordMobile(phone.trim());
      if (result.success) {
        setEmailSent(true);
        Toast.show({
          type: 'success',
          text1: t('Success'),
          text2: t('Reset link sent to your registered email')
        });
      } else {
        Toast.show({
          type: 'error',
          text1: t('Error'),
          text2: result.error?.message || t('Failed to send reset link')
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: t('Error'),
        text2: error.message || t('Something went wrong')
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpVerify = async () => {
    if (!otp.trim() || otp.trim().length < 6) {
      Toast.show({
        type: 'error',
        text1: t('Validation Error'),
        text2: t('Please enter the 6-digit OTP code')
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await verifyForgotOtp(phone.trim(), otp.trim());
      if (result.success && result.data?.token) {
        Toast.show({
          type: 'success',
          text1: t('Verified'),
          text2: t('OTP verified successfully')
        });
        // Navigate to Reset Password Screen with the token
        navigation.navigate('ResetPassword', { token: result.data.token });
      } else {
        Toast.show({
          type: 'error',
          text1: t('Error'),
          text2: result.error?.message || t('Verification failed')
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: t('Error'),
        text2: error.message || t('Something went wrong')
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
          <View style={styles.headerContainer}>
            <Image
              source={require('../../assets/images/logo_new.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <Text style={styles.tagline}>{t('Building Materials Expert')}</Text>
          </View>

          {/* Forgot Password Card */}
          <View style={styles.formContainer}>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => navigation.goBack()}
              disabled={isLoading}
            >
              <Icon name="arrow-left" size={20} color="#ffffff" />
            </TouchableOpacity>

            <Text style={styles.title}>{t('Reset Password')}</Text>

            {emailSent ? (
              // Email success state
              <View style={styles.successContainer}>
                <Icon name="check-circle" size={50} color="#10B981" style={styles.successIcon} />
                <Text style={styles.successTitle}>{t('Check Your Email')}</Text>
                <Text style={styles.successText}>
                  {t('We have sent a secure password reset link to your email address. Please open it to continue.')}
                </Text>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => navigation.navigate('Login')}
                >
                  <Text style={styles.actionButtonText}>{t('Back to Login')}</Text>
                </TouchableOpacity>
              </View>
            ) : step === 1 ? (
              // Step 1: Input email or phone
              <>
                {/* Method Toggle */}
                <View style={styles.toggleContainer}>
                  <TouchableOpacity
                    style={[styles.toggleButton, method === 'email' && styles.toggleButtonActive]}
                    onPress={() => setMethod('email')}
                    disabled={isLoading}
                  >
                    <Text style={[styles.toggleButtonText, method === 'email' && styles.toggleButtonTextActive]}>
                      {t('Email')}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.toggleButton, method === 'mobile' && styles.toggleButtonActive]}
                    onPress={() => setMethod('mobile')}
                    disabled={isLoading}
                  >
                    <Text style={[styles.toggleButtonText, method === 'mobile' && styles.toggleButtonTextActive]}>
                      {t('Mobile')}
                    </Text>
                  </TouchableOpacity>
                </View>

                {method === 'email' ? (
                  // Email Input Flow
                  <View style={styles.flowContainer}>
                    <Text style={styles.instructionText}>
                      {t('Enter your registered email address to receive a password reset link.')}
                    </Text>
                    <View style={styles.inputContainer}>
                      <TextInput
                        style={styles.input}
                        placeholder={t('Email address')}
                        placeholderTextColor="rgba(255, 255, 255, 0.8)"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        editable={!isLoading}
                      />
                    </View>
                    <TouchableOpacity
                      style={[styles.actionButton, isLoading && styles.actionButtonDisabled]}
                      onPress={handleEmailSubmit}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <ActivityIndicator color="#3B58EB" />
                      ) : (
                        <Text style={styles.actionButtonText}>{t('Send Link')}</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                ) : (
                  // Mobile Input Flow
                  <View style={styles.flowContainer}>
                    <Text style={styles.instructionText}>
                      {t('Enter your registered mobile number to receive a password reset link.')}
                    </Text>
                    <View style={styles.inputContainer}>
                      <TextInput
                        style={styles.input}
                        placeholder={t('Mobile number')}
                        placeholderTextColor="rgba(255, 255, 255, 0.8)"
                        value={phone}
                        onChangeText={setPhone}
                        keyboardType="phone-pad"
                        maxLength={10}
                        editable={!isLoading}
                      />
                    </View>
                    <TouchableOpacity
                      style={[styles.actionButton, isLoading && styles.actionButtonDisabled]}
                      onPress={handlePhoneSubmit}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <ActivityIndicator color="#3B58EB" />
                      ) : (
                        <Text style={styles.actionButtonText}>{t('Send Link')}</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                )}
              </>
            ) : (
              // Step 2: Input Mobile OTP verification code
              <View style={styles.flowContainer}>
                <Text style={styles.instructionText}>
                  {t('Enter the 6-digit OTP code sent to your registered email (SMS fallback).')}
                </Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder={t('Verification Code')}
                    placeholderTextColor="rgba(255, 255, 255, 0.8)"
                    value={otp}
                    onChangeText={setOtp}
                    keyboardType="number-pad"
                    maxLength={6}
                    editable={!isLoading}
                  />
                </View>
                <TouchableOpacity
                  style={[styles.actionButton, isLoading && styles.actionButtonDisabled]}
                  onPress={handleOtpVerify}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#3B58EB" />
                  ) : (
                    <Text style={styles.actionButtonText}>{t('Verify OTP')}</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.resendButton}
                  onPress={() => setStep(1)}
                  disabled={isLoading}
                >
                  <Text style={styles.resendButtonText}>{t('Change Phone Number')}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Footer spacing */}
          <View style={styles.footer} />
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
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    padding: 10,
    borderRadius: 99,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    zIndex: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 30,
    marginTop: 20,
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
  flowContainer: {
    width: '100%',
  },
  instructionText: {
    color: '#E0E7FF',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#ffffff',
  },
  actionButton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  actionButtonDisabled: {
    opacity: 0.7,
  },
  actionButtonText: {
    color: '#3B58EB',
    fontSize: 16,
    fontWeight: '600',
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  successIcon: {
    marginBottom: 15,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
  },
  successText: {
    color: '#E0E7FF',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  resendButton: {
    marginTop: 15,
    alignItems: 'center',
  },
  resendButtonText: {
    color: '#E0E7FF',
    fontSize: 14,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  footer: {
    height: 20,
  }
});

export default ForgotPasswordScreen;
