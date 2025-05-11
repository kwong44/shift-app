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
    <Card style={styles.statCardSmall} mode="elevated">
      <Card.Content style={styles.statCardSmallContent}>
        <View style={[styles.statIconContainer, { backgroundColor: `${color}20` }]}>
          <MaterialCommunityIcons name={icon} size={28} color={color} />
        </View>
        <View style={styles.statTextContainer}>
          <Text style={[styles.statValueSmall, { color }]}>{value}</Text>
          <Text style={styles.statTitleSmall}>{title}</Text>
          {unit && <Text style={styles.statUnitSmall}>{unit}</Text>}
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  statCardSmall: {
    width: '46%',
    marginBottom: SPACING.md,
    borderRadius: RADIUS.lg,
  },
  statCardSmallContent: {
    alignItems: 'center',
    padding: SPACING.md,
  },
  statIconContainer: {
    padding: SPACING.sm,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.sm,
  },
  statTextContainer: {
    alignItems: 'center',
  },
  statValueSmall: {
    fontFamily: FONT.family.heading,
    fontWeight: FONT.weight.bold,
    fontSize: FONT.size.xxl,
  },
  statTitleSmall: {
    fontFamily: FONT.family.base,
    fontWeight: FONT.weight.medium,
    fontSize: FONT.size.sm,
    color: COLORS.textLight,
    marginTop: SPACING.xxs,
  },
  statUnitSmall: {
    fontFamily: FONT.family.base,
    fontWeight: FONT.weight.regular,
    fontSize: FONT.size.xs,
    color: COLORS.textLight,
  },
});

export default StatCard;
