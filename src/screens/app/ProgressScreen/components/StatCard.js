import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SPACING, COLORS, RADIUS, FONT, SHADOWS } from '../../../../config/theme';

// Icon to gradient mapping for different stat types
const STAT_GRADIENTS = {
  'brain': ['#5AC8FA', '#4B9EF8'], // Focus Time - blue gradient
  'meditation': ['#00B894', '#007E66'], // Mindful Minutes - teal gradient
  'dumbbell': ['#6C63FF', '#5F52EE'], // Total Exercises - purple gradient
  'calendar-check': ['#FF7675', '#FF5D5D'], // Active Days - coral gradient
  'fire': ['#FF9500', '#FF6B00'], // Streak - orange gradient
  'trophy': ['#FDCB6E', '#E17055'], // Achievements - yellow gradient
  'chart-line': ['#7D8CC4', '#5D6CAF'], // Progress - indigo gradient
  'heart-pulse': ['#F368E0', '#D63AC8'], // Health - pink gradient
};

// Debug logger
const debug = {
  log: (message, data = '') => {
    console.log(`[StatCard] ${message}`, data);
  }
};

const StatCard = ({ title, value, icon, unit }) => {
  debug.log('Rendering modern stat card:', { title, value, icon, unit });
  
  // Get gradient colors for the icon, default to purple if not found
  const gradientColors = STAT_GRADIENTS[icon] || ['#6C63FF', '#5F52EE'];
  
  // Format large numbers (e.g., 1000 -> 1K)
  const formatValue = (val) => {
    if (typeof val !== 'number') return val;
    if (val >= 1000) {
      return `${(val / 1000).toFixed(1)}K`;
    }
    return val.toString();
  };

  const formattedValue = formatValue(value);

  return (
    <Card style={styles.card}>
      <View style={styles.content}>
        {/* Icon with gradient background */}
        <LinearGradient
          colors={gradientColors}
          style={styles.iconContainer}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <MaterialCommunityIcons 
            name={icon} 
            size={24} 
            color={COLORS.white} 
          />
        </LinearGradient>
        
        {/* Value and unit */}
        <View style={styles.valueSection}>
          <View style={styles.valueContainer}>
            <Text style={styles.value}>{formattedValue}</Text>
            {unit && <Text style={styles.unit}>{unit}</Text>}
          </View>
          
          {/* Title */}
          <Text style={styles.title} numberOfLines={2}>{title}</Text>
        </View>
        
        {/* Subtle accent line */}
        <LinearGradient
          colors={[...gradientColors, 'transparent']}
          style={styles.accentLine}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
    ...SHADOWS.small,
    overflow: 'hidden', // Ensure gradient line doesn't overflow
  },
  content: {
    padding: SPACING.lg,
    position: 'relative',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.small,
  },
  valueSection: {
    flex: 1,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: SPACING.xs,
  },
  value: {
    fontSize: FONT.size.xxl,
    fontWeight: FONT.weight.bold,
    color: COLORS.text,
    lineHeight: FONT.size.xxl * 1.1,
  },
  unit: {
    fontSize: FONT.size.md,
    fontWeight: FONT.weight.medium,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xxs,
  },
  title: {
    fontSize: FONT.size.sm,
    fontWeight: FONT.weight.medium,
    color: COLORS.textSecondary,
    lineHeight: FONT.size.sm * 1.3,
  },
  accentLine: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
  },
});

export default StatCard;
