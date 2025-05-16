import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { Text, TextInput, IconButton, ActivityIndicator } from 'react-native-paper';
import { COLORS, SPACING, RADIUS } from '../../../config/theme';
import { chatWithCoach } from '../../../api/aiCoach';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

// Debug logging
console.debug('[AICoachScreen] Initializing screen');

// Define haptic feedback constants for clarity
const HAPTIC_FEEDBACK = {
  LIGHT: Haptics.ImpactFeedbackStyle.Light,
  MEDIUM: Haptics.ImpactFeedbackStyle.Medium,
  HEAVY: Haptics.ImpactFeedbackStyle.Heavy,
  SUCCESS: Haptics.NotificationFeedbackType.Success,
  WARNING: Haptics.NotificationFeedbackType.Warning,
  ERROR: Haptics.NotificationFeedbackType.Error,
};

const Message = ({ content, isUser }) => (
  <View style={[
    styles.messageBubble,
    isUser ? styles.userMessage : styles.aiMessage
  ]}>
    <Text style={[
      styles.messageText,
      isUser ? styles.userMessageText : styles.aiMessageText
    ]}>
      {content}
    </Text>
  </View>
);

const AICoachScreen = ({ navigation }) => {
  // State management
  const [messages, setMessages] = useState([
    { 
      id: '1', 
      content: "So, tell me about your goals. What are you supposedly 'working toward' but making excuses about?", 
      isUser: false 
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Refs
  const flatListRef = useRef(null);

  // Debug logging for state changes
  console.debug('[AICoachScreen] Messages count:', messages.length);

  // Set navigation options when screen is focused
  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: 'Accountability Coach',
      headerTintColor: COLORS.white,
      headerStyle: {
        backgroundColor: COLORS.background,
      },
    });
    
    // Debug log
    console.debug('[AICoachScreen] Screen focused, header options set');
  }, [navigation]);

  const handleSend = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      content: inputMessage.trim(),
      isUser: true
    };
    
    // Always add the user message immediately
    setMessages(prev => [...prev, userMessage]);
    const currentMessage = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);

    try {
      // Scroll to bottom
      flatListRef.current?.scrollToEnd();
      
      // Haptic feedback - stronger for the tough coach
      await Haptics.impactAsync(HAPTIC_FEEDBACK.MEDIUM);

      // Get AI response
      try {
        console.debug('[AICoachScreen] Sending message to coach API');
        const response = await chatWithCoach(currentMessage);
        
        if (response?.data?.response) {
          // Use the response directly from the coach
          const aiMessage = {
            id: (Date.now() + 1).toString(),
            content: response.data.response,
            isUser: false
          };
          
          setMessages(prev => [...prev, aiMessage]);
          await Haptics.notificationAsync(HAPTIC_FEEDBACK.SUCCESS);
          console.debug('[AICoachScreen] Successfully received and displayed coach response');
        } else {
          throw new Error('Invalid response from coach');
        }
      } catch (error) {
        console.error('[AICoachScreen] Error from coach API:', error);
        
        // Add fallback error message from the coach that stays in character
        const errorMessage = {
          id: (Date.now() + 1).toString(),
          content: "Hmm, seems like you're trying to avoid our conversation. Technical issues? Or just another excuse? Let's continue when you're actually ready to be honest with yourself.",
          isUser: false
        };
        
        setMessages(prev => [...prev, errorMessage]);
        await Haptics.notificationAsync(HAPTIC_FEEDBACK.ERROR);
      }
    } catch (error) {
      console.error('[AICoachScreen] Critical error in message handling:', error);
      await Haptics.notificationAsync(HAPTIC_FEEDBACK.ERROR);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={[COLORS.background, '#f8f8f8']}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={item => item.id}
            renderItem={({ item }) => <Message {...item} />}
            contentContainerStyle={styles.messageList}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
            showsVerticalScrollIndicator={false}
          />
          
          <View style={styles.inputContainer}>
            <TextInput
              value={inputMessage}
              onChangeText={setInputMessage}
              placeholder="No excuses. Just type."
              style={styles.input}
              multiline
              maxLength={500}
              disabled={isLoading}
              right={
                isLoading ? (
                  <TextInput.Icon icon={() => <ActivityIndicator color={COLORS.accent} />} />
                ) : (
                  <TextInput.Icon 
                    icon="send"
                    disabled={!inputMessage.trim()}
                    onPress={handleSend}
                    color={inputMessage.trim() ? COLORS.accent : COLORS.disabled}
                  />
                )
              }
            />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  messageList: {
    padding: SPACING.md,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: SPACING.sm,
    marginVertical: SPACING.xs,
    borderRadius: RADIUS.lg,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.backgroundLight,
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.background,
    borderWidth: 0,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: COLORS.text,
  },
  aiMessageText: {
    color: COLORS.text,
    fontWeight: '500',
  },
  inputContainer: {
    padding: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  input: {
    maxHeight: 100,
    backgroundColor: COLORS.surface,
  },
});

export default AICoachScreen; 