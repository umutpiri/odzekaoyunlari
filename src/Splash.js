import React, { Component } from "react";
import { View, ActivityIndicator, Image } from "react-native";
import firebase from "firebase";
import { GoogleSignin, GoogleSigninButton } from "react-native-google-signin";

export default class Splash extends Component {
  state = {
    isSplash: true,
    isLoginLoading: false,
  };

  componentWillMount() {
    if (!firebase.apps.length) {
      firebase.initializeApp("");
    }
    GoogleSignin.configure("");

    GoogleSignin.signInSilently()
      .then((data) => {
        const credential = firebase.auth.GoogleAuthProvider.credential(
          data.idToken,
          data.accessToken
        );
        firebase
          .auth()
          .signInAndRetrieveDataWithCredential(credential)
          .then((data) => {
            firebase
              .database()
              .ref(`/users/${data.user.uid}`)
              .once("value", (snapshot) => {
                if (!snapshot.hasChild("coin")) {
                  firebase
                    .database()
                    .ref(`/users/${data.user.uid}/`)
                    .set({
                      name: data.user.displayName,
                      email: data.user.email,
                      question: 0,
                      coin: 0,
                      lastHint: 0,
                      answers: "",
                      refNum: 0,
                      reference: "none",
                    })
                    .then(() => {
                      this.props.navigation.navigate("MainMenu");
                    })
                    .catch((error) => this.setState({ isSplash: false }));
                } else {
                  this.props.navigation.navigate("MainMenu");
                }
              })
              .catch((error) => this.setState({ isSplash: false }));
          })
          .catch((error) => this.setState({ isSplash: false }));
      })
      .catch((error) => this.setState({ isSplash: false }));
  }

  _signIn = async () => {
    GoogleSignin.signIn()
      .then((data) => {
        this.setState({ isLoginLoading: true });
        const credential = firebase.auth.GoogleAuthProvider.credential(
          data.idToken,
          data.accessToken
        );
        firebase
          .auth()
          .signInAndRetrieveDataWithCredential(credential)
          .then((data) => {
            firebase
              .database()
              .ref(`/users/${data.user.uid}`)
              .once("value", (snapshot) => {
                if (!snapshot.hasChild("coin")) {
                  firebase
                    .database()
                    .ref(`/users/${data.user.uid}/`)
                    .set({
                      name: data.user.displayName,
                      email: data.user.email,
                      question: 0,
                      coin: 0,
                      lastHint: 0,
                      answers: "",
                      refNum: 0,
                      reference: "none",
                    })
                    .then(() => this.props.navigation.navigate("MainMenu"))
                    .catch((err) => this.setState({ isLoginLoading: false }));
                } else {
                  this.props.navigation.navigate("MainMenu");
                }
              })
              .catch((err) => this.setState({ isLoginLoading: false }));
          })
          .catch((error) => this.setState({ isLoginLoading: false }));
      })
      .catch((error) => this.setState({ isLoginLoading: false }));
  };

  renderAll() {
    if (this.state.isSplash) {
      return (
        <View
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
          }}
        >
          <ActivityIndicator
            style={{
              position: "absolute",
              bottom: 0,
              right: 0,
            }}
            size={30}
            color="#f28957"
          />
        </View>
      );
    } else {
      if (this.state.isLoginLoading) {
        return (
          <ActivityIndicator
            style={{
              position: "absolute",
              bottom: 0,
              right: 0,
            }}
            size={30}
            color="#f28957"
          />
        );
      } else {
        return (
          <View
            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
          >
            <GoogleSigninButton
              style={{ width: 265, height: 48 }}
              size={GoogleSigninButton.Size.Wide}
              color={GoogleSigninButton.Color.Dark}
              onPress={this._signIn}
            />
          </View>
        );
      }
    }
  }

  render() {
    return (
      <View
        style={{ flex: 1, backgroundColor: "#0f0704", alignItems: "center" }}
      >
        <Image
          style={{
            width: "100%",
            height: "70%",
          }}
          resizeMode="stretch"
          source={require("../assets/Icons/bg1.jpg")}
        />
        {this.renderAll()}
      </View>
    );
  }
}
