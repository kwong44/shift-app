import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import CustomButton from './CustomButton';
import { testAiConnection, analyzeText } from '../../api/aiCoach';

/**
 * A button component that tests the AI connection and text analysis
 */
const AITestButton = () => {
  const [testResult, setTestResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Debug log: Component mounted
  console.debug('[AITestButton] Component mounted');

  const handleTestConnection = async () => {
    setIsLoading(true);
    setTestResult('');
    
    // Debug log: Test button pressed
    console.debug('[AITestButton] Testing AI connection...');

    try {
      const response = await testAiConnection('Hello AI Coach!');
      // Debug log: Successful response
      console.debug('[AITestButton] Test successful:', response);
      setTestResult('✅ AI Connection successful!');
    } catch (error) {
      // Debug log: Error in connection
      console.error('[AITestButton] Test failed:', error);
      setTestResult(`❌ Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestAnalysis = async () => {
    setIsLoading(true);
    setTestResult('');
    
    // Debug log: Analysis test started
    console.debug('[AITestButton] Testing text analysis...');

    try {
      const response = await analyzeText(
        "I want to improve my fitness and eat better, but I'm struggling to stay consistent.",
        { type: 'goal' }
      );
      // Debug log: Successful analysis
      console.debug('[AITestButton] Analysis successful:', response);
      setTestResult(`✅ Analysis successful!\n\n${response.data.analysis}`);
    } catch (error) {
      // Debug log: Error in analysis
      console.error('[AITestButton] Analysis failed:', error);
      setTestResult(`❌ Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <CustomButton
        title="Test AI Connection"
        onPress={handleTestConnection}
        loading={isLoading}
        style={styles.button}
      />
      <CustomButton
        title="Test AI Analysis"
        onPress={handleTestAnalysis}
        loading={isLoading}
        style={styles.button}
      />
      {testResult ? (
        <Text style={styles.resultText}>{testResult}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 16,
  },
  button: {
    marginBottom: 8,
  },
  resultText: {
    marginTop: 8,
    fontSize: 16,
    textAlign: 'center',
  },
});

export default AITestButton; 