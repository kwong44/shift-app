/**
 * Subscription Settings Screen
 * 
 * Allows users to view their subscription status, manage billing,
 * and access subscription-related features.
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Card, Title, Button, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSubscription } from '../contexts/SubscriptionContext';

const SubscriptionSettingsScreen = ({ navigation }) => {
  const theme = useTheme();
  const { isSubscribed, refreshSubscription } = useSubscription();

  const handleRefresh = async () => {
    try {
      await refreshSubscription();
      Alert.alert('Success', 'Subscription status refreshed');
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh subscription');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Title>Subscription Settings</Title>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.statusText}>
              Status: {isSubscribed ? 'Premium Active' : 'Free Plan'}
            </Text>
            
            <Button
              mode="contained"
              onPress={handleRefresh}
              style={styles.button}
            >
              Refresh Status
            </Button>

            {!isSubscribed && (
              <Button
                mode="outlined"
                onPress={() => navigation.navigate('Paywall')}
                style={styles.button}
              >
                Upgrade to Premium
              </Button>
            )}
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  card: {
    margin: 16,
  },
  statusText: {
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    marginVertical: 8,
  },
});

export default SubscriptionSettingsScreen; 