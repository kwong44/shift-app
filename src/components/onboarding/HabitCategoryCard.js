import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SPACING, RADIUS } from '../../config/theme';

// Debug logger
const debug = {
  log: (message) => {
    console.log(`[HabitCategoryCard] ${message}`);
  }
};

const HabitCategoryCard = ({ category, selected, onPress }) => {
  const theme = useTheme();

  // Log card interaction
  const handlePress = () => {
    debug.log(`Category card pressed: ${category.id}`);
    onPress(category);
  };

  return (
    <Card
      mode="outlined"
      style={[
        styles.card,
        selected && { 
          backgroundColor: theme.colors.primaryContainer,
          borderColor: theme.colors.primary 
        }
      ]}
      onPress={handlePress}
    >
      <Card.Content style={styles.content}>
        <View style={styles.header}>
          <MaterialCommunityIcons
            name={category.icon}
            size={24}
            color={selected ? theme.colors.primary : theme.colors.onSurfaceVariant}
            style={styles.icon}
          />
          <Text
            variant="titleMedium"
            style={[
              styles.title,
              selected && { color: theme.colors.primary }
            ]}
          >
            {category.label}
          </Text>
        </View>
        <Text
          variant="bodyMedium"
          style={[
            styles.description,
            selected && { color: theme.colors.primary }
          ]}
        >
          {category.description}
        </Text>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: SPACING.md,
    borderRadius: RADIUS.lg,
  },
  content: {
    padding: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  icon: {
    marginRight: SPACING.sm,
  },
  title: {
    flex: 1,
  },
  description: {
    opacity: 0.7,
  },
});

export default HabitCategoryCard; 