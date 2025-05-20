import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, StatusBar, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Text, 
  Appbar,
  Button,
  Card,
  IconButton
} from 'react-native-paper';
import { SPACING, COLORS, RADIUS, FONT, SHADOWS } from '../../../config/theme';
import * as Haptics from 'expo-haptics';

// Import local components
import FrequencySelector from './components/FrequencySelector';
import DurationPicker from './components/DurationPicker';
import { FREQUENCIES } from './constants';
import SetupScreenButton from '../../../components/common/SetupScreenButton';
import SetupScreenButtonContainer from '../../../components/common/SetupScreenButtonContainer';

// Debug logging
console.debug('BinauralSetupScreen mounted');

const SetupScreen = ({ navigation }) => {
  const [selectedFrequency, setSelectedFrequency] = useState('focus');
  const [customDuration, setCustomDuration] = useState(300); // 5 minutes default

  const handleStartSession = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    const frequencyData = {
      ...FREQUENCIES[selectedFrequency],
      duration: customDuration,
    };
    
    navigation.navigate('BinauralPlayer', { frequencyData });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <Appbar.Header style={styles.appbar} statusBarHeight={0}>
          <Appbar.BackAction 
            onPress={async () => {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.goBack();
            }} 
            color={COLORS.text} 
          />
          <Appbar.Content 
            title="Binaural Beats" 
            titleStyle={styles.appbarTitle}
            subtitle="Focus & Relaxation"
            subtitleStyle={styles.appbarSubtitle}
          />
          <IconButton
            icon="information"
            iconColor={COLORS.text}
            size={24}
            onPress={() => {
              // TODO: Show info modal about binaural beats
            }}
          />
        </Appbar.Header>

        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Select Frequency</Text>
              <FrequencySelector
                selectedFrequency={selectedFrequency}
                onSelectFrequency={setSelectedFrequency}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Session Duration</Text>
              <DurationPicker
                value={customDuration}
                onDurationChange={setCustomDuration}
              />
            </View>
          </View>
        </ScrollView>

        <SetupScreenButtonContainer>
          <SetupScreenButton
            label="Start Session"
            onPress={handleStartSession}
            icon="headphones"
            backgroundColor={COLORS.indigoGradient.start}
          />
        </SetupScreenButtonContainer>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  safeArea: {
    flex: 1,
  },
  appbar: {
    backgroundColor: COLORS.background,
    elevation: 0,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  appbarTitle: {
    color: COLORS.text,
    fontSize: FONT.size.lg,
    fontWeight: FONT.weight.bold,
  },
  appbarSubtitle: {
    color: COLORS.textLight,
    fontSize: FONT.size.sm,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContentContainer: {
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xl + 80, // Extra padding for button
  },
  content: {
    gap: SPACING.xl,
  },
  section: {
    gap: SPACING.sm,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: FONT.size.md,
    fontWeight: FONT.weight.bold,
  },
});

export default SetupScreen; 