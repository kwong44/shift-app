import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text, IconButton, TextInput } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SPACING, COLORS, RADIUS, SHADOWS, FONT } from '../../../../config/theme';
import * as Haptics from 'expo-haptics';

export const QuestionCard = ({ 
  selectedTopic,
  questions,
  currentQuestionIndex,
  response,
  setResponse,
  onNextQuestion,
  onPreviousQuestion,
  textInputHeight,
  setTextInputHeight
}) => {
  // Debug log
  console.debug('QuestionCard rendered', { 
    topic: selectedTopic.value, 
    questionIndex: currentQuestionIndex,
    responseLength: response.length
  });

  return (
    <Card style={styles.card} elevation={3}>
      <LinearGradient
        colors={[`${selectedTopic.color}15`, `${selectedTopic.color}05`]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <Card.Content>
          <View style={styles.questionHeader}>
            <IconButton
              icon="chevron-left"
              iconColor={COLORS.text}
              size={24}
              onPress={() => {
                if (currentQuestionIndex > 0) {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onPreviousQuestion();
                }
              }}
              disabled={currentQuestionIndex === 0}
              style={[
                styles.questionNavButton,
                currentQuestionIndex === 0 && styles.questionNavButtonDisabled
              ]}
            />
            <Text style={styles.questionCount}>
              Question {currentQuestionIndex + 1} of {questions.length}
            </Text>
            <IconButton
              icon="chevron-right"
              iconColor={COLORS.text}
              size={24}
              onPress={() => {
                if (currentQuestionIndex < questions.length - 1) {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onNextQuestion();
                }
              }}
              disabled={currentQuestionIndex === questions.length - 1}
              style={[
                styles.questionNavButton,
                currentQuestionIndex === questions.length - 1 && styles.questionNavButtonDisabled
              ]}
            />
          </View>
          
          <View style={styles.questionTextContainer}>
            <MaterialCommunityIcons
              name="format-quote-open"
              size={20}
              color={selectedTopic.color}
              style={styles.quoteIcon}
            />
            <Text style={styles.questionText}>
              {questions[currentQuestionIndex]}
            </Text>
            <MaterialCommunityIcons
              name="format-quote-close"
              size={20}
              color={selectedTopic.color}
              style={[styles.quoteIcon, styles.quoteIconRight]}
            />
          </View>

          <TextInput
            mode="outlined"
            placeholder="Write your thoughts here..."
            value={response}
            onChangeText={setResponse}
            multiline
            style={[styles.responseInput, {height: Math.max(150, textInputHeight)}]}
            onContentSizeChange={(e) => setTextInputHeight(e.nativeEvent.contentSize.height)}
            outlineColor={selectedTopic.color + '50'}
            activeOutlineColor={selectedTopic.color}
            placeholderTextColor={COLORS.textLight + '80'}
          />
        </Card.Content>
      </LinearGradient>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  gradient: {
    borderRadius: RADIUS.lg,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.xs,
  },
  questionNavButton: {
    margin: -SPACING.xs,
  },
  questionNavButtonDisabled: {
    opacity: 0.3,
  },
  questionCount: {
    fontWeight: FONT.weight.medium,
    color: COLORS.text,
    fontSize: FONT.size.sm,
  },
  questionTextContainer: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    position: 'relative',
    ...SHADOWS.small,
  },
  questionText: {
    fontSize: FONT.size.md,
    fontStyle: 'italic',
    lineHeight: 22,
    textAlign: 'center',
    paddingHorizontal: SPACING.md,
    color: COLORS.text,
  },
  quoteIcon: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
    opacity: 0.6,
  },
  quoteIconRight: {
    left: 'auto',
    right: SPACING.sm,
    top: 'auto',
    bottom: SPACING.sm,
  },
  responseInput: {
    backgroundColor: COLORS.background,
    minHeight: 150,
    fontSize: FONT.size.md,
    borderRadius: RADIUS.sm,
  },
}); 