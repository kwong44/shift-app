import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { 
  Text, 
  TextInput, 
  Button, 
  useTheme, 
  Surface,
  HelperText,
  TouchableRipple
} from 'react-native-paper';
import { SPACING } from '../../config/theme';
import { signIn } from '../../api/auth';

const SignInScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const theme = useTheme();

  const handleSignIn = async () => {
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await signIn(email, password);
      // The navigation will be handled by the main navigator 
      // when it detects a session change
    } catch (error) {
      setError(error.message || 'Failed to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Surface style={styles.content} elevation={0}>
        <View style={styles.header}>
          <Text variant="headlineLarge" style={styles.title}>Welcome Back</Text>
          <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
            Sign in to continue your transformation journey
          </Text>
        </View>

        <View style={styles.formContainer}>
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            error={!!error}
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
            error={!!error}
            style={styles.input}
          />

          {error && (
            <HelperText type="error" visible={!!error}>
              {error}
            </HelperText>
          )}

          <TouchableRipple
            onPress={() => navigation.navigate('ForgotPassword')}
            style={styles.forgotPassword}
          >
            <Text variant="bodyMedium" style={{ color: theme.colors.primary }}>
              Forgot Password?
            </Text>
          </TouchableRipple>

          <Button
            mode="contained"
            onPress={handleSignIn}
            loading={loading}
            style={styles.button}
          >
            Sign In
          </Button>
        </View>

        <View style={styles.footer}>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            Don't have an account?{' '}
          </Text>
          <TouchableRipple onPress={() => navigation.navigate('SignUp')}>
            <Text variant="bodyMedium" style={{ color: theme.colors.primary }}>
              Sign Up
            </Text>
          </TouchableRipple>
        </View>
      </Surface>
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: SPACING.lg,
  },
  button: {
    marginTop: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: SPACING.lg,
  },
});

export default SignInScreen; 