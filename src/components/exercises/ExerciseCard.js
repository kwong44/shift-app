import React from 'react';
import { StyleSheet } from 'react-native';
import { Card, Text, IconButton, useTheme, Surface, TouchableRipple } from 'react-native-paper';
import { SPACING } from '../../config/theme';

/**
 * ExerciseCard component for displaying exercise options
 * @param {Object} props
 * @param {string} props.title - Exercise title
 * @param {string} props.description - Exercise description
 * @param {string} props.icon - Material icon name
 * @param {string} props.duration - Exercise duration (e.g., "5 min")
 * @param {boolean} props.completed - Whether the exercise is completed
 * @param {boolean} props.disabled - Whether the exercise is disabled
 * @param {Function} props.onPress - Function to call when card is pressed
 */
const ExerciseCard = ({
  title,
  description,
  icon,
  duration,
  completed = false,
  disabled = false,
  onPress,
}) => {
  const theme = useTheme();

  const cardStyle = [
    styles.card,
    disabled && { opacity: 0.6 },
    completed && { backgroundColor: theme.colors.surfaceVariant }
  ];

  const renderIcon = () => (
    <Surface style={[
      styles.iconContainer,
      {
        backgroundColor: completed 
          ? theme.colors.primary + '20'
          : theme.colors.surfaceVariant
      }
    ]} elevation={0}>
      <IconButton
        icon={completed ? 'check-circle' : icon}
        size={28}
        iconColor={completed ? theme.colors.primary : theme.colors.onSurfaceVariant}
      />
    </Surface>
  );

  const renderDuration = () => (
    <Text
      variant="labelSmall"
      style={[
        styles.duration,
        { color: theme.colors.onSurfaceVariant }
      ]}
    >
      {duration}
    </Text>
  );

  return (
    <Card style={cardStyle} mode="outlined">
      <TouchableRipple
        onPress={disabled ? null : onPress}
        style={styles.touchable}
        disabled={disabled}
      >
        <Card.Content style={styles.content}>
          <Surface style={styles.header} elevation={0}>
            {renderIcon()}
            {renderDuration()}
          </Surface>
          
          <Text variant="titleMedium" style={styles.title}>
            {title}
          </Text>
          
          <Text 
            variant="bodyMedium" 
            style={[
              styles.description,
              { color: theme.colors.onSurfaceVariant }
            ]}
            numberOfLines={2}
          >
            {description}
          </Text>

          {completed && (
            <Text
              variant="labelSmall"
              style={[
                styles.completedText,
                { color: theme.colors.primary }
              ]}
            >
              Completed
            </Text>
          )}
        </Card.Content>
      </TouchableRipple>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: SPACING.md,
  },
  touchable: {
    borderRadius: 12,
  },
  content: {
    padding: SPACING.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  iconContainer: {
    borderRadius: 12,
  },
  duration: {
    paddingHorizontal: SPACING.sm,
  },
  title: {
    marginBottom: SPACING.xs,
  },
  description: {
    marginBottom: SPACING.sm,
  },
  completedText: {
    marginTop: SPACING.xs,
  },
});

export default ExerciseCard; 