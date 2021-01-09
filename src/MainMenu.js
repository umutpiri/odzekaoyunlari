import React, { Component } from 'react';
import {
  View,
  ActivityIndicator,
  ImageBackground,
  FlatList,
  TouchableOpacity,
  Text,
  Image,
  BackHandler,
  Alert,
  Linking,
  Dimensions
} from 'react-native';
import firebase from 'firebase';
import { GoogleSignin } from 'react-native-google-signin';
import DialogManager from 'react-native-dialog-component';
import DeviceInfo from 'react-native-device-info';
import { Fonts } from './Fonts';

export default class MainMenu extends Component {
  modes = { comps: 0, games: 1 };
  games = ['Sayısal Hafıza', 'Refleks', 'Kelime Hafıza'];
  constructor(props) {
    super(props);
    this.state = {
      names: [],
      currentUser: {},
      coinValue: 0,
      isLoading: true,
      isWinnerLoading: false,
      mode: 0
    };
  }

  componentWillMount() {
    this.setState({ isLoading: true });
    firebase
      .database()
      .ref(`competitions/names`)
      .once('value', snapshot => {
        this.setState({ names: snapshot.val() });
      });
    this.setState({ currentUser: firebase.auth().currentUser }, () => {
      firebase
        .database()
        .ref(`/users/${this.state.currentUser.uid}`)
        .once('value', snapshot => {
          try {
            DeviceInfo.getMACAddress()
              .then(mac => {
                firebase
                  .database()
                  .ref(`/admin/00Banned`)
                  .once('value', snapshot => {
                    if (snapshot.hasChild(mac)) {
                      firebase
                        .database()
                        .ref(`/users/${this.state.currentUser.uid}/`)
                        .set('0')
                        .then(() => {
                          try {
                            BackHandler.exitApp();
                          } catch (error) {
                            console.log(error);
                          }
                        });
                    }
                  })
                  .catch(err => console.log(err));
                if (snapshot.val().mac == null) {
                  firebase
                    .database()
                    .ref(`/users/${this.state.currentUser.uid}/`)
                    .update({ mac: mac })
                    .catch(err => console.log(err));
                }
              })
              .catch(err => {
                console.log(err);
              });
          } catch (error) {
            console.log(error);
          }
          this.setState({
            coinValue: snapshot.val().coin
          });
        })
        .then(() => this.setState({ isLoading: false }));
    });
  }
  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
  }

  handleBackPress = () => {
    Alert.alert(
      'Çıkış',
      'Çıkış yapmak istediğine emin misin?',
      [
        {
          text: 'Evet',
          onPress: () => BackHandler.exitApp()
        },
        {
          text: 'Hayır',
          onPress: () => {},
          style: 'cancel'
        }
      ],
      { cancelable: false }
    );
    return true;
  };

  select(item) {
    this.props.navigation.push('Main', {
      levelID: item
    });
  }

  signOut() {
    GoogleSignin.signOut();
    this.props.navigation.navigate('Splash');
  }

  community(text) {
    Linking.openURL(text);
  }

  renderList() {
    if (this.state.isLoading) {
      return (
        <ActivityIndicator
          size={40}
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center'
          }}
        />
      );
    } else {
      if (this.state.mode == this.modes.comps) {
        return (
          <FlatList
            style={{ flex: 1 }}
            contentContainerStyle={{
              alignItems: 'center',
              paddingTop: 10,
              width: (Dimensions.get('window').width * 8) / 10
            }}
            data={this.state.names}
            keyExtractor={(item, index) => (index + 10).toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => this.select(item)}
                activeOpacity={0.7}
                style={{
                  marginTop: 5,
                  marginBottom: 7,
                  borderRadius: 25,
                  padding: 3,
                  alignItems: 'center',
                  backgroundColor: '#fff'
                }}
              >
                <View
                  style={{
                    backgroundColor: '#4682b4',
                    width: (Dimensions.get('window').width * 7.6) / 10,
                    alignItems: 'center',
                    borderRadius: 25,
                    padding: 10
                  }}
                >
                  <Text
                    style={{
                      color: '#fff',
                      fontSize: 20,
                      fontFamily: Fonts.WorkSans
                    }}
                  >
                    {item}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        );
      } else {
        return (
          <FlatList
            style={{ flex: 1 }}
            contentContainerStyle={{
              alignItems: 'center',
              paddingTop: 10,
              width: (Dimensions.get('window').width * 8) / 10
            }}
            data={this.games}
            keyExtractor={(item, index) => (index + 10).toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  switch (item) {
                    case 'Sayısal Hafıza':
                      this.props.navigation.navigate('NumberGame');
                      break;
                    case 'Refleks':
                      this.props.navigation.navigate('ReflexGame');
                      break;
                    case 'Sözel Hafıza':
                      this.props.navigation.navigate('VerbalGame');
                      break;
                  }
                }}
                activeOpacity={0.7}
                style={{
                  marginTop: 5,
                  marginBottom: 7,
                  borderRadius: 25,
                  padding: 3,
                  alignItems: 'center',
                  backgroundColor: '#fff'
                }}
              >
                <View
                  style={{
                    backgroundColor: '#4682b4',
                    width: (Dimensions.get('window').width * 7.6) / 10,
                    alignItems: 'center',
                    borderRadius: 25,
                    padding: 10
                  }}
                >
                  <Text
                    style={{
                      color: '#fff',
                      fontSize: 20,
                      fontFamily: Fonts.WorkSans
                    }}
                  >
                    {item}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        );
      }
    }
  }

  openWinners() {
    this.setState({ isWinnerLoading: true });
    data = [];
    firebase
      .database()
      .ref(`/winners`)
      .orderByChild('/score')
      .limitToLast(10)
      .once('value', snapshot => {
        snapshot.forEach(element => {
          data.push(element.val());
          data.reverse();
        });
      })
      .then(() => {
        DialogManager.show({
          titleTextStyle: {
            fontSize: 25,
            fontWeight: 'bold',
            color: '#000',
            paddingTop: 8
          },
          width: 0.9,
          height: 0.75,
          dialogStyle: { borderRadius: 10 },
          children: (
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text
                style={{
                  color: '#c85',
                  fontSize: 25,
                  fontFamily: Fonts.WorkSans,
                  marginBottom: 15,
                  marginTop: 5
                }}
              >
                Kazananlar
              </Text>
              <TouchableOpacity
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 3,
                  borderRadius: 50,
                  width: 45,
                  height: 45,
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onPress={() => DialogManager.dismissAll()}
              >
                <Text
                  style={{
                    color: '#666',
                    fontSize: 30,
                    fontWeight: 'bold',
                    textAlignVertical: 'top',
                    paddingBottom: 3,
                    alignSelf: 'center',
                    alignItems: 'center',
                    fontFamily: Fonts.WorkSans
                  }}
                >
                  ✖
                </Text>
              </TouchableOpacity>
              <View
                style={{
                  width: (Dimensions.get('window').width * 8) / 10,
                  flexDirection: 'row',
                  borderRadius: 5,
                  padding: 2
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    margin: 2,
                    textAlign: 'left',
                    fontFamily: Fonts.WorkSans,
                    flex: 2
                  }}
                >
                  Oyun
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    margin: 2,
                    textAlign: 'center',
                    fontFamily: Fonts.WorkSans,
                    flex: 5
                  }}
                >
                  İsim
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    margin: 2,
                    marginRight: 5,
                    textAlign: 'right',
                    fontFamily: Fonts.WorkSans,
                    flex: 2
                  }}
                >
                  Ödül
                </Text>
              </View>
              <FlatList
                data={data}
                keyExtractor={(item, index) => 'it-' + (index + 10).toString()}
                renderItem={({ item, index }) => (
                  <View
                    style={{
                      width: (Dimensions.get('window').width * 8) / 10,
                      flexDirection: 'row',
                      borderRadius: 5,
                      padding: 2
                    }}
                    backgroundColor={
                      index == 0
                        ? '#FFD710'
                        : index % 2 == 0
                        ? '#87CEFA'
                        : '#4682B4'
                    }
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        margin: 2,
                        textAlign: 'left',
                        fontFamily: Fonts.WorkSans,
                        flex: 2,
                        textAlignVertical: 'center'
                      }}
                    >
                      {item.test}
                    </Text>
                    <Text
                      style={{
                        fontSize: 16,
                        margin: 2,
                        marginLeft: 0,
                        textAlign: 'center',
                        fontFamily: Fonts.WorkSans,
                        flex: 5,
                        textAlignVertical: 'center'
                      }}
                    >
                      {item.name}
                    </Text>
                    <Text
                      style={{
                        fontSize: 16,
                        margin: 2,
                        marginRight: 5,
                        textAlign: 'right',
                        fontFamily: Fonts.WorkSans,
                        flex: 2,
                        textAlignVertical: 'center'
                      }}
                    >
                      {item.score}
                    </Text>
                  </View>
                )}
              />
            </View>
          )
        });
      })
      .then(() => {
        this.setState({ isWinnerLoading: false });
      });
  }

  renderWinners() {}

  render() {
    return (
      <ImageBackground
        style={{
          flex: 1
        }}
        source={require('../assets/Icons/bg2.jpg')}
        resizeMode={'stretch'}
      >
        <View
          style={{
            width: '100%',
            flexDirection: 'row',
            paddingBottom: 15,
            paddingTop: 15
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-start',
              alignItems: 'center',
              marginLeft: 7,
              backgroundColor: '#345895',
              borderRadius: 10
            }}
          >
            <Image
              style={{
                width: 30,
                height: 30,
                padding: 5,
                margin: 5,
                marginLeft: 10
              }}
              source={require('../assets/coin.png')}
            />
            <Text
              style={{
                fontSize: 25,
                color: '#fff',
                margin: 5,
                marginRight: 15,
                fontFamily: Fonts.WorkSans
              }}
            >
              {this.state.coinValue}
            </Text>
          </View>
          <View
            style={{
              flex: 1,
              alignSelf: 'flex-end',
              alignItems: 'flex-end',
              flexDirection: 'row',
              justifyContent: 'flex-end'
            }}
          >
            <TouchableOpacity
              onPress={() => this.openWinners()}
              disabled={this.state.isWinnerLoading}
              style={{
                width: 55,
                height: 55,
                alignItems: 'center',
                borderRadius: 45,
                backgroundColor: '#345895',
                marginRight: 15,
                justifyContent: 'center'
              }}
            >
              <Image
                style={{
                  width: 32,
                  height: 32,
                  tintColor: '#ddd'
                }}
                source={require('../assets/Icons/crown.png')}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => this.signOut()}
              style={{
                width: 55,
                height: 55,
                alignItems: 'center',
                borderRadius: 45,
                backgroundColor: '#345895',
                marginRight: 10,
                justifyContent: 'center'
              }}
            >
              <Image
                style={{
                  width: 32,
                  height: 32,
                  marginLeft: 6,
                  tintColor: '#ddd'
                }}
                source={require('../assets/Icons/exit.png')}
              />
            </TouchableOpacity>
          </View>
        </View>
        <View
          style={{ flexDirection: 'row', width: '95%', alignSelf: 'center' }}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {
              this.setState({ mode: this.modes.comps });
            }}
            style={{
              flex: 1,
              backgroundColor:
                this.state.mode == this.modes.comps ? '#345895' : '#243855',
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              paddingTop: 8,
              paddingBottom: 5
            }}
          >
            <Text
              style={{
                fontFamily: Fonts.WorkSans,
                fontSize: Dimensions.get('window').width * 0.077,
                color: '#ddd',
                textAlign: 'center'
              }}
            >
              Sorular
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {
              this.setState({ mode: this.modes.games });
            }}
            style={{
              flex: 1,
              backgroundColor:
                this.state.mode != this.modes.comps ? '#345895' : '#243855',
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              paddingTop: 8,
              paddingBottom: 5
            }}
          >
            <Text
              style={{
                fontFamily: Fonts.WorkSans,
                fontSize: Dimensions.get('window').width * 0.077,
                color: '#ddd',
                textAlign: 'center'
              }}
            >
              Oyunlar
            </Text>
          </TouchableOpacity>
        </View>
        <View
          style={{
            width: '95%',
            backgroundColor: '#345895',
            alignItems: 'center',
            justifyContent: 'center',
            alignSelf: 'center',
            flex: 1,
            marginBottom: 15,
            borderBottomLeftRadius: 20,
            borderBottomRightRadius: 20
          }}
        >
          {this.renderList()}
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <TouchableOpacity
            onPress={() =>
              this.community('https://www.facebook.com/zkoyunlari')
            }
          >
            <Image
              style={{ width: 45, height: 45 }}
              source={require('../assets/Icons/facebook.png')}
            />
          </TouchableOpacity>
          <View style={{ width: 30 }} />
          <TouchableOpacity
            onPress={() =>
              this.community('https://www.instagram.com/od_zekaoyunlari')
            }
          >
            <Image
              style={{ width: 45, height: 45 }}
              source={require('../assets/Icons/instagram.png')}
            />
          </TouchableOpacity>
        </View>
        <Text
          style={{
            textAlign: 'center',
            fontSize: 11.5,
            color: '#ddd',
            marginBottom: 8,
            marginTop: 4
          }}
        >
          Daha fazla bilgi için topluluk sayfalarını ziyaret edebilirsiniz.
        </Text>
      </ImageBackground>
    );
  }
}
