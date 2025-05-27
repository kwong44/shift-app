import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, Platform } from 'react-native';
import { Text, Title, Paragraph, Button, Card, useTheme } from 'react-native-paper';
import { OnboardingLayout } from '../../components/onboarding';
import { SPACING, FONT, COLORS, RADIUS } from '../../config/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';

// Debug logger
const debug = {
  log: (message, data = '') => {
    console.log(`[NotificationPermissionScreen] ${message}`, data);
  }
};

const NotificationPermissionScreen = ({ navigation, route }) => {
  const theme = useTheme();
  const [permissionStatus, setPermissionStatus] = useState(null);
  const [isRequesting, setIsRequesting] = useState(false);

  // Get all data passed from PreferencesScreen
  const onboardingData = route.params || {};

  useEffect(() => {
    debug.log('Screen loaded. Route params (onboardingData):', onboardingData);
    checkInitialPermissionStatus();
  }, []);

  const checkInitialPermissionStatus = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    debug.log('Initial notification permission status:', status);
    setPermissionStatus(status);
  };

  const requestPermissionsAndProceed = async () => {
    setIsRequesting(true);
    debug.log('Requesting notification permissions...');
    try {
      const { status: newStatus } = await Notifications.requestPermissionsAsync();
      debug.log('Notification permission request result:', newStatus);
      setPermissionStatus(newStatus);
      // Even if denied, we proceed. The app can function without notifications,
      // though user experience for reminders etc. will be degraded.
    } catch (error) {
      debug.log('Error requesting notification permissions:', error);
      // Still proceed in case of error
    } finally {
      setIsRequesting(false);
      navigateToNextScreen();
    }
  };

  const navigateToNextScreen = () => {
    debug.log('Proceeding to OnboardingComplete with data:', onboardingData);
    navigation.navigate('OnboardingComplete', onboardingData);
  };

  return (
    <OnboardingLayout
      title="Stay Connected & Motivated"
      subtitle="Enable notifications to get the most out of RealityShift™."
      onBack={() => navigation.goBack()} // Go back to PreferencesScreen
      // We will use custom buttons below instead of the default next button
      hideNextButton={true} 
      currentStep={11} // Corrected: This is step 11 of 12
      totalSteps={12}  // NEW TOTAL STEPS
    >
      <ScrollView 
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.infoCard}>
          <Card.Content style={styles.cardContent}>
            <MaterialCommunityIcons name="bell-ring-outline" size={40} color={theme.colors.primary} style={styles.icon} />
            <Title style={styles.cardTitle}>Why Enable Notifications?</Title>
            <Paragraph style={styles.paragraph}>
              RealityShift™ uses notifications to:
            </Paragraph>
            <View style={styles.benefitList}>
              <Text style={styles.listItem}>• Remind you of scheduled sessions and tasks.</Text>
              <Text style={styles.listItem}>• Provide timely motivational nudges from your AI Coach.</Text>
              <Text style={styles.listItem}>• Alert you to new insights and progress milestones.</Text>
              <Text style={styles.listItem}>• Help you build consistent habits for lasting transformation.</Text>
            </View>
            <Paragraph style={[styles.paragraph, styles.subtleText]}>
              You can customize your notification preferences in settings at any time.
            </Paragraph>
          </Card.Content>
        </Card>

        <View style={styles.buttonContainer}>
          <Button 
            mode="contained"
            onPress={requestPermissionsAndProceed}
            style={styles.button}
            labelStyle={styles.buttonLabel}
            icon="check-circle-outline"
            disabled={isRequesting || permissionStatus === Notifications.PermissionStatus.GRANTED}
            loading={isRequesting}
          >
            {permissionStatus === Notifications.PermissionStatus.GRANTED ? 'Permissions Granted' : 'Enable Notifications'}
          </Button>
          <Button 
            mode="outlined" 
            onPress={navigateToNextScreen} // Skip/Maybe Later also navigates to complete
            style={[styles.button, styles.skipButton]}
            labelStyle={styles.buttonLabel}
            icon="skip-next-outline"
            disabled={isRequesting}
          >
            Maybe Later
          </Button>
        </View>
         {permissionStatus === Notifications.PermissionStatus.DENIED && (
          <Text style={styles.deniedText}>
            Notifications are currently disabled. You can enable them later in your device settings if you change your mind.
          </Text>
        )}
      </ScrollView>
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl, 
    justifyContent: 'center',
    flexGrow: 1,
  },
  infoCard: {
    marginBottom: SPACING.xl,
    backgroundColor: COLORS.surface, 
    borderRadius: RADIUS.md,
    elevation: 2,
  },
  cardContent: {
    alignItems: 'center', 
    padding: SPACING.lg,
  },
  icon: {
    marginBottom: SPACING.md,
  },
  cardTitle: {
    fontSize: FONT.size.xl,
    fontWeight: FONT.weight.bold,
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  paragraph: {
    fontSize: FONT.size.md,
    color: COLORS.text,
    lineHeight: FONT.size.md * 1.5,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  benefitList: {
    alignSelf: 'stretch',
    marginVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
  },
  listItem: {
    fontSize: FONT.size.md,
    color: COLORS.textSecondary,
    lineHeight: FONT.size.md * 1.5,
    marginBottom: SPACING.xs,
  },
  subtleText: {
    fontSize: FONT.size.sm,
    color: COLORS.textLight,
    fontStyle: 'italic',
    marginTop: SPACING.md,
  },
  buttonContainer: {
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.md,
  },
  button: {
    marginBottom: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.lg,
  },
  skipButton: {
    borderColor: COLORS.primary, // Make skip button outline match primary theme
  },
  buttonLabel: {
    fontSize: FONT.size.md,
    fontWeight: FONT.weight.semiBold,
  },
  deniedText: {
    fontSize: FONT.size.sm,
    color: COLORS.warning, // Or a less alarming color like textSecondary
    textAlign: 'center',
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    fontStyle: 'italic',
  }
});

export default NotificationPermissionScreen; 