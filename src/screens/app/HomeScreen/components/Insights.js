import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Title, Text, IconButton, Paragraph } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { SPACING, COLORS, RADIUS, FONT } from '../../../../config/theme';

const Insights = ({ insights }) => {
  if (!insights) return null;

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
            <Title style={styles.cardTitle}>AI Insights</Title>
            <IconButton 
              icon="lightbulb-outline" 
              size={24}
              iconColor="#ff5757"
              style={styles.insightIcon}
              accessibilityLabel="AI generated insights"
            />
          </View>
          
          <Paragraph style={styles.insightText}>
            "{insights.text}"
          </Paragraph>
          
          {insights.recommendations?.length > 0 && (
            <View style={styles.recommendationsList}>
              {insights.recommendations.map((recommendation, index) => (
                <View 
                  key={index} 
                  style={styles.recommendationItem}
                  accessible={true}
                  accessibilityLabel={`Recommendation ${index + 1}: ${recommendation}`}
                >
                  <Text style={styles.recommendationStar}>★</Text>
                  <Text style={styles.recommendationText}>{recommendation}</Text>
                </View>
              ))}
            </View>
          )}
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
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  cardTitle: {
    fontSize: FONT.size.xl,
    fontWeight: FONT.weight.bold,
    color: COLORS.text,
  },
  insightIcon: {
    backgroundColor: COLORS.accent + '20',
    borderRadius: 12,
  },
  insightText: {
    fontStyle: 'italic',
    marginVertical: SPACING.sm,
    color: COLORS.text,
    lineHeight: 22,
    fontSize: FONT.size.md,
  },
  recommendationsList: {
    marginTop: SPACING.sm,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: SPACING.xs,
  },
  recommendationStar: {
    color: "#ff5757",
    fontSize: FONT.size.md,
    marginRight: SPACING.xs,
  },
  recommendationText: {
    flex: 1,
    color: COLORS.text,
    lineHeight: 20,
    fontSize: FONT.size.md,
  },
});

export default Insights; 