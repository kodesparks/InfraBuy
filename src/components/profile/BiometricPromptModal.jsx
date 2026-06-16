import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Modal,
    StyleSheet,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { colors, spacing, borderRadius } from '../../assets/styles/global';
import { useTranslation } from 'react-i18next';

const BiometricPromptModal = ({ visible, onClose, onSubmit, loading, error }) => {
    const { t } = useTranslation();
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = () => {
        if (!password.trim()) return;
        onSubmit(password);
    };

    const handleClose = () => {
        setPassword('');
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={handleClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.modalOverlay}
            >
                <TouchableOpacity
                    style={styles.overlay}
                    activeOpacity={1}
                    onPress={handleClose}
                />
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <Text style={styles.title}>{t('Enable Biometric Login')}</Text>
                        <TouchableOpacity onPress={handleClose} disabled={loading}>
                            <Icon name="x" size={24} color={colors.textPrimary} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.form}>
                        <Text style={styles.description}>
                            {t('To enable biometric login, please verify your current password so we can securely store your credentials on this device.')}
                        </Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Password *</Text>
                            <View style={styles.passwordContainer}>
                                <TextInput
                                    style={[styles.input, error && styles.inputError]}
                                    value={password}
                                    onChangeText={setPassword}
                                    placeholder={t('Enter your password')}
                                    placeholderTextColor={colors.textSecondary}
                                    secureTextEntry={!showPassword}
                                    editable={!loading}
                                />
                                <TouchableOpacity
                                    style={styles.eyeIcon}
                                    onPress={() => setShowPassword(!showPassword)}
                                >
                                    <Icon
                                        name={showPassword ? 'eye-off' : 'eye'}
                                        size={20}
                                        color={colors.textSecondary}
                                    />
                                </TouchableOpacity>
                            </View>
                            {error && (
                                <Text style={styles.errorText}>{error}</Text>
                            )}
                        </View>

                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                style={[styles.cancelButton, loading && styles.buttonDisabled]}
                                onPress={handleClose}
                                disabled={loading}
                            >
                                <Text style={styles.cancelButtonText}>{t('Cancel')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.submitButton,
                                    (!password.trim() || loading) && styles.buttonDisabled
                                ]}
                                onPress={handleSubmit}
                                disabled={!password.trim() || loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#FFFFFF" />
                                ) : (
                                    <Text style={styles.submitButtonText}>{t('Enable')}</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: colors.white,
        borderTopLeftRadius: borderRadius.xl,
        borderTopRightRadius: borderRadius.xl,
        padding: spacing.lg,
        maxHeight: '90%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.textPrimary,
    },
    description: {
        fontSize: 14,
        color: colors.textSecondary,
        marginBottom: spacing.md,
        lineHeight: 20,
    },
    form: {
        gap: spacing.md,
    },
    inputGroup: {
        marginBottom: spacing.md,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: spacing.sm,
    },
    passwordContainer: {
        position: 'relative',
    },
    input: {
        backgroundColor: '#F9FAFB',
        borderRadius: borderRadius.md,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        fontSize: 16,
        color: colors.textPrimary,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        paddingRight: 50,
    },
    inputError: {
        borderColor: '#EF4444',
    },
    eyeIcon: {
        position: 'absolute',
        right: spacing.md,
        top: '50%',
        transform: [{ translateY: -10 }],
        padding: spacing.xs,
    },
    errorText: {
        fontSize: 12,
        color: '#EF4444',
        marginTop: spacing.xs,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: spacing.md,
        marginTop: spacing.md,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textPrimary,
    },
    submitButton: {
        flex: 1,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.md,
        backgroundColor: '#723FED',
        alignItems: 'center',
        justifyContent: 'center',
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    buttonDisabled: {
        opacity: 0.6,
    },
});

export default BiometricPromptModal;
