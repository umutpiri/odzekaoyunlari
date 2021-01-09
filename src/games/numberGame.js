import React, { Component } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Animated,
  Text,
  TextInput,
  Dimensions,
  StyleSheet,
  Image,
  ImageBackground,
  BackHandler,
  AsyncStorage
} from 'react-native';
import { AdMobBanner, AdMobInterstitial } from 'react-native-admob';
import { Fonts } from '../Fonts';

class numberGame extends Component {
  gameModes = { BEGIN: 0, SHOW: 1, INPUT: 2, TRYAGAIN: 3 };
  state = {
    text: '',
    answer: '',
    mode: 0,
    score: 0,
    duration: 2000,
    highScore: -1,
    gameCount: 0
  };
  screenWidth = Dimensions.get('window').width;
  barWidth = this.screenWidth / 1.8;
  _animatedWidth = new Animated.Value(this.barWidth);

  componentWillMount() {
    this.retrieveData();
  }

  async retrieveData() {
    try {
      highScore = (await AsyncStorage.getItem('numberGameHigh')) || '-1';
      this.setState({ highScore: parseInt(highScore, 10) });
    } catch (error) {}
  }

  async storeData(score) {
    try {
      await AsyncStorage.setItem('numberGameHigh', score.toString());
    } catch (error) {}
  }

  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
    AdMobInterstitial.setAdUnitID('ca-app-pub-8980970186700232/5663779083');

    AdMobInterstitial.addEventListener('adClosed', () => {
      console.log('AdModInterstitial => adClosed');
      AdMobInterstitial.requestAd().catch(error => console.warn(error));
    });

    AdMobInterstitial.requestAd()
      .then(result => console.log(result))
      .catch(error => console.log(error));
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
    AdMobInterstitial.removeAllListeners();
  }
  handleBackPress = () => {
    this.props.navigation.pop();
    return true;
  };

  getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }

  showText() {
    this._animatedWidth.setValue(this.barWidth);
    Animated.timing(this._animatedWidth, {
      toValue: 0,
      duration: this.state.duration
    }).start(() => {
      this.setState({ mode: this.gameModes.INPUT });
      if (this.refs.textinput) this.refs.textinput.focus();
    });
    let tempText = (this.getRandomInt(9) + 1).toString();
    if (this.state.score > 0) {
      for (i = 0; i < this.state.score; i++) {
        tempText += this.getRandomInt(10).toString();
      }
    }
    this.setState({ text: tempText }, () => {
      this.setState({ mode: this.gameModes.SHOW });
    });
  }

  checkAnswer() {
    if (this.state.answer == '') return;
    if (this.state.text === this.state.answer) {
      this.setState(
        {
          answer: '',
          score: this.state.score + 1,
          duration: this.state.duration + 750
        },
        () => this.showText()
      );
    } else {
      this.setState({ gameCount: this.state.gameCount + 1 }, () => {
        if (this.state.gameCount == 3) {
          AdMobInterstitial.showAd().catch(error => console.warn(error));
          this.setState({ gameCount: 0 });
        }
      });
      if (this.state.score > this.state.highScore) {
        this.storeData(this.state.score);
        this.setState({
          mode: this.gameModes.TRYAGAIN,
          duration: 2000,
          highScore: this.state.score
        });
      } else {
        this.setState({
          mode: this.gameModes.TRYAGAIN,
          duration: 2000
        });
      }
    }
  }

  renderHighScore(isEnd) {
    if (this.state.highScore != -1)
      return (
        <Text
          style={{
            fontSize: 28,
            color: '#ddd',
            marginLeft: 10,
            marginRight: 10,
            backgroundColor: '#545895',
            textAlign: 'center',
            padding: 5,
            paddingLeft: 10,
            paddingRight: 10,
            borderBottomLeftRadius: 15,
            borderBottomRightRadius: 15,
            borderTopLeftRadius: isEnd ? 15 : 0,
            borderTopRightRadius: isEnd ? 15 : 0,
            fontFamily: Fonts.WorkSans
          }}
        >
          {this.state.score == this.state.highScore ? 'Yeni ' : ''}Rekorun:{' '}
          {this.state.highScore}
        </Text>
      );
  }

  renderBody() {
    switch (this.state.mode) {
      case this.gameModes.BEGIN:
        return (
          <View style={{ flex: 1, alignItems: 'center', marginTop: 30 }}>
            <View
              style={{
                marginTop: 30,
                paddingBottom: 15,
                borderRadius: 10,
                backgroundColor: '#345895',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%'
              }}
            >
              <Text
                style={{
                  fontSize: 30,
                  color: '#ddd',
                  textAlign: 'center',
                  marginTop: 7,
                  marginBottom: 10,
                  fontFamily: Fonts.WorkSans
                }}
              >
                Oynanış
              </Text>
              <Text
                style={{
                  fontSize: 20,
                  color: '#ddd',
                  marginLeft: 10,
                  marginRight: 10,
                  textAlign: 'center',
                  fontFamily: Fonts.WorkSans
                }}
              >
                İlk ekranda gösterilen sayıları aklında tutup ikinci ekranda
                yazarak bir sonraki seviyeye geç.
              </Text>
            </View>
            {this.renderHighScore(false)}
            <TouchableOpacity
              onPress={() => this.showText()}
              style={{
                marginTop: 25,
                borderRadius: 55,
                padding: 5,
                backgroundColor: '#ddd'
              }}
              activeOpacity={0.7}
            >
              <View
                style={{
                  padding: 25,
                  paddingLeft: 30,
                  paddingRight: 20,
                  borderRadius: 55,
                  backgroundColor: '#345895'
                }}
              >
                <View style={[styles.triangle]} />
              </View>
            </TouchableOpacity>
          </View>
        );
      case this.gameModes.SHOW:
        return (
          <View style={{ flex: 1, width: '100%' }}>
            <View style={styles.container}>
              <View
                style={{
                  backgroundColor: '#345895',
                  width: '100%',
                  padding: 5,
                  marginBottom: 30
                }}
              >
                <Text
                  style={{
                    fontSize: 40,
                    fontFamily: Fonts.WorkSans,
                    textAlign: 'center',
                    color: '#ddd'
                  }}
                >
                  {this.state.text}
                </Text>
              </View>
              <View
                style={{
                  width: this.barWidth,
                  height: 15,
                  backgroundColor: '#ddd',
                  marginBottom: 70
                }}
              >
                <Animated.View
                  style={{
                    width: this._animatedWidth,
                    height: 15,
                    backgroundColor: '#14a'
                  }}
                />
              </View>
            </View>
          </View>
        );
      case this.gameModes.INPUT:
        return (
          <ScrollView
            style={{ flex: 1, marginTop: 15 }}
            keyboardShouldPersistTaps={'handled'}
          >
            <View
              style={{
                width: '100%',
                alignItems: 'center',
                marginTop: 50
              }}
            >
              <TextInput
                style={{
                  width: '100%',
                  backgroundColor: '#345895',
                  fontSize: 40,
                  color: '#ddd'
                }}
                ref={'textinput'}
                onSubmitEditing={() => {
                  this.checkAnswer();
                }}
                autoCorrect={false}
                underlineColorAndroid="#aaa"
                selectionColor="#aaa"
                blurOnSubmit={false}
                keyboardType="numeric"
                textAlign={'center'}
                onChangeText={text => {
                  this.setState({ answer: text });
                }}
                value={this.state.answer}
              />
              <TouchableOpacity
                activeOpacity={0.7}
                style={{
                  marginTop: 40,
                  padding: 5,
                  backgroundColor: '#ddd',
                  borderRadius: 5
                }}
                onPress={() => this.checkAnswer()}
              >
                <View
                  style={{
                    backgroundColor: '#345895',
                    padding: 20,
                    paddingTop: 10,
                    paddingBottom: 10,
                    borderRadius: 5
                  }}
                >
                  <Text
                    style={{
                      fontSize: 30,
                      color: '#ddd',
                      fontFamily: Fonts.WorkSans
                    }}
                  >
                    Tamam
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </ScrollView>
        );
      case this.gameModes.TRYAGAIN:
        return (
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <View
              style={{
                backgroundColor: '#345895',
                borderRadius: 15,
                width: '90%',
                alignItems: 'center',
                marginBottom: 50
              }}
            >
              <Text
                style={{
                  color: '#ddd',
                  fontSize: 30,
                  marginTop: 20,
                  fontFamily: Fonts.WorkSans
                }}
              >
                Skor: {this.state.score}
              </Text>
              <View style={{ height: 20 }} />
              {this.renderHighScore(true)}
              <Text
                style={{
                  color: '#ddd',
                  marginTop: 20,
                  borderBottomWidth: 1.5,
                  borderTopWidth: 1.5,
                  width: '100%',
                  textAlign: 'center',
                  borderColor: '#282',
                  fontSize:
                    this.screenWidth * 0.13 -
                    (this.state.text.length > this.state.answer.length
                      ? this.state.text.length
                      : this.state.answer.length)
                }}
              >
                {this.state.text}
              </Text>
              <Text
                style={{
                  color: '#ddd',
                  marginTop: 5,
                  width: '100%',
                  borderBottomWidth: 1.5,
                  borderTopWidth: 1.5,
                  textAlign: 'center',
                  borderColor: '#822',
                  fontSize:
                    this.screenWidth * 0.13 -
                    (this.state.text.length > this.state.answer.length
                      ? this.state.text.length
                      : this.state.answer.length)
                }}
              >
                {this.state.answer}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  this.setState({ score: 0, answer: '' }, () =>
                    this.showText()
                  );
                }}
                style={{
                  backgroundColor: '#ddd',
                  marginBottom: 20,
                  marginTop: 30,
                  padding: 4,
                  borderRadius: 75
                }}
              >
                <View
                  style={{
                    backgroundColor: '#1f3f7f',
                    width: 75,
                    height: 75,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 75
                  }}
                >
                  <Image
                    style={{ width: 50, height: 50 }}
                    source={require('../../assets/Icons/reload.png')}
                    tintColor="#ddd"
                  />
                </View>
              </TouchableOpacity>
            </View>
            <View style={{ position: 'absolute', bottom: 0 }}>
              <AdMobBanner
                adSize="smartBannerPortrait"
                adUnitID="ca-app-pub-8980970186700232/7622839967"
              />
            </View>
          </View>
        );
      default:
        break;
    }
  }

  renderHeader() {
    if (
      this.state.mode == this.gameModes.BEGIN ||
      this.state.mode == this.gameModes.TRYAGAIN
    ) {
      return (
        <Text
          style={{
            fontSize: 35,
            fontFamily: Fonts.WorkSans,
            textAlignVertical: 'center',
            color: '#ddd'
          }}
        >
          Sayısal Hafıza
        </Text>
      );
    } else
      return (
        <Text
          style={{
            fontSize: 35,
            fontFamily: Fonts.WorkSans,
            textAlignVertical: 'center',
            color: '#ddd'
          }}
        >
          Skor: {this.state.score}
        </Text>
      );
  }

  render() {
    return (
      <ImageBackground
        style={{
          flex: 1,
          width: this.screenWidth,
          height: Dimensions.get('window').height
        }}
        source={require('../../assets/Icons/bg2.jpg')}
        resizeMode={'stretch'}
      >
        <View
          style={{
            width: '100%',
            height: 60,
            paddingTop: 5,
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'row',
            backgroundColor: '#345895'
          }}
        >
          <TouchableOpacity
            style={{
              position: 'absolute',
              left: 0,
              top: -5,
              alignItems: 'flex-start',
              width: 60,
              height: 60,
              justifyContent: 'center'
            }}
            onPress={() => this.props.navigation.pop()}
          >
            <Image
              style={{ width: 35, height: 35, marginLeft: 10, marginTop: 10 }}
              source={require('../../assets/Icons/back.png')}
              tintColor="#ddd"
            />
          </TouchableOpacity>
          {this.renderHeader()}
        </View>
        {this.renderBody()}
      </ImageBackground>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    width: '100%'
  },
  triangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 25,
    borderRightWidth: 25,
    borderBottomWidth: 50,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#ddd',
    transform: [{ rotate: '90deg' }]
  }
});

export { numberGame };
