import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';

const ProgressScreen = () => {
  const theme = useTheme();
  
  console.debug('Rendering ProgressScreen'); // Debug log
  
  return (
    <View style={styles.container}>
      <Text style={[styles.text, { color: theme.colors.primary }]}>Progress Screen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default ProgressScreen; 