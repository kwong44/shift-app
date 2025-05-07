import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text, TouchableRipple } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SPACING, COLORS, RADIUS, SHADOWS, FONT } from '../../../../config/theme';
import * as Haptics from 'expo-haptics';

export const TopicSelector = ({ 
  topics, 
  selectedTopic, 
  onSelectTopic 
}) => {
  // Debug log
  console.debug('TopicSelector rendered', { selectedTopic: selectedTopic.value });

  const renderTopicOption = (topic) => {
    const isSelected = selectedTopic.value === topic.value;
    
    return (
      <TouchableRipple
        key={topic.value}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onSelectTopic(topic.value);
        }}
      >
        <Card 
          style={[
            styles.topicOption,
            isSelected && { 
              borderColor: topic.color,
              borderWidth: 2
            }
          ]} 
          elevation={isSelected ? 4 : 2}
        >
          <LinearGradient
            colors={[`${topic.color}15`, `${topic.color}05`]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.optionGradient}
          >
            <View style={[styles.iconContainer, { backgroundColor: `${topic.color}25` }]}>
              <MaterialCommunityIcons name={topic.icon} size={28} color={topic.color} />
            </View>
            
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>{topic.label}</Text>
              <Text style={styles.optionDescription}>{topic.description}</Text>
            </View>
            
            {isSelected && (
              <MaterialCommunityIcons name="check-circle" size={22} color={topic.color} />
            )}
          </LinearGradient>
        </Card>
      </TouchableRipple>
    );
  };

  return (
    <View style={styles.container}>
      {topics.map(renderTopicOption)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: SPACING.lg,
  },
  topicOption: {
    marginBottom: SPACING.sm,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  optionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
    ...SHADOWS.small,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: FONT.size.md,
    fontWeight: FONT.weight.bold,
    color: COLORS.text,
    marginBottom: 2,
  },
  optionDescription: {
    color: COLORS.textLight,
    fontSize: FONT.size.sm,
  },
}); 