import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, borderRadius } from '../../assets/styles/global';

const MessageBox = ({ 
  title = 'Chat Support',
  placeholder = 'Type your message...',
  onSend,
  messages = [],
  isVisible = false,
  onClose
}) => {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim()) {
      if (onSend) {
        onSend(message.trim());
      }
      setMessage('');
    }
  };

  if (!isVisible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icon name="close" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Messages */}
        <ScrollView style={styles.messagesContainer} showsVerticalScrollIndicator={false}>
          {messages.map((msg, index) => (
            <View key={index} style={[
              styles.messageBubble,
              msg.isUser ? styles.userMessage : styles.supportMessage
            ]}>
              <Text style={[
                styles.messageText,
                msg.isUser ? styles.userMessageText : styles.supportMessageText
              ]}>
                {msg.text}
              </Text>
              <Text style={styles.messageTime}>{msg.time}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Input */}
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.inputContainer}
        >
          <TextInput
            style={styles.textInput}
            value={message}
            onChangeText={setMessage}
            placeholder={placeholder}
            placeholderTextColor={colors.textSecondary}
            multiline
            maxLength={500}
          />
          <TouchableOpacity 
            style={[styles.sendButton, !message.trim() && styles.sendButtonDisabled]} 
            onPress={handleSend}
            disabled={!message.trim()}
          >
            <Icon 
              name="send" 
              size={20} 
              color={message.trim() ? colors.white : colors.textSecondary} 
            />
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  container: {
    width: '90%',
    height: '80%',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.primary,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.white,
  },
  closeButton: {
    padding: spacing.sm,
  },
  messagesContainer: {
    flex: 1,
    padding: spacing.md,
  },
  messageBubble: {
    marginBottom: spacing.sm,
    maxWidth: '80%',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
  },
  supportMessage: {
    alignSelf: 'flex-start',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userMessageText: {
    color: colors.white,
  },
  supportMessageText: {
    color: colors.textPrimary,
  },
  messageTime: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginRight: spacing.sm,
    maxHeight: 100,
    fontSize: 14,
    color: colors.textPrimary,
  },
  sendButton: {
    backgroundColor: colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.border,
  },
});

export default MessageBox;
