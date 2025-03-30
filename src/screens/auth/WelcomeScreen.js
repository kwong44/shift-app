import React from 'react';
import { View, Text, StyleSheet, Image, SafeAreaView } from 'react-native';
import { COLORS, FONT, SPACING } from '../../config/theme';
import CustomButton from '../../components/common/CustomButton';

const WelcomeScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>RealityShift</Text>
          <Text style={styles.subtitle}>Transform your life, one day at a time</Text>
        </View>
        
        <View style={styles.imageContainer}>
          {/* Replace with your app logo or illustration */}
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderText}>Logo</Text>
          </View>
        </View>
        
        <View style={styles.description}>
          <Text style={styles.descriptionText}>
            Take control of your personal transformation with guided exercises, 
            AI-powered insights, and a personalized roadmap to reach your goals.
          </Text>
        </View>
      </View>
      
      <View style={styles.buttonContainer}>
        <CustomButton
          title="Sign In"
          onPress={() => navigation.navigate('SignIn')}
          style={styles.button}
        />
        <CustomButton
          title="Create Account"
          onPress={() => navigation.navigate('SignUp')}
          type="secondary"
          style={styles.button}
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
  content: {
    flex: 1,
    padding: SPACING.lg,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: FONT.size.xxxl,
    fontWeight: FONT.weight.bold,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT.size.md,
    color: COLORS.textLight,
  },
  imageContainer: {
    alignItems: 'center',
    marginVertical: SPACING.xl,
  },
  imagePlaceholder: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    color: COLORS.background,
    fontSize: FONT.size.lg,
    fontWeight: FONT.weight.medium,
  },
  description: {
    marginBottom: SPACING.xl,
  },
  descriptionText: {
    fontSize: FONT.size.md,
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    padding: SPACING.lg,
  },
  button: {
    marginBottom: SPACING.md,
  },
});

export default WelcomeScreen; 