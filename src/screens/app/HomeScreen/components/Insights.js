import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Title, Text, IconButton, Paragraph, Button } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { SPACING, COLORS, RADIUS, FONT } from '../../../../config/theme';
import { supabase } from '../../../../config/supabase';

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
};

const Insights = ({ insights, journalDate, navigation }) => {
  // Add state to track expanded/collapsed state
  const [expanded, setExpanded] = useState(false);
  const [patternRecommendations, setPatternRecommendations] = useState(null);
  const [loadingPatterns, setLoadingPatterns] = useState(false);
  
  // Function to toggle expanded state
  const toggleExpanded = () => {
    // Debug log
    console.debug('[Insights] Toggling expanded state:', { currentState: expanded, newState: !expanded });
    setExpanded(!expanded);
  };

  // Load pattern recommendations when component mounts
  useEffect(() => {
    loadPatternRecommendations();
  }, []);

  const loadPatternRecommendations = async () => {
    try {
      console.debug('[Insights] Loading pattern recommendations');
      setLoadingPatterns(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get the most recent journal entry with pattern analysis
      const { data: recentEntries, error } = await supabase
        .from('journal_entries')
        .select('ai_metadata, created_at')
        .eq('user_id', user.id)
        .not('ai_metadata', 'is', null)
        .order('created_at', { ascending: false })
        .limit(5); // Check last 5 entries for patterns

      if (error) {
        console.error('[Insights] Error fetching pattern data:', error);
        return;
      }

      // Find the most recent entry with pattern recommendations
      let latestPatterns = null;
      for (const entry of recentEntries || []) {
        if (entry.ai_metadata?.patternAnalysis?.pattern_detected) {
          latestPatterns = entry.ai_metadata.patternAnalysis;
          console.debug('[Insights] Found pattern recommendations:', latestPatterns);
          break;
        }
      }

      setPatternRecommendations(latestPatterns);
    } catch (error) {
      console.error('[Insights] Error loading pattern recommendations:', error);
    } finally {
      setLoadingPatterns(false);
    }
  };

  const handleNavigateToRecommendedExercise = () => {
    if (!patternRecommendations?.recommendation) {
      console.warn('[Insights] No pattern recommendation available');
      return;
    }

    const recommendation = patternRecommendations.recommendation;
    console.debug('[Insights] Navigating to recommended exercise:', recommendation);
    
    // Extract exerciseId and exerciseType from the recommendation object
    const { exercise_id: exerciseId, exercise_type: exerciseType } = recommendation;
    
    console.debug('[Insights] Extracted navigation params:', { exerciseId, exerciseType });
    
    // Navigate based on exercise type - same navigation logic as PatternRecommendationCard
    switch (exerciseType) {
      case 'Mindfulness':
        navigation?.navigate('MindfulnessSetup', { 
          preselectedExercise: exerciseId,
          source: 'pattern_recommendation' 
        });
        break;
      case 'Visualization':
        navigation?.navigate('VisualizationSetup', { 
          preselectedExercise: exerciseId,
          source: 'pattern_recommendation' 
        });
        break;
      case 'Deep Work':
        navigation?.navigate('DeepWorkSetup', { 
          source: 'pattern_recommendation' 
        });
        break;
      case 'Journaling':
        navigation?.navigate('JournalingSetup', { 
          source: 'pattern_recommendation' 
        });
        break;
      case 'Binaural Beats':
        navigation?.navigate('BinauralSetup', { 
          preselectedExercise: exerciseId,
          source: 'pattern_recommendation' 
        });
        break;
      case 'Task Planning':
        navigation?.navigate('TaskPlanner', { 
          source: 'pattern_recommendation' 
        });
        break;
      default:
        console.warn('[Insights] Unknown exercise type:', exerciseType, 'falling back to ExercisesDashboard');
        navigation?.navigate('ExercisesDashboard');
    }
  };

  if (!insights) return null;

  // Debug log
  console.debug('[Insights] Rendering insights:', { 
    insights, 
    journalDate, 
    expanded, 
    hasPatternRecommendations: !!patternRecommendations 
  });
  
  // Determine if text should be truncated
  const shouldTruncate = insights && insights.length > 100 && !expanded;
  const displayText = shouldTruncate ? insights.substring(0, 100) + '...' : insights;

  return (
    <Card style={styles.insightCard} elevation={2}>
      <LinearGradient
        colors={['#e9e6ff', '#d8d4fc']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.insightGradient}
      >
        <Card.Content>
          <View style={styles.cardHeader}>
            <View style={styles.titleContainer}>
              <Title style={styles.cardTitle}>AI Coach Insights</Title>
              {journalDate && (
                <Text style={styles.timestamp}>
                  from your journal on {formatDate(journalDate)}
                </Text>
              )}
            </View>
            <IconButton 
              icon="robot-love-outline" 
              size={24}
              iconColor={COLORS.primary}
              style={styles.insightIcon}
              accessibilityLabel="AI generated insights"
            />
          </View>
          
          <Paragraph style={styles.insightText}>
            {displayText}
          </Paragraph>
          
          <View style={styles.buttonsContainer}>
            {insights.length > 100 && (
              <Button 
                mode="text" 
                onPress={toggleExpanded}
                style={styles.expandButton}
                labelStyle={styles.expandButtonText}
                icon={expanded ? "chevron-up" : "chevron-down"}
                accessibilityLabel={expanded ? "Collapse insight" : "Expand insight"}
                accessibilityHint={expanded ? "Collapses the full insight text" : "Expands to show the full insight text"}
              >
                {expanded ? "Show less" : "Read more"}
              </Button>
            )}
            
            {/* AI Recommended Exercise Button */}
            {patternRecommendations?.recommendation && (
              <Button 
                mode="contained-tonal" 
                onPress={handleNavigateToRecommendedExercise}
                style={styles.recommendedExerciseButton}
                labelStyle={styles.recommendedExerciseButtonText}
                icon="lightbulb-outline"
                accessibilityLabel="Try recommended exercise"
                accessibilityHint={`Navigate to recommended ${patternRecommendations.recommendation.exercise_type} exercise`}
              >
                Try {patternRecommendations.recommendation.exercise_type}
              </Button>
            )}
          </View>
          
        </Card.Content>
      </LinearGradient>
    </Card>
  );
};

const styles = StyleSheet.create({
  insightCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  insightGradient: {
    borderRadius: RADIUS.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
    marginTop: SPACING.md,
  },
  titleContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: FONT.size.xl,
    fontWeight: FONT.weight.bold,
    color: COLORS.text,
  },
  timestamp: {
    fontSize: FONT.size.sm,
    color: COLORS.textLight,
    marginTop: SPACING.xs,
  },
  insightIcon: {
    backgroundColor: COLORS.primary + '20',
    borderRadius: 12,
  },
  insightText: {
    marginVertical: SPACING.sm,
    color: COLORS.text,
    lineHeight: 22,
    fontSize: FONT.size.md,
  },
  expandButton: {
    alignSelf: 'flex-start',
    marginTop: -SPACING.xs,
    marginBottom: SPACING.xs,
  },
  expandButtonText: {
    color: COLORS.primary,
    fontSize: FONT.size.sm,
  },
  buttonsContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginTop: SPACING.sm,
  },
  recommendedExerciseButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.sm,
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
    alignSelf: 'flex-start',
  },
  recommendedExerciseButtonText: {
    color: COLORS.surface,
    fontSize: FONT.size.sm,
    fontWeight: FONT.weight.semiBold,
  },
});

export default Insights; 