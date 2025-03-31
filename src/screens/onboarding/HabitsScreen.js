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
  Chip,
  ProgressBar,
  List
} from 'react-native-paper';
import { SPACING } from '../../config/theme';

const habitOptions = [
  'Regular Exercise',
  'Healthy Eating',
  'Reading',
  'Meditation',
  'Journaling',
  'Early Rising',
  'Yoga',
  'Deep Work',
  'Digital Detox',
  'Hydration',
  'Sleep Hygiene',
];

const HabitsScreen = ({ navigation, route }) => {
  const [selectedHabits, setSelectedHabits] = useState([]);
  const [otherHabit, setOtherHabit] = useState('');
  const theme = useTheme();
  
  const handleContinue = () => {
    const habits = [...selectedHabits];
    if (otherHabit.trim()) {
      habits.push(otherHabit.trim());
    }
    navigation.navigate('ImprovementAreas', { currentHabits: habits });
  };

  const toggleHabit = (habit) => {
    setSelectedHabits(prev => 
      prev.includes(habit)
        ? prev.filter(h => h !== habit)
        : [...prev, habit]
    );
  };

  const progress = 0.25; // 1/4 steps

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
              Your Current Habits
            </Text>
            <Text 
              variant="titleMedium" 
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              Select the positive habits you already practice regularly.
            </Text>
          </View>
          
          <Card style={styles.optionsCard} mode="outlined">
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Select all that apply:
              </Text>
              
              <View style={styles.chipContainer}>
                {habitOptions.map((habit) => (
                  <Chip
                    key={habit}
                    selected={selectedHabits.includes(habit)}
                    onPress={() => toggleHabit(habit)}
                    style={styles.chip}
                    showSelectedOverlay
                  >
                    {habit}
                  </Chip>
                ))}
              </View>
            </Card.Content>
          </Card>
          
          <Card style={styles.otherCard} mode="outlined">
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Other habits not listed above:
              </Text>
              <TextInput
                mode="outlined"
                placeholder="E.g., Gratitude practice, Cold showers, etc."
                value={otherHabit}
                onChangeText={setOtherHabit}
                multiline
                numberOfLines={2}
                style={styles.input}
              />
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
            disabled={selectedHabits.length === 0 && !otherHabit.trim()}
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
  optionsCard: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    marginBottom: SPACING.md,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  chip: {
    marginBottom: SPACING.xs,
  },
  otherCard: {
    marginBottom: SPACING.lg,
  },
  input: {
    marginTop: SPACING.xs,
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

export default HabitsScreen; 