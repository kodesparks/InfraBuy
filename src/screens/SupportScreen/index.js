import React, { useState } from 'react';
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
import { colors, spacing, borderRadius } from '../../assets/styles/global';
import AppHeader from '../../components/common/AppHeader';

const SupportScreen = ({ navigation }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: 'Hello! Welcome to infraXpert Support. I\'m Sarah, your dedicated support agent. How can I help you today?',
      isUser: false,
      time: 'Just now',
      timestamp: new Date(),
      isAgent: true,
    },
    {
      id: 2,
      text: 'We\'re here to assist you with:\n• Product inquiries\n• Order tracking\n• Delivery issues\n• Technical support\n• General questions',
      isUser: false,
      time: 'Just now',
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
        'Thank you for your message! I understand your concern. Let me help you with that.',
        'I\'m here to assist you. Could you please provide more details about your issue?',
        'That\'s a great question! Let me check our system for the most up-to-date information.',
        'I appreciate you reaching out. Our team is committed to resolving your query quickly.',
        'I\'ve noted your request. You can expect a detailed response within 2-4 hours during business hours.',
        'For immediate assistance, you can also reach us at:\n📞 +91-9876543210\n📧 support@infraxpert.com'
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
          <Icon name="person" size={16} color={colors.white} />
        </View>
      )}
      <View style={[
        styles.messageBubble,
        item.isUser ? styles.userBubble : styles.supportBubble
      ]}>
        {!item.isUser && item.isAgent && (
          <Text style={styles.agentName}>Sarah - Support Agent</Text>
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

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
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
              onPress={() => setNewMessage('I need help with my order')}
            >
              <Text style={styles.quickActionText}>Order Help</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => setNewMessage('I have a delivery issue')}
            >
              <Text style={styles.quickActionText}>Delivery Issue</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => setNewMessage('Product inquiry')}
            >
              <Text style={styles.quickActionText}>Product Info</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="Type your message..."
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
    paddingVertical: spacing.md,
  },
  messageContainer: {
    marginBottom: spacing.md,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  supportMessage: {
    alignItems: 'flex-start',
    flexDirection: 'row',
  },
  agentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
    marginTop: 4,
  },
  agentName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 4,
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  userBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  supportBubble: {
    backgroundColor: colors.white,
    borderBottomLeftRadius: 4,
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
  userMessageText: {
    color: colors.white,
  },
  supportMessageText: {
    color: colors.text,
  },
  messageTime: {
    fontSize: 12,
    marginTop: 4,
  },
  userMessageTime: {
    color: colors.white,
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
    width: 8,
    height: 8,
    borderRadius: 4,
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
    paddingTop: spacing.sm,
    paddingBottom: 20, // Add extra padding to avoid bottom bar
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  quickActions: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    justifyContent: 'space-between',
  },
  quickActionButton: {
    backgroundColor: colors.lightGray,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    flex: 1,
    marginHorizontal: 2,
  },
  quickActionText: {
    fontSize: 12,
    color: colors.text,
    textAlign: 'center',
    fontWeight: '500',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.lightGray,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 50,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    maxHeight: 100,
    paddingVertical: 0,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  sendButtonActive: {
    backgroundColor: colors.primary,
  },
  sendButtonInactive: {
    backgroundColor: colors.lightGray,
  },
});

export default SupportScreen;
