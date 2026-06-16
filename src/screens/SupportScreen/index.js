import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { spacing, borderRadius, shadows } from '../../assets/styles/global';
import AppHeader from '../../components/common/AppHeader';
import Skeleton from '../../components/common/Skeleton';

const SupportScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { colors, isDarkMode } = useTheme();
  const styles = React.useMemo(() => createStyles(colors, isDarkMode), [colors, isDarkMode]);
  
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: t('Hello! Welcome to InfraExpert Support. I\'m Sarah, your dedicated support agent. How can I help you today?'),
      isUser: false,
      time: t('Just now'),
      timestamp: new Date(),
      isAgent: true,
    },
    {
      id: 2,
      text: t('We\'re here to assist you with:\n• Product inquiries\n• Order tracking\n• Delivery issues\n• Technical support\n• General questions\n\n📞 Customer Care: 9000390909'),
      isUser: false,
      time: t('Just now'),
      timestamp: new Date(),
      isAgent: true,
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = () => {
    if (newMessage.trim() === '') return;

    const userMessage = {
      id: Date.now(),
      text: newMessage.trim(),
      isUser: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsTyping(true);

    // Simulate support response with more helpful messages
    setTimeout(() => {
      const responses = [
        t(`Thank you for your message! I understand your concern. Let me help you with that.`),
        t(`I'm here to assist you. Could you please provide more details about your issue?`),
        t(`That's a great question! Let me check our system for the most up-to-date information.`),
        t(`I appreciate you reaching out. Our team is committed to resolving your query quickly.`),
        t(`I've noted your request. You can expect a detailed response within 2-4 hours during business hours.`),
        t(`For immediate assistance, you can also reach us at:\n📞 9000390909\n📧 support@infraexpert.com`)
      ];

      const randomResponse = responses[Math.floor(Math.random() * responses.length)];

      const supportResponse = {
        id: Date.now() + 1,
        text: randomResponse,
        isUser: false,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timestamp: new Date(),
        isAgent: true,
      };
      setMessages(prev => [...prev, supportResponse]);
      setIsTyping(false);
    }, 2000);
  };

  const renderMessage = ({ item }) => (
    <View style={[
      styles.messageContainer,
      item.isUser ? styles.userMessage : styles.supportMessage
    ]}>
      {!item.isUser && (
        <View style={styles.agentAvatar}>
          <Icon name="person" size={16} color="#ffffff" />
        </View>
      )}
      <View style={[
        styles.messageBubble,
        item.isUser ? styles.userBubble : styles.supportBubble
      ]}>
        {!item.isUser && item.isAgent && (
          <Text style={styles.agentName}>{t('Sarah - Support Agent')}</Text>
        )}
        <Text style={[
          styles.messageText,
          item.isUser ? styles.userMessageText : styles.supportMessageText
        ]}>
          {item.text}
        </Text>
        <Text style={[
          styles.messageTime,
          item.isUser ? styles.userMessageTime : styles.supportMessageTime
        ]}>
          {item.time}
        </Text>
      </View>
    </View>
  );

  const renderTypingIndicator = () => (
    <View style={[styles.messageContainer, styles.supportMessage]}>
      <View style={[styles.messageBubble, styles.supportBubble]}>
        <View style={styles.typingContainer}>
          <View style={styles.typingDot} />
          <View style={[styles.typingDot, styles.typingDotDelay1]} />
          <View style={[styles.typingDot, styles.typingDotDelay2]} />
        </View>
      </View>
    </View>
  );

  const renderSupportSkeleton = () => (
    <View style={styles.messagesContent}>
      <View style={{ flexDirection: 'row', marginBottom: 20 }}>
        <Skeleton width={36} height={36} borderRadius={18} style={{ marginRight: 12 }} />
        <Skeleton width="70%" height={100} borderRadius={16} />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 20 }}>
        <Skeleton width="60%" height={60} borderRadius={16} />
      </View>
      <View style={{ flexDirection: 'row', marginBottom: 20 }}>
        <Skeleton width={36} height={36} borderRadius={18} style={{ marginRight: 12 }} />
        <Skeleton width="50%" height={80} borderRadius={16} />
      </View>
    </View>
  );

  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <AppHeader navigation={navigation} title="Support Chat" showBack={true} cartCount={0} notificationCount={0} />
        {renderSupportSkeleton()}
        <View style={styles.inputContainer}>
          <Skeleton width="100%" height={56} borderRadius={28} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader
        navigation={navigation}
        title="Support Chat"
        showBack={true}
        cartCount={0}
        notificationCount={0}
      />

      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id.toString()}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={isTyping ? renderTypingIndicator : null}
        />

        <View style={styles.inputContainer}>
          {/* Quick Action Buttons */}
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => setNewMessage(t('I need help with my order'))}
            >
              <Text style={styles.quickActionText}>{t('Order Help')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => setNewMessage(t('I have a delivery issue'))}
            >
              <Text style={styles.quickActionText}>{t('Delivery Issue')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => setNewMessage(t('Product inquiry'))}
            >
              <Text style={styles.quickActionText}>{t('Product Info')}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder={t("Type your message...")}
              placeholderTextColor={colors.textSecondary}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                newMessage.trim() ? styles.sendButtonActive : styles.sendButtonInactive
              ]}
              onPress={handleSendMessage}
              disabled={!newMessage.trim()}
            >
              <Icon
                name="send"
                size={20}
                color={newMessage.trim() ? colors.white : colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const createStyles = (colors, isDarkMode) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  messagesContent: {
    paddingTop: 130, // Increased header clearance
    paddingBottom: spacing.md,
  },
  messageContainer: {
    marginBottom: spacing.lg,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  supportMessage: {
    alignItems: 'flex-start',
    flexDirection: 'row',
  },
  agentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: isDarkMode ? colors.surface_container : '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
    marginTop: 4,
  },
  agentName: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
  },
  userBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
    ...shadows.cloud,
  },
  supportBubble: {
    backgroundColor: isDarkMode ? colors.surface_container_low : '#f3f4f6',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
  },
  userMessageText: {
    color: '#ffffff',
  },
  supportMessageText: {
    color: colors.textPrimary,
  },
  messageTime: {
    fontSize: 10,
    marginTop: 6,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  userMessageTime: {
    color: '#ffffff',
    opacity: 0.8,
  },
  supportMessageTime: {
    color: colors.textSecondary,
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.textSecondary,
    marginHorizontal: 2,
    opacity: 0.4,
  },
  typingDotDelay1: {
    opacity: 0.6,
  },
  typingDotDelay2: {
    opacity: 0.8,
  },
  inputContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: 110, // Increased to clear FloatingTabBar (approx 90-100px)
    backgroundColor: colors.background,
  },
  quickActions: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  quickActionButton: {
    backgroundColor: isDarkMode ? colors.card : '#f3f4f6',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.cloud,
  },
  quickActionText: {
    fontSize: 11,
    color: colors.textPrimary,
    textAlign: 'center',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDarkMode ? colors.card : '#f3f4f6',
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    minHeight: 56,
    ...shadows.cloud,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
    maxHeight: 120,
    paddingVertical: spacing.sm,
    fontWeight: '500',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  sendButtonActive: {
    backgroundColor: colors.primary,
    ...shadows.cloud,
  },
  sendButtonInactive: {
    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#e5e7eb',
  },
});

export default SupportScreen;



