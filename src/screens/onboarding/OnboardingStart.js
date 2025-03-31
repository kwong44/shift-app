import React from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { 
  Text, 
  Button, 
  useTheme, 
  Surface,
  List,
  Card,
  Divider
} from 'react-native-paper';
import { SPACING } from '../../config/theme';

const OnboardingStart = ({ navigation }) => {
  const theme = useTheme();

  const bulletPoints = [
    'Your current habits',
    'Areas you want to improve',
    'Your long-term goals',
    'Your preferences for engagement'
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Surface style={styles.content} elevation={0}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text variant="headlineMedium" style={styles.title}>
              Let's Get to Know You
            </Text>
            <Text 
              variant="titleMedium" 
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              Complete this assessment to help us create your personalized transformation roadmap.
            </Text>
          </View>
          
          <Card style={styles.card} mode="outlined">
            <Card.Content>
              <Text variant="titleLarge" style={styles.sectionTitle}>
                What to Expect
              </Text>
              <Text 
                variant="bodyLarge" 
                style={[styles.sectionText, { color: theme.colors.onSurfaceVariant }]}
              >
                This assessment will take about 5 minutes to complete. We'll ask you about:
              </Text>
              
              <List.Section style={styles.bulletPoints}>
                {bulletPoints.map((point, index) => (
                  <List.Item
                    key={index}
                    title={point}
                    left={props => (
                      <View 
                        {...props} 
                        style={[
                          styles.bullet,
                          { backgroundColor: theme.colors.primary }
                        ]} 
                      />
                    )}
                    titleStyle={[
                      styles.bulletText,
                      { color: theme.colors.onSurface }
                    ]}
                  />
                ))}
              </List.Section>
            </Card.Content>
          </Card>
          
          <Card style={styles.card} mode="outlined">
            <Card.Content>
              <Text variant="titleLarge" style={styles.sectionTitle}>
                How It Works
              </Text>
              <Text 
                variant="bodyLarge" 
                style={[styles.sectionText, { color: theme.colors.onSurfaceVariant }]}
              >
                Based on your responses, our AI will create a personalized roadmap to help you achieve your goals. 
                Your roadmap will include daily exercises, challenges, and insights tailored to your needs.
              </Text>
            </Card.Content>
          </Card>
        </ScrollView>
      </Surface>
      
      <Surface style={styles.footer} elevation={1}>
        <Divider />
        <Button
          mode="contained"
          onPress={() => navigation.navigate('Habits')}
          style={styles.button}
          contentStyle={styles.buttonContent}
        >
          Start Assessment
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
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  header: {
    marginBottom: SPACING.xl,
  },
  title: {
    marginBottom: SPACING.sm,
  },
  card: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    marginBottom: SPACING.sm,
  },
  sectionText: {
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  bulletPoints: {
    marginTop: SPACING.xs,
    paddingHorizontal: 0,
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.sm,
    alignSelf: 'center',
  },
  bulletText: {
    fontSize: 16,
  },
  footer: {
    width: '100%',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  button: {
    marginTop: SPACING.md,
  },
  buttonContent: {
    paddingVertical: SPACING.xs,
  },
});

export default OnboardingStart; 