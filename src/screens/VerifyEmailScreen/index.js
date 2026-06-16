import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Toast from 'react-native-toast-message';
import { colors } from '../../assets/styles/global';
import { verifyEmailByLink, verifyEmailByOtp, otpGenerate } from '../../services/api';
import { storeTokens } from '../../services/auth/tokenManager';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';

const VerifyEmailScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const email = route?.params?.email || '';
  const phone = route?.params?.phone || '';
  const tokenFromLink = route?.params?.token || null;

  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const { login } = useAuth();

  // Handle email link verification (token in URL/params)
  useEffect(() => {
    if (!tokenFromLink) return;
    let cancelled = false;
    (async () => {
      setIsVerifying(true);
      try {
        const result = await verifyEmailByLink(tokenFromLink);
        if (cancelled) return;
        if (result.success && result.data?.accessToken) {
          await storeTokens(result.data.accessToken, result.data.refreshToken, result.data.user);
          if (cancelled) return;
          login(result.data.user);
          Toast.show({ type: 'success', text1: t('Email verified'), text2: t('Welcome!') });
          navigation.replace('MainApp');
        } else {
          Toast.show({ type: 'error', text1: t('Verification failed'), text2: result.error?.message || t('Link may be expired.') });
        }
      } catch (e) {
        if (!cancelled) Toast.show({ type: 'error', text1: t('Error'), text2: t('Verification failed.') });
      } finally {
        if (!cancelled) setIsVerifying(false);
      }
    })();
    return () => { cancelled = true; };
  }, [tokenFromLink]);

  const handleSendOtp = async () => {
    if (!phone || phone.length !== 10) {
      Toast.show({ type: 'error', text1: t('Invalid phone'), text2: t('Enter the 10-digit phone number used at signup.') });
      return;
    }
    setIsSendingOtp(true);
    try {
      const result = await otpGenerate(phone);
      if (result.success) {
        Toast.show({
          type: 'success',
          text1: t('Code sent'),
          text2: result.data?.sendChannel === 'email' ? t('Check your email for the 6-digit code.') : t('Check your phone/email for the code.'),
        });
      } else {
        Toast.show({ type: 'error', text1: t('Failed'), text2: result.error?.message || t('Could not send code.') });
      }
    } catch (e) {
      Toast.show({ type: 'error', text1: t('Error'), text2: t('Could not send code.') });
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    const code = otp.trim();
    if (!email || !code || code.length !== 6) {
      Toast.show({ type: 'error', text1: t('Invalid OTP'), text2: t('Enter the 6-digit code from your email.') });
      return;
    }
    setIsVerifying(true);
    try {
      const result = await verifyEmailByOtp(email, code);
      if (result.success && result.data?.accessToken) {
        await storeTokens(result.data.accessToken, result.data.refreshToken, result.data.user);
        login(result.data.user);
        Toast.show({ type: 'success', text1: t('Email verified'), text2: t('Welcome!') });
        navigation.replace('MainApp');
      } else {
        Toast.show({ type: 'error', text1: t('Verification failed'), text2: result.error?.message || t('Invalid or expired OTP.') });
      }
    } catch (e) {
      Toast.show({ type: 'error', text1: t('Error'), text2: t('Verification failed.') });
    } finally {
      setIsVerifying(false);
    }
  };

  if (tokenFromLink) {
    return (
      <LinearGradient colors={colors.primaryGradient} style={styles.gradient}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.verifyingText}>{t('Verifying your email...')}</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <LinearGradient colors={colors.primaryGradient} style={styles.gradient}>
        <View style={styles.content}>
          <Text style={styles.title}>{t('Verify your email')}</Text>
          {email ? <Text style={styles.emailText}>{email}</Text> : null}

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder={t('Enter 6-digit code')}
              placeholderTextColor="rgba(255, 255, 255, 0.8)"
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
              maxLength={6}
              editable={!isVerifying}
            />
          </View>

          {phone ? (
            <TouchableOpacity style={styles.sendCodeBtn} onPress={handleSendOtp} disabled={isSendingOtp || isVerifying}>
              {isSendingOtp ? <ActivityIndicator size="small" color="#3B58EB" /> : <Text style={styles.sendCodeText}>{t('Send code to my email')}</Text>}
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity style={[styles.verifyBtn, isVerifying && styles.verifyBtnDisabled]} onPress={handleVerifyOtp} disabled={isVerifying}>
            {isVerifying ? <ActivityIndicator color="#3B58EB" /> : <Text style={styles.verifyBtnText}>{t('Verify')}</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Login')} disabled={isVerifying}>
            <Text style={styles.backText}>{t('Back to Sign in')}</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  verifyingText: { color: '#ffffff', marginTop: 12, fontSize: 16 },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 80 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#ffffff', textAlign: 'center', marginBottom: 8 },
  emailText: { fontSize: 14, color: 'rgba(255,255,255,0.9)', textAlign: 'center', marginBottom: 24 },
  inputContainer: { marginBottom: 16 },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 18,
    color: '#ffffff',
    letterSpacing: 4,
    textAlign: 'center',
  },
  sendCodeBtn: { alignSelf: 'center', marginBottom: 24 },
  sendCodeText: { color: '#ffffff', fontSize: 14 },
  verifyBtn: { backgroundColor: '#ffffff', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginBottom: 24 },
  verifyBtnDisabled: { opacity: 0.7 },
  verifyBtnText: { color: '#3B58EB', fontSize: 16, fontWeight: '600' },
  backText: { color: '#ffffff', fontSize: 14, textAlign: 'center' },
});

export default VerifyEmailScreen;


