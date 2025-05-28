import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Card, IconButton, Button, ActivityIndicator } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { SPACING, COLORS, RADIUS, FONT, SHADOWS } from '../../../../config/theme';
import { useUser } from '../../../../hooks/useUser';
import { getFavoriteExerciseIds } from '../../../../api/profile';
import { getExerciseById, MASTER_EXERCISE_LIST } from '../../../../constants/masterExerciseList';
import useExerciseFavorites from '../../../../hooks/useExerciseFavorites';
import { useNavigation } from '@react-navigation/native';

// Debug logging
console.debug('[FavoritesSection] Component loaded');

const FavoriteExerciseCard = ({ exercise, onPress, onRemoveFavorite, isRemoving }) => {
  console.debug('[FavoriteExerciseCard] Rendering exercise:', exercise.id);

  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    console.debug('[FavoriteExerciseCard] Quick starting exercise:', exercise.id);
    onPress(exercise);
  };

  const handleRemoveFavorite = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    console.debug('[FavoriteExerciseCard] Removing from favorites:', exercise.id);
    onRemoveFavorite(exercise.id);
  };

  return (
    <TouchableOpacity onPress={handlePress} style={styles.favoriteCard}>
      <LinearGradient
        colors={exercise.gradientColors || [COLORS.primary, COLORS.primaryDark]}
        style={styles.favoriteCardGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.favoriteCardContent}>
          <View style={styles.favoriteCardHeader}>
            <MaterialCommunityIcons
              name={exercise.icon}
              size={24}
              color={COLORS.white}
            />
            <IconButton
              icon="heart"
              iconColor={COLORS.white}
              size={20}
              onPress={handleRemoveFavorite}
              disabled={isRemoving}
              style={styles.removeButton}
            />
          </View>
          
          <Text style={styles.favoriteCardTitle} numberOfLines={2}>
            {exercise.title}
          </Text>
          
          <Text style={styles.favoriteCardDuration}>
            {exercise.defaultDurationText}
          </Text>
          
          <View style={styles.favoriteCardFooter}>
            <Text style={styles.favoriteCardType}>
              {exercise.type}
            </Text>
            <MaterialCommunityIcons
              name="play-circle"
              size={20}
              color={COLORS.white}
            />
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const SuggestedExerciseCard = ({ exercise, onPress }) => {
  console.debug('[SuggestedExerciseCard] Rendering suggested exercise:', exercise.id);

  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    console.debug('[SuggestedExerciseCard] Trying suggested exercise:', exercise.id);
    onPress(exercise);
  };

  return (
    <TouchableOpacity onPress={handlePress} style={styles.suggestedCard}>
      <View style={styles.suggestedCardContent}>
        <MaterialCommunityIcons
          name={exercise.icon}
          size={20}
          color={COLORS.primary}
        />
        <View style={styles.suggestedCardText}>
          <Text style={styles.suggestedCardTitle} numberOfLines={1}>
            {exercise.title}
          </Text>
          <Text style={styles.suggestedCardType}>
            {exercise.type}
          </Text>
        </View>
        <MaterialCommunityIcons
          name="arrow-right"
          size={16}
          color={COLORS.textLight}
        />
      </View>
    </TouchableOpacity>
  );
};

const FavoritesSection = () => {
  const { user } = useUser();
  const navigation = useNavigation();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { 
    toggleFavorite, 
    getFavoriteStatus, 
    getLoadingStatus 
  } = useExerciseFavorites(user?.id);

  console.debug('[FavoritesSection] Component mounted for user:', user?.id);

  // Load user's favorite exercises
  const loadFavorites = useCallback(async () => {
    if (!user?.id) {
      console.debug('[FavoritesSection] No user ID, skipping favorites load');
      setLoading(false);
      return;
    }

    console.debug('[FavoritesSection] Loading favorites for user:', user.id);
    setError(null);
    
    try {
      const favoriteIds = await getFavoriteExerciseIds(user.id);
      console.debug('[FavoritesSection] Favorite IDs loaded:', favoriteIds);
      
      // Get full exercise objects from master list
      const favoriteExercises = favoriteIds
        .map(id => getExerciseById(id))
        .filter(exercise => exercise !== null); // Remove any null results
      
      console.debug('[FavoritesSection] Favorite exercises loaded:', favoriteExercises.length);
      setFavorites(favoriteExercises);
    } catch (err) {
      console.error('[FavoritesSection] Error loading favorites:', err);
      setError('Failed to load favorites');
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  // Handle quick start exercise
  const handleQuickStart = useCallback((exercise) => {
    console.debug('[FavoritesSection] Quick starting exercise:', exercise.id, 'Route:', exercise.route);
    
    // Navigate to the exercise with masterExerciseId and originRouteName
    const params = {
      masterExerciseId: exercise.id,
      originRouteName: 'ProgressScreen',
      // Add any default settings from the exercise
      ...exercise.defaultSettings
    };
    
    console.debug('[FavoritesSection] Navigating with params:', params);
    navigation.navigate(exercise.route, params);
  }, [navigation]);

  // Handle remove from favorites
  const handleRemoveFavorite = useCallback(async (exerciseId) => {
    console.debug('[FavoritesSection] Removing exercise from favorites:', exerciseId);
    
    const currentStatus = getFavoriteStatus(exerciseId, true); // Assume it's favorited since it's in the list
    await toggleFavorite(exerciseId, currentStatus);
    
    // Reload favorites to update the UI
    await loadFavorites();
  }, [getFavoriteStatus, toggleFavorite, loadFavorites]);

  // Group favorites by exercise type
  const groupedFavorites = favorites.reduce((groups, exercise) => {
    const type = exercise.type;
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(exercise);
    return groups;
  }, {});

  // Get suggested exercises for empty state (random selection)
  const getSuggestedExercises = () => {
    const shuffled = [...MASTER_EXERCISE_LIST].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 4); // Show 4 suggestions
  };

  if (loading) {
    return (
      <Card style={styles.sectionCard}>
        <Card.Content style={styles.loadingContent}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading favorites...</Text>
        </Card.Content>
      </Card>
    );
  }

  return (
    <Card style={styles.sectionCard}>
      <Card.Content>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons
            name="heart"
            size={24}
            color={COLORS.primary}
          />
          <Text style={styles.sectionTitle}>Your Favorites</Text>
        </View>

        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}

        {favorites.length === 0 ? (
          // Empty state with suggestions
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="heart-outline"
              size={48}
              color={COLORS.textLight}
              style={styles.emptyIcon}
            />
            <Text style={styles.emptyTitle}>No favorites yet</Text>
            <Text style={styles.emptyDescription}>
              Complete exercises and tap the heart to add them to your favorites
            </Text>
            
            <Text style={styles.suggestionsTitle}>Try these exercises:</Text>
            <View style={styles.suggestionsContainer}>
              {getSuggestedExercises().map((exercise) => (
                <SuggestedExerciseCard
                  key={exercise.id}
                  exercise={exercise}
                  onPress={handleQuickStart}
                />
              ))}
            </View>
          </View>
        ) : (
          // Display grouped favorites
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.favoritesContainer}
          >
            {Object.entries(groupedFavorites).map(([type, exercises]) => (
              <View key={type} style={styles.typeGroup}>
                <Text style={styles.typeTitle}>{type}</Text>
                <View style={styles.typeExercises}>
                  {exercises.map((exercise) => (
                    <FavoriteExerciseCard
                      key={exercise.id}
                      exercise={exercise}
                      onPress={handleQuickStart}
                      onRemoveFavorite={handleRemoveFavorite}
                      isRemoving={getLoadingStatus(exercise.id)}
                    />
                  ))}
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  sectionCard: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: RADIUS.lg,
    ...SHADOWS.small,
  },
  loadingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
  },
  loadingText: {
    marginLeft: SPACING.sm,
    color: COLORS.textLight,
    fontSize: FONT.size.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT.size.lg,
    fontWeight: FONT.weight.bold,
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONT.size.sm,
    textAlign: 'center',
    marginVertical: SPACING.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  emptyIcon: {
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    fontSize: FONT.size.lg,
    fontWeight: FONT.weight.bold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  emptyDescription: {
    fontSize: FONT.size.md,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 20,
  },
  suggestionsTitle: {
    fontSize: FONT.size.md,
    fontWeight: FONT.weight.semibold,
    color: COLORS.text,
    marginBottom: SPACING.md,
    alignSelf: 'flex-start',
  },
  suggestionsContainer: {
    width: '100%',
  },
  suggestedCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  suggestedCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  suggestedCardText: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  suggestedCardTitle: {
    fontSize: FONT.size.md,
    fontWeight: FONT.weight.medium,
    color: COLORS.text,
  },
  suggestedCardType: {
    fontSize: FONT.size.sm,
    color: COLORS.textLight,
    marginTop: 2,
  },
  favoritesContainer: {
    paddingRight: SPACING.md,
  },
  typeGroup: {
    marginRight: SPACING.lg,
  },
  typeTitle: {
    fontSize: FONT.size.sm,
    fontWeight: FONT.weight.semibold,
    color: COLORS.textLight,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  typeExercises: {
    flexDirection: 'row',
  },
  favoriteCard: {
    width: 140,
    height: 120,
    marginRight: SPACING.sm,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  favoriteCardGradient: {
    flex: 1,
    padding: SPACING.sm,
  },
  favoriteCardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  favoriteCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  removeButton: {
    margin: 0,
    padding: 0,
    width: 24,
    height: 24,
  },
  favoriteCardTitle: {
    fontSize: FONT.size.sm,
    fontWeight: FONT.weight.semibold,
    color: COLORS.white,
    lineHeight: 16,
  },
  favoriteCardDuration: {
    fontSize: FONT.size.xs,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: FONT.weight.medium,
  },
  favoriteCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  favoriteCardType: {
    fontSize: FONT.size.xs,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: FONT.weight.medium,
  },
});

export default FavoritesSection; 