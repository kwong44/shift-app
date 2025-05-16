import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT, SHADOWS } from '../../../../config/theme';

// Debug logger
const debug = {
  log: (message, data = '') => {
    console.log(`[ProfileTabHeader] ${message}`, data);
  }
};

const ProfileTabHeader = ({ activeTab, setActiveTab }) => {
  debug.log('Rendering with activeTab:', activeTab);
  
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.tabButton, 
          activeTab === 'profile' && styles.activeTabButton
        ]}
        onPress={() => {
          debug.log('Switching to Profile tab');
          setActiveTab('profile');
        }}
      >
        <Ionicons 
          name={activeTab === 'profile' ? 'person' : 'person-outline'} 
          size={22} 
          color={activeTab === 'profile' ? COLORS.primary : COLORS.textLight} 
        />
        <Text style={[
          styles.tabLabel, 
          activeTab === 'profile' && styles.activeTabLabel
        ]}>
          Profile
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.tabButton, 
          activeTab === 'progress' && styles.activeTabButton
        ]}
        onPress={() => {
          debug.log('Switching to Progress tab');
          setActiveTab('progress');
        }}
      >
        <Ionicons 
          name={activeTab === 'progress' ? 'trending-up' : 'trending-up-outline'} 
          size={22} 
          color={activeTab === 'progress' ? COLORS.primary : COLORS.textLight} 
        />
        <Text style={[
          styles.tabLabel, 
          activeTab === 'progress' && styles.activeTabLabel
        ]}>
          Progress
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.md,
    borderRadius: 8,
    ...SHADOWS.small,
    overflow: 'hidden',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.backgroundLight,
  },
  activeTabButton: {
    backgroundColor: COLORS.background,
  },
  tabLabel: {
    marginLeft: SPACING.xs,
    fontSize: FONT.size.md,
    fontWeight: FONT.weight.medium,
    color: COLORS.textLight,
  },
  activeTabLabel: {
    color: COLORS.primary,
    fontWeight: FONT.weight.semiBold,
  },
});

export default ProfileTabHeader; 