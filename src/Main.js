import React, { Component } from "react";
import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
  ActivityIndicator,
  Image,
  ImageBackground,
  Dimensions,
  Keyboard,
  Alert,
  Linking,
  FlatList,
  Animated,
  Easing,
  BackHandler,
} from "react-native";
import ViewShot from "react-native-view-shot";
import DialogManager, {
  DialogContent,
  DialogComponent,
} from "react-native-dialog-component";
import { AdMobRewarded, AdMobInterstitial } from "react-native-admob";
import firebase from "firebase";
import { AppEventsLogger } from "react-native-fbsdk";
import { Buffer } from "buffer";
import LinearGradient from "react-native-linear-gradient";
import { Card, CardSection } from "./components";
import Share from "react-native-share";
import InAppBilling from "react-native-billing";
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from "react-native-popup-menu";
import { ThreeDots } from "./components";
import { Fonts } from "./Fonts";

export default class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      firebaseDB: {},
      nexts: [],
      numara: 0,
      _cevap: "",
      coinValue: 0,
      isLoading2: true,
      hintNumber: 0,
      isWrong: false,
      referenceInput: "",
      isWrongReference: false,
      isRefLoading: false,
      referenceNumber: -1,
      didReference: true,
      currentUser: {},
      isShareLoading: false,
      isHintLoading: false,
      adPosition: new Animated.Value(-100),
      isAdDown: false,
      levelID: "",
      isWin: false,
      purchases: "",
    };
  }

  componentWillMount() {
    this.loadParams().then(() => {
      try {
        this.setState({ isLoading2: true });
        AppEventsLogger.logEvent("Giris");
      } catch (error) {
        console.log(error);
      }
      this.setState({ currentUser: firebase.auth().currentUser }, () => {
        firebase
          .database()
          .ref(`/users/${this.state.currentUser.uid}`)
          .once("value", (snapshot) => {
            this.setState({
              coinValue: snapshot.val().coin,
              referenceNumber: snapshot.val().refNum,
              didReference: snapshot.val().reference == "none" ? false : true,
            });
            if (snapshot.val().purchases != null) {
              this.setState({ purchases: snapshot.val().purchases });
            }
          });
        firebase
          .database()
          .ref(`/users/${this.state.currentUser.uid}/${this.state.levelID}`)
          .once("value", (snapshot) => {
            if (snapshot.hasChild("quest")) {
              this.setState({
                numara: snapshot.val().quest,
                hintNumber: snapshot.val().hint,
              });
            } else {
              firebase
                .database()
                .ref(
                  `/users/${this.state.currentUser.uid}/${this.state.levelID}`
                )
                .set({ quest: 0, hint: 0 });
              this.setState({ numara: 0, hintNumber: 0 });
            }
          })
          .then(() => {
            firebase
              .database()
              .ref(`competitions/${this.state.levelID}/next`)
              .once("value", (snapshot) => {
                this.setState({ nexts: snapshot.val() });
              });
            this._loadLevel();
            const userEmail = new Buffer(this.state.currentUser.email).toString(
              "Base64"
            );
            firebase
              .database()
              .ref(`/references/${userEmail}`)
              .once("value", (snapshot) => {
                if (!snapshot.hasChild("refNum")) {
                  firebase
                    .database()
                    .ref(`/references/${userEmail}/`)
                    .set({ refNum: 0 });
                } else {
                  if (this.state.referenceNumber != -1) {
                    var onlineRefs = snapshot.val().refNum;
                    if (onlineRefs > this.state.referenceNumber) {
                      var newCoinValue =
                        this.state.coinValue +
                        (onlineRefs - this.state.referenceNumber) * 10;
                      firebase
                        .database()
                        .ref(`/users/${this.state.currentUser.uid}`)
                        .update({
                          refNum: onlineRefs,
                          coin: newCoinValue,
                        })
                        .then(() => {
                          this.setState({
                            coinValue: newCoinValue,
                          });
                          this.setState({ referenceNumber: onlineRefs });
                        });
                    }
                  }
                }
              })
              .catch((error) => console.log(error));
          });
      });
      try {
        this.shotRef = React.createRef();
      } catch (error) {
        console.log(error);
      }
    });
  }

  async loadParams() {
    var levelID;
    try {
      levelID = await this.props.navigation.getParam("levelID", "default");
      if (levelID != null && levelID != "default") this.setState({ levelID });
      else {
        await firebase
          .database()
          .ref(`competitions/names`)
          .once("value", (snapshot) => {
            this.setState({ levelID: snapshot.val()[0] });
          });
      }
    } catch (error) {
      await firebase
        .database()
        .ref(`competitions/names`)
        .once("value", (snapshot) => {
          this.setState({ levelID: snapshot.val()[0] });
        });
    }
  }

  _loadLevel = () => {
    this.setState({ isLoading2: true });
    firebase
      .database()
      .ref(`competitions/${this.state.levelID}/list/${this.state.numara}`)
      .once("value", (snapshot) => {
        if (snapshot.val().soru.substr(0, 9) == "TEBRİKLER")
          this.setState({ isWin: true });
        this.setState({ firebaseDB: snapshot.val() });
        this.setState({ isLoading2: false });
      });
  };

  componentDidMount() {
    BackHandler.addEventListener("hardwareBackPress", this.handleBackPress);
    AdMobRewarded.setAdUnitID("");
    AdMobInterstitial.setAdUnitID("");

    AdMobInterstitial.addEventListener("adClosed", () => {
      console.log("AdModInterstitial => adClosed");
      AdMobInterstitial.requestAd().catch((error) => console.warn(error));
    });

    AdMobRewarded.addEventListener("rewarded", (reward) => {
      console.log("AdMobRewarded => rewarded", reward);
      let newCValue = this.state.coinValue + 3;
      this.setState({ coinValue: newCValue });
      firebase.database().ref(`/users/${this.state.currentUser.uid}/`).update({
        coin: newCValue,
      });
    });
    AdMobRewarded.addEventListener("adLoaded", () => {
      console.log("ad loaded");
      this.adAnimateDown();
    });
    AdMobRewarded.addEventListener("adOpened", () => {
      console.log("AdMobRewarded => adOpened");
      this.adAnimateUp();
    });
    AdMobRewarded.addEventListener("adClosed", () => {
      console.log("AdMobRewarded => adClosed");
      AdMobRewarded.requestAd().catch((error) => console.warn(error));
    });
    AdMobInterstitial.requestAd()
      .then((result) => console.log(result))
      .catch((error) => console.log(error));

    AdMobRewarded.requestAd()
      .then((result) => console.log(result))
      .catch((error) => console.log(error));

    try {
      AdMobRewarded.isReady((result) => {
        if (result) this.adAnimateDown();
      });
    } catch (error) {
      console.log(error);
    }
  }

  handleBackPress = () => {
    if (this.menuComponent.props.ctx.menuActions.isMenuOpen()) {
      this.menuComponent.props.ctx.menuActions.closeMenu();
      return true;
    }
    this.props.navigation.push("MainMenu");
    return true;
  };

  showRewarded() {
    AdMobRewarded.showAd().catch((error) => console.warn(error));
  }

  adAnimateDown() {
    if (!this.state.isAdDown)
      Animated.timing(this.state.adPosition, {
        delay: 5000,
        toValue: -40,
        duration: 600,
        easing: Easing.linear,
      }).start();
    this.setState({ isAdDown: true });
  }

  adAnimateUp() {
    Animated.timing(this.state.adPosition, {
      toValue: -100,
      duration: 0,
    }).start();
    this.setState({ isAdDown: false });
  }

  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackPress);
    AdMobRewarded.removeAllListeners();
    AdMobInterstitial.removeAllListeners();
  }

  share = () => {
    this.setState({ isShareLoading: true });
    this.refs.viewShot.capture().then((uri) => {
      const shareOptions = {
        title: "Birlikte paylaş",
        message:
          "https://play.google.com/store/apps/details?id=com.odzekaoyunlari",
        url: "data:image/png;base64," + uri,
      };
      Share.open(shareOptions)
        .then(() => this.setState({ isShareLoading: false }))
        .catch(() => this.setState({ isShareLoading: false }));
    });
  };

  signOut() {
    this.menuComponent.props.ctx.menuActions.closeMenu();
    this.props.navigation.push("MainMenu");
  }

  showStarPopup() {
    firebase
      .database()
      .ref(`/users/${this.state.currentUser.uid}/like`)
      .once("value", (snapshot) => {
        if (snapshot.val() == null) {
          DialogManager.show({
            width: 0.9,
            dialogStyle: { borderRadius: 10 },
            children: (
              <DialogContent>
                <View
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text style={[styles.textStyle, { textAlign: "center" }]}>
                    Görüşleriniz bizim için önemli. Uygulamayı beğendiniz mi?
                  </Text>
                  <Text
                    style={[
                      styles.textStyle,
                      { fontSize: 30, marginBottom: 15 },
                    ]}
                  >
                    ★★★★★
                  </Text>
                </View>
                <View style={{ flexDirection: "row" }}>
                  <TouchableOpacity
                    style={{ flex: 1, justifyContent: "center" }}
                    onPress={() => {
                      DialogManager.dismissAll();
                      firebase
                        .database()
                        .ref(`/users/${this.state.currentUser.uid}/like`)
                        .set(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.textStyle,
                        { color: "gray", textAlign: "center" },
                      ]}
                    >
                      Hayır
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ flex: 1, justifyContent: "center" }}
                    onPress={() => {
                      firebase
                        .database()
                        .ref(`/users/${this.state.currentUser.uid}/like`)
                        .set(true);
                      Linking.openURL(
                        "https://play.google.com/store/apps/details?id=com.odzekaoyunlari"
                      );
                      DialogManager.dismissAll();
                    }}
                  >
                    <Text
                      style={[
                        styles.textStyle,
                        { color: "green", textAlign: "center" },
                      ]}
                    >
                      Evet
                    </Text>
                  </TouchableOpacity>
                </View>
              </DialogContent>
            ),
          });
        } else if (snapshot.val() == false) {
          console.log("falseyim");
        } else if (snapshot.val() == true) {
          console.log("trueyim");
        }
      });
  }

  nextQuestion = async (minusCoin) => {
    firebase
      .database()
      .ref(`/users/${this.state.currentUser.uid}/`)
      .update({
        coin: this.state.coinValue + this.state.firebaseDB.prize + minusCoin,
      });
    firebase
      .database()
      .ref(`/users/${this.state.currentUser.uid}/${this.state.levelID}`)
      .update({
        quest: this.state.numara + 1,
        hint: 0,
      });
    this.setState(
      {
        numara: 1 + this.state.numara,
        _cevap: "",
        coinValue:
          this.state.coinValue + this.state.firebaseDB.prize + minusCoin,
        hintNumber: 0,
        isWrong: false,
      },
      () => {
        if ((this.state.numara + 1) % 3 == 0)
          AdMobInterstitial.showAd().catch((error) => console.warn(error));
        this._loadLevel();
        if (this.state.numara == 6) {
          this.showStarPopup();
        }
        var parts = this.state.currentUser.displayName.split(" ");
        parts.forEach((element, index) => {
          parts[index] = element.charAt(0) + "*".repeat(element.length - 1);
        });
        var date = new Date();
        var dateScore =
          (99 - this.state.numara).toString() +
          (date.getTime() / 100).toFixed(0).toString();

        firebase
          .database()
          .ref(
            `competitions/${this.state.levelID}/leaderboard/${this.state.currentUser.uid}/`
          )
          .set({
            score: this.state.numara + 1,
            name: parts.join(" "),
            dateScore: dateScore,
          });
      }
    );
  };

  checkAnswer = async () => {
    if (
      compareStrings(
        this.state._cevap,
        new Buffer(
          String(this.state.firebaseDB.cevap).substr(3),
          "base64"
        ).toString()
      )
    ) {
      this.nextQuestion(0);
      this.refs.textinput.blur();
    } else {
      this.setState({ _cevap: "", isWrong: true });
    }
  };

  openRefDialog() {
    Keyboard.dismiss();
    if (this.state.didReference) {
      DialogManager.show({
        title: "Referans",
        titleAlign: "center",
        titleTextStyle: {
          fontSize: 25,
          fontWeight: "bold",
          color: "#000",
          paddingTop: 8,
        },
        width: 0.9,
        dialogStyle: { borderRadius: 10 },
        children: (
          <DialogContent>
            <View>
              <Text style={styles.dialogText}>
                Şimdiye kadar {this.state.referenceNumber} kullanıcıya referans
                oldun ve {this.state.referenceNumber * 10} coin kazandın.
              </Text>
              <Text style={styles.dialogText}>
                Referans adresin:
                {"\n"}
                {this.state.currentUser.email}
              </Text>
              <View style={{ alignItems: "center", justifyContent: "center" }}>
                <TouchableOpacity
                  style={{
                    backgroundColor: "#333",
                    borderRadius: 10,
                    marginTop: 10,
                  }}
                  onPress={() => DialogManager.dismissAll()}
                >
                  <Text style={{ fontSize: 20, color: "#fff", margin: 8 }}>
                    Kapat
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </DialogContent>
        ),
      });
    } else {
      this.dialogComponent.show();
    }
  }

  checkReference() {
    this.setState({ isRefLoading: true });
    if (
      this.state.referenceInput == "" ||
      this.state.referenceInput == this.state.currentUser.email
    ) {
      this.setState({
        isWrongReference: true,
        isRefLoading: false,
        referenceInput: "",
      });
    } else {
      const refEmail = new Buffer(this.state.referenceInput).toString("Base64");
      firebase
        .database()
        .ref(`/references/${refEmail}`)
        .once("value", (snapshot) => {
          if (!snapshot.hasChild("refNum")) {
            //Error reference: email doesnt exist
            this.setState({
              referenceInput: "",
              isWrongReference: true,
              isRefLoading: false,
            });
          } else {
            //True reference
            var oldRefNum = snapshot.val().refNum;
            firebase
              .database()
              .ref(`references/${refEmail}`)
              .update({
                refNum: oldRefNum + 1,
              })
              .then(() => {
                firebase
                  .database()
                  .ref(`users/${this.state.currentUser.uid}`)
                  .update({ reference: this.state.referenceInput });
                this.dialogComponent.dismiss();
                this.setState({
                  isRefLoading: false,
                  didReference: true,
                });
              });
          }
        });
    }
  }

  async buyProduct(item) {
    await InAppBilling.open();
    try {
      await InAppBilling.consumePurchase(item.productId);
    } catch (error) {
      console.log(error);
    }
    await InAppBilling.purchase(item.productId)
      .then((purchase) => {
        Alert.alert("Satın alma başarılı!");
        var newPurchases =
          this.state.purchases +
          "+??" +
          item.description +
          "-" +
          this.state.levelID +
          (this.state.numara + 1).toString() +
          "??";
        var newCoins = this.state.coinValue + parseInt(item.description, 10);
        firebase
          .database()
          .ref(`/users/${this.state.currentUser.uid}/`)
          .update({ coin: newCoins, purchases: newPurchases });
        this.setState({ coinValue: newCoins, purchases: newPurchases });
      })
      .catch((err) => {
        Alert.alert(err.message);
      });
    await InAppBilling.close();
  }

  async openMarket() {
    Keyboard.dismiss();
    try {
      await InAppBilling.open();
      InAppBilling.getProductDetailsArray([
        "coin.50",
        "coin.100",
        "coin.200",
        "coin.500",
        "coin.1000",
      ])
        .then((products) => {
          DialogManager.show({
            title: "Market",
            titleAlign: "center",
            titleTextStyle: {
              fontSize: 25,
              fontWeight: "bold",
              color: "#000",
              paddingTop: 8,
              fontFamily: Fonts.WorkSans,
            },
            dialogStyle: { borderRadius: 10 },
            width: 0.9,
            children: (
              <DialogContent>
                <FlatList
                  data={products.sort((a, b) => {
                    return (
                      parseInt(a.description, 10) - parseInt(b.description, 10)
                    );
                  })}
                  contentContainerStyle={{ paddingBottom: 0 }}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({ item }) => (
                    <CardSection>
                      <View
                        style={{
                          flexDirection: "row",
                          flex: 5,
                          alignItems: "center",
                          alignSelf: "center",
                        }}
                      >
                        <Image
                          style={{
                            width: 23,
                            height: 23,
                            margin: 8,
                            marginLeft: 5,
                            marginRight: 5,
                          }}
                          source={require("../assets/coin.png")}
                        />
                        <Text
                          style={[
                            styles.textStyle,
                            {
                              fontSize: 25,
                            },
                          ]}
                        >
                          {item.description}
                        </Text>
                      </View>
                      <View
                        style={{
                          flexDirection: "column",
                          flex: 3,
                        }}
                      >
                        <TouchableOpacity
                          style={{
                            marginRight: 5,
                            backgroundColor: "#11a922",
                            borderRadius: 10,
                          }}
                          onPress={() => this.buyProduct(item)}
                        >
                          <Text
                            style={[
                              styles.textStyle,
                              {
                                textAlign: "center",
                                color: "red",
                                fontSize: 16,
                                textDecorationLine: "line-through",
                                textDecorationStyle: "solid",
                                marginBottom: -5,
                              },
                            ]}
                          >
                            {item.priceText.charAt(0)}
                            {((item.priceValue * 10) / 7.0)
                              .toFixed(2)
                              .replace(".", ",")}
                          </Text>
                          <Text
                            style={[
                              styles.textStyle,
                              {
                                textAlign: "center",
                                color: "white",
                                fontSize: 22,
                              },
                            ]}
                          >
                            {item.priceText}
                          </Text>
                        </TouchableOpacity>
                      </View>
                      <Text
                        style={{
                          color: "#ff0",
                          backgroundColor: "#d11",
                          borderRadius: 8,
                          paddingLeft: 2,
                          paddingRight: 2,
                          position: "absolute",
                          top: 5,
                          right: 2.5,
                          transform: [{ rotate: "30deg" }],
                        }}
                      >
                        -%30
                      </Text>
                    </CardSection>
                  )}
                />
                <View
                  style={{ alignItems: "center", justifyContent: "center" }}
                >
                  <TouchableOpacity
                    style={{
                      backgroundColor: "#333",
                      borderRadius: 10,
                      marginTop: 10,
                    }}
                    onPress={() => DialogManager.dismissAll()}
                  >
                    <Text
                      style={{
                        fontSize: 20,
                        color: "#fff",
                        margin: 8,
                        fontFamily: Fonts.WorkSans,
                      }}
                    >
                      Kapat
                    </Text>
                  </TouchableOpacity>
                </View>
              </DialogContent>
            ),
          });
        })
        .catch((err) => console.log(error));
    } catch (error) {
      console.log(error);
    } finally {
      this.setState({ isShareLoading: false });
      await InAppBilling.close();
    }
  }

  contact() {
    Linking.openURL("https://www.instagram.com/od_zekaoyunlari");
  }

  buyHint() {
    this.setState({ isHintLoading: true });
    var hintPrice = this.state.firebaseDB.prices[this.state.hintNumber];
    if (this.state.coinValue >= hintPrice) {
      firebase
        .database()
        .ref(`/users/${this.state.currentUser.uid}/${this.state.levelID}`)
        .update({ hint: this.state.hintNumber + 1 });
      firebase
        .database()
        .ref(`/users/${this.state.currentUser.uid}/`)
        .update({
          coin: this.state.coinValue - hintPrice,
        })
        .then(() => {
          this.setState({
            hintNumber: this.state.hintNumber + 1,
            coinValue: this.state.coinValue - hintPrice,
          });
          this.setState({ isHintLoading: false });
        })
        .catch(() => this.setState({ isHintLoading: false }));
    } else {
      this.setState({ isShareLoading: true });
      this.openMarket();
      this.setState({ isHintLoading: false });
    }
  }

  renderNext() {
    if (this.state.nexts[this.state.numara + 1])
      return (
        <Card>
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              paddingBottom: 5,
              paddingTop: 5,
            }}
          >
            <TouchableOpacity
              onPress={() => {
                if (
                  this.state.coinValue >=
                  this.state.nexts[this.state.numara + 1]
                ) {
                  Alert.alert(
                    "",
                    this.state.nexts[this.state.numara + 1].toString() +
                      " coin karşılığında soruyu pas geçmek istediğine emin misin?",
                    [
                      {
                        text: "Evet",
                        onPress: () => {
                          this.nextQuestion(
                            -this.state.nexts[this.state.numara + 1]
                          );
                        },
                      },
                      {
                        text: "Hayır",
                        onPress: () => {},
                        style: "cancel",
                      },
                    ]
                  );
                } else {
                  this.setState({ isShareLoading: true });
                  this.openMarket();
                  this.setState({ isHintLoading: false });
                }
              }}
            >
              <LinearGradient
                colors={[
                  "#191919",
                  "#292929",
                  "#333333",
                  "#494444",
                  "#55555f",
                  "#666f66",
                  "#77777f",
                  "#8f8f8f",
                ]}
                style={{
                  backgroundColor: "#1929a0",
                  borderRadius: 5,
                  alignItems: "center",
                  justifyContent: "center",
                  paddingLeft: 5,
                  paddingRight: 5,
                  flexDirection: "row",
                }}
              >
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "400",
                    fontFamily: Fonts.WorkSans,
                    marginRight: 52,
                    color:
                      this.state.coinValue >=
                      this.state.nexts[this.state.numara + 1]
                        ? "#00cc50"
                        : "#dc0000",
                    paddingLeft: 3,
                  }}
                >
                  PAS
                </Text>
                <Text
                  style={{
                    fontSize: 20,
                    fontFamily: Fonts.WorkSans,
                    fontWeight: "400",
                    color:
                      this.state.coinValue >=
                      this.state.nexts[this.state.numara + 1]
                        ? "#00cc50"
                        : "#dc0000",
                  }}
                >
                  {this.state.nexts[this.state.numara + 1]}
                </Text>
                <Image
                  style={{
                    width: 19,
                    height: 19,
                    marginLeft: 5,
                    marginBottom: 11,
                    marginTop: 11,
                  }}
                  source={require("../assets/coin.png")}
                />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Card>
      );
  }

  renderHint() {
    const ary = this.state.firebaseDB.ipucu;
    let temp = "";
    for (i = 0; i < this.state.hintNumber; i++) {
      if (i != 0) temp += "\n";
      temp += Buffer(String(ary[i]).substr(3), "base64").toString();
    }
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingBottom: 5,
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontWeight: "bold",
            textAlign: "center",
            fontFamily: Fonts.WorkSans,
          }}
        >
          {temp}
        </Text>
        {this.renderHintButton()}
      </View>
    );
  }

  renderHintButton() {
    if (this.state.hintNumber < this.state.firebaseDB.ipucu.length) {
      var hintPrice = this.state.firebaseDB.prices[this.state.hintNumber];
      if (this.state.isHintLoading) {
        return <ActivityIndicator size={25} />;
      } else {
        return (
          <TouchableOpacity onPress={() => this.buyHint()}>
            <LinearGradient
              activeOpacity={0.7}
              colors={[
                "#191919",
                "#292929",
                "#333333",
                "#494444",
                "#55555f",
                "#666f66",
                "#77777f",
                "#8f8f8f",
              ]}
              style={{
                borderRadius: 5,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  color:
                    this.state.coinValue >= hintPrice ? "#00cc50" : "#dc0000",
                  paddingLeft: 10,
                  paddingRight: 40,
                  marginTop: 8,
                  marginBottom: 8,
                  fontFamily: Fonts.WorkSans,
                }}
              >
                İpucu al
              </Text>
              <View
                style={{
                  alignItems: "center",
                  flexDirection: "row",
                }}
              >
                <Text
                  style={{
                    fontSize: 18,
                    fontFamily: Fonts.WorkSans,
                    fontWeight: "bold",
                    textAlignVertical: "center",
                    marginTop: 8,
                    marginBottom: 8,
                    color:
                      this.state.coinValue >= hintPrice ? "#00cc50" : "#dc0000",
                  }}
                >
                  {hintPrice}
                </Text>
                <Image
                  style={{
                    width: 19,
                    height: 19,
                    marginLeft: 5,
                    marginRight: 5,
                  }}
                  source={require("../assets/coin.png")}
                />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        );
      }
    } else return <View />;
  }

  renderFab() {
    if (!this.state.isWin && !this.state.isLoading2) {
      return (
        <TouchableOpacity
          style={{
            width: 60,
            height: 60,
            borderRadius: 70,
            justifyContent: "center",
            alignItems: "center",
            position: "absolute",
            bottom: 42,
            right: 20,
          }}
          activeOpacity={0.5}
          onPress={() => {
            this.share();
          }}
        >
          <LinearGradient
            colors={["#1929a0", "#1959c0", "#19a9f0"]}
            style={{
              width: 60,
              height: 60,
              borderRadius: 70,
              justifyContent: "center",
              alignItems: "center",
              position: "absolute",
            }}
          >
            <Image
              source={require("../assets/Icons/share.png")}
              tintColor="#ddd"
              style={{ width: 28, height: 28 }}
            />
          </LinearGradient>
        </TouchableOpacity>
      );
    }
  }

  renderCards() {
    if (this.state.isWin) {
      return (
        <View style={{ flex: 1 }}>
          <Text
            style={{
              alignItems: "center",
              justifyContent: "center",
              alignSelf: "center",
              color: "#555",
              opacity: 0.3,
              marginBottom: -5,
              fontFamily: Fonts.WorkSans,
            }}
          >
            {this.state.currentUser.email}
          </Text>
          <Card>
            <CardSection>{this.renderQuestion()}</CardSection>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-start",
              }}
            >
              <Image
                style={{
                  width: 25,
                  height: 25,
                  marginTop: 5,
                  marginLeft: 5,
                  marginBottom: 5,
                }}
                source={require("../android/app/src/main/res/mipmap-mdpi/ic_launcher.png")}
              />
              <Text
                style={{
                  color: "#000",
                  textAlignVertical: "center",
                  margin: 5,
                  fontSize: 12,
                  fontFamily: Fonts.WorkSans,
                }}
              >
                OD - Zeka Oyunları
              </Text>
            </View>
          </Card>
        </View>
      );
    } else {
      return (
        <ScrollView
          style={styles.container}
          keyboardShouldPersistTaps={"handled"}
        >
          <Text
            style={{
              alignItems: "center",
              justifyContent: "center",
              alignSelf: "center",
              color: "#555",
              opacity: 0.3,
              marginBottom: -5,
              fontFamily: Fonts.WorkSans,
            }}
          >
            {this.state.currentUser.email}
          </Text>
          <ViewShot
            options={{ format: "png", quality: 0.5, result: "base64" }}
            ref={"viewShot"}
          >
            <Card>
              <CardSection>
                <Text
                  style={{
                    fontSize: 25,
                    fontWeight: "bold",
                    textAlign: "center",
                    flex: 1,
                    color: "#000",
                    fontFamily: Fonts.WorkSans,
                  }}
                >
                  {this.state.numara + 1}
                </Text>
              </CardSection>
              <CardSection>{this.renderQuestion()}</CardSection>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "flex-start",
                }}
              >
                <Image
                  style={{
                    width: 25,
                    height: 25,
                    marginTop: 5,
                    marginLeft: 5,
                    marginBottom: 5,
                  }}
                  source={require("../android/app/src/main/res/mipmap-mdpi/ic_launcher.png")}
                />
                <Text
                  style={{
                    color: "#000",
                    textAlignVertical: "center",
                    margin: 5,
                    fontSize: 12,
                    fontFamily: Fonts.WorkSans,
                  }}
                >
                  OD - Zeka Oyunları
                </Text>
              </View>
            </Card>
          </ViewShot>
          <Card>
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "stretch",
              }}
            >
              <TextInput
                style={[
                  styles.textInput,
                  {
                    borderColor: this.state.isWrong ? "red" : "gray",
                    fontSize: this.state.isWrong ? 12 : 20,
                  },
                ]}
                placeholder={this.state.isWrong ? "Yanlış! " : "...."}
                placeholderTextColor={this.state.isWrong ? "red" : "gray"}
                value={this.state._cevap}
                onChangeText={(text) =>
                  this.setState({ _cevap: text, isWrong: false })
                }
                onSubmitEditing={() => this.checkAnswer()}
                underlineColorAndroid="rgba(0,0,0,0)"
                textAlignVertival="bottom"
                returnKeyType="done"
                autoCorrect={false}
                blurOnSubmit={false}
                multiline={false}
                ref={"textinput"}
              />
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => this.checkAnswer()}
              >
                <LinearGradient
                  colors={["#1929a0", "#1959c0", "#19a9f0"]}
                  style={styles.button}
                >
                  <Image
                    tintColor={"#ddd"}
                    source={require("../assets/Icons/checked.png")}
                  />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Card>
          <Card>{this.renderHint()}</Card>
          {this.renderNext()}
        </ScrollView>
      );
    }
  }

  renderQuestion() {
    if (
      this.state.firebaseDB.soru.length > 4 &&
      this.state.firebaseDB.soru.substr(0, 4) == "http"
    ) {
      return (
        <Image
          style={{ width: "100%", height: 220 }}
          source={{ uri: this.state.firebaseDB.soru }}
          resizeMode="stretch"
        />
      );
    } else {
      return (
        <View style={{ flex: 1 }}>
          <Text style={styles.welcome}>{this.state.firebaseDB.soru}</Text>
        </View>
      );
    }
  }

  renderWspinner() {
    if (this.state.isLoading2) {
      return (
        <ActivityIndicator
          style={{
            position: "absolute",
            top: 100,
            left: 0,
            right: 0,
          }}
          size={50}
          color="#f28957"
        />
      );
    } else {
      return this.renderCards();
    }
  }

  render() {
    const { headerText, viewStyle } = styles;
    return (
      <ImageBackground
        style={{
          width: Dimensions.get("window").width,
          height: Dimensions.get("window").height,
        }}
        source={require("../assets/Icons/bg2.jpg")}
        resizeMode={"stretch"}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior="padding"
          keyboardVerticalOffset={24}
          enabled
        >
          <StatusBar translucent={false} />
          <View style={viewStyle}>
            <TouchableOpacity
              style={{ justifyContent: "flex-start" }}
              onPress={() => {
                this.setState({ isShareLoading: true });
                this.openMarket();
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "flex-start",
                  alignItems: "center",
                  marginLeft: 7,
                }}
              >
                <Image
                  style={{ width: 30, height: 30, padding: 5, margin: 5 }}
                  source={require("../assets/coin.png")}
                />
                <Text
                  style={{
                    fontSize: 25,
                    color: "#fff",
                    margin: 5,
                    fontFamily: Fonts.WorkSans,
                  }}
                >
                  {this.state.coinValue}
                </Text>
              </View>
            </TouchableOpacity>
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                justifyContent: "flex-end",
                alignItems: "center",
              }}
            >
              <TouchableOpacity>
                <Menu
                  ref={(menuComponent) => {
                    this.menuComponent = menuComponent;
                  }}
                >
                  <MenuTrigger>
                    <ThreeDots />
                  </MenuTrigger>
                  <MenuOptions>
                    <MenuOption
                      onSelect={() => {
                        if (!this.state.isLoading2) this.openRefDialog();
                      }}
                      style={{ flexDirection: "row" }}
                    >
                      <Image
                        style={styles.imageStyle}
                        source={require("../assets/Icons/reference.png")}
                      />
                      <Text style={headerText}> Referans </Text>
                    </MenuOption>
                    <MenuOption
                      onSelect={() => {
                        if (!this.state.isLoading2)
                          this.props.navigation.navigate("LeaderBoard", {
                            levelID: this.state.levelID,
                          });
                      }}
                      style={{ flexDirection: "row" }}
                    >
                      <Image
                        style={styles.imageStyle}
                        source={require("../assets/Icons/trophy.png")}
                      />
                      <Text style={headerText}>Lider Tablosu</Text>
                    </MenuOption>
                    <MenuOption
                      onSelect={() => {
                        if (!this.state.isLoading2) {
                          this.setState({ isShareLoading: true });
                          this.openMarket();
                        }
                      }}
                      style={{ flexDirection: "row" }}
                    >
                      <Image
                        style={styles.imageStyle}
                        source={require("../assets/Icons/shopping-cart.png")}
                      />
                      <Text style={headerText}> Market </Text>
                    </MenuOption>
                    <MenuOption
                      onSelect={() => this.contact()}
                      style={{ flexDirection: "row" }}
                    >
                      <Image
                        style={styles.imageStyle}
                        source={require("../assets/Icons/contact.png")}
                      />
                      <Text style={headerText}> Topluluk Sayfası </Text>
                    </MenuOption>
                    <MenuOption
                      onSelect={() => this.signOut()}
                      style={{ flexDirection: "row" }}
                    >
                      <Image
                        style={styles.imageStyle}
                        source={require("../assets/Icons/home.png")}
                      />
                      <Text style={headerText}> Ana menü </Text>
                    </MenuOption>
                  </MenuOptions>
                </Menu>
              </TouchableOpacity>
            </View>
          </View>
          <Animated.View
            style={{
              position: "absolute",
              width: 60,
              height: 100,
              top: this.state.adPosition,
              alignItems: "center",
              alignSelf: "center",
            }}
          >
            <TouchableOpacity
              onPress={() => this.showRewarded()}
              style={{
                alignSelf: "center",
                alignItems: "center",
                justifyContent: "flex-end",
                width: 65,
                height: 100,
                borderRadius: 22,
                paddingLeft: 5,
              }}
            >
              <LinearGradient
                colors={["#1929a0", "#1929a0", "#1959c0", "#19a9f0"]}
                style={{
                  alignSelf: "center",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  width: 60,
                  height: 100,
                  borderRadius: 22,
                }}
              >
                <Image
                  style={{
                    width: 36,
                    height: 36,
                    marginBottom: -3,
                  }}
                  tintColor="#ccc"
                  source={require("../assets/video-player.png")}
                />
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 18,
                      paddingRight: 2,
                      color: "#ddd",
                      fontFamily: Fonts.WorkSans,
                    }}
                  >
                    +3
                  </Text>
                  <Image
                    style={{ width: 17, height: 17, paddingLeft: 2 }}
                    source={require("../assets/coin.png")}
                  />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
          {this.renderWspinner()}
          {this.renderFab()}
        </KeyboardAvoidingView>
        <DialogComponent
          ref={(dialogComponent) => {
            this.dialogComponent = dialogComponent;
          }}
          dialogStyle={{ borderRadius: 10 }}
          onDismissed={() => {
            Keyboard.dismiss();
            this.setState({ isWrongReference: false });
          }}
          width={0.9}
          height={0.75}
        >
          <View>
            <TouchableOpacity
              style={{
                position: "absolute",
                top: 0,
                right: 3,
                borderRadius: 50,
                width: 45,
                height: 45,
                alignItems: "center",
                justifyContent: "center",
              }}
              onPress={() => this.dialogComponent.dismiss()}
            >
              <Text
                style={{
                  color: "#666",
                  fontSize: 30,
                  fontWeight: "bold",
                  textAlignVertical: "top",
                  paddingBottom: 3,
                  alignSelf: "center",
                  alignItems: "center",
                  fontFamily: Fonts.WorkSans,
                }}
              >
                ✖
              </Text>
            </TouchableOpacity>
            <Text
              style={{
                fontSize: 25,
                fontWeight: "bold",
                color: "#000",
                alignSelf: "center",
                alignItems: "center",
                paddingTop: 8,
                fontFamily: Fonts.WorkSans,
              }}
            >
              Referans
            </Text>
            <DialogContent>
              <View>
                <Text style={styles.dialogText}>
                  Sana referans olan kullanıcının mail adresini aşağıdaki alana
                  girerek 10 coin kazanmasını sağlayabilirsin.
                </Text>
                <TextInput
                  style={{ fontSize: 18 }}
                  autoCapitalize="none"
                  placeholder={
                    this.state.isWrongReference ? "Hatalı referans" : "..."
                  }
                  placeholderTextColor={
                    this.state.isWrongReference ? "#f10" : "gray"
                  }
                  underlineColorAndroid={
                    this.state.isWrongReference ? "#f10" : "#000"
                  }
                  keyboardType="email-address"
                  returnKeyType="done"
                  onSubmitEditing={() => this.checkReference()}
                  value={this.state.referenceInput}
                  onChangeText={(text) => {
                    this.setState({
                      referenceInput: text,
                      isWrongReference: false,
                    });
                  }}
                />
                <View
                  style={{ alignItems: "center", justifyContent: "center" }}
                >
                  {this.state.isRefLoading ? (
                    <ActivityIndicator
                      style={{ margin: 10 }}
                      size={36}
                      color="#555"
                    />
                  ) : (
                    <TouchableOpacity
                      style={{
                        backgroundColor: "#548958",
                        alignItems: "center",
                        borderRadius: 15,
                        marginTop: 10,
                      }}
                      onPress={() => this.checkReference()}
                    >
                      <Text
                        style={{
                          fontSize: 25,
                          padding: 5,
                          paddingLeft: 15,
                          paddingRight: 15,
                          color: "white",
                          fontFamily: Fonts.WorkSans,
                        }}
                      >
                        Tamam
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
                <Text style={styles.dialogText}>
                  {"\n"}
                  Senin referans adresini giren her kullanıcı için ise sen 10
                  coin kazanacaksın. {"\n"}
                  Referans adresin:
                  {"\n"}
                  {this.state.currentUser.email}
                </Text>
              </View>
            </DialogContent>
          </View>
        </DialogComponent>
        <DialogComponent
          title="Yükleniyor.."
          titleAlign="center"
          dialogStyle={{ borderRadius: 10 }}
          titleTextStyle={{
            fontSize: 24,
            fontWeight: "bold",
            color: "#000",
            paddingTop: 8,
            fontFamily: Fonts.WorkSans,
          }}
          show={this.state.isShareLoading}
          width={0.55}
        >
          <ActivityIndicator size={30} />
        </DialogComponent>
      </ImageBackground>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  welcome: {
    fontSize: 20,
    textAlign: "center",
    margin: 10,
    fontFamily: Fonts.WorkSans,
  },
  dialogText: {
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: Fonts.WorkSans,
  },
  textInput: {
    alignSelf: "stretch",
    flex: 1,
    height: 50,
    margin: 10,
    borderWidth: 1,
    borderRadius: 30,
    paddingLeft: 22,
    paddingRight: 22,
    paddingTop: 8,
  },
  button: {
    width: 50,
    height: 50,
    margin: 10,
    marginLeft: 0,
    justifyContent: "center",
    borderRadius: 50,
    alignItems: "center",
  },
  textStyle: {
    fontSize: 22,
    color: "#111",
    margin: 2,
    fontFamily: Fonts.WorkSans,
  },
  headerText: {
    fontSize: 17,
    color: "#000",
    marginLeft: 5,
    textAlignVertical: "center",
    fontFamily: Fonts.WorkSans,
  },
  imageStyle: {
    width: 30,
    height: 30,
    paddingTop: 5,
    paddingBottom: 5,
    marginTop: 5,
    marginBottom: 5,
  },
  viewStyle: {
    backgroundColor: "#345895",
    height: 60,
    width: "100%",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
  },
});
//9bc73f
function compareStrings(str1, str2) {
  str1 = str1.trim();
  if (str1.length != str2.length) return false;
  for (var i = 0; i < str1.length; i++) {
    if (
      ((str1[i] == "İ" || str1[i] == "I" || str1[i] == "ı" || str1[i] == "i") &&
        (str2[i] == "İ" ||
          str2[i] == "I" ||
          str2[i] == "ı" ||
          str2[i] == "i")) ||
      ((str1[i] == "Ş" || str1[1] == "ş") &&
        (str2[i] == "ş" || str2[i] == "Ş")) ||
      ((str1[i] == "Ç" || str1[1] == "ç") &&
        (str2[i] == "Ç" || str2[i] == "ç")) ||
      ((str1[i] == "ğ" || str1[1] == "Ğ") &&
        (str2[i] == "ğ" || str2[i] == "Ğ")) ||
      ((str1[i] == "ü" || str1[1] == "Ü") &&
        (str2[i] == "ü" || str2[i] == "Ü")) ||
      ((str1[i] == "ö" || str1[1] == "Ö") && (str2[i] == "ö" || str2[i] == "Ö"))
    )
      continue;
    if (
      ((str1[i] <= "z" && str1[i] >= "a") ||
        (str1[i] <= "Z" && str1[i] >= "A")) &&
      ((str2[i] <= "z" && str2[i] >= "a") || (str2[i] <= "Z" && str2[i] >= "A"))
    ) {
      if (str1[i].toUpperCase() != str2[i].toUpperCase()) return false;
    } else if (str1[i] != str2[i]) return false;
  }
  return true;
}
