import { StyleSheet, Platform, Dimensions } from 'react-native';
import { colors, typography } from './global';

const { width, height } = Dimensions.get('window');

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  chatContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
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
    backgroundColor: colors.primary,
    borderBottomRightRadius: 5,
  },
  receivedBubble: {
    backgroundColor: colors.white,
    borderBottomLeftRadius: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  sentText: {
    color: colors.white,
  },
  receivedText: {
    color: colors.text,
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
    color: colors.darkGray,
  },
  quickRepliesContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  quickReplyButton: {
    backgroundColor: colors.white,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  quickReplyText: {
    fontSize: 14,
    color: colors.text,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
    backgroundColor: colors.white,
  },
  messageInput: {
    flex: 1,
    backgroundColor: colors.lightGray,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    fontSize: 16,
    maxHeight: 100,
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
    backgroundColor: colors.lightGray,
  },
  sendButtonText: {
    fontSize: 18,
  },
}); 