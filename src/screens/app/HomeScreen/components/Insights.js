import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Title, Text, IconButton, Paragraph, Chip, Button } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { SPACING, COLORS, RADIUS, FONT } from '../../../../config/theme';

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
};

const Insights = ({ insights, journalDate }) => {
  // Add state to track expanded/collapsed state
  const [expanded, setExpanded] = useState(false);
  
  // Function to toggle expanded state
  const toggleExpanded = () => {
    // Debug log
    console.debug('[Insights] Toggling expanded state:', { currentState: expanded, newState: !expanded });
    setExpanded(!expanded);
  };

  if (!insights) return null;

  // Debug log
  console.debug('[Insights] Rendering insights:', { insights, journalDate, expanded });
  
  // Determine if text should be truncated
  const shouldTruncate = insights.length > 100 && !expanded;
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
  );
};

const styles = StyleSheet.create({
  insightCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    marginTop: SPACING.lg,
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