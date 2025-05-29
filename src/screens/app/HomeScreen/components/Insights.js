import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Title, Text, IconButton, Paragraph, Chip, Button } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { SPACING, COLORS, RADIUS, FONT } from '../../../../config/theme';
import PatternRecommendationCard from '../../../exercises/JournalingScreen/components/PatternRecommendationCard';
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

  const handleNavigateToRecommendedExercise = (exerciseId, exerciseType) => {
    console.debug('[Insights] Navigating to recommended exercise:', { exerciseId, exerciseType });
    
    // Dismiss the pattern recommendation
    setPatternRecommendations(null);
    
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
      case 'Task Planning':
        navigation?.navigate('TaskPlanner', { 
          source: 'pattern_recommendation' 
        });
        break;
      default:
        navigation?.navigate('ExercisesDashboard');
    }
  };

  const handleDismissPatternRecommendation = () => {
    console.debug('[Insights] Dismissing pattern recommendation');
    setPatternRecommendations(null);
  };

  if (!insights && !patternRecommendations) return null;

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
    <View>
      {/* Pattern Recommendations Card - Show above regular insights */}
      {patternRecommendations && (
        <View style={styles.patternContainer}>
          <PatternRecommendationCard
            patternAnalysis={patternRecommendations}
            onNavigateToExercise={handleNavigateToRecommendedExercise}
            onDismiss={handleDismissPatternRecommendation}
            visible={true}
          />
        </View>
      )}

      {/* Regular AI Insights Card */}
      {insights && (
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
                  icon="robot" 
                  size={24}
                  iconColor={COLORS.primary}
                  style={styles.insightIcon}
                  accessibilityLabel="AI generated insights"
                />
              </View>
              
              <Paragraph style={styles.insightText}>
                {displayText}
              </Paragraph>
              
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
              
              <View style={styles.tagsContainer}>
                <Chip 
                  icon="brain" 
                  style={styles.aiTag}
                  textStyle={styles.aiTagText}
                >
                  AI Generated
                </Chip>
              </View>
            </Card.Content>
          </LinearGradient>
        </Card>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  patternContainer: {
    marginBottom: SPACING.md,
  },
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
  tagsContainer: {
    flexDirection: 'row',
    marginTop: SPACING.md,
    flexWrap: 'wrap',
  },
  aiTag: {
    backgroundColor: COLORS.primary + '20',
    marginRight: SPACING.xs,
    marginBottom: SPACING.md,
  },
  aiTagText: {
    color: COLORS.primary,
    fontSize: FONT.size.sm,
  },
});

export default Insights; 