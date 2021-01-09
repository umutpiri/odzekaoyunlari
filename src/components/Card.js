import React from 'react';
import { View } from 'react-native';

const Card = props => (
  <View style={[styles.containerStyle, { marginTop: props.marginTop || 10 }]}>
    {props.children}
  </View>
);

const styles = {
  containerStyle: {
    borderRadius: 5,
    backgroundColor: '#fff',
    elevation: 1,
    marginLeft: 5,
    marginRight: 5,
    marginTop: 10
  }
};

export { Card };
