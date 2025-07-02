# Dynamic DailyFocus Recommendation Engine Implementation Plan

## Overview

The DailyFocus component currently uses a static array of exercises. This plan outlines how to implement a dynamic recommendation engine that personalizes daily exercise suggestions based on user data including:
- Focus areas and goals
- Journal entries and insights
- Mood tracking
- Task priorities
- Exercise history

## Implementation Architecture

### 1. Recommendation Service

Create a dedicated service layer for generating exercise recommendations:

```javascript
// Location: src/services/recommendationService.js
```

This service will:
- Define the full exercise library with metadata
- Fetch user data from Supabase
- Process and score exercises
- Apply contextual factors
- Return sorted recommendations

### 2. React Hook

Create a custom hook to interface with the recommendation service:

```javascript
// Location: src/hooks/useDailyFocusRecommendations.js
```

This hook will:
- Fetch all necessary user data
- Generate recommendations
- Handle loading states
- Manage periodic refreshing
- Provide fallbacks for error cases

### 3. DailyFocus Component Update

Update the existing component to use dynamic recommendations:

```javascript
// Location: src/screens/app/HomeScreen/components/DailyFocus.js
```

## Detailed Implementation Steps

### Step 1: Exercise Library Definition

Create a comprehensive exercise database with metadata for scoring:

```javascript
// EXERCISE_LIBRARY in recommendationService.js
export const EXERCISE_LIBRARY = [
  {
    id: 'mindfulness',
    title: 'Mindfulness',
    icon: 'meditation',
    duration: '5-10 min',
    route: 'MindfulnessSetup',
    benefit: 'Reduce stress and improve focus',
    gradientColors: [COLORS.tealGradient.start, COLORS.tealGradient.end],
    category: ['stress-reduction', 'focus', 'mental-health'],
    keywords: ['stress', 'anxiety', 'calm', 'focus', 'present'],
    complementsGoals: ['mental-health', 'focus', 'balance', 'stress'],
    recommendedFor: {
      moods: ['stressed', 'anxious', 'overwhelmed', 'distracted']
    }
  },
  // Additional exercises...
];
```

### Step 2: Data Collection Functions

Implement functions to gather data from all relevant Supabase tables:

```javascript
export const getUserRecommendationData = async (userId) => {
  // Parallel data fetching with Promise.all
  const [
    weeklyGoals,
    journalInsights,
    moodHistory,
    tasks,
    roadmap,
    // etc.
  ] = await Promise.all([
    // Specific queries for each data source
  ]);
  
  return {
    weeklyGoals: weeklyGoals.data || [],
    journalInsights: journalInsights.data || [],
    // etc.
  };
};
```

### Step 3: Scoring Algorithm Components

#### 3.1 Goal Alignment Scoring (0-30 points)

```javascript
const calculateGoalAlignmentScore = (exercise, weeklyGoals, roadmap) => {
  let score = 0;
  
  // Weekly goals scoring
  if (weeklyGoals?.length > 0) {
    weeklyGoals.forEach(goal => {
      // Match exercise keywords with goal text
      const goalText = goal.text.toLowerCase();
      const matchingKeywords = exercise.keywords.filter(keyword => 
        goalText.includes(keyword)
      );
      score += matchingKeywords.length * 3;
    });
  }
  
  // Roadmap goals scoring
  if (roadmap?.goals?.length > 0) {
    // Score based on complementary goals
  }
  
  return Math.min(score, 30); // Cap at 30 points
};
```

#### 3.2 Mood-Based Scoring (0-25 points)

```javascript
const calculateMoodScore = (exercise, moodHistory) => {
  if (!moodHistory?.length) return 10;
  
  const recentMood = moodHistory[0];
  const moodType = recentMood.mood_type;
  
  // Mood-exercise correlations
  const moodExerciseMap = {
    'stressed': ['mindfulness', 'binaural'],
    'sad': ['journaling', 'visualization'],
    // etc.
  };
  
  // Primary match
  if (moodExerciseMap[moodType]?.includes(exercise.id)) {
    return 25;
  }
  
  // Category match
  if (exercise.recommendedFor.moods.includes(moodType)) {
    return 15;
  }
  
  return 5; // Default score
};
```

#### 3.3 Journal Analysis Scoring (0-20 points)

```javascript
const calculateJournalScore = (exercise, journalInsights) => {
  // Score based on journal content and AI insights
};
```

#### 3.4 Exercise History Scoring (0-15 points)

```javascript
const calculateHistoryScore = (exercise, exerciseHistory) => {
  // Score based on recency and frequency of exercise
};
```

#### 3.5 Task Relevance Scoring (0-10 points)

```javascript
const calculateTaskRelevanceScore = (exercise, tasks) => {
  // Score based on pending tasks and priorities
};
```

#### 3.6 Time Context Adjustment

```javascript
const applyTimeContextFactors = (scoredExercises) => {
  // Adjust scores based on time of day and day of week
};
```

### Step 4: Main Recommendation Generation Function

```javascript
export const generateRecommendations = (userData) => {
  const scoredExercises = EXERCISE_LIBRARY.map(exercise => {
    // Calculate individual scores
    const goalScore = calculateGoalAlignmentScore(exercise, userData.weeklyGoals, userData.roadmap);
    const moodScore = calculateMoodScore(exercise, userData.moodHistory);
    const journalScore = calculateJournalScore(exercise, userData.journalInsights);
    const historyScore = calculateHistoryScore(exercise, userData.exerciseHistory);
    const taskScore = calculateTaskRelevanceScore(exercise, userData.tasks);
    
    // Total score
    const score = goalScore + moodScore + journalScore + historyScore + taskScore;
    
    return {
      ...exercise,
      score
    };
  });
  
  // Apply time context factors
  const timeAdjustedScores = applyTimeContextFactors(scoredExercises);
  
  // Sort by score and return top 4
  return timeAdjustedScores
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);
};
```

### Step 5: Custom Hook Implementation

```javascript
// src/hooks/useDailyFocusRecommendations.js
import { useState, useEffect } from 'react';
import { getUserRecommendationData, generateRecommendations, EXERCISE_LIBRARY } from '../services/recommendationService';

export const useDailyFocusRecommendations = (userId) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        if (!userId) {
          // Use default exercises if no user ID
          setRecommendations(EXERCISE_LIBRARY.slice(0, 4));
          setLoading(false);
          return;
        }
        
        setLoading(true);
        
        // Get all the user data
        const userData = await getUserRecommendationData(userId);
        
        // Generate recommendations
        const exercises = generateRecommendations(userData);
        
        setRecommendations(exercises);
        setLoading(false);
      } catch (err) {
        console.error("[useDailyFocusRecommendations] Error:", err);
        setError(err);
        setLoading(false);
        
        // Fallback to default exercises on error
        setRecommendations(EXERCISE_LIBRARY.slice(0, 4));
      }
    };

    fetchRecommendations();
    
    // Set up a refresh interval every hour
    const refreshInterval = setInterval(fetchRecommendations, 60 * 60 * 1000);
    
    return () => clearInterval(refreshInterval);
  }, [userId]);

  return { recommendations, loading, error };
};
```

### Step 6: DailyFocus Component Update

```javascript
// src/screens/app/HomeScreen/components/DailyFocus.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Title, Text, TouchableRipple, IconButton, Chip, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SPACING, COLORS, RADIUS, FONT } from '../../../../config/theme';
import * as Haptics from 'expo-haptics';
import { useDailyFocusRecommendations } from '../../../../hooks/useDailyFocusRecommendations';
import { useUser } from '../../../../hooks/useUser';

const DailyFocus = ({ onExercisePress }) => {
  const { user } = useUser();
  const { recommendations, loading } = useDailyFocusRecommendations(user?.id);

  const handleExercisePress = async (exercise) => {
    await Haptics.selectionAsync();
    onExercisePress(exercise.route);
  };

  return (
    <Card style={styles.focusCard} elevation={2}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <Title style={styles.cardTitle}>Today's Focus</Title>
          <Chip 
            mode="flat"
            style={styles.focusChip}
            textStyle={styles.focusChipText}
          >
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </Chip>
        </View>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Personalizing your recommendations...</Text>
          </View>
        ) : (
          <View style={styles.exerciseList}>
            {recommendations.map((exercise) => (
              <TouchableRipple
                key={exercise.id}
                onPress={() => handleExercisePress(exercise)}
                style={styles.exerciseButton}
                accessible={true}
                accessibilityLabel={`Start ${exercise.title} exercise`}
                accessibilityHint={`${exercise.duration} exercise to ${exercise.benefit}`}
              >
                <LinearGradient
                  colors={exercise.gradientColors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.exerciseGradient}
                >
                  <View style={styles.exerciseItemContainer}>
                    <View style={styles.exerciseIconContainer}>
                      <MaterialCommunityIcons 
                        name={exercise.icon} 
                        size={24} 
                        color={COLORS.textOnColor} 
                      />
                    </View>
                    <View style={styles.exerciseContent}>
                      <Text style={styles.exerciseTitle}>{exercise.title}</Text>
                      <Text style={styles.exerciseDescription}>
                        {exercise.duration} • {exercise.benefit}
                      </Text>
                    </View>
                    <IconButton 
                      icon="chevron-right" 
                      iconColor={COLORS.textOnColor} 
                      size={20}
                      style={styles.exerciseArrow}
                    />
                  </View>
                </LinearGradient>
              </TouchableRipple>
            ))}
          </View>
        )}
      </Card.Content>
    </Card>
  );
};
```

### Step 7: Exercise Completion Tracking

Add a function to track exercise completions in the progress_logs table:

```javascript
// src/api/exercises/index.js
export const logExerciseCompletion = async (userId, exerciseType, details = {}) => {
  try {
    console.debug(`[API] Logging ${exerciseType} completion:`, { userId });
    
    const { data, error } = await supabase
      .from('progress_logs')
      .insert({
        user_id: userId,
        exercise_type: exerciseType,
        details
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error logging ${exerciseType} completion:`, error.message);
    throw error;
  }
};
```

Then update each exercise completion function to call this logging function.

## Testing Plan

1. **Unit Tests:** Create tests for each scoring function with mock data
2. **Integration Tests:** Test the recommendation engine with sample user profiles
3. **Performance Testing:** Ensure data fetching doesn't impact app performance
4. **User Testing:** Collect feedback on recommendation relevance

## Deployment Strategy

1. Implement in small, testable pieces:
   - First implement the hook and service with basic recommendations
   - Add individual scoring components one at a time
   - Enable time-based contextual factors last

2. A/B test with users to validate the recommendation quality

3. Monitor impact on user engagement metrics

## Expected Outcomes

- Increased user engagement with exercises
- More personalized user experience
- Higher retention and completion rates for exercises
- Better alignment between user goals and daily activities

## Future Enhancements

- AI-based recommendation refinement
- User feedback on recommendation quality
- Machine learning model to improve scoring weights
- Deeper natural language processing of journal entries
- Calendar integration for time-based recommendations 