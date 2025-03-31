import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { 
  Text, 
  Button, 
  useTheme,
  Surface,
  Card,
  Divider,
  TextInput,
  ProgressBar,
  IconButton
} from 'react-native-paper';
import { SPACING } from '../../config/theme';

const GoalsScreen = ({ navigation, route }) => {
  const { currentHabits, improvementAreas } = route.params || { 
    currentHabits: [],
    improvementAreas: [] 
  };
  
  const [personalGoal, setPersonalGoal] = useState('');
  const [professionalGoal, setProfessionalGoal] = useState('');
  const [healthGoal, setHealthGoal] = useState('');
  const [otherGoal, setOtherGoal] = useState('');
  const theme = useTheme();
  
  const handleContinue = () => {
    const longTermGoals = {
      personal: personalGoal.trim(),
      professional: professionalGoal.trim(),
      health: healthGoal.trim(),
      other: otherGoal.trim()
    };
    
    // Filter out empty goals
    const filteredGoals = Object.entries(longTermGoals)
      .filter(([_, value]) => value.length > 0)
      .reduce((obj, [key, value]) => {
        obj[key] = value;
        return obj;
      }, {});
      
    navigation.navigate('Preferences', {
      currentHabits,
      improvementAreas,
      longTermGoals: filteredGoals
    });
  };
  
  // Check if at least one goal is entered
  const hasAtLeastOneGoal = () => {
    return personalGoal.trim().length > 0 || 
           professionalGoal.trim().length > 0 || 
           healthGoal.trim().length > 0 || 
           otherGoal.trim().length > 0;
  };

  const progress = 0.75; // 3/4 steps

  return (
    <SafeAreaView style={styles.container}>
      <Surface style={styles.content} elevation={0}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <ProgressBar progress={progress} style={styles.progressBar} />
          
          <View style={styles.header}>
            <Text variant="headlineMedium" style={styles.title}>
              Your Long-Term Goals
            </Text>
            <Text 
              variant="titleMedium" 
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              What do you hope to achieve in the next 3-12 months? Be specific about what success looks like.
            </Text>
          </View>
          
          <Card style={styles.goalsCard} mode="outlined">
            <Card.Content>
              <TextInput
                mode="outlined"
                label="Personal Development Goal"
                placeholder="E.g., Develop a daily meditation practice of 20 minutes"
                value={personalGoal}
                onChangeText={setPersonalGoal}
                multiline
                numberOfLines={2}
                style={styles.input}
                right={personalGoal ? (
                  <TextInput.Icon 
                    icon="check-circle" 
                    color={theme.colors.primary}
                  />
                ) : null}
              />
              
              <TextInput
                mode="outlined"
                label="Professional/Career Goal"
                placeholder="E.g., Complete a certification in my field"
                value={professionalGoal}
                onChangeText={setProfessionalGoal}
                multiline
                numberOfLines={2}
                style={styles.input}
                right={professionalGoal ? (
                  <TextInput.Icon 
                    icon="check-circle" 
                    color={theme.colors.primary}
                  />
                ) : null}
              />
              
              <TextInput
                mode="outlined"
                label="Health & Wellness Goal"
                placeholder="E.g., Run a 5K race or establish a consistent exercise routine"
                value={healthGoal}
                onChangeText={setHealthGoal}
                multiline
                numberOfLines={2}
                style={styles.input}
                right={healthGoal ? (
                  <TextInput.Icon 
                    icon="check-circle" 
                    color={theme.colors.primary}
                  />
                ) : null}
              />
              
              <TextInput
                mode="outlined"
                label="Other Goal (Optional)"
                placeholder="Any other important goal not covered above"
                value={otherGoal}
                onChangeText={setOtherGoal}
                multiline
                numberOfLines={2}
                style={styles.input}
                right={otherGoal ? (
                  <TextInput.Icon 
                    icon="check-circle" 
                    color={theme.colors.primary}
                  />
                ) : null}
              />
            </Card.Content>
          </Card>
          
          <Card 
            style={[styles.tipCard, { backgroundColor: theme.colors.surfaceVariant }]} 
            mode="outlined"
          >
            <Card.Content>
              <View style={styles.tipHeader}>
                <IconButton
                  icon="lightbulb-on"
                  iconColor={theme.colors.primary}
                  size={24}
                  style={styles.tipIcon}
                />
                <Text 
                  variant="bodyLarge"
                  style={[styles.tipText, { color: theme.colors.onSurfaceVariant }]}
                >
                  Specific, measurable goals are more likely to be achieved. Instead of "exercise more," try "exercise 3 times per week for 30 minutes."
                </Text>
              </View>
            </Card.Content>
          </Card>
        </ScrollView>
      </Surface>
      
      <Surface style={styles.footer} elevation={1}>
        <Divider />
        <View style={styles.buttonContainer}>
          <Button
            mode="outlined"
            onPress={() => navigation.goBack()}
            style={[styles.button, styles.backButton]}
            contentStyle={styles.buttonContent}
          >
            Back
          </Button>
          <Button
            mode="contained"
            onPress={handleContinue}
            disabled={!hasAtLeastOneGoal()}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            Continue
          </Button>
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
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  progressBar: {
    marginBottom: SPACING.lg,
    height: 8,
    borderRadius: 4,
  },
  header: {
    marginBottom: SPACING.xl,
  },
  title: {
    marginBottom: SPACING.sm,
  },
  goalsCard: {
    marginBottom: SPACING.lg,
  },
  input: {
    marginBottom: SPACING.md,
  },
  tipCard: {
    marginBottom: SPACING.lg,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tipIcon: {
    margin: 0,
    marginRight: SPACING.xs,
  },
  tipText: {
    flex: 1,
    fontStyle: 'italic',
  },
  footer: {
    width: '100%',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
  },
  button: {
    flex: 1,
  },
  backButton: {
    marginRight: SPACING.md,
  },
  buttonContent: {
    paddingVertical: SPACING.xs,
  },
});

export default GoalsScreen; 