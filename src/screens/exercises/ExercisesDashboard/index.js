import React, { useState, useEffect } from 'react';
import { StyleSheet, Animated, View, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from 'react-native-paper';
import { COLORS, SPACING } from '../../../config/theme';
import { DashboardHeader, ExerciseCard } from './components';
import { MASTER_EXERCISE_LIST } from '../../../constants/masterExerciseList';
import { useUser } from '../../../hooks/useUser';
import { getAllExercisePreferences, setExerciseFavorite } from '../../../api/profile';

// Constants for all available exercises
const EXERCISES = [
  {
    id: 'journaling',
    title: 'Journaling',
    description: 'Process thoughts and emotions through writing',
    icon: 'book-outline',
    duration: '10-15 min',
    route: 'Journaling',  
  },
   {
    id: 'tasks',
    title: 'Task Planner',
    description: 'Break down your goals into actionable tasks',
    icon: 'checkbox-marked-outline',
    duration: '5-10 min',
    route: 'TaskPlanner',
  },
  {
    id: 'binaural',
    title: 'Binaural Beats',
    description: 'Enhance focus and relaxation through audio entrainment',
    icon: 'headphones',
    duration: '10-15 min',
    route: 'BinauralSetup',
  },
  {
    id: 'visualization',
    title: 'Visualization',
    description: 'Strengthen your mindset through guided visualization',
    icon: 'eye',
    duration: '5 min',
    route: 'VisualizationSetup',
  },
  {
    id: 'deepwork',
    title: 'Deep Work',
    description: 'Focus intensely on important tasks without distractions',
    icon: 'timer-outline',
    duration: '25-50 min',
    route: 'DeepWorkSetup',
  },
  {
    id: 'mindfulness',
    title: 'Mindfulness',
    description: 'Practice presence and emotional awareness',
    icon: 'meditation',
    duration: '5-10 min',
    route: 'MindfulnessSetup',
  }
];

console.debug('[ExercisesDashboard] Mounted. Now displays a static list of all exercises.');

const ExercisesDashboard = ({ navigation }) => {
  const { user } = useUser();
  const [scrollY] = useState(new Animated.Value(0));
  const [exercisePreferences, setExercisePreferences] = useState({});
  const [loadingPreferences, setLoadingPreferences] = useState(true);
  const [errorPreferences, setErrorPreferences] = useState(null);

  console.debug('[ExercisesDashboard] Initializing. User:', user?.id, 'Loading Prefs:', loadingPreferences);

  useEffect(() => {
    const loadPreferences = async () => {
      if (user?.id) {
        console.debug('[ExercisesDashboard] User found, loading preferences for:', user.id);
        setLoadingPreferences(true);
        setErrorPreferences(null);
        try {
          const prefsArray = await getAllExercisePreferences(user.id);
          const prefsObject = prefsArray.reduce((acc, pref) => {
            acc[pref.exercise_id] = pref;
            return acc;
          }, {});
          setExercisePreferences(prefsObject);
          console.debug('[ExercisesDashboard] Preferences loaded:', prefsObject);
        } catch (err) {
          console.error('[ExercisesDashboard] Error loading preferences:', err);
          setErrorPreferences('Failed to load exercise preferences.');
        } finally {
          setLoadingPreferences(false);
        }
      }
    };
    loadPreferences();
  }, [user]);

  const handleExercisePress = (exercise) => {
    console.debug('[ExercisesDashboard] Exercise pressed:', exercise.id, 'Navigating to:', exercise.route);
    navigation.navigate(exercise.route, exercise.defaultSettings || {});
  };

  const handleToggleFavorite = async (exerciseId, currentIsFavorite) => {
    if (!user?.id) {
      console.warn('[ExercisesDashboard] No user to toggle favorite for.');
      return;
    }
    console.debug(`[ExercisesDashboard] Toggling favorite for ${exerciseId}. Current: ${currentIsFavorite}`);
    try {
      const newPreferences = {
        ...exercisePreferences,
        [exerciseId]: {
          ...(exercisePreferences[exerciseId] || { exercise_id: exerciseId, user_id: user.id }),
          is_favorite: !currentIsFavorite,
          updated_at: new Date().toISOString(),
        },
      };
      setExercisePreferences(newPreferences);

      const updatedPref = await setExerciseFavorite(user.id, exerciseId, !currentIsFavorite);
      if (updatedPref) {
        setExercisePreferences(prev => ({
          ...prev,
          [exerciseId]: updatedPref,
        }));
        console.debug('[ExercisesDashboard] Favorite toggled successfully on server for:', exerciseId);
      } else {
        console.error('[ExercisesDashboard] Failed to toggle favorite on server. Reverting optimistic update.');
        setExercisePreferences(prev => {
          const revertedPrefs = { ...prev };
          if (prev[exerciseId]) {
            revertedPrefs[exerciseId].is_favorite = currentIsFavorite;
          } else {
            delete revertedPrefs[exerciseId];
          }
          return revertedPrefs;
        });
      }
    } catch (error) {
      console.error('[ExercisesDashboard] Error toggling favorite:', error);
      setExercisePreferences(prev => {
        const revertedPrefs = { ...prev };
        if (prev[exerciseId]) {
          revertedPrefs[exerciseId].is_favorite = currentIsFavorite;
        }
        return revertedPrefs;
      });
    }
  };

  if (loadingPreferences && !Object.keys(exercisePreferences).length) {
    return (
      <View style={styles.centeredMessageContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.messageText}>Loading exercises...</Text>
      </View>
    );
  }

  if (errorPreferences) {
    return (
      <View style={styles.centeredMessageContainer}>
        <Text style={styles.messageText}>{errorPreferences}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.headerArea} edges={['top']}>
        <DashboardHeader scrollY={scrollY} />
      </SafeAreaView>
      
      <Animated.ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: Platform.OS !== 'web' }
        )}
        scrollEventThrottle={16}
      >
        {MASTER_EXERCISE_LIST.map(exercise => {
          const preference = exercisePreferences[exercise.id];
          const isFavorite = preference ? preference.is_favorite : false;
          return (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              isFavorite={isFavorite}
              onToggleFavorite={handleToggleFavorite}
              onPress={handleExercisePress}
            />
          );
        })}
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerArea: {
    zIndex: 1,
  },
  scrollContainer: {
    flex: 1, 
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
  },
  scrollContent: {
    paddingBottom: SPACING.xl,
  },
  centeredMessageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  messageText: {
    marginTop: SPACING.md,
    fontSize: 16,
    color: COLORS.textLight,
  },
});

export default ExercisesDashboard; 