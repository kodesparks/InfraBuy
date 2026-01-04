import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Alert, 
  Image,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import Toast from 'react-native-toast-message';
import styles from '../../assets/styles/profile';

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
import CustomerCareFooter from '../../components/common/CustomerCareFooter';

const ProfileScreen = ({ navigation }) => {
  const { user, logout, refreshProfile } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showEditEmailModal, setShowEditEmailModal] = useState(false);
  const [showEditMobileModal, setShowEditMobileModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  // Use real user data from AuthContext, fallback to empty object
  const userData = user || {};

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
        'Not Available',
        'Image picker is not available. Please ensure react-native-image-picker is properly installed and linked.',
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Upload Avatar',
      'Choose an option',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Choose from Gallery',
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
                    Alert.alert('Error', `Image picker error: ${response.errorMessage || 'Unknown error'}`);
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
        text1: 'Error',
        text2: 'User ID not found',
      });
      return;
    }

    setLoading(true);
    try {
      const result = await uploadAvatar(userData.id, imageUri);
      if (result.success) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: result.message || 'Avatar uploaded successfully',
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
          text1: 'Error',
          text2: result.error?.message || 'Failed to upload avatar',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to upload avatar',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              Toast.show({
                type: 'success',
                text1: 'Logged Out',
                text2: 'You have been successfully logged out',
              });
              navigation.navigate('Login');
            } catch (error) {
              Toast.show({
                type: 'error',
                text1: 'Logout Failed',
                text2: 'Something went wrong. Please try again.',
              });
            }
          },
        },
      ]
    );
  };

  const getRoleBadgeColor = (role) => {
    const roleColors = {
      admin: { bg: '#FEE2E2', text: '#991B1B' },
      manager: { bg: '#F3E8FF', text: '#6B21A8' },
      employee: { bg: '#DBEAFE', text: '#1E40AF' },
      vendor: { bg: '#FED7AA', text: '#9A3412' },
      customer: { bg: '#D1FAE5', text: '#065F46' },
    };
    return roleColors[role] || roleColors.customer;
  };

  const getAccessLevelBadgeColor = (accessLevel) => {
    const accessColors = {
      app_web: { bg: '#DBEAFE', text: '#1E40AF' },
      app_mobile: { bg: '#D1FAE5', text: '#065F46' },
      web_only: { bg: '#F3E8FF', text: '#6B21A8' },
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

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
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
                <ActivityIndicator size="small" color="#FFFFFF" />
              </View>
            )}
            <View style={styles.avatarEditIcon}>
              <Icon name="camera" size={16} color="#FFFFFF" />
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
            <Icon name="log-out" size={18} color="#FFFFFF" style={styles.logoutIcon} />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Personal Information Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            <TouchableOpacity onPress={handleEditProfile}>
              <Icon name="edit-2" size={18} color="#3B82F6" />
            </TouchableOpacity>
          </View>

          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <View style={styles.infoIconContainer}>
                <Icon name="mail" size={20} color="#3B82F6" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{userData.email || 'N/A'}</Text>
                <View style={styles.verificationBadge}>
                  <Icon
                    name={userData.isEmailVerified ? 'check-circle' : 'x-circle'}
                    size={14}
                    color={userData.isEmailVerified ? '#10B981' : '#EF4444'}
                  />
                  <Text
                    style={[
                      styles.verificationText,
                      {
                        color: userData.isEmailVerified ? '#10B981' : '#EF4444',
                      },
                    ]}
                  >
                    {userData.isEmailVerified ? 'Verified' : 'Not Verified'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={handleEditEmail}>
                <Icon name="edit-2" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <View style={styles.infoItem}>
              <View style={styles.infoIconContainer}>
                <Icon name="phone" size={20} color="#3B82F6" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Phone</Text>
                <Text style={styles.infoValue}>{userData.phone || 'N/A'}</Text>
                <View style={styles.verificationBadge}>
                  <Icon
                    name={userData.isPhoneVerified ? 'check-circle' : 'x-circle'}
                    size={14}
                    color={userData.isPhoneVerified ? '#10B981' : '#EF4444'}
                  />
                  <Text
                    style={[
                      styles.verificationText,
                      {
                        color: userData.isPhoneVerified ? '#10B981' : '#EF4444',
                      },
                    ]}
                  >
                    {userData.isPhoneVerified ? 'Verified' : 'Not Verified'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={handleEditMobile}>
                <Icon name="edit-2" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <View style={styles.infoItem}>
              <View style={styles.infoIconContainer}>
                <Icon name="map-pin" size={20} color="#3B82F6" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Address</Text>
                <Text style={styles.infoValue}>{userData.address || 'N/A'}</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <View style={styles.infoIconContainer}>
                <Icon name="hash" size={20} color="#3B82F6" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Pincode</Text>
                <Text style={styles.infoValue}>{userData.pincode || 'N/A'}</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <View style={styles.infoIconContainer}>
                <Icon name="file-text" size={20} color="#3B82F6" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Contract ID</Text>
                <Text style={styles.infoValue}>{userData.contractId || 'N/A'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Security Settings Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Security</Text>
          </View>
          <TouchableOpacity
            style={styles.securityItem}
            onPress={() => setShowChangePasswordModal(true)}
          >
            <View style={styles.securityItemLeft}>
              <View style={styles.infoIconContainer}>
                <Icon name="lock" size={20} color="#3B82F6" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Change Password</Text>
                <Text style={styles.infoValue}>Update your account password</Text>
              </View>
            </View>
            <Icon name="chevron-right" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Account Status Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Account Status</Text>
          <View style={styles.statusGrid}>
            <View style={styles.statusItem}>
              <Icon
                name={userData.isEmailVerified ? 'check-circle' : 'x-circle'}
                size={24}
                color={userData.isEmailVerified ? '#10B981' : '#EF4444'}
              />
              <Text style={styles.statusLabel}>Email Verified</Text>
              <Text style={styles.statusValue}>
                {userData.isEmailVerified ? 'Yes' : 'No'}
              </Text>
            </View>

            <View style={styles.statusItem}>
              <Icon
                name={userData.isPhoneVerified ? 'check-circle' : 'x-circle'}
                size={24}
                color={userData.isPhoneVerified ? '#10B981' : '#EF4444'}
              />
              <Text style={styles.statusLabel}>Phone Verified</Text>
              <Text style={styles.statusValue}>
                {userData.isPhoneVerified ? 'Yes' : 'No'}
              </Text>
            </View>

            <View style={styles.statusItem}>
              <Icon
                name={userData.isActive ? 'check-circle' : 'x-circle'}
                size={24}
                color={userData.isActive ? '#10B981' : '#EF4444'}
              />
              <Text style={styles.statusLabel}>Account Active</Text>
              <Text style={styles.statusValue}>
                {userData.isActive ? 'Active' : 'Inactive'}
              </Text>
            </View>

            <View style={styles.statusItem}>
              <Icon
                name={userData.isLocked ? 'lock' : 'unlock'}
                size={24}
                color={userData.isLocked ? '#EF4444' : '#10B981'}
              />
              <Text style={styles.statusLabel}>Account Locked</Text>
              <Text style={styles.statusValue}>
                {userData.isLocked ? 'Locked' : 'Unlocked'}
              </Text>
            </View>
          </View>
        </View>

        {/* Permissions Section */}
        {userData.permissions && userData.permissions.length > 0 && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Permissions</Text>
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
          <Text style={styles.sectionTitle}>Account Details</Text>
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Member Since</Text>
              <Text style={styles.detailValue}>
                {formatDate(userData.createdAt)}
              </Text>
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Last Updated</Text>
              <Text style={styles.detailValue}>
                {formatDate(userData.updatedAt)}
              </Text>
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>User ID</Text>
              <Text style={styles.detailValueSmall}>{userData.id || 'N/A'}</Text>
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Login Attempts</Text>
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
            text1: 'Success',
            text2: 'Password changed successfully',
          });
        }}
      />

      <CustomerCareFooter />
    </View>
  );
};

export default ProfileScreen;
