import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { COLORS, FONT, SPACING } from '../../config/theme';
import CustomButton from '../../components/common/CustomButton';
import OnboardingHeader from '../../components/onboarding/OnboardingHeader';

const OnboardingStart = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <OnboardingHeader
          title="Let's Get to Know You"
          subtitle="Complete this assessment to help us create your personalized transformation roadmap."
        />
        
        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What to Expect</Text>
            <Text style={styles.sectionText}>
              This assessment will take about 5 minutes to complete. We'll ask you about:
            </Text>
            
            <View style={styles.bulletPoints}>
              <View style={styles.bulletPoint}>
                <View style={styles.bullet} />
                <Text style={styles.bulletText}>Your current habits</Text>
              </View>
              
              <View style={styles.bulletPoint}>
                <View style={styles.bullet} />
                <Text style={styles.bulletText}>Areas you want to improve</Text>
              </View>
              
              <View style={styles.bulletPoint}>
                <View style={styles.bullet} />
                <Text style={styles.bulletText}>Your long-term goals</Text>
              </View>
              
              <View style={styles.bulletPoint}>
                <View style={styles.bullet} />
                <Text style={styles.bulletText}>Your preferences for engagement</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>How It Works</Text>
            <Text style={styles.sectionText}>
              Based on your responses, our AI will create a personalized roadmap to help you achieve your goals. 
              Your roadmap will include daily exercises, challenges, and insights tailored to your needs.
            </Text>
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <CustomButton
          title="Start Assessment"
          onPress={() => navigation.navigate('Habits')}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT.size.lg,
    fontWeight: FONT.weight.bold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  sectionText: {
    fontSize: FONT.size.md,
    color: COLORS.text,
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  bulletPoints: {
    marginTop: SPACING.sm,
  },
  bulletPoint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginRight: SPACING.sm,
  },
  bulletText: {
    fontSize: FONT.size.md,
    color: COLORS.text,
  },
  footer: {
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
});

export default OnboardingStart; 