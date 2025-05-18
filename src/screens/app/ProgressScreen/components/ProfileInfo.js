import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Text, Button, Avatar } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, SHADOWS, RADIUS, FONT } from '../../../../config/theme';

// Debug logger
const debug = {
  log: (message, data = '') => {
    console.log(`[ProfileInfo] ${message}`, data);
  }
};

const ProfileInfo = ({ profile, onEditProfile, onLogout }) => {
  debug.log('Rendering with profile:', profile);
  
  // Function to handle logout
  const handleLogout = () => {
    debug.log('Logout button pressed');
    if (onLogout) {
      onLogout();
    }
  };
  
  return (
    <View style={styles.container}>
      {/* Profile Header with Avatar */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          {profile?.avatar_url ? (
            <Avatar.Image 
              size={80} 
              source={{ uri: profile.avatar_url }} 
              style={styles.avatar}
            />
          ) : (
            <Avatar.Icon 
              size={80} 
              icon="account" 
              color={COLORS.textOnColor} 
              style={[styles.avatar, { backgroundColor: COLORS.primary }]} 
            />
          )}
          <TouchableOpacity style={styles.editAvatarButton} onPress={() => onEditProfile('avatar')}>
            <Ionicons name="camera" size={16} color={COLORS.textOnColor} />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.name}>
          {profile?.full_name || 'Set your name'}
        </Text>
        
        <Text style={styles.email}>
          {profile?.email || ''}
        </Text>
      </View>
      
      {/* Profile Details */}
      <View style={styles.detailsCard}>
        <View style={styles.detailRow}>
          <Ionicons name="person-outline" size={24} color={COLORS.primary} />
          <Text style={styles.detailLabel}>Name</Text>
          <Text style={styles.detailValue}>{profile?.full_name || 'Not set'}</Text>
          <TouchableOpacity onPress={() => onEditProfile('name')}>
            <Ionicons name="create-outline" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.detailRow}>
          <Ionicons name="mail-outline" size={24} color={COLORS.primary} />
          <Text style={styles.detailLabel}>Email</Text>
          <Text style={styles.detailValue}>{profile?.email || 'Not set'}</Text>
        </View>
        
        <View style={styles.divider} />
        
        {/* Add more profile fields as needed */}
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={24} color={COLORS.primary} />
          <Text style={styles.detailLabel}>Member Since</Text>
          <Text style={styles.detailValue}>
            {profile?.created_at 
              ? new Date(profile.created_at).toLocaleDateString() 
              : 'Not available'}
          </Text>
        </View>
      </View>
      
      {/* Settings Button */}
      <Button 
        mode="outlined" 
        icon="cog"
        style={styles.settingsButton}
        onPress={() => onEditProfile('settings')}
      >
        Settings
      </Button>
      
      {/* Logout Button */}
      <Button 
        mode="outlined" 
        icon="logout"
        style={styles.logoutButton}
        onPress={handleLogout}
        textColor={COLORS.error}
      >
        Log Out
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.md,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: SPACING.md,
  },
  avatar: {
    ...SHADOWS.medium,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.secondary,
    borderRadius: RADIUS.round,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.small,
  },
  name: {
    fontSize: FONT.size.xl,
    fontWeight: FONT.weight.bold,
    marginBottom: SPACING.xxs,
  },
  email: {
    fontSize: FONT.size.md,
    color: COLORS.textLight,
  },
  detailsCard: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    ...SHADOWS.small,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  detailLabel: {
    flex: 1,
    marginLeft: SPACING.sm,
    fontSize: FONT.size.md,
    color: COLORS.textLight,
  },
  detailValue: {
    flex: 2,
    fontSize: FONT.size.md,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginVertical: SPACING.xs,
  },
  settingsButton: {
    borderColor: COLORS.primary,
    marginVertical: SPACING.sm,
  },
  logoutButton: {
    borderColor: COLORS.error,
    marginBottom: SPACING.sm,
  },
});

export default ProfileInfo; 