import React, { useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Text, 
  Appbar,
  Button,
} from 'react-native-paper';
import { SPACING, COLORS, RADIUS, FONT } from '../../../config/theme';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

// Import local components
import FrequencySelector from './components/FrequencySelector';
import DurationPicker from './components/DurationPicker';
import { FREQUENCIES } from './constants';

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
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient
          colors={[COLORS.primary, COLORS.secondary]}
          style={styles.screenGradient}
        >
          <Appbar.Header style={styles.appbar}>
            <Appbar.BackAction onPress={() => navigation.goBack()} color={COLORS.background} />
            <View>
              <Text style={styles.appbarTitle}>Binaural Beats</Text>
              <Text style={styles.appbarSubtitle}>Focus & Relaxation</Text>
            </View>
          </Appbar.Header>

          <ScrollView
            style={styles.scrollContainer}
            contentContainerStyle={styles.scrollContentContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.content}>
              <View style={styles.mainContent}>
                <View style={styles.infoCard}>
                  <Text style={styles.infoTitle}>How to Use</Text>
                  <Text style={styles.infoText}>
                    Binaural beats use two slightly different frequencies played in each ear to create a perceived beat that can help induce specific mental states. Use headphones for best results.
                  </Text>
                </View>

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
            </View>

            <Button
              mode="contained"
              onPress={handleStartSession}
              style={styles.startButton}
              labelStyle={styles.startButtonLabel}
            >
              Start Session
            </Button>
          </ScrollView>
        </LinearGradient>
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
  screenGradient: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContentContainer: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  appbar: {
    backgroundColor: 'transparent',
    elevation: 0,
  },
  appbarTitle: {
    color: COLORS.background,
    fontWeight: FONT.weight.bold,
    fontSize: FONT.size.lg,
  },
  appbarSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontWeight: FONT.weight.medium,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    padding: SPACING.md,
  },
  mainContent: {
    gap: SPACING.lg,
  },
  infoCard: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
  },
  infoTitle: {
    color: COLORS.background,
    fontSize: FONT.size.lg,
    fontWeight: FONT.weight.bold,
    marginBottom: SPACING.sm,
  },
  infoText: {
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 22,
  },
  section: {
    gap: SPACING.sm,
  },
  sectionTitle: {
    color: COLORS.background,
    fontSize: FONT.size.md,
    fontWeight: FONT.weight.bold,
  },
  startButton: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.full,
    marginTop: SPACING.lg,
  },
  startButtonLabel: {
    fontSize: FONT.size.md,
    fontWeight: FONT.weight.bold,
    color: COLORS.primary,
  },
});

export default SetupScreen; 