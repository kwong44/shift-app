import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Modal, Card, Title, Paragraph, Button, Text } from 'react-native-paper';
import { COLORS, FONT, SPACING, RADIUS } from '../../config/theme';

// Debug logger
const debugLog = (message) => console.log('[PhaseUpModal] ' + message);

const PhaseUpModal = ({ visible, onDismiss, newPhaseName, newPhaseDescription }) => {
  debugLog(`Modal visibility: ${visible}, Phase: ${newPhaseName}`);

  return (
    <Modal
      visible={visible}
      onDismiss={onDismiss}
      contentContainerStyle={styles.modalContainer}
      backdropColor="rgba(0,0,0,0.7)" // Optional: makes backdrop darker
    >
      <Card style={styles.card}>
        <Card.Content style={styles.content}>
          {/* Placeholder for an exciting image */}
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderText}>[Celebration Image Here!]</Text>
          </View>
          
          <Title style={styles.title}>Congratulations!</Title>
          <Paragraph style={styles.paragraph}>
            You've advanced to a new phase:
          </Paragraph>
          <Text style={styles.phaseName}>{newPhaseName || 'New Phase!'}</Text>
          <Paragraph style={styles.phaseDescription}>
            {newPhaseDescription || 'Keep up the amazing work on your journey!'}
          </Paragraph>

          <Button
            mode="contained"
            onPress={onDismiss}
            style={styles.button}
            labelStyle={styles.buttonLabel}
            icon="arrow-right-circle"
          >
            Continue Your Journey
          </Button>
        </Card.Content>
      </Card>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
  },
  card: {
    width: '90%',
    maxWidth: 400,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.background, // Use a light background for the card
    elevation: 8, // For Android shadow
    shadowColor: '#000', // For iOS shadow
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  content: {
    alignItems: 'center',
    padding: SPACING.lg,
  },
  imagePlaceholder: {
    width: 150,
    height: 150,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.lightGray, // A light placeholder color
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.mediumGray,
  },
  imagePlaceholderText: {
    color: COLORS.textSecondary,
    fontSize: FONT.size.sm,
  },
  title: {
    fontSize: FONT.size.xxl,
    fontWeight: FONT.weight.bold,
    color: COLORS.primary, // Use primary color for the title
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  paragraph: {
    fontSize: FONT.size.md,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  phaseName: {
    fontSize: FONT.size.lg,
    fontWeight: FONT.weight.bold,
    color: COLORS.accent, // Accent color for the phase name
    textAlign: 'center',
    marginVertical: SPACING.sm,
  },
  phaseDescription: {
    fontSize: FONT.size.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  button: {
    marginTop: SPACING.md,
    borderRadius: RADIUS.xl,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.accent, // Use accent color for the button
  },
  buttonLabel: {
    fontSize: FONT.size.md,
    fontWeight: FONT.weight.semiBold,
    color: COLORS.textOnColor, // Ensure text is readable on accent color
  },
});

export default PhaseUpModal; 