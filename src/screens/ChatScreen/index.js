import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, FlatList, Alert } from 'react-native';
import styles from '../../assets/styles/chat';
import { colors } from '../../assets/styles/global';

const ChatScreen = ({ navigation }) => {
  const [message, setMessage] = useState('');
  const [chatHistory] = useState([
    {
      id: 1,
      type: 'received',
      message: 'Hello! Welcome to InfraBuy customer support. How can I help you today?',
      time: '10:30 AM'
    },
    {
      id: 2,
      type: 'sent',
      message: 'Hi! I have a question about my recent order #12345',
      time: '10:32 AM'
    },
    {
      id: 3,
      type: 'received',
      message: 'Sure! I can help you with that. What would you like to know about your order?',
      time: '10:33 AM'
    },
    {
      id: 4,
      type: 'sent',
      message: 'When will it be delivered?',
      time: '10:35 AM'
    },
    {
      id: 5,
      type: 'received',
      message: 'Your order is scheduled for delivery tomorrow between 10 AM - 2 PM. You will receive a notification when the delivery truck is on its way.',
      time: '10:36 AM'
    }
  ]);

  const quickReplies = [
    'Order Status',
    'Delivery Time',
    'Payment Issue',
    'Product Quality',
    'Return Policy'
  ];

  const handleSendMessage = () => {
    if (message.trim()) {
      Alert.alert('Message Sent', 'Your message has been sent to customer support.');
      setMessage('');
    }
  };

  const handleQuickReply = (reply) => {
    setMessage(reply);
  };

  const renderMessage = ({ item }) => (
    <View style={[
      styles.messageContainer,
      item.type === 'sent' ? styles.sentMessage : styles.receivedMessage
    ]}>
      <View style={[
        styles.messageBubble,
        item.type === 'sent' ? styles.sentBubble : styles.receivedBubble
      ]}>
        <Text style={[
          styles.messageText,
          item.type === 'sent' ? styles.sentText : styles.receivedText
        ]}>
          {item.message}
        </Text>
        <Text style={[
          styles.messageTime,
          item.type === 'sent' ? styles.sentTime : styles.receivedTime
        ]}>
          {item.time}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Chat Messages */}
      <FlatList
        data={chatHistory}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.chatContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* Quick Replies */}
      <View style={styles.quickRepliesContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {quickReplies.map((reply, index) => (
            <TouchableOpacity
              key={index}
              style={styles.quickReplyButton}
              onPress={() => handleQuickReply(reply)}
            >
              <Text style={styles.quickReplyText}>{reply}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Message Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.messageInput}
          placeholder="Type your message..."
          value={message}
          onChangeText={setMessage}
          multiline
          placeholderTextColor={colors.darkGray}
        />
        <TouchableOpacity 
          style={[styles.sendButton, !message.trim() && styles.sendButtonDisabled]}
          onPress={handleSendMessage}
          disabled={!message.trim()}
        >
          <Text style={styles.sendButtonText}>📤</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ChatScreen; 