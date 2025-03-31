import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { 
  Text, 
  Button, 
  useTheme, 
  Surface,
  Avatar,
  Card
} from 'react-native-paper';
import { SPACING } from '../../config/theme';

const WelcomeScreen = ({ navigation }) => {
  const theme = useTheme();

  return (
    <SafeAreaView style={styles.container}>
      <Surface style={styles.content} elevation={0}>
        <View style={styles.header}>
          <Text variant="displayMedium" style={[styles.title, { color: theme.colors.primary }]}>
            RealityShift
          </Text>
          <Text 
            variant="titleMedium" 
            style={{ color: theme.colors.onSurfaceVariant }}
          >
            Transform your life, one day at a time
          </Text>
        </View>
        
        <View style={styles.imageContainer}>
          <Avatar.Icon 
            size={150} 
            icon="meditation" 
            style={{
              backgroundColor: theme.colors.primaryContainer
            }}
            color={theme.colors.onPrimaryContainer}
          />
        </View>
        
        <Card style={styles.descriptionCard} mode="contained">
          <Card.Content>
            <Text 
              variant="bodyLarge" 
              style={[
                styles.descriptionText,
                { color: theme.colors.onSurfaceVariant }
              ]}
            >
              Take control of your personal transformation with guided exercises, 
              AI-powered insights, and a personalized roadmap to reach your goals.
            </Text>
          </Card.Content>
        </Card>
      </Surface>
      
      <Surface style={styles.buttonContainer} elevation={0}>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('SignIn')}
          style={styles.button}
          contentStyle={styles.buttonContent}
        >
          Sign In
        </Button>
        <Button
          mode="outlined"
          onPress={() => navigation.navigate('SignUp')}
          style={styles.button}
          contentStyle={styles.buttonContent}
        >
          Create Account
        </Button>
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
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  title: {
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  imageContainer: {
    alignItems: 'center',
    marginVertical: SPACING.xl,
  },
  descriptionCard: {
    marginBottom: SPACING.xl,
    backgroundColor: 'transparent',
  },
  descriptionText: {
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  button: {
    marginBottom: SPACING.md,
  },
  buttonContent: {
    paddingVertical: SPACING.xs,
  },
});

export default WelcomeScreen; 