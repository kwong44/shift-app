import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SPACING, COLORS, RADIUS, FONT } from '../../../../config/theme';

// Debug logger
const debug = {
  log: (message, data = '') => {
    console.log(`[StatCard] ${message}`, data);
  }
};

const StatCard = ({ title, value, icon, color, unit }) => {
  debug.log('Rendering stat card:', { title, value, icon, color, unit });
  return (
    <Card 
      style={[
        styles.statCardSmall,
        {
          borderColor: COLORS.border,
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
      <Card.Content style={styles.statCardSmallContent}>
        <MaterialCommunityIcons 
          name={icon} 
          size={28} 
          color={COLORS.primaryLight} 
          style={styles.icon}
        />
        <View style={styles.valueContainer}>
          <Text style={styles.statValueSmall}>
            {value}
            <Text style={styles.unit}>{unit ? ` ${unit}` : ''}</Text>
          </Text>
        </View>
        <Text style={styles.statTitleSmall}>{title}</Text>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  statCardSmall: {
    width: '46%',
    marginBottom: SPACING.md,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.background,
    borderWidth: 1,
  },
  statCardSmallContent: {
    alignItems: 'center',
    padding: SPACING.lg,
    gap: SPACING.xs,
  },
  icon: {
    marginBottom: SPACING.sm
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: SPACING.xs,
  },
  statValueSmall: {
    fontFamily: FONT.family.heading,
    fontWeight: FONT.weight.bold,
    fontSize: FONT.size.xl,
    color: COLORS.text,
    textAlign: 'center',
  },
  unit: {
    fontSize: FONT.size.lg,
    color: COLORS.text,
  },
  statTitleSmall: {
    fontFamily: FONT.family.base,
    fontWeight: FONT.weight.regular,
    fontSize: FONT.size.md,
    color: COLORS.textLight,
    textAlign: 'center',
  },
});

export default StatCard;
