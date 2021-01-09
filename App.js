import React, { Component } from 'react';
import { YellowBox } from 'react-native';
import { createStackNavigator, createSwitchNavigator } from 'react-navigation';
import { MenuProvider } from 'react-native-popup-menu';
import Main from './src/Main';
import Splash from './src/Splash';
import LeaderBoard from './src/LeaderBoard';
import MainMenu from './src/MainMenu';
import { numberGame, reflexGame, verbalGame } from './src/games';

YellowBox.ignoreWarnings(['Setting a timer', 'Warning: isMounted']);

const AppStack = createStackNavigator(
  {
    MainMenu: MainMenu,
    Main: Main,
    LeaderBoard: LeaderBoard,
    VerbalGame: verbalGame,
    ReflexGame: reflexGame,
    NumberGame: numberGame
  },
  {
    navigationOptions: {
      header: null
    }
  }
);

const RootStack = createSwitchNavigator(
  {
    Splash: Splash,
    App: AppStack
  },
  {
    navigationOptions: {
      header: null
    }
  }
);

export default class App extends Component {
  render() {
    return (
      <MenuProvider backHandler={true}>
        <RootStack />
      </MenuProvider>
    );
  }
}
