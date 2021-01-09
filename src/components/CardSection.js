import React from 'react';
import { View } from 'react-native';

const CardSection = props => (
  <View
    style={[
      styles.subContainerStyle,
      { backgroundColor: props.backgroundColor || '#fff' }
    ]}
  >
    {props.children}
  </View>
);

const styles = {
  subContainerStyle: {
    borderBottomWidth: 1,
    padding: 5,
    justifyContent: 'flex-start',
    flexDirection: 'row',
    borderColor: '#ddd',
    position: 'relative',
    borderRadius: 11
  }
};

export { CardSection };
