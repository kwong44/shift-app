import React, { useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { COLORS, FONT, SPACING } from '../../config/theme';
import { signOut } from '../../api/auth';
import { testSupabaseConnection } from '../../utils/testConnection';

const HomeScreen = () => {
  useEffect(() => {
    // Test the connection when the screen loads
    testSupabaseConnection()
      .then(isConnected => {
        console.log('Supabase connection status:', isConnected);
      })
      .catch(error => {
        console.error('Error testing connection:', error);
      });
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      // The main navigation component will handle the redirect
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>RealityShift</Text>
        <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Welcome to Your Transformation Journey!</Text>
          <Text style={styles.cardText}>
            Your personalized roadmap has been created based on your assessment. 
            Complete daily exercises and track your progress here.
          </Text>
          <Text style={styles.comingSoon}>
            Full app features coming soon...
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: FONT.size.xl,
    fontWeight: FONT.weight.bold,
    color: COLORS.primary,
  },
  signOutButton: {
    padding: SPACING.sm,
  },
  signOutText: {
    fontSize: FONT.size.sm,
    color: COLORS.primary,
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: COLORS.background,
    borderRadius: SPACING.sm,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
  },
  cardTitle: {
    fontSize: FONT.size.lg,
    fontWeight: FONT.weight.bold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  cardText: {
    fontSize: FONT.size.md,
    color: COLORS.text,
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  comingSoon: {
    fontSize: FONT.size.md,
    fontStyle: 'italic',
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: SPACING.lg,
  },
});

export default HomeScreen; 