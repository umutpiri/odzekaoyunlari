import React, { Component } from 'react';
import {
  Text,
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  BackHandler,
  AsyncStorage,
  ImageBackground
} from 'react-native';
import { AdMobBanner, AdMobInterstitial } from 'react-native-admob';
import { Fonts } from '../Fonts';

class verbalGame extends Component {
  verbs = [
    'proje',
    'pet şişe',
    'altın',
    'kalem',
    'kule',
    'kalemlik',
    'kale',
    'mancınık',
    'sevgi',
    'ekmek',
    'meslek',
    'koşul',
    'mahalle',
    'tane',
    'görüntü',
    'anlayış',
    'belediye',
    'faaliyet',
    'kapı',
    'pencere',
    'sorumluluk',
    'değişiklik',
    'eleman',
    'elma',
    'elmas',
    'sebze',
    'sanat',
    'vatandaş',
    'hastahane',
    'özgürlük',
    'mağaza',
    'medya',
    'güvenlik',
    'uygulama',
    'yetenek',
    'yumurta',
    'vitamin',
    'hayal',
    'adres',
    'çiçek',
    'rüzgar',
    'meyve',
    'üzüm',
    'sigorta',
    'ağırlık',
    'muayenehane',
    'tedavi',
    'rehabilitasyon',
    'istatistik',
    'statik',
    'elektrik',
    'halüsinasyon',
    'şemsiye',
    'transkript',
    'spekülatif',
    'konsantrasyon',
    'sevgili',
    'sokak',
    'tavuk',
    'tanecik',
    'fırın',
    'özgür',
    'sanatçı',
    'yağmur',
    'spekülasyon',
    'insiyatif',
    'inşaat',
    'inşa',
    'mühendis',
    'armağan',
    'hediye',
    'duyuru',
    'kulak',
    'duyu',
    'lisans',
    'lisan',
    'dil',
    'biraz',
    'bariz',
    'mektup',
    'mektep',
    'izin',
    'değil',
    'yıl',
    'gün',
    'şey',
    'ara',
    'el',
    'zaman',
    'çocuk',
    'içinde',
    'yol',
    'neden',
    'konu',
    'kadın',
    'ev',
    'göz',
    'dünya',
    'yan',
    'hâl',
    'su',
    'ülke',
    'iç',
    'kişi',
    'son',
    'şekil',
    'yüz',
    'taraf',
    'adam',
    'ses',
    'kız',
    'para',
    'anne',
    'baba',
    'hayat',
    'bilgi',
    'an',
    'sonuç',
    'dış',
    'ad',
    'süre',
    'saat',
    'yaş',
    'sorun',
    'devlet',
    'sahip',
    'sıra',
    'yüzde',
    'ay',
    'olay',
    'söz',
    'sistem',
    'kapı',
    'kitap',
    'gece',
    'alan',
    'bugün',
    'dönem',
    'arkadaş',
    'ürün',
    'aile',
    'erkek',
    'güç',
    'gerçek',
    'ilişki',
    'çevre',
    'yaşam',
    'halk',
    'sokak',
    'bey',
    'tarih',
    'özellik',
    'bölüm',
    'akıl',
    'anlam',
    'banka',
    'ayak',
    'toplum',
    'araç',
    'madde',
    'tür',
    'karar',
    'hava',
    'sayı',
    'grup',
    'oda',
    'biçim',
    'haber',
    'soru',
    'arka',
    'yazı',
    'okul',
    'dil',
    'şirket',
    'kaynak',
    'program',
    'hareket',
    'renk',
    'hak',
    'çalışma',
    'açı',
    'parça',
    'gazete',
    'değer',
    'yapı',
    'doktor',
    'gelir',
    'görev',
    'amaç',
    'bölge',
    'film',
    'müşteri',
    'telefon',
    'eğitim',
    'deniz',
    'etki',
    'vücut',
    'düşünce',
    'milyon',
    'temel',
    'kültür',
    'resim',
    'ışık',
    'hanım',
    'hizmet',
    'ihtiyaç',
    'nokta',
    'yön',
    'oyun',
    'işlem',
    'oran',
    'orada',
    'dikkat',
    'bilgisayar',
    'gelecek',
    'oğul',
    'lira',
    'üretim',
    'dakika',
    'araba',
    'ağız',
    'duygu',
    'örnek',
    'derece',
    'duvar',
    'sanat',
    'ana',
    'hastalık',
    'öğrenci',
    'televizyon',
    'yöntem',
    'masa',
    'takım',
    'kafa',
    'müzik',
    'enerji',
    'üniversite',
    'spor',
    'türlü',
    'can',
    'kısım',
    'ölüm',
    'sağlık',
    'sabah',
    'internet',
    'teknik',
    'dışarı',
    'merkez',
    'ortam',
    'düzey',
    'köy',
    'yönetim',
    'aşağı',
    'cevap',
    'toprak',
    'isim',
    'akşam',
    'araştırma',
    'kan',
    'hasta',
    'şehir',
    'hafta',
    'trafik',
    'hesap',
    'otomobil',
    'yabancı',
    'davranış',
    'mutfak',
    'kent',
    'fiyat',
    'kol',
    'cam',
    'önem',
    'koca',
    'varlık',
    'ilgi',
    'satış',
    'içeri',
    'acı',
    'kat',
    'ekonomi',
    'fotoğraf',
    'hayvan',
    'savaş',
    'mal',
    'saç',
    'kalan',
    'sayfa',
    'teknoloji',
    'kurum',
    'sektör',
    'kağıt',
    'koku',
    'yüzyıl',
    'cadde',
    'pazar',
    'kullanım',
    'sınıf',
    'aşk',
    'güneş',
    'sigara',
    'ağaç',
    'kelime',
    'bina',
    'parti',
    'yatak',
    'yazar',
    'kulak',
    'öğretmen',
    'sebep',
    'yağ',
    'kural',
    'şiir',
    'başarı',
    'firma',
    'hükümet',
    'kalp',
    'proje',
    'şart',
    'hız',
    'köşe',
    'model',
    'balık',
    'piyasa',
    'görüş',
    'miktar',
    'meydan',
    'ölçü',
    'bahçe',
    'sevgi',
    'ekmek',
    'dolu',
    'kuruluş',
    'yardım',
    'malzeme',
    'köpek',
    'istek',
    'kardeş',
    'izin',
    'korku',
    'meslek',
    'polis',
    'fikir',
    'pencere',
    'taş',
    'ateş',
    'fark',
    'koşul',
    'mahalle',
    'tane',
    'ortak',
    'tip',
    'görüntü',
    'ders',
    'başkan',
    'karşılık',
    'numara',
    'defa',
    'batı',
    'sinema',
    'hedef',
    'dost',
    'anlayış',
    'kenar',
    'kontrol',
    'din',
    'plan',
    'beyin',
    'elektrik',
    'et',
    'çizgi',
    'üye',
    'cilt',
    'ruh',
    'süreç',
    'bakış',
    'bilim',
    'ifade',
    'beden',
    'kaza',
    'dağ',
    'adım',
    'çözüm',
    'belediye',
    'gelişme',
    'seçim',
    'kavram',
    'faaliyet',
    'zarar',
    'salon',
    'çeşit',
    'sorumluluk',
    'mektup',
    'makine',
    'maç',
    'yönetici',
    'metre',
    'kalite',
    'bitki',
    'değişiklik',
    'ilaç',
    'kredi',
    'yasa',
    'imkan',
    'ceza',
    'top',
    'uzman',
    'kanal',
    'mekân',
    'parmak',
    'ilke',
    'rol',
    'şarkı',
    'eleman',
    'hoca',
    'boy',
    'günlük',
    'politika',
    'suç',
    'sahne',
    'adet',
    'koltuk',
    'sanatçı',
    'aşama',
    'orman',
    'düzen',
    'faiz',
    'hikaye',
    'hücre',
    'ora',
    'roman',
    'vergi',
    'ağabey',
    'basın',
    'destek',
    'hata',
    'sınır',
    'birlik',
    'eser',
    'birey',
    'otobüs',
    'sanayi',
    'bebek',
    'vatandaş',
    'bakan',
    'kere',
    'millet',
    'reklam',
    'boyut',
    'dergi',
    'enflasyon',
    'geçmiş',
    'hastahane',
    'toplantı',
    'gazeteci',
    'içerisi',
    'inanç',
    'nitelik',
    'üzeri',
    'giriş',
    'toplam',
    'dükkan',
    'deri',
    'mücadele',
    'problem',
    'servis',
    'tedavi',
    'bakanlık',
    'baskı',
    'tepki',
    'cümle',
    'özgürlük',
    'kimlik',
    'mesele',
    'sürücü',
    'süt',
    'eşya',
    'aday',
    'ağırlık',
    'milyar',
    'sıkıntı',
    'Tanrı',
    'tavır',
    'yayın',
    'yatırım',
    'tehlike',
    'vakit',
    'daire',
    'fırsat',
    'katkı',
    'öykü',
    'uçak',
    'yanıt',
    'doğa',
    'burun',
    'çıkar',
    'işçi',
    'işletme',
    'mağaza',
    'medya',
    'artış',
    'kamu',
    'sigorta',
    'yaz',
    'yürek',
    'belge',
    'çaba',
    'risk',
    'sözcük',
    'demokrasi',
    'tuz',
    'cami',
    'çağ',
    'etraf',
    'olanak',
    'organ',
    'sene',
    'meyve',
    'bacak',
    'değişim',
    'kanun',
    'rüzgar',
    'cumhuriyet',
    'tarz',
    'cep telefonu',
    'iletişim',
    'müdür',
    'otel',
    'zevk',
    'güvenlik',
    'hukuk',
    'okur',
    'silah',
    'talep',
    'yıldız',
    'asker',
    'gaz',
    'uygulama',
    'beyan',
    'besin',
    'alışveriş',
    'bilinç',
    'çerçeve',
    'mevcut',
    'tüketici',
    'at',
    'site',
    'abla',
    'çiçek',
    'saygı',
    'ücret',
    'yetenek',
    'kilo',
    'çay',
    'gider',
    'laf',
    'örgüt',
    'ticaret',
    'boyun',
    'cihaz',
    'denge',
    'sırt',
    'kahve',
    'kas',
    'meclis',
    'öteki',
    'adres',
    'paşa',
    'sıcaklık',
    'güven',
    'marka',
    'yaprak',
    'yarar',
    'gönül',
    'hayal',
    'şarap',
    'altın',
    'vitamin',
    'ek',
    'yumurta',
    'eylem',
    'kesim',
    'kriz',
    'birim',
    'sevinil',
    'özenil',
    'tapınıl',
    'abadi',
    'abajur',
    'abaküs',
    'abanoz',
    'abartı',
    'abartılı',
    'abartılmak',
    'abartılmış',
    'abartısız',
    'abartmak',
    'abdest',
    'abes',
    'abide',
    'abiye',
    'abla',
    'abluka',
    'abone',
    'abonelik',
    'absorbe etmek',
    'acaba',
    'acele',
    'aceleci',
    'acemi',
    'acemilik',
    'acı',
    'acılı',
    'acımasız',
    'acıtmak',
    'acil',
    'acizlik',
    'açgözlülük',
    'açı',
    'açık',
    'açıkgöz',
    'açıklama',
    'açıklayıcı',
    'açılım',
    'açılış',
    'adak',
    'adalet',
    'adam',
    'adap',
    'adapte',
    'adapte etmek',
    'adapte olmak',
    'adaptör',
    'adaş',
    'aday'
  ];
  seen = [];
  screenWidth = Dimensions.get('window').width;
  gameModes = { BEGIN: 0, GAME: 1, END: 2 };
  state = {
    lives: 3,
    score: 0,
    text: ' ',
    mode: 0,
    uid: -1,
    highScore: -1,
    gameCount: 0
  };
  start = 0;
  oldIndex = -1;

  componentWillMount() {
    this.retrieveData();
  }

  async retrieveData() {
    try {
      highScore = (await AsyncStorage.getItem('verbalGameHigh')) || '-1';
      console.log(highScore);
      this.setState({ highScore: parseInt(highScore, 10) });
    } catch (error) {}
  }

  async storeData(score) {
    try {
      console.log(score);
      await AsyncStorage.setItem('verbalGameHigh', score.toString());
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
    return Math.floor(Math.random() * max);
  }

  nextWord() {
    index =
      (this.getRandomInt(this.state.score > 4 ? this.state.score + 3 : 10) +
        this.start) %
      this.verbs.length;
    if (index == this.oldIndex)
      index =
        (this.getRandomInt(this.state.score > 4 ? this.state.score + 3 : 10) +
          this.start) %
        this.verbs.length;
    this.setState({
      text: this.verbs[index]
    });
    this.oldIndex = index;
  }

  checkAnswer(bool) {
    tempBool = this.seen.includes(this.state.text);
    if (!tempBool) this.seen.push(this.state.text);
    if (tempBool == bool) {
      this.setState({ score: this.state.score + 1 }, () => this.nextWord());
    } else {
      this.setState({ lives: this.state.lives - 1 }, () => {
        if (this.state.lives == 0) {
          this.finishGame();
        } else {
          this.nextWord();
        }
      });
    }
  }

  finishGame() {
    this.setState({ gameCount: this.state.gameCount + 1 }, () => {
      if (this.state.gameCount == 3) {
        AdMobInterstitial.showAd().catch(error => console.warn(error));
        this.setState({ gameCount: 0 });
      }
    });
    if (this.state.score > this.state.highScore) {
      this.storeData(this.state.score);
      this.setState({ highScore: this.state.score, mode: this.gameModes.END });
    } else {
      this.setState({ mode: this.gameModes.END });
    }
  }

  restart() {
    this.setState({
      score: 0,
      lives: 3,
      text: ' ',
      mode: this.gameModes.BEGIN
    });
    this.seen = [];
  }

  renderHighScore() {
    if (this.state.highScore != -1)
      return (
        <Text
          style={{
            fontSize: 27,
            color: '#ddd',
            marginLeft: 10,
            marginRight: 10,
            textAlign: 'center',
            backgroundColor: '#545895',
            width: '90%',
            padding: 5,
            borderBottomLeftRadius: 15,
            borderBottomRightRadius: 15,
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
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View
              style={{
                alignItems: 'center',
                backgroundColor: '#345895',
                borderRadius: 7,
                width: '100%',
                marginTop: 50,
                paddingBottom: 15,
                paddingTop: 10,
                paddingLeft: 5,
                paddingRight: 5
              }}
            >
              <Text
                style={{
                  fontFamily: Fonts.WorkSans,
                  fontSize: 30,
                  color: '#ddd'
                }}
              >
                Oynanış
              </Text>
              <Text
                style={[
                  styles.text,
                  {
                    textAlign: 'center',
                    color: '#ddd',
                    fontSize: 20
                  }
                ]}
              >
                Kelimeleri hatırlamaya çalış. Her döngüde tekrar eden kelimeler
                için Gördüm, yeni kelimeler için Görmedim işaretlenmeli. 3 hata
                hakkın var.
              </Text>
            </View>
            {this.renderHighScore()}
            <TouchableOpacity
              onPress={() => {
                this.start = this.getRandomInt(this.verbs.length);
                this.nextWord();
                this.setState({ mode: this.gameModes.GAME });
              }}
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
      case this.gameModes.GAME:
        return (
          <View style={{ flex: 1 }}>
            <View
              style={{
                flexDirection: 'row',
                paddingLeft: 5,
                paddingRight: 5
              }}
            >
              <Text
                style={[
                  styles.text,
                  {
                    flex: 1,
                    paddingTop: 2,
                    fontSize: 30,
                    color: '#fff'
                  }
                ]}
              >
                {'♥'.repeat(this.state.lives)}
              </Text>
              <Text
                style={[
                  styles.text,
                  {
                    color: '#ccc',
                    flex: 1,
                    textAlign: 'right',
                    fontSize: 35
                  }
                ]}
              >
                Skor: {this.state.score}
              </Text>
            </View>
            <View
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Text
                style={{
                  fontFamily: Fonts.WorkSans,
                  color: '#ddd',
                  textAlign: 'center',
                  fontSize: this.screenWidth * 0.145 - this.state.text.length,
                  width: '100%',
                  paddingTop: 10,
                  paddingBottom: 10,
                  backgroundColor: '#345895'
                }}
              >
                {this.state.text}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', width: '100%' }}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  this.checkAnswer(true);
                }}
                style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#2a2',
                  paddingTop: 20,
                  paddingBottom: 17
                }}
              >
                <Text
                  style={{
                    textAlign: 'center',
                    fontFamily: Fonts.WorkSans,
                    fontSize: 30
                  }}
                >
                  Gördüm
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  this.checkAnswer(false);
                }}
                style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#a22',
                  paddingTop: 20,
                  paddingBottom: 17
                }}
              >
                <Text
                  style={{
                    textAlign: 'center',
                    fontFamily: Fonts.WorkSans,
                    fontSize: 30
                  }}
                >
                  Görmedim
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      case this.gameModes.END:
        return (
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View
              style={{
                width: '90%',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 10,
                paddingTop: 30,
                marginTop: 80
              }}
            >
              <Text
                style={[
                  styles.text,
                  {
                    color: '#ddd',
                    backgroundColor: '#345895',
                    width: '90%',
                    padding: 5,
                    fontSize: 27,
                    borderTopLeftRadius: 15,
                    borderTopRightRadius: 15,
                    textAlign: 'center'
                  }
                ]}
              >
                Skor: {this.state.score}
              </Text>
              {this.renderHighScore()}
              <TouchableOpacity
                onPress={() => {
                  this.setState({ score: 0 }, () => this.restart());
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
          </View>
        );
    }
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
            backgroundColor: '#345895'
          }}
        >
          <TouchableOpacity
            style={{
              width: 60,
              height: 60,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#345895'
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
              fontSize: this.screenWidth * 0.07,
              fontFamily: Fonts.WorkSans,
              textAlignVertical: 'center',
              textAlign: 'center',
              color: '#ddd',
              flex: 1
            }}
          >
            Sözel Hafıza
          </Text>
          <View
            style={{
              width: 60,
              height: 60,
              backgroundColor: '#345895'
            }}
          />
        </View>
        {this.renderBody()}
        <AdMobBanner
          adSize="smartBannerPortrait"
          adUnitID="ca-app-pub-8980970186700232/7622839967"
        />
      </ImageBackground>
    );
  }
}

const styles = StyleSheet.create({
  text: {
    fontSize: 25,
    fontFamily: Fonts.WorkSans
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

export { verbalGame };
