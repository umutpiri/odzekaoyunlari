import React, { Component } from 'react';
import { View } from 'react-native';

const ThreeDots = () => {
  return (
    <View style={styles.container}>
      <View style={styles.dotStyle} />
      <View style={styles.dotStyle} />
      <View style={styles.dotStyle} />
    </View>
  );
};

styles = {
  container: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center'
  },
  dotStyle: {
    width: 7,
    height: 7,
    borderRadius: 10,
    backgroundColor: '#fff',
    margin: 1.5
  }
};

export { ThreeDots };
