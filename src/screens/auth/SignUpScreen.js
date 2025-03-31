import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { COLORS, FONT, SPACING } from '../../config/theme';
import CustomButton from '../../components/common/CustomButton';
import CustomInput from '../../components/common/CustomInput';
import { signUp } from '../../api/auth';

const SignUpScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSignUp = async () => {
    // Basic validation
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill out all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { session } = await signUp(email, password, name);
      
      if (session) {
        // User is automatically signed in after signup
        // Navigate to onboarding
        navigation.reset({
          index: 0,
          routes: [{ name: 'OnboardingStart' }],
        });
      } else {
        // If email confirmation is required
        Alert.alert(
          'Check your email',
          'We sent you a confirmation email. Please confirm your email address to continue.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('SignIn')
            }
          ]
        );
      }
    } catch (error) {
      setError(error.message || 'Failed to sign up. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join RealityShift and start your transformation journey</Text>
        </View>

        <View style={styles.formContainer}>
          <CustomInput
            label="Full Name"
            value={name}
            onChangeText={setName}
            placeholder="Enter your full name"
            autoCapitalize="words"
          />

          <CustomInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            keyboardType="email-address"
          />

          <CustomInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            secureTextEntry
          />

          <CustomInput
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm your password"
            secureTextEntry
          />

          {error && <Text style={styles.errorText}>{error}</Text>}

          <CustomButton
            title="Create Account"
            onPress={handleSignUp}
            loading={loading}
            style={styles.button}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
            <Text style={styles.footerLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
  },
  header: {
    marginTop: SPACING.xxl,
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: FONT.size.xxl,
    fontWeight: FONT.weight.bold,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT.size.md,
    color: COLORS.textLight,
  },
  formContainer: {
    marginVertical: SPACING.lg,
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONT.size.sm,
    marginVertical: SPACING.sm,
  },
  button: {
    marginTop: SPACING.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: SPACING.lg,
  },
  footerText: {
    color: COLORS.textLight,
    fontSize: FONT.size.md,
  },
  footerLink: {
    color: COLORS.primary,
    fontSize: FONT.size.md,
    fontWeight: FONT.weight.medium,
  },
});

export default SignUpScreen; 