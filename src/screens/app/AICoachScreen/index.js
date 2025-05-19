import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Text, TextInput, IconButton, ActivityIndicator, Button, Badge } from 'react-native-paper';
import { COLORS, SPACING, RADIUS } from '../../../config/theme';
import { chatWithCoach, checkUserTokens } from '../../../api/aiCoach';
import { getUserTokens, mockPurchaseTokens, TOKENS_CONFIG, tokensToCredits } from '../../../api/credits';
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

const CreditDisplay = ({ credits, onTopUp }) => (
  <View style={styles.creditContainer}>
    <View style={styles.creditBadge}>
      <Text style={styles.creditText}>Credits: {credits}</Text>
    </View>
    <TouchableOpacity onPress={onTopUp} style={styles.topUpButton}>
      <Text style={styles.topUpText}>Top Up</Text>
    </TouchableOpacity>
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
  const [tokens, setTokens] = useState(null);
  const [credits, setCredits] = useState(null);
  const [showCreditWarning, setShowCreditWarning] = useState(false);
  
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
      // Add credits display to header
      headerRight: () => credits !== null && (
        <CreditDisplay credits={credits} onTopUp={handleTopUpCredits} />
      ),
    });
    
    // Debug log
    console.debug('[AICoachScreen] Screen focused, header options set');
    
    // Load user credits
    loadUserTokens();
    
    // Set up focus listener to refresh tokens when screen is focused
    const unsubscribe = navigation.addListener('focus', () => {
      loadUserTokens();
    });
    
    return unsubscribe;
  }, [navigation, credits]);

  // Load user tokens from the database
  const loadUserTokens = async () => {
    try {
      console.debug('[AICoachScreen] Loading user tokens');
      const { tokens: userTokens, credits: userCredits } = await getUserTokens();
      console.debug('[AICoachScreen] User tokens loaded:', { tokens: userTokens, credits: userCredits });
      
      setTokens(userTokens);
      setCredits(userCredits);
      
      // Show warning if tokens are low
      const isLow = userTokens <= TOKENS_CONFIG.lowBalanceThreshold && userTokens > 0;
      setShowCreditWarning(isLow || userTokens === 0);
      
      if (isLow) {
        console.debug('[AICoachScreen] Low token balance warning shown');
      }
    } catch (error) {
      console.error('[AICoachScreen] Error loading user tokens:', error);
    }
  };

  // Handle purchasing more tokens
  const handleTopUpCredits = () => {
    console.debug('[AICoachScreen] Opening token purchase flow');
    
    // Show token package options using the config
    Alert.alert(
      'Purchase Credits',
      'Select a credit package to purchase:',
      TOKENS_CONFIG.packages.map(pkg => ({
        text: `${pkg.label} ($${pkg.price})`,
        onPress: () => processPurchase(pkg.id),
      })).concat([
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ])
    );
  };

  // Process the purchase
  const processPurchase = async (packageId) => {
    console.debug('[AICoachScreen] Processing purchase of package:', packageId);
    
    try {
      setIsLoading(true);
      
      // Get the package details
      const packageInfo = TOKENS_CONFIG.packages.find(p => p.id === packageId);
      if (!packageInfo) {
        throw new Error('Invalid package selected');
      }
      
      // In a real app, this would show a payment UI and process the payment
      // For now, we'll use our mock purchase function
      const result = await mockPurchaseTokens(packageInfo.tokens);
      
      if (result.success) {
        setTokens(result.newBalance.tokens);
        setCredits(result.newBalance.credits);
        
        const isLow = result.newBalance.tokens <= TOKENS_CONFIG.lowBalanceThreshold && result.newBalance.tokens > 0;
        setShowCreditWarning(isLow);
        
        // Convert for display (1000 tokens = 1 credit)
        const creditsAdded = result.added.credits;
        
        // Success message
        Alert.alert(
          'Purchase Successful',
          `${creditsAdded} credits (${result.added.tokens.toLocaleString()} tokens) have been added to your account.`,
          [{ text: 'OK' }]
        );
        
        // Haptic feedback for success
        await Haptics.notificationAsync(HAPTIC_FEEDBACK.SUCCESS);
        
        // Log the purchase
        console.debug('[AICoachScreen] Purchase completed:', {
          package: packageId,
          tokensAdded: result.added.tokens,
          creditsAdded: result.added.credits,
          newBalance: result.newBalance
        });
      } else {
        throw new Error('Purchase failed');
      }
    } catch (error) {
      console.error('[AICoachScreen] Error processing purchase:', error);
      Alert.alert('Purchase Failed', 'Unable to process your purchase. Please try again.');
      
      // Haptic feedback for failure
      await Haptics.notificationAsync(HAPTIC_FEEDBACK.ERROR);
    } finally {
      setIsLoading(false);
    }
  };

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
          
          // Update tokens and credits display with latest balance
          if (response.tokenInfo) {
            setTokens(response.tokenInfo.remaining);
            setCredits(response.tokenInfo.credits);
            setShowCreditWarning(response.tokenInfo.lowBalanceWarning);
            
            console.debug('[AICoachScreen] Updated token info:', response.tokenInfo);
            
            // Show warning if tokens are low
            if (response.tokenInfo.lowBalanceWarning && response.tokenInfo.remaining > 0) {
              setTimeout(() => {
                const creditsRemaining = response.tokenInfo.credits;
                const tokensRemaining = response.tokenInfo.remaining;
                
                Alert.alert(
                  'Low Credit Balance',
                  `You only have ${creditsRemaining} credits (${tokensRemaining.toLocaleString()} tokens) left. Purchase more credits to continue using the AI Coach.`,
                  [
                    { text: 'Buy Credits', onPress: handleTopUpCredits },
                    { text: 'Not Now', style: 'cancel' }
                  ]
                );
              }, 500);
            }
          } else {
            // Refresh tokens just in case
            loadUserTokens();
          }
          
          // Show token usage info if available
          if (response.tokenInfo?.used) {
            console.debug(`[AICoachScreen] This interaction used ${response.tokenInfo.used} tokens`);
          }
        } else {
          throw new Error('Invalid response from coach');
        }
      } catch (error) {
        console.error('[AICoachScreen] Error from coach API:', error);
        
        // Check if the error is about insufficient tokens
        if (error.message?.includes('Insufficient tokens')) {
          const errorMessage = {
            id: (Date.now() + 1).toString(),
            content: "I'd love to continue our conversation, but you've run out of tokens. Purchase more credits to keep working with me on your goals.",
            isUser: false
          };
          
          setMessages(prev => [...prev, errorMessage]);
          
          // Refresh tokens
          loadUserTokens();
          
          // Show purchase prompt
          setTimeout(() => {
            Alert.alert(
              'Out of Credits',
              `You need at least ${tokensToCredits(TOKENS_CONFIG.minTokensRequired)} credits to interact with the AI Coach.`,
              [
                { text: 'Buy Credits', onPress: handleTopUpCredits },
                { text: 'Not Now', style: 'cancel' }
              ]
            );
          }, 500);
        } else {
          // Add fallback error message from the coach that stays in character
          const errorMessage = {
            id: (Date.now() + 1).toString(),
            content: "Hmm, seems like you're trying to avoid our conversation. Technical issues? Or just another excuse? Let's continue when you're actually ready to be honest with yourself.",
            isUser: false
          };
          
          setMessages(prev => [...prev, errorMessage]);
        }
        
        await Haptics.notificationAsync(HAPTIC_FEEDBACK.ERROR);
      }
    } catch (error) {
      console.error('[AICoachScreen] Critical error in message handling:', error);
      await Haptics.notificationAsync(HAPTIC_FEEDBACK.ERROR);
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user has enough tokens to chat
  const hasEnoughTokens = tokens !== null && tokens >= TOKENS_CONFIG.minTokensRequired;

  // Display token/credit warning banner
  const renderCreditWarningBanner = () => {
    if (!showCreditWarning || tokens === null) return null;
    
    const creditsText = credits === 0 
      ? "You're out of credits!" 
      : `Low credits (${credits} left)`;
    
    const tokensText = tokens === 0
      ? ""
      : ` (${tokens.toLocaleString()} tokens)`;
    
    return (
      <TouchableOpacity 
        style={styles.warningBanner} 
        onPress={handleTopUpCredits}
      >
        <Text style={styles.warningText}>
          {creditsText}{tokensText}. Tap to purchase more.
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient
      colors={[COLORS.background, '#f8f8f8']}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        {renderCreditWarningBanner()}
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
              placeholder={!hasEnoughTokens ? "Purchase credits to continue" : "No excuses. Just type."}
              style={styles.input}
              multiline
              maxLength={500}
              disabled={isLoading || !hasEnoughTokens}
              right={
                isLoading ? (
                  <TextInput.Icon icon={() => <ActivityIndicator color={COLORS.accent} />} />
                ) : (
                  <TextInput.Icon 
                    icon="send"
                    disabled={!inputMessage.trim() || !hasEnoughTokens}
                    onPress={handleSend}
                    color={(inputMessage.trim() && hasEnoughTokens) ? COLORS.accent : COLORS.disabled}
                  />
                )
              }
            />
            {!hasEnoughTokens && (
              <Button 
                mode="contained" 
                onPress={handleTopUpCredits}
                style={styles.purchaseButton}
              >
                Purchase Credits
              </Button>
            )}
            {tokens !== null && (
              <Text style={styles.tokenInfoText}>
                {hasEnoughTokens 
                  ? `You have ${credits} credits (${tokens.toLocaleString()} tokens)`
                  : `You need at least ${tokensToCredits(TOKENS_CONFIG.minTokensRequired)} credits to chat`
                }
              </Text>
            )}
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
  warningBanner: {
    backgroundColor: COLORS.accent,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
  },
  warningText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  creditContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  creditBadge: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    marginRight: SPACING.xs,
  },
  creditText: {
    color: COLORS.text,
    fontWeight: 'bold',
  },
  topUpButton: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  topUpText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  purchaseButton: {
    marginTop: SPACING.sm,
  },
  tokenInfoText: {
    textAlign: 'center',
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: SPACING.xs,
  },
});

export default AICoachScreen; 