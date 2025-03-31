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
  HelperText
} from 'react-native-paper';
import { SPACING } from '../../config/theme';

const improvementOptions = [
  'Focus & Concentration',
  'Stress Management',
  'Work-Life Balance',
  'Sleep Quality',
  'Physical Fitness',
  'Nutrition',
  'Mental Health',
  'Time Management',
  'Productivity',
  'Social Connections',
  'Financial Wellness',
  'Creativity',
];

const ImprovementAreasScreen = ({ navigation, route }) => {
  const { currentHabits } = route.params || { currentHabits: [] };
  const [selectedAreas, setSelectedAreas] = useState([]);
  const [otherArea, setOtherArea] = useState('');
  const theme = useTheme();
  
  const handleContinue = () => {
    const areas = [...selectedAreas];
    if (otherArea.trim()) {
      areas.push(otherArea.trim());
    }
    
    navigation.navigate('Goals', { 
      currentHabits,
      improvementAreas: areas 
    });
  };

  const toggleArea = (area) => {
    setSelectedAreas(prev => 
      prev.includes(area)
        ? prev.filter(a => a !== area)
        : [...prev, area]
    );
  };

  const progress = 0.5; // 2/4 steps
  const hasExceededLimit = selectedAreas.length > 5;

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
              Areas to Improve
            </Text>
            <Text 
              variant="titleMedium" 
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              Select the areas of your life you'd like to enhance or transform.
            </Text>
          </View>
          
          <Card style={styles.optionsCard} mode="outlined">
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Select up to 5 areas:
              </Text>
              
              <View style={styles.chipContainer}>
                {improvementOptions.map((area) => (
                  <Chip
                    key={area}
                    selected={selectedAreas.includes(area)}
                    onPress={() => toggleArea(area)}
                    style={styles.chip}
                    showSelectedOverlay
                  >
                    {area}
                  </Chip>
                ))}
              </View>

              {hasExceededLimit && (
                <HelperText type="warning" style={styles.warningText}>
                  You've selected more than 5 areas. Consider focusing on your top priorities.
                </HelperText>
              )}
            </Card.Content>
          </Card>
          
          <Card style={styles.otherCard} mode="outlined">
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Other areas not listed above:
              </Text>
              <TextInput
                mode="outlined"
                placeholder="E.g., Public speaking, Relationship skills, etc."
                value={otherArea}
                onChangeText={setOtherArea}
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
            disabled={selectedAreas.length === 0 && !otherArea.trim()}
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
  warningText: {
    marginTop: SPACING.sm,
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

export default ImprovementAreasScreen; 