import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import NepVisionApp from './components/NepVisionApp';
import ErrorBoundary from './components/ErrorBoundary';

export default function App() {
  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <ErrorBoundary>
          <NepVisionApp />
        </ErrorBoundary>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
});