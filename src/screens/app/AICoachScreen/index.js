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
import conversationHistory, { CONVERSATION_CONFIG, getConversationHistory } from '../../../api/conversationHistory';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { getWeeklyGoals } from '../../../api/exercises/goals';
import GoalActionMessage from './components/GoalActionMessage';
import { supabase } from '../../../config/supabase';

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

const Message = ({ content, isUser, tokenInfo, goals, onGoalAdded }) => {
  if (!isUser && goals) {
    return (
      <GoalActionMessage
        message={content}
        goals={goals}
        onGoalAdded={onGoalAdded}
        tokenInfo={tokenInfo}
      />
    );
  }

  return (
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
      {tokenInfo && !isUser && (
        <Text style={styles.tokenUsageText}>
          {`${tokenInfo.used} tokens used`}
        </Text>
      )}
    </View>
  );
};

// NOTE: Top-up UI removed due to new subscription/paywall. Leaving
// placeholder component (no rendering) so imports remain consistent
// and future credit UI can be re-enabled without refactor.
const CreditDisplay = () => null;

const AICoachScreen = ({ navigation }) => {
  // State management
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tokens, setTokens] = useState(null);
  const [credits, setCredits] = useState(null);
  const [isLoadingTokens, setIsLoadingTokens] = useState(true);
  const [showCreditWarning, setShowCreditWarning] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [loadingError, setLoadingError] = useState(false);
  const [weeklyGoals, setWeeklyGoals] = useState([]);
  const [isLoadingGoals, setIsLoadingGoals] = useState(false);
  
  // Refs
  const flatListRef = useRef(null);

  // Load conversation history when component mounts
  useEffect(() => {
    console.debug('[AICoachScreen] Component mounted, loading conversation history');
    
    // Track loading time for debugging
    const startTime = Date.now();
    
    // Ensure loading state is set correctly
    setIsLoadingHistory(true);
    
    // Add a timeout to ensure we don't get stuck in loading state
    const timeoutId = setTimeout(() => {
      console.warn('[AICoachScreen] Safety timeout triggered - forcing loading state to complete');
      setIsLoadingHistory(false);
    }, 15000); // 15 second safety timeout
    
    loadConversationHistory()
      .then(() => {
        const loadTime = Date.now() - startTime;
        console.debug(`[AICoachScreen] Conversation history loaded in ${loadTime}ms`);
        clearTimeout(timeoutId);
      })
      .catch(error => {
        console.error('[AICoachScreen] Failed to load conversation history on mount:', error);
        setIsLoadingHistory(false);
        clearTimeout(timeoutId);
      });
    
    return () => clearTimeout(timeoutId);
  }, []);

  // Debug logging for messages changes
  useEffect(() => {
    console.debug('[AICoachScreen] Messages count:', messages.length);
  }, [messages]);

  // Set navigation options when screen is focused
  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: 'Samantha',
      headerTintColor: COLORS.text,
      headerTitleStyle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
      },
      headerStyle: {
        backgroundColor: COLORS.surface,
        elevation: 4,
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
      },
      headerBackVisible: true,
      headerBackTitleVisible: false,
      // Top-up button removed – subscription model handles payments.
      headerRight: () => null,
    });
    
    // Debug log
    console.debug('[AICoachScreen] Header options updated');
  }, [navigation, credits, isLoadingTokens]); // Keep dependencies for header updates

  // Load tokens on mount and focus (SEPARATE useEffect to avoid loop)
  useEffect(() => {
    console.debug('[AICoachScreen] Setting up token loading on mount and focus');
    
    // Load tokens immediately on mount
    loadUserTokens();
    
    // Set up focus listener to refresh tokens when screen is focused
    const unsubscribe = navigation.addListener('focus', () => {
      console.debug('[AICoachScreen] Screen focused, refreshing tokens');
      loadUserTokens();
    });
    
    return unsubscribe;
  }, [navigation]); // Only depend on navigation, not on token states

  // Load conversation history from the database
  const loadConversationHistory = async (retryCount = 0) => {
    try {
      // Reset loading error state
      setLoadingError(false);
      console.debug(`[AICoachScreen] Starting to load conversation history (attempt ${retryCount + 1})`);
      setIsLoadingHistory(true);
      
      // Track if we've already been in this function too long - increase to 10 seconds
      const timeoutId = setTimeout(() => {
        console.warn('[AICoachScreen] loadConversationHistory is taking too long (> 10 seconds)');
      }, 10000); // Increased from 5 seconds to 10 seconds
      
      console.debug('[AICoachScreen] Fetching conversation history from API');
      // Reduce the limit to improve loading time
      const historyMessages = await getConversationHistory(25); // Reduced from 50 to 25 for faster loading
      console.debug(`[AICoachScreen] getConversationHistory returned ${historyMessages?.length || 0} messages`);
      
      clearTimeout(timeoutId);
      
      if (historyMessages && historyMessages.length > 0) {
        // Format messages for our UI and ensure they're sorted correctly
        console.debug('[AICoachScreen] Formatting conversation history messages for UI');
        
        // Double-check that messages are in chronological order (oldest first)
        const sortedMessages = [...historyMessages].sort((a, b) => 
          new Date(a.timestamp) - new Date(b.timestamp)
        );
        
        const formattedMessages = sortedMessages.map(msg => ({
          id: msg.id,
          content: msg.content,
          isUser: msg.isUser,
          tokenInfo: msg.isUser ? null : { used: msg.tokenUsage || 0 }
        }));
        
        setMessages(formattedMessages);
        console.debug(`[AICoachScreen] Successfully set ${formattedMessages.length} history messages to state`);
      } else {
        // If no history exists, add default first message
        console.debug('[AICoachScreen] No history found, setting default first message');
        setMessages([{
          id: '1',
          content: CONVERSATION_CONFIG.defaultFirstMessage,
          isUser: false
        }]);
        console.debug('[AICoachScreen] Set default first message to state');
      }
      
      // Important: Set loading to false on success
      console.debug('[AICoachScreen] Setting isLoadingHistory to false after successful load');
      setIsLoadingHistory(false);
      
    } catch (error) {
      console.error('[AICoachScreen] Error in loadConversationHistory:', error.message, error.stack);
      
      // If we haven't tried too many times, retry after a short delay
      if (retryCount < 2) {
        console.debug(`[AICoachScreen] Retrying load conversation history (attempt ${retryCount + 1} of 3)`);
        setTimeout(() => loadConversationHistory(retryCount + 1), 1000);
        return; // Don't mark as loaded yet, since we're retrying
      }
      
      // After max retries, set the error state
      setLoadingError(true);
      
      // Fall back to the default message
      setMessages([{
        id: '1',
        content: CONVERSATION_CONFIG.defaultFirstMessage,
        isUser: false
      }]);
      console.debug('[AICoachScreen] Set default first message to state (after error)');
      
      // Set loading to false even after error (after max retries)
      console.debug('[AICoachScreen] Setting isLoadingHistory to false after error (max retries reached)');
      setIsLoadingHistory(false);
    }
  };

  // Load user tokens from the database
  const loadUserTokens = async () => {
    try {
      setIsLoadingTokens(true);
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
    } finally {
      setIsLoadingTokens(false);
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

  // Handle sending a message to the AI Coach (Samantha)
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

      // Save user message to conversation history
      try {
        console.debug('[AICoachScreen] About to save user message:', {
          content: userMessage.content,
          isUser: true,
          length: userMessage.content.length
        });
        
        const savedUserMessage = await conversationHistory.saveMessage({
          content: userMessage.content,
          isUser: true
        });
        
        console.debug('[AICoachScreen] User message saved to history successfully:', {
          id: savedUserMessage.id,
          created_at: savedUserMessage.created_at
        });
      } catch (error) {
        console.error('[AICoachScreen] Error saving user message to history:', error);
        console.error('[AICoachScreen] Error details:', {
          message: error.message,
          stack: error.stack
        });
        // Continue anyway - the edge function will save it as a backup
      }

      // Get AI response
      try {
        console.debug('[AICoachScreen] Sending message to coach API');
        
        // Check if we need to refresh goals before sending
        if (weeklyGoals.length === 0) {
          await loadWeeklyGoals();
        }
        
        // Pass the current goals to the API
        const response = await chatWithCoach(currentMessage, {}, weeklyGoals);
        
        if (response?.data?.response) {
          // Check if this is early in the conversation and if we should show the goal UI
          const isEarlyConversation = messages.length <= 3;
          const hasNoGoals = weeklyGoals.length === 0;
          const messageHasGoalPrompt = currentMessage.toLowerCase().includes('goal') || 
                                     response.data.response.toLowerCase().includes('goal');
          
          // Use the response directly from the coach
          const aiMessage = {
            id: (Date.now() + 1).toString(),
            content: response.data.response,
            isUser: false,
            tokenInfo: {
              used: response.tokenInfo?.used || 0,
              remaining: response.tokenInfo?.remaining || 0
            },
            // Show goals UI in specific cases:
            // 1. Early in conversation with no goals
            // 2. User mentioned goals in their message
            // 3. AI mentioned goals in their response
            ...(
              (isEarlyConversation && hasNoGoals) || 
              (hasNoGoals && messageHasGoalPrompt) 
                ? { goals: [] } 
                : {}
            )
          };
          
          setMessages(prev => [...prev, aiMessage]);
          await Haptics.notificationAsync(HAPTIC_FEEDBACK.SUCCESS);
          console.debug('[AICoachScreen] Successfully received and displayed coach response');

          // Save AI message to conversation history
          try {
            console.debug('[AICoachScreen] About to save AI message:', {
              content: aiMessage.content.substring(0, 50) + '...',
              isUser: false,
              tokenUsage: aiMessage.tokenInfo.used,
              length: aiMessage.content.length
            });
            
            const savedAIMessage = await conversationHistory.saveMessage({
              content: aiMessage.content,
              isUser: false,
              tokenUsage: aiMessage.tokenInfo.used
            });
            
            console.debug('[AICoachScreen] AI response saved to history successfully:', {
              id: savedAIMessage.id,
              created_at: savedAIMessage.created_at,
              token_usage: savedAIMessage.token_usage
            });
          } catch (error) {
            console.error('[AICoachScreen] Error saving AI response to history:', error);
            console.error('[AICoachScreen] AI save error details:', {
              message: error.message,
              stack: error.stack
            });
            // Continue anyway - the edge function will save it as a backup
          }
          
          // Update tokens and credits display with latest balance
          if (response.tokenInfo) {
            setTokens(response.tokenInfo.remaining);
            setCredits(response.tokenInfo.credits);
            setShowCreditWarning(response.tokenInfo.lowBalanceWarning);
            
            console.debug('[AICoachScreen] Updated token info:', response.tokenInfo);
            
            // Show usage information in the console for debugging
            if (response.tokenInfo.used > 0) {
              console.debug(`[AICoachScreen] This interaction used ${response.tokenInfo.used} tokens (${(response.tokenInfo.used / 1000).toFixed(3)} credits)`);
            }
            
            // Show warning if tokens are low
            if (response.tokenInfo.lowBalanceWarning && response.tokenInfo.remaining > 0) {
              setTimeout(() => {
                const creditsRemaining = response.tokenInfo.credits;
                const tokensRemaining = response.tokenInfo.remaining;
                
                Alert.alert(
                  'Low Credit Balance',
                  `You only have ${creditsRemaining} credits (${tokensRemaining.toLocaleString()} tokens) left. Purchase more credits to continue talking with Samantha.`,
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
          
          // Save error message to conversation history
          try {
            await conversationHistory.saveMessage({
              content: errorMessage.content,
              isUser: false
            });
          } catch (historyError) {
            console.error('[AICoachScreen] Error saving error message to history:', historyError);
          }
          
          // Refresh tokens
          loadUserTokens();
          
          // Show purchase prompt
          setTimeout(() => {
            Alert.alert(
              'Out of Credits',
              `You need at least ${tokensToCredits(TOKENS_CONFIG.minTokensRequired)} credits to interact with the Samantha.`,
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
          
          // Save error message to conversation history
          try {
            await conversationHistory.saveMessage({
              content: errorMessage.content,
              isUser: false
            });
          } catch (historyError) {
            console.error('[AICoachScreen] Error saving error message to history:', historyError);
          }
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

  // Add a function to clear conversation history
  const handleClearHistory = () => {
    Alert.alert(
      'Clear Conversation History',
      'Are you sure you want to clear your entire conversation history with Samantha? This cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Clear History',
          style: 'destructive',
          onPress: async () => {
            try {
              console.debug('[AICoachScreen] Clearing conversation history');
              await conversationHistory.clearConversationHistory();
              
              // Reset the messages state with just the default message
              setMessages([{
                id: '1',
                content: CONVERSATION_CONFIG.defaultFirstMessage,
                isUser: false
              }]);
              
              console.debug('[AICoachScreen] Conversation history cleared');
            } catch (error) {
              console.error('[AICoachScreen] Error clearing conversation history:', error);
              Alert.alert('Error', 'Failed to clear conversation history.');
            }
          }
        }
      ]
    );
  };

  // Check if user has enough tokens to chat - Rule: Always add debug logs
  const hasEnoughTokens = !isLoadingTokens && tokens !== null && tokens >= TOKENS_CONFIG.minTokensRequired;
  const shouldShowPurchaseButton = !isLoadingTokens && tokens !== null && tokens < TOKENS_CONFIG.minTokensRequired;

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

  // Load user's weekly goals
  const loadWeeklyGoals = async () => {
    try {
      setIsLoadingGoals(true);
      console.debug('[AICoachScreen] Loading weekly goals');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      const goals = await getWeeklyGoals(user.id);
      console.debug(`[AICoachScreen] Loaded ${goals.length} weekly goals`);
      
      setWeeklyGoals(goals);
      return goals;
    } catch (error) {
      console.error('[AICoachScreen] Error loading weekly goals:', error);
      return [];
    } finally {
      setIsLoadingGoals(false);
    }
  };

  // Function to handle when a goal is added
  const handleGoalAdded = async () => {
    await loadWeeklyGoals();
    // You could add a celebratory message here if you want
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
          {isLoadingHistory ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.accent} />
              <Text style={styles.loadingText}>
                {loadingError 
                  ? "Failed to load conversation history" 
                  : isLoadingGoals 
                    ? "Checking your goals..." 
                    : "Loading conversation history..."}
              </Text>
              {loadingError && (
                <Button 
                  mode="contained" 
                  onPress={() => loadConversationHistory(0)}
                  style={styles.retryButton}
                >
                  Retry
                </Button>
              )}
            </View>
          ) : (
            <>
              <View style={styles.headerContainer}>
                <TouchableOpacity 
                  style={styles.clearButton} 
                  onPress={handleClearHistory}
                >
                  <Text style={styles.clearButtonText}>Clear History</Text>
                </TouchableOpacity>
              </View>
            
              <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                  <Message 
                    {...item} 
                    onGoalAdded={handleGoalAdded}
                  />
                )}
                contentContainerStyle={styles.messageList}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
                showsVerticalScrollIndicator={false}
              />
            </>
          )}
          
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
            {shouldShowPurchaseButton && (
              <Button 
                mode="contained" 
                onPress={handleTopUpCredits}
                style={styles.purchaseButton}
              >
                Purchase Credits
              </Button>
            )}
            {isLoadingTokens ? (
              <View style={styles.tokenInfoContainer}>
                <Text style={styles.tokenInfoText}>Loading credits...</Text>
              </View>
            ) : tokens !== null && (
              <View style={styles.tokenInfoContainer}>
                <Text style={styles.tokenInfoText}>
                  {hasEnoughTokens 
                    ? `You have ${credits} credits (${tokens.toLocaleString()} tokens)`
                    : `You need at least ${tokensToCredits(TOKENS_CONFIG.minTokensRequired)} credits to chat`
                  }
                </Text>
                <Text style={styles.tokenCostText}>
                  {`Each interaction costs ~300-500 tokens (0.3-0.5 credits)`}
                </Text>
              </View>
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
  tokenInfoContainer: {
    marginTop: SPACING.xs,
  },
  tokenInfoText: {
    textAlign: 'center',
    fontSize: 12,
    color: COLORS.textLight,
  },
  tokenCostText: {
    textAlign: 'center',
    fontSize: 10,
    color: COLORS.textLight,
    marginTop: 2,
  },
  tokenUsageText: {
    fontSize: 10,
    color: COLORS.textLight,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    color: COLORS.accent,
  },
  retryButton: {
    marginTop: SPACING.sm,
    backgroundColor: COLORS.accent,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: SPACING.sm,
  },
  clearButton: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  clearButtonText: {
    color: COLORS.accent,
    fontSize: 14,
  },
});

export default AICoachScreen; 