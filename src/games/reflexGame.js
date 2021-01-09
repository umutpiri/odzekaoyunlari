import React, { Component } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  Animated,
  BackHandler,
  AsyncStorage,
  ImageBackground
} from 'react-native';
import { AdMobBanner, AdMobInterstitial } from 'react-native-admob';
import { Fonts } from '../Fonts';

class reflexGame extends Component {
  gameModes = { BEGIN: 0, WAIT: 1, AGAIN: 2, READY: 3, FINAL: 4 };
  state = { mode: 0, average: 0, highScore: -1, gameCount: 0 };
  buttonText = ['BAŞLA', 'YEŞİLİ BEKLE', 'TEKRAR DENE', 'ŞİMDİ BAS', ''];
  buttonColor = ['#345895', '#b51535', '#953539', '#367942', '#345895'];

  firstTime;
  screenWidth = Dimensions.get('window').width;
  countDown = new Animated.Value(0);
  tries = [];
  _mounted = false;

  componentWillMount() {
    this.retrieveData();
  }

  async retrieveData() {
    try {
      highScore = (await AsyncStorage.getItem('reflexGameHigh')) || '-1';
      this.setState({ highScore: parseInt(highScore, 10) });
    } catch (error) {}
  }

  async storeData(score) {
    try {
      console.log(score);
      await AsyncStorage.setItem('reflexGameHigh', score.toString());
    } catch (error) {}
  }

  finishGame() {
    this.setState({ gameCount: this.state.gameCount + 1 }, () => {
      if (this.state.gameCount == 3) {
        AdMobInterstitial.showAd().catch(error => console.warn(error));
        this.setState({ gameCount: 0 });
      }
    });
    if (
      this.state.average < this.state.highScore ||
      this.state.highScore == -1
    ) {
      this.storeData(this.state.average);
      this.setState({
        mode: this.gameModes.FINAL,
        highScore: this.state.average
      });
    } else {
      this.setState({
        mode: this.gameModes.FINAL
      });
    }
  }

  renderHighScore() {
    if (this.state.highScore != -1)
      return (
        <Text
          style={{
            fontSize: 25,
            color: '#ddd',
            marginLeft: 10,
            marginRight: 10,
            textAlign: 'center',
            fontFamily: Fonts.WorkSans
          }}
        >
          {this.state.average == this.state.highScore ? 'Yeni ' : ''}Rekorun:{' '}
          {this.state.highScore}
        </Text>
      );
  }

  componentDidMount() {
    this._mounted = true;
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
    this._mounted = false;
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
    AdMobInterstitial.removeAllListeners();
  }
  handleBackPress = () => {
    this.props.navigation.pop();
    return true;
  };

  startWaiting() {
    this.setState({ mode: this.gameModes.WAIT }, () => {
      Animated.timing(this.countDown, {
        toValue: 10,
        duration: Math.random() * 5000 + 1500
      }).start(() => {
        if (this._mounted)
          this.setState(
            { mode: this.gameModes.READY },
            () => (this.firstTime = new Date())
          );
      });
    });
  }

  renderButton() {
    return (
      <TouchableOpacity
        style={{
          borderRadius: this.screenWidth,
          backgroundColor: '#ddd',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 5
        }}
        activeOpacity={0.7}
        onPress={() => {
          switch (this.state.mode) {
            case this.gameModes.BEGIN:
              this.startWaiting();
              break;
            case this.gameModes.WAIT:
              Animated.timing(this.countDown).stop();
              this.setState({ mode: this.gameModes.AGAIN });
              break;
            case this.gameModes.AGAIN:
              this.startWaiting();
              break;
            case this.gameModes.READY:
              lastTime = new Date();
              this.tries.push(lastTime.getTime() - this.firstTime.getTime());
              avg = 0;
              this.tries.forEach(element => {
                avg += element;
              });
              avg /= this.tries.length;
              this.setState({ average: avg.toFixed(0) }, () => {
                if (this.tries.length == 3) this.finishGame();
                else this.startWaiting();
              });

              break;
            case this.gameModes.FINAL:
              this.tries = [];
              this.setState({ average: 0, mode: this.gameModes.BEGIN });
              break;
          }
        }}
      >
        <View
          style={{
            width: this.screenWidth - 25,
            height: this.screenWidth - 25,
            borderRadius: this.screenWidth,
            backgroundColor: this.buttonColor[this.state.mode],
            alignItems: 'center',
            justifyContent: 'center',
            padding: 7
          }}
        >
          <Text
            style={[
              styles.text,
              { textAlign: 'center', color: '#ddd', fontSize: 35 }
            ]}
          >
            {this.state.mode != this.gameModes.FINAL
              ? this.buttonText[this.state.mode]
              : 'Skor: ' + this.state.average.toString() + ' ms'}
          </Text>
          {this.state.mode == this.gameModes.FINAL ||
          this.state.mode == this.gameModes.BEGIN ? (
            this.renderHighScore()
          ) : (
            <View />
          )}
          {this.state.mode == this.gameModes.FINAL ? (
            <Image
              style={{ width: 60, height: 60, marginTop: 40 }}
              source={require('../../assets/Icons/reload.png')}
              tintColor="#ddd"
            />
          ) : (
            <View />
          )}
        </View>
      </TouchableOpacity>
    );
  }

  renderTexts() {
    if (
      this.state.mode != this.gameModes.BEGIN &&
      this.state.mode != this.gameModes.FINAL
    )
      return (
        <View
          style={{
            paddingTop: 15,
            height: 100,
            backgroundColor: '#444',
            borderRadius: 15,
            padding: 10,
            marginTop: 15,
            marginBottom: 40
          }}
        >
          <Text style={[styles.text, { color: '#ddd', textAlign: 'center' }]}>
            Ortalama: {this.state.average} ms
          </Text>
          <Text
            style={[
              styles.text,
              { color: '#ddd', marginTop: 10, textAlign: 'center' }
            ]}
          >
            Deneme {this.tries.length + 1}/3
          </Text>
        </View>
      );
    else return <View style={{ height: 100 }} />;
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
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'row',
            backgroundColor: this.buttonColor[this.state.mode]
          }}
        >
          <TouchableOpacity
            style={{
              width: 60,
              height: 60,
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onPress={() => this.props.navigation.pop()}
          >
            <Image
              style={{ width: 50, height: 35 }}
              source={require('../../assets/Icons/back.png')}
              tintColor="#ddd"
            />
          </TouchableOpacity>
          <Text
            style={{
              fontSize: this.screenWidth * 0.08,
              fontFamily: Fonts.WorkSans,
              textAlignVertical: 'center',
              textAlign: 'center',
              color: '#ddd',
              flex: 1
            }}
          >
            Refleks
          </Text>
          <View
            style={{
              width: 60,
              height: 60
            }}
          />
        </View>
        <View style={{ height: 50 }} />
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {this.renderButton()}
          {this.renderTexts()}
        </View>
        <View style={{ height: 50 }} />
        <View style={{ position: 'absolute', bottom: 0 }}>
          <AdMobBanner
            adSize="smartBannerPortrait"
            adUnitID="ca-app-pub-8980970186700232/7622839967"
          />
        </View>
      </ImageBackground>
    );
  }
}

const styles = StyleSheet.create({
  text: {
    fontSize: 25,
    fontFamily: Fonts.WorkSans
  }
});

export { reflexGame };
