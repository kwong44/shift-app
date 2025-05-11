import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { SPACING, COLORS, RADIUS, FONT } from '../../../../config/theme';
import CircularProgress from '../../../../components/common/CircularProgress';

// Debug logger
const debug = {
  log: (message, data = '') => {
    console.log(`[GoalsProgress] ${message}`, data);
  }
};

const GoalsProgress = ({ completedGoals, totalGoals }) => {
  debug.log('Rendering goals progress:', { completedGoals, totalGoals });
  const goalPercentage = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;

  return (
    <Card 
      style={[
        styles.contentCard,
        {
          borderColor: `${COLORS.primary}30`,
          shadowColor: COLORS.text,
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 3,
          elevation: 3,
        }
      ]} 
      mode="outlined"
    >
      <Card.Content>
        <Text style={styles.contentCardTitle}>Goals Progress</Text>
        <View style={styles.goalsProgressContent}>
          <CircularProgress
            percentage={goalPercentage}
            size={100}
            strokeWidth={10}
            color={COLORS.primary}
            showText
          />
          <View style={styles.goalsTextContainer}>
            <Text style={styles.goalsRatioText}>{completedGoals} / {totalGoals}</Text>
            <Text style={styles.goalsLabelText}>Goals Completed</Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  contentCard: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.background,
    borderWidth: 1,
  },
  contentCardTitle: {
    fontFamily: FONT.family.heading,
    fontWeight: FONT.weight.semiBold,
    fontSize: FONT.size.lg,
    marginBottom: SPACING.md,
    color: COLORS.text,
  },
  goalsProgressContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: SPACING.md,
  },
  goalsTextContainer: {
    alignItems: 'flex-start',
    marginLeft: SPACING.lg,
  },
  goalsRatioText: {
    fontFamily: FONT.family.heading,
    fontWeight: FONT.weight.bold,
    fontSize: FONT.size.xl,
    color: COLORS.text,
  },
  goalsLabelText: {
    fontFamily: FONT.family.base,
    fontWeight: FONT.weight.regular,
    fontSize: FONT.size.sm,
    color: COLORS.textLight,
  },
});

export default GoalsProgress;
