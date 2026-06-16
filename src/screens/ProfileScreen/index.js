import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
  RefreshControl,
  Switch,
  Platform
} from 'react-native';
import Skeleton from '../../components/common/Skeleton';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';
import Icon from 'react-native-vector-icons/Feather';
import Toast from 'react-native-toast-message';
import createStyles from '../../assets/styles/profile';

// Conditionally import image picker
let launchImageLibrary = null;
try {
  const imagePicker = require('react-native-image-picker');
  launchImageLibrary = imagePicker.launchImageLibrary;
} catch (error) {
  console.warn('react-native-image-picker not available:', error);
}
import { useAuth } from '../../context/AuthContext';
import { updateProfile, updateEmail, updateMobile, uploadAvatar } from '../../services/api';
import EditProfileModal from '../../components/profile/EditProfileModal';
import EditEmailModal from '../../components/profile/EditEmailModal';
import EditMobileModal from '../../components/profile/EditMobileModal';
import ChangePasswordModal from '../../components/profile/ChangePasswordModal';
import BiometricPromptModal from '../../components/profile/BiometricPromptModal';
import CustomerCareFooter from '../../components/common/CustomerCareFooter';
import { loginUser } from '../../services/api';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';

const ProfileScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { isDarkMode, toggleTheme, colors } = useTheme();

  // Create dynamic styles using current theme colors
  const styles = React.useMemo(() => createStyles(colors, isDarkMode), [colors, isDarkMode]);

  const { user, logout, refreshProfile } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showEditEmailModal, setShowEditEmailModal] = useState(false);
  const [showEditMobileModal, setShowEditMobileModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showBiometricModal, setShowBiometricModal] = useState(false);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [biometricLoading, setBiometricLoading] = useState(false);
  const [biometricError, setBiometricError] = useState(null);

  // Use real user data from AuthContext, fallback to empty object
  const userData = user || {};

  useEffect(() => {
    checkBiometricStatus();
  }, []);

  const checkBiometricStatus = async () => {
    try {
      const biometryType = await Keychain.getSupportedBiometryType();
      if (biometryType) {
        setIsBiometricSupported(true);
        const isEnabled = await AsyncStorage.getItem('biometric_enabled');
        if (isEnabled === 'true') {
          setIsBiometricEnabled(true);
        }
      }
    } catch (error) {
      console.log('Error checking biometrics on profile:', error);
    }
  };

  const handleToggleBiometric = async (value) => {
    if (value && !isBiometricSupported) {
      Toast.show({
        type: 'info',
        text1: t('Biometrics Not Configured'),
        text2: t('Please set up Fingerprint/Face ID in your device settings first.')
      });
      return;
    }

    if (value) {
      // User intends to turn ON
      setShowBiometricModal(true);
      setBiometricError(null);
    } else {
      // User intends to turn OFF
      try {
        await Keychain.resetGenericPassword();
        await AsyncStorage.removeItem('biometric_enabled');
        setIsBiometricEnabled(false);
        Toast.show({
          type: 'success',
          text1: t('Success!'),
          text2: t('Biometric login disabled')
        });
      } catch (err) {
        Toast.show({
          type: 'error',
          text1: t('Error'),
          text2: t('Could not disable biometric login')
        });
      }
    }
  };

  const submitBiometricActivation = async (password) => {
    setBiometricLoading(true);
    setBiometricError(null);
    try {
      // Validate password by making a real login call
      const username = userData.email || userData.phone;
      if (!username) {
        setBiometricError('User must have an email or phone number');
        setBiometricLoading(false);
        return;
      }

      const payload = userData.email
        ? { email: username.toLowerCase(), password }
        : { mobile: username, password };

      const result = await loginUser(payload);

      if (result.success) {
        // Correct password! Now we can safely save to Keychain
        await Keychain.setGenericPassword(username, password, {
          accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY,
          accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY
        });
        await AsyncStorage.setItem('biometric_enabled', 'true');
        setIsBiometricEnabled(true);
        setShowBiometricModal(false);
        Toast.show({
          type: 'success',
          text1: t('Success!'),
          text2: t('Biometric login enabled successfully')
        });
      } else {
        setBiometricError(result.error?.message || t('Incorrect password'));
      }
    } catch (err) {
      console.log('Error activating biometrics:', err);
      setBiometricError(t('An error occurred during verification'));
    } finally {
      setBiometricLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshProfile();
    } catch (error) {
      console.error('Error refreshing profile:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleEditProfile = () => {
    setShowEditProfileModal(true);
  };

  const handleEditEmail = () => {
    setShowEditEmailModal(true);
  };

  const handleEditMobile = () => {
    setShowEditMobileModal(true);
  };

  const handleAvatarUpload = () => {
    if (!launchImageLibrary) {
      Alert.alert(
        t('Not Available'),
        t('Image picker is not available. Please ensure react-native-image-picker is properly installed and linked.'),
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      t('Upload Avatar'),
      t('Choose an option'),
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: t('Choose from Gallery'),
          onPress: () => {
            launchImageLibrary(
              {
                mediaType: 'photo',
                quality: 0.8,
                maxWidth: 1024,
                maxHeight: 1024,
              },
              async (response) => {
                if (response.didCancel || response.errorCode) {
                  if (response.errorCode) {
                    Alert.alert(t('Error'), `Image picker error: ${response.errorMessage || 'Unknown error'}`);
                  }
                  return;
                }

                if (response.assets && response.assets[0]) {
                  const imageUri = response.assets[0].uri;
                  await uploadAvatarImage(imageUri);
                }
              }
            );
          },
        },
      ],
      { cancelable: true }
    );
  };

  const uploadAvatarImage = async (imageUri) => {
    if (!userData.id) {
      Toast.show({
        type: 'error',
        text1: t('Error'),
        text2: t('User ID not found'),
      });
      return;
    }

    setLoading(true);
    try {
      const result = await uploadAvatar(userData.id, imageUri);
      if (result.success) {
        Toast.show({
          type: 'success',
          text1: t('Success!'),
          text2: result.message || t('Avatar uploaded successfully'),
        });
        // Use user data from response if available, otherwise refresh
        if (result.data?.user) {
          await refreshProfile(result.data.user);
        } else {
          await refreshProfile();
        }
      } else {
        Toast.show({
          type: 'error',
          text1: t('Error'),
          text2: result.error?.message || t('Failed to upload avatar'),
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: t('Error'),
        text2: t('Failed to upload avatar'),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      t('Logout'),
      t('Are you sure you want to logout?'),
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: t('Logout'),
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              Toast.show({
                type: 'success',
                text1: t('Logged Out'),
                text2: t('You have been successfully logged out'),
              });
              navigation.navigate('Login');
            } catch (error) {
              Toast.show({
                type: 'error',
                text1: t('Logout Failed'),
                text2: t('Something went wrong. Please try again.'),
              });
            }
          },
        },
      ]
    );
  };

  const getRoleBadgeColor = (role) => {
    const roleColors = {
      admin: { bg: isDarkMode ? '#7F1D1D' : '#FEE2E2', text: isDarkMode ? '#FECACA' : '#991B1B' },
      manager: { bg: isDarkMode ? '#581C87' : '#F3E8FF', text: isDarkMode ? '#E9D5FF' : '#6B21A8' },
      employee: { bg: isDarkMode ? '#1E3A8A' : '#DBEAFE', text: isDarkMode ? '#BFDBFE' : '#1E40AF' },
      vendor: { bg: isDarkMode ? '#7C2D12' : '#FED7AA', text: isDarkMode ? '#FFEDD5' : '#9A3412' },
      customer: { bg: isDarkMode ? '#064E3B' : '#D1FAE5', text: isDarkMode ? '#A7F3D0' : '#065F46' },
    };
    return roleColors[role] || roleColors.customer;
  };

  const getAccessLevelBadgeColor = (accessLevel) => {
    const accessColors = {
      app_web: { bg: isDarkMode ? '#1E3A8A' : '#DBEAFE', text: isDarkMode ? '#BFDBFE' : '#1E40AF' },
      app_mobile: { bg: isDarkMode ? '#064E3B' : '#D1FAE5', text: isDarkMode ? '#A7F3D0' : '#065F46' },
      web_only: { bg: isDarkMode ? '#581C87' : '#F3E8FF', text: isDarkMode ? '#E9D5FF' : '#6B21A8' },
    };
    return accessColors[accessLevel] || accessColors.app_web;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (error) {
      return dateString;
    }
  };

  const roleBadge = getRoleBadgeColor(userData.role);
  const accessBadge = getAccessLevelBadgeColor(userData.accessLevel);

  const renderProfileSkeleton = () => (
    <View style={styles.scrollContent}>
      <View style={styles.profileOverviewCard}>
        <Skeleton width={100} height={100} borderRadius={50} style={{ marginBottom: 16 }} />
        <Skeleton width="60%" height={24} borderRadius={4} style={{ marginBottom: 8 }} />
        <Skeleton width="40%" height={16} borderRadius={4} style={{ marginBottom: 20 }} />
        <Skeleton width={120} height={40} borderRadius={20} />
      </View>
      <View style={styles.sectionCard}>
        <Skeleton width="40%" height={20} borderRadius={4} style={{ marginBottom: 20 }} />
        {[1, 2, 3].map(i => (
          <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
            <Skeleton width={40} height={40} borderRadius={10} style={{ marginRight: 12 }} />
            <View style={{ flex: 1 }}>
              <Skeleton width="30%" height={14} borderRadius={4} style={{ marginBottom: 6 }} />
              <Skeleton width="70%" height={18} borderRadius={4} />
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const { isLoading: profileContextLoading } = useAuth(); // Assuming there's a loading state in AuthContext

  if (!user && (loading || profileContextLoading)) {
    return (
      <View style={styles.container}>
        <ScrollView style={styles.content}>
          {renderProfileSkeleton()}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Overview Section */}
        <View style={styles.profileOverviewCard}>
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={handleAvatarUpload}
            disabled={loading}
          >
            {userData.avatar ? (
              <Image source={{ uri: userData.avatar }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Icon name="user" size={50} color="#6B7280" />
              </View>
            )}
            {loading && (
              <View style={styles.avatarLoadingOverlay}>
                <ActivityIndicator size="small" color={colors.textWhite} />
              </View>
            )}
            <View style={[styles.avatarEditIcon, { borderColor: colors.background }]}>
              <Icon name="camera" size={16} color={colors.textWhite} />
            </View>
          </TouchableOpacity>

          <Text style={styles.userName}>{userData.name || 'N/A'}</Text>
          <Text style={styles.userEmail}>{userData.email || 'N/A'}</Text>

          {/* Role and Access Level Badges */}
          <View style={styles.badgeContainer}>
            {userData.role && (
              <View style={[styles.badge, { backgroundColor: roleBadge.bg }]}>
                <Text style={[styles.badgeText, { color: roleBadge.text }]}>
                  {userData.role.charAt(0).toUpperCase() + userData.role.slice(1)}
                </Text>
              </View>
            )}
            {userData.accessLevel && (
              <View style={[styles.badge, { backgroundColor: accessBadge.bg }]}>
                <Text style={[styles.badgeText, { color: accessBadge.text }]}>
                  {userData.accessLevel.replace('_', ' ').toUpperCase()}
                </Text>
              </View>
            )}
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Icon name="log-out" size={18} color={colors.textWhite} style={styles.logoutIcon} />
            <Text style={styles.logoutButtonText}>{t('Logout')}</Text>
          </TouchableOpacity>
        </View>

        {/* Personal Information Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('Personal Information')}</Text>
            <TouchableOpacity onPress={handleEditProfile}>
              <Icon name="edit-2" size={18} color={colors.info} />
            </TouchableOpacity>
          </View>

          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <View style={styles.infoIconContainer}>
                <Icon name="mail" size={20} color={colors.info} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{t('Email')}</Text>
                <Text style={styles.infoValue}>{userData.email || 'N/A'}</Text>
                <View style={styles.verificationBadge}>
                  <Icon
                    name={userData.isEmailVerified ? 'check-circle' : 'x-circle'}
                    size={14}
                    color={userData.isEmailVerified ? colors.success : colors.error}
                  />
                  <Text
                    style={[
                      styles.verificationText,
                      {
                        color: userData.isEmailVerified ? colors.success : colors.error,
                      },
                    ]}
                  >
                    {userData.isEmailVerified ? t('Verified') : t('Not Verified')}
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={handleEditEmail}>
                <Icon name="edit-2" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.infoItem}>
              <View style={styles.infoIconContainer}>
                <Icon name="phone" size={20} color={colors.info} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{t('Phone')}</Text>
                <Text style={styles.infoValue}>{userData.phone || 'N/A'}</Text>
                <View style={styles.verificationBadge}>
                  <Icon
                    name={userData.isPhoneVerified ? 'check-circle' : 'x-circle'}
                    size={14}
                    color={userData.isPhoneVerified ? colors.success : colors.error}
                  />
                  <Text
                    style={[
                      styles.verificationText,
                      {
                        color: userData.isPhoneVerified ? colors.success : colors.error,
                      },
                    ]}
                  >
                    {userData.isPhoneVerified ? t('Verified') : t('Not Verified')}
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={handleEditMobile}>
                <Icon name="edit-2" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.infoItem}>
              <View style={styles.infoIconContainer}>
                <Icon name="map-pin" size={20} color={colors.info} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{t('Address')}</Text>
                <Text style={styles.infoValue}>{userData.address || 'N/A'}</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <View style={styles.infoIconContainer}>
                <Icon name="hash" size={20} color={colors.info} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{t('Pincode')}</Text>
                <Text style={styles.infoValue}>{userData.pincode || 'N/A'}</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <View style={styles.infoIconContainer}>
                <Icon name="file-text" size={20} color={colors.info} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{t('Contract ID')}</Text>
                <Text style={styles.infoValue}>{userData.contractId || 'N/A'}</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <View style={styles.infoIconContainer}>
                <Icon name="briefcase" size={20} color={colors.info} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{t('GST Number')}</Text>
                <Text style={styles.infoValue}>{userData.gstNumber || 'N/A'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Security Settings Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('Security')}</Text>
          </View>
          <TouchableOpacity
            style={styles.securityItem}
            onPress={() => setShowChangePasswordModal(true)}
          >
            <View style={styles.securityItemLeft}>
              <View style={[styles.infoIconContainer, { backgroundColor: isDarkMode ? '#172554' : '#EFF6FF' }]}>
                <Icon name="lock" size={20} color={colors.info} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{t('Change Password')}</Text>
                <Text style={styles.infoValue}>{t('Update your account password')}</Text>
              </View>
            </View>
            <Icon name="chevron-right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>



          <View style={styles.securityItem}>
            <View style={styles.securityItemLeft}>
              <View style={[styles.infoIconContainer, { backgroundColor: isDarkMode ? '#172554' : '#EFF6FF' }]}>
                <Icon name="fingerprint" size={20} color={colors.info} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{t('Biometric Login')}</Text>
                <Text style={styles.infoValue}>{t('Use fingerprint/face to log in')}</Text>
              </View>
            </View>
            <Switch
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={isBiometricEnabled ? colors.textWhite : "#F9FAFB"}
              ios_backgroundColor={colors.border}
              onValueChange={handleToggleBiometric}
              value={isBiometricEnabled}
            />
          </View>
        </View>

        {/* Account Status Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>{t('Account Status')}</Text>
          <View style={styles.statusGrid}>
            <View style={styles.statusItem}>
              <Icon
                name={userData.isEmailVerified ? 'check-circle' : 'x-circle'}
                size={24}
                color={userData.isEmailVerified ? colors.success : colors.error}
              />
              <Text style={styles.statusLabel}>{t('Email Verified')}</Text>
              <Text style={styles.statusValue}>
                {userData.isEmailVerified ? t('Yes') : t('No')}
              </Text>
            </View>

            <View style={styles.statusItem}>
              <Icon
                name={userData.isPhoneVerified ? 'check-circle' : 'x-circle'}
                size={24}
                color={userData.isPhoneVerified ? colors.success : colors.error}
              />
              <Text style={styles.statusLabel}>{t('Phone Verified')}</Text>
              <Text style={styles.statusValue}>
                {userData.isPhoneVerified ? t('Yes') : t('No')}
              </Text>
            </View>

            <View style={styles.statusItem}>
              <Icon
                name={userData.isActive ? 'check-circle' : 'x-circle'}
                size={24}
                color={userData.isActive ? colors.success : colors.error}
              />
              <Text style={styles.statusLabel}>{t('Account Active')}</Text>
              <Text style={styles.statusValue}>
                {userData.isActive ? t('Active') : t('Inactive')}
              </Text>
            </View>

            <View style={styles.statusItem}>
              <Icon
                name={userData.isLocked ? 'lock' : 'unlock'}
                size={24}
                color={userData.isLocked ? colors.error : colors.success}
              />
              <Text style={styles.statusLabel}>{t('Account Locked')}</Text>
              <Text style={styles.statusValue}>
                {userData.isLocked ? t('Locked') : t('Unlocked')}
              </Text>
            </View>
          </View>
        </View>

        {/* Permissions Section */}
        {userData.permissions && userData.permissions.length > 0 && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>{t('Permissions')}</Text>
            <View style={styles.permissionsContainer}>
              {userData.permissions.map((permission, index) => (
                <View key={index} style={styles.permissionBadge}>
                  <Text style={styles.permissionText}>{permission}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Account Details Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>{t('Account Details')}</Text>
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>{t('Member Since')}</Text>
              <Text style={styles.detailValue}>
                {formatDate(userData.createdAt)}
              </Text>
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>{t('Last Updated')}</Text>
              <Text style={styles.detailValue}>
                {formatDate(userData.updatedAt)}
              </Text>
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>{t('User ID')}</Text>
              <Text style={styles.detailValueSmall}>{userData.id || 'N/A'}</Text>
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>{t('Login Attempts')}</Text>
              <Text style={styles.detailValue}>
                {userData.loginAttempts !== undefined ? userData.loginAttempts : 'N/A'}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Modals */}
      <EditProfileModal
        visible={showEditProfileModal}
        onClose={() => setShowEditProfileModal(false)}
        user={userData}
        onSuccess={(updatedData) => refreshProfile(updatedData)}
      />

      <EditEmailModal
        visible={showEditEmailModal}
        onClose={() => setShowEditEmailModal(false)}
        user={userData}
        onSuccess={(updatedData) => refreshProfile(updatedData)}
      />

      <EditMobileModal
        visible={showEditMobileModal}
        onClose={() => setShowEditMobileModal(false)}
        user={userData}
        onSuccess={(updatedData) => refreshProfile(updatedData)}
      />

      <ChangePasswordModal
        visible={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
        onSuccess={() => {
          Toast.show({
            type: 'success',
            text1: t('Success!'),
            text2: t('Password changed successfully'),
          });
        }}
      />

      <BiometricPromptModal
        visible={showBiometricModal}
        onClose={() => {
          setShowBiometricModal(false);
          setBiometricError(null);
        }}
        onSubmit={submitBiometricActivation}
        loading={biometricLoading}
        error={biometricError}
      />

      <CustomerCareFooter />
    </View>
  );
};

export default ProfileScreen;


