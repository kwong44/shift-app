import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { 
  Text, 
  useTheme,
  ActivityIndicator,
  Portal,
  Dialog,
  List,
  Button,
  Card,
  Title,
  Paragraph
} from 'react-native-paper';
import { CommonActions } from '@react-navigation/native';
import { SPACING, FONT, RADIUS } from '../../config/theme';
import { supabase } from '../../config/supabase';
import { submitSelfAssessment } from '../../api/selfAssessment';
import { createRoadmap } from '../../api/roadmap';
import { OnboardingLayout, OnboardingCard } from '../../components/onboarding';
import CustomDialog from '../../components/common/CustomDialog';
import * as Haptics from 'expo-haptics';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Debug logger
const debug = {
  log: (message, data = '') => {
    console.log(`[OnboardingComplete] ${message}`, data);
  }
};

const OnboardingComplete = ({ navigation, route }) => {
  const { 
    satisfactionBaseline, 
    engagementPrefs, 
    selectedGrowthAreas,
    definedLTAs
  } = route.params || {};

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userName, setUserName] = useState('User');
  const theme = useTheme();
  
  // Styles are now a function of theme, defined inside the component
  const styles = getDynamicStyles(theme);
  
  useEffect(() => {
    debug.log('Screen loaded. Route params:', route.params);
    finalizeOnboarding();
  }, []);
  
  const finalizeOnboarding = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated.');

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', user.id)
        .single();
      if (profileError && profileError.code !== 'PGRST116') {
        debug.log('Error fetching profile for name:', profileError);
      } else if (profileData) {
        setUserName(profileData.full_name || 'User');
      }

      const assessmentResponses = {
        satisfactionBaseline,
        engagementPrefs,
        growthAreas: selectedGrowthAreas,
        aspirations: definedLTAs,
      };
      debug.log('Submitting self-assessment with data (v3 structure):', assessmentResponses);
      const assessmentResult = await submitSelfAssessment(user.id, assessmentResponses);
      debug.log('Self-assessment submitted:', assessmentResult);

      debug.log('Creating roadmap with assessment data (including LTAs):', assessmentResponses);
      const roadmapResult = await createRoadmap(user.id, assessmentResponses);
      debug.log('Roadmap created:', roadmapResult);

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      debug.log('Onboarding finalized successfully.');

    } catch (e) {
      debug.log('Error finalizing onboarding:', e);
      setError(e.message || 'An unexpected error occurred. Please try again.');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToApp = () => {
    navigation.reset({ index: 0, routes: [{ name: 'AppTabs' }] });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator animating={true} size="large" color={theme.colors.primary} />
        <Text style={styles.statusText}>Setting up your personalized journey...</Text>
      </View>
    );
  }

  return (
    <OnboardingLayout
      titleComponent={
        <View style={styles.titleContainer}>
          <MaterialCommunityIcons name="party-popper" size={48} color={theme.colors.primary} />
          <Title style={styles.mainTitle}>You're All Set, {userName}!</Title>
        </View>
      }
      hideBackButton={true}
      onNext={handleGoToApp}
      nextButtonLabel="Explore Your Growth Roadmap"
      nextButtonIcon="arrow-right-circle-outline"
    >
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {error ? (
          <Card style={styles.errorCard}>
            <Card.Content>
              <Paragraph style={styles.errorText}>{error}</Paragraph>
              <Button mode="contained" onPress={finalizeOnboarding} style={{marginTop: SPACING.md}}>
                Try Again
              </Button>
            </Card.Content>
          </Card>
        ) : (
          <View style={styles.successContainer}>
            <Paragraph style={styles.paragraph}>
              Congratulations on taking this important first step! Your personalized Growth Roadmap has been created based on the aspirations you've shared.
            </Paragraph>
            <Paragraph style={styles.paragraph}>
              Inside the app, you'll find your roadmap guiding you with actionable weekly goals, tailored exercises, and AI coaching to help you achieve what matters most to you.
            </Paragraph>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons name="rocket-launch-outline" size={60} color={theme.colors.accent || theme.colors.primary} style={styles.icon} />
            </View>
            <Paragraph style={styles.paragraphBold}>
              Your journey to a transformed life starts now!
            </Paragraph>
          </View>
        )}
      </ScrollView>
    </OnboardingLayout>
  );
};

// Define styles as a function that takes theme as an argument
const getDynamicStyles = (theme) => StyleSheet.create({
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: SPACING.lg,
  },
  statusText: {
    marginTop: SPACING.md,
    fontSize: FONT.size.md,
    color: theme.colors.text,
    textAlign: 'center',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  mainTitle: {
    fontSize: FONT.size.xxl,
    fontWeight: FONT.weight.bold,
    color: theme.colors.primary,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  successContainer: {
    alignItems: 'center',
  },
  paragraph: {
    fontSize: FONT.size.md,
    lineHeight: FONT.size.md * 1.6,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  paragraphBold: {
    fontSize: FONT.size.lg,
    lineHeight: FONT.size.lg * 1.5,
    color: theme.colors.textHeader,
    fontWeight: FONT.weight.semiBold,
    textAlign: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  iconContainer: {
    marginVertical: SPACING.md,
    padding: SPACING.md,
    backgroundColor: theme.colors.primaryMuted,
    borderRadius: RADIUS.xl*2,
  },
  icon: {
    // Add styles if needed, color is already set
  },
  errorCard: {
    backgroundColor: theme.colors.errorLight,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
  },
  errorText: {
    color: theme.colors.error,
    textAlign: 'center',
    fontSize: FONT.size.md,
  },
});

export default OnboardingComplete; 