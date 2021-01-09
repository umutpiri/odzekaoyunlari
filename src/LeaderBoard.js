import React, { Component } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  BackHandler
} from 'react-native';
import firebase from 'firebase';
import { CardSection } from './components';
import { Fonts } from './Fonts';

var data = [];
export default class LeaderBoard extends Component {
  state = { isLoading: true, count: 50, current: 50 };
  componentWillMount() {
    data = [];
    this.loadParams().then(() => {
      firebase
        .database()
        .ref(`competitions/${this.state.levelID}/leaderboard`)
        .orderByChild('/dateScore')
        .limitToFirst(50)
        .once('value', snapshot => {
          snapshot.forEach(element => {
            data.push(element.val());
          });
        });
      firebase
        .database()
        .ref(`/admin`)
        .child('00Count')
        .once('value', snapshot => {
          console.log(snapshot.val());
          this.setState({ count: snapshot.val(), isLoading: false }, () => {
            if (data.length < 50) {
              this.setState({ count: data.length });
              this.setState({ current: data.length });
            }
          });
        });
    });
  }

  async loadParams() {
    var levelID;
    try {
      levelID = await this.props.navigation.getParam('levelID', 'default');
      console.log(levelID);
      if (levelID != null && levelID != 'default') this.setState({ levelID });
      else {
        await firebase
          .database()
          .ref(`competitions/names`)
          .once('value', snapshot => {
            this.setState({ levelID: snapshot.val()[0] });
          });
      }
    } catch (error) {
      await firebase
        .database()
        .ref(`competitions/names`)
        .once('value', snapshot => {
          this.setState({ levelID: snapshot.val()[0] });
        });
    }
  }

  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
  }
  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
  }
  handleBackPress = () => {
    this.props.navigation.goBack();
    return true;
  };

  renderWspinner() {
    if (this.state.isLoading) {
      return (
        <View
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
        >
          <ActivityIndicator size="large" />
        </View>
      );
    } else {
      return (
        <FlatList
          data={data}
          keyExtractor={(item, index) => 'it-' + (index + 10).toString()}
          renderItem={({ item, index }) => (
            <CardSection
              backgroundColor={
                index == 0 ? '#FFD710' : index % 2 == 0 ? '#87CEFA' : '#4682B4'
              }
            >
              <Text style={[styles.textStyle, { marginLeft: 5 }]}>
                {index + 1}.
              </Text>
              <Text style={[styles.textStyle, { flex: 7 }]}>{item.name}</Text>
              <Text
                style={[
                  styles.textStyle,
                  { flex: 2, textAlign: 'right', marginRight: 5 }
                ]}
              >
                {item.score}
              </Text>
            </CardSection>
          )}
        />
      );
    }
  }

  render() {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'flex-start',
          backgroundColor: '#F5FCFF'
        }}
      >
        <View
          style={{
            width: '100%',
            height: 60,
            justifyContent: 'flex-end'
          }}
        >
          <View style={{ flexDirection: 'row', backgroundColor: '#ddd' }}>
            <TouchableOpacity
              style={{
                alignItems: 'flex-start',
                width: 60,
                height: 60,
                justifyContent: 'center'
              }}
              onPress={() => this.props.navigation.goBack(null)}
            >
              <Image
                style={{ width: 50, height: 35 }}
                source={require('../assets/Icons/back.png')}
              />
            </TouchableOpacity>
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <Text
                style={{
                  fontSize: 35,
                  textAlign: 'center',
                  fontWeight: 'bold',
                  color: '#0f0f0f',
                  fontFamily: Fonts.WorkSans
                }}
              >
                Lider Tablosu
              </Text>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: 'row', marginTop: 10 }}>
          <Text
            style={{
              flex: 1,
              alignSelf: 'flex-start',
              marginLeft: 14,
              fontSize: 20,
              color: '#202020',
              fontWeight: '500'
            }}
          >
            İsim
          </Text>
          <Text
            style={{
              flex: 3,
              alignSelf: 'center',
              textAlign: 'center',
              fontSize: 20,
              color: '#202020',
              fontWeight: '500',
              fontFamily: Fonts.WorkSans
            }}
            numberOfLines={1}
          >
            {this.state.current}/{this.state.count}
          </Text>
          <Text
            style={{
              flex: 1,
              alignSelf: 'flex-end',
              textAlign: 'right',
              marginRight: 10,
              fontSize: 20,
              color: '#202020',
              fontWeight: '500',
              fontFamily: Fonts.WorkSans
            }}
          >
            Skor
          </Text>
        </View>
        <View style={styles.cardStyle}>{this.renderWspinner()}</View>
      </View>
    );
  }
}

const styles = {
  textStyle: {
    fontSize: 16,
    margin: 2,
    textAlign: 'left',
    fontFamily: Fonts.WorkSans
  },
  cardStyle: {
    flex: 1,
    marginLeft: 5,
    paddingRight: 5,
    marginTop: 2
  }
};
