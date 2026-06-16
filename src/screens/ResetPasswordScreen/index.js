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
import LinearGradient from 'react-native-linear-gradient';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/Feather';
import { colors, spacing } from '../../assets/styles/global';
import { resetPassword } from '../../services/api';
import { useTranslation } from 'react-i18next';

const ResetPasswordScreen = ({ route, navigation }) => {
  const { t } = useTranslation();
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if token was passed as route parameter (both deep links and navigation)
    const tokenParam = route.params?.token;
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      Toast.show({
        type: 'error',
        text1: t('Invalid Access'),
        text2: t('No reset token found. Please trigger the reset flow again.')
      });
      setTimeout(() => {
        navigation.navigate('Login');
      }, 2000);
    }
  }, [route.params]);

  const handleResetSubmit = async () => {
    if (!token) {
      Toast.show({
        type: 'error',
        text1: t('Error'),
        text2: t('Missing reset token. Please request a new link/OTP.')
      });
      return;
    }
    if (!newPassword) {
      Toast.show({
        type: 'error',
        text1: t('Validation Error'),
        text2: t('Please enter your new password')
      });
      return;
    }
    if (newPassword.length < 6) {
      Toast.show({
        type: 'error',
        text1: t('Validation Error'),
        text2: t('Password must be at least 6 characters long')
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      Toast.show({
        type: 'error',
        text1: t('Validation Error'),
        text2: t('Passwords do not match')
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await resetPassword(token, newPassword);
      if (result.success) {
        Toast.show({
          type: 'success',
          text1: t('Password Reset Successful'),
          text2: t('Please sign in with your new password.')
        });
        setTimeout(() => {
          navigation.navigate('Login');
        }, 1500);
      } else {
        Toast.show({
          type: 'error',
          text1: t('Reset Failed'),
          text2: result.error?.message || t('Failed to reset password. Link may be expired.')
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

          {/* Reset Password Form */}
          <View style={styles.formContainer}>
            <Text style={styles.title}>{t('New Password')}</Text>
            <Text style={styles.instructionText}>
              {t('Please choose a secure new password for your account (minimum 6 characters).')}
            </Text>

            {/* New Password Input */}
            <View style={[styles.inputContainer, styles.passwordContainer]}>
              <TextInput
                style={styles.passwordInput}
                placeholder={t('New Password')}
                placeholderTextColor="rgba(255, 255, 255, 0.8)"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showNewPassword}
                editable={!isLoading}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowNewPassword(!showNewPassword)}
                disabled={isLoading}
              >
                <Icon name={showNewPassword ? "eye" : "eye-off"} size={20} color="rgba(255, 255, 255, 0.8)" />
              </TouchableOpacity>
            </View>

            {/* Confirm Password Input */}
            <View style={[styles.inputContainer, styles.passwordContainer]}>
              <TextInput
                style={styles.passwordInput}
                placeholder={t('Confirm Password')}
                placeholderTextColor="rgba(255, 255, 255, 0.8)"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                editable={!isLoading}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading}
              >
                <Icon name={showConfirmPassword ? "eye" : "eye-off"} size={20} color="rgba(255, 255, 255, 0.8)" />
              </TouchableOpacity>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
              onPress={handleResetSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#3B58EB" />
              ) : (
                <Text style={styles.submitButtonText}>{t('Save Password')}</Text>
              )}
            </TouchableOpacity>
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
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 15,
  },
  instructionText: {
    color: '#E0E7FF',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 20,
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
    color: '#ffffff',
  },
  eyeIcon: {
    padding: 14,
  },
  submitButton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#3B58EB',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    height: 20,
  }
});

export default ResetPasswordScreen;
