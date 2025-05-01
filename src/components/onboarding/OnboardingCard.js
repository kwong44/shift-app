import React from 'react';
import { StyleSheet } from 'react-native';
import { Card } from 'react-native-paper';
import { SPACING, RADIUS } from '../../config/theme';

// Debug logger
const debug = {
  log: (message) => {
    console.log(`[OnboardingCard] ${message}`);
  }
};

const OnboardingCard = ({ 
  children, 
  style,
  ...props 
}) => {
  debug.log('Rendering card');
  
  return (
    <Card 
      style={[styles.card, style]} 
      mode="outlined"
      {...props}
    >
      <Card.Content>
        {children}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: SPACING.lg,
    borderRadius: RADIUS.lg,
  },
});

export default OnboardingCard; 