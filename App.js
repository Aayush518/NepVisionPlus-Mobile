import React from 'react';
import { StyleSheet, View } from 'react-native';
import NepVisionApp from './components/NepVisionApp';

export default function App() {
  return (
    <View style={styles.container}>
      <NepVisionApp />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});