import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import CustomButton from './CustomButton';
import { testAiConnection, analyzeText } from '../../api/aiCoach';
import { Button } from 'react-native';

/**
 * A button component that tests the AI connection and text analysis
 */
const AITestButton = () => {
  const [testResult, setTestResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState({
    aiDailyFocus: null,
  });

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

  // Test AI Daily Focus Recommendations
  const testAIDailyFocus = async () => {
    try {
      console.log('[AITestButton] Testing AI Daily Focus Recommendations...');
      setTestResults(prev => ({
        ...prev,
        aiDailyFocus: { status: 'testing', message: 'Testing AI Daily Focus...' }
      }));

      const { generateAIDailyFocusRecommendations } = await import('../../services/aiDailyFocusService');
      
      if (!user?.id) {
        throw new Error('No user ID available for testing');
      }

      const recommendations = await generateAIDailyFocusRecommendations(user.id, 3);
      
      if (recommendations && recommendations.length > 0) {
        const aiPowered = recommendations.some(rec => rec.ai_recommendation?.is_ai_powered);
        setTestResults(prev => ({
          ...prev,
          aiDailyFocus: { 
            status: 'success', 
            message: `✅ Generated ${recommendations.length} recommendations (AI: ${aiPowered ? 'Yes' : 'Fallback'})`,
            data: recommendations.map(r => ({
              title: r.title,
              aiPowered: !!r.ai_recommendation?.is_ai_powered,
              score: r.ai_recommendation?.priority_score || 'N/A'
            }))
          }
        }));
      } else {
        throw new Error('No recommendations returned');
      }
    } catch (error) {
      console.error('[AITestButton] AI Daily Focus test failed:', error);
      setTestResults(prev => ({
        ...prev,
        aiDailyFocus: { status: 'error', message: `❌ ${error.message}` }
      }));
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
      <Button 
        mode="outlined" 
        onPress={testAIDailyFocus}
        style={styles.testButton}
        loading={testResults.aiDailyFocus?.status === 'testing'}
      >
        Test AI Daily Focus
      </Button>
      {testResults.aiDailyFocus && (
        <Text style={[
          styles.resultText,
          testResults.aiDailyFocus.status === 'success' ? styles.successText : styles.errorText
        ]}>
          {testResults.aiDailyFocus.message}
        </Text>
      )}
      {testResults.aiDailyFocus?.data && (
        <View style={styles.dataContainer}>
          {testResults.aiDailyFocus.data.map((rec, index) => (
            <Text key={index} style={styles.dataText}>
              {rec.title} - AI: {rec.aiPowered ? 'Yes' : 'No'} - Score: {rec.score}
            </Text>
          ))}
        </View>
      )}
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
  testButton: {
    marginTop: 16,
    marginBottom: 8,
  },
  successText: {
    color: 'green',
  },
  errorText: {
    color: 'red',
  },
  dataContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  dataText: {
    marginBottom: 8,
  },
});

export default AITestButton; 