import { StyleSheet, Platform, Dimensions } from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from './global';

const { width, height } = Dimensions.get('window');

const createStyles = (colors, isDarkMode) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  chatContainer: {
    paddingHorizontal: 20,
    paddingTop: 130, // Increased standard clearance for absolute floating header
    paddingBottom: 20,
  },
  messageContainer: {
    marginBottom: 15,
  },
  sentMessage: {
    alignItems: 'flex-end',
  },
  receivedMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: width * 0.75,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 18,
  },
  sentBubble: {
    backgroundColor: 'transparent',
    borderBottomRightRadius: 5,
  },
  receivedBubble: {
    backgroundColor: isDarkMode ? colors.card : colors.white,
    borderBottomLeftRadius: 5,
    ...shadows.cloud,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  sentText: {
    color: colors.white,
  },
  receivedText: {
    color: colors.textPrimary,
  },
  messageTime: {
    fontSize: 12,
    marginTop: 5,
  },
  sentTime: {
    color: colors.white,
    opacity: 0.8,
    textAlign: 'right',
  },
  receivedTime: {
    color: colors.textSecondary,
  },
  quickRepliesContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: colors.background,
  },
  quickReplyButton: {
    backgroundColor: isDarkMode ? colors.card : colors.white,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
  },
  quickReplyText: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 110, // Increased to clear FloatingTabBar
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
  },
  messageInput: {
    flex: 1,
    backgroundColor: isDarkMode ? colors.card : '#f3f4f6',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    fontSize: 16,
    maxHeight: 100,
    color: colors.textPrimary,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#e5e7eb',
  },
  sendButtonText: {
    fontSize: 18,
  },
});

export default createStyles; 


