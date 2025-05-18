import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { 
  Text, 
  TextInput, 
  Button, 
  useTheme, 
  Surface,
  HelperText,
  TouchableRipple,
} from 'react-native-paper';
import { SPACING } from '../../config/theme';
import { signUp } from '../../api/auth';
import CustomDialog from '../../components/common/CustomDialog';

const SignUpScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const theme = useTheme();

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
        setShowSuccessDialog(true);
      }
    } catch (error) {
      setError(error.message || 'Failed to sign up. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Surface style={styles.content} elevation={0}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text variant="headlineLarge" style={styles.title}>Create Account</Text>
            <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
              Join RealityShift and start your transformation journey
            </Text>
          </View>

          <View style={styles.formContainer}>
            <TextInput
              label="Full Name"
              value={name}
              onChangeText={setName}
              mode="outlined"
              autoCapitalize="words"
              error={!!error && !name}
              style={styles.input}
            />

            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              error={!!error && !email}
              style={styles.input}
            />

            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              mode="outlined"
              secureTextEntry={!showPassword}
              right={
                <TextInput.Icon
                  icon={showPassword ? "eye-off" : "eye"}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
              error={!!error && (!password || password.length < 6)}
              style={styles.input}
            />

            <TextInput
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              mode="outlined"
              secureTextEntry={!showConfirmPassword}
              right={
                <TextInput.Icon
                  icon={showConfirmPassword ? "eye-off" : "eye"}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                />
              }
              error={!!error && (!confirmPassword || password !== confirmPassword)}
              style={styles.input}
            />

            {error && (
              <HelperText type="error" visible={!!error}>
                {error}
              </HelperText>
            )}

            <Button
              mode="contained"
              onPress={handleSignUp}
              loading={loading}
              style={styles.button}
            >
              Create Account
            </Button>
          </View>

          <View style={styles.footer}>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              Already have an account?{' '}
            </Text>
            <TouchableRipple onPress={() => navigation.navigate('SignIn')}>
              <Text variant="bodyMedium" style={{ color: theme.colors.primary }}>
                Sign In
              </Text>
            </TouchableRipple>
          </View>
        </ScrollView>
      </Surface>

      <CustomDialog
        visible={showSuccessDialog}
        onDismiss={() => {
          setShowSuccessDialog(false);
          navigation.navigate('SignIn');
        }}
        title="Check your email"
        content="We sent you a confirmation email. Please confirm your email address to continue."
        icon="email-check"
        confirmText="Got it"
        onConfirm={() => {
          setShowSuccessDialog(false);
          navigation.navigate('SignIn');
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  header: {
    marginTop: SPACING.xxl,
    marginBottom: SPACING.xl,
  },
  title: {
    marginBottom: SPACING.xs,
  },
  formContainer: {
    marginVertical: SPACING.lg,
  },
  input: {
    marginBottom: SPACING.md,
  },
  button: {
    marginTop: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: SPACING.lg,
  },
});

export default SignUpScreen; 