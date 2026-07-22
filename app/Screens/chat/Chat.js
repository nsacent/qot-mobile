import React from 'react';
import { View, Text, SafeAreaView, Image, TouchableOpacity, FlatList, Platform } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { COLORS, FONTS, IMAGES, SIZES } from '../../constants/theme';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import { useNavigation } from '@react-navigation/native';
import { ScrollView } from 'react-native-gesture-handler';


const LiveUserData = [
  {
    id: '1',
    title: 'Deepesh',
    image: IMAGES.Small4,
  },
  {
    id: '2',
    title: 'Alex Techie',
    image: IMAGES.Small2,
  },
  {
    id: '3',
    title: 'Lily Learns',
    image: IMAGES.Small3,
  },
  {
    id: '4',
    title: 'Mia Maven',
    image: IMAGES.Small1,

  },
  {
    id: '5',
    title: 'herry Techie',
    image: IMAGES.Small5,
  },
  {
    id: '6',
    title: 'Sophia James',
    image: IMAGES.Small6,
  },
  {
    id: '5',
    title: 'herry Techie',
    image: IMAGES.Small7,
  },
  {
    id: '6',
    title: 'Sophia James',
    image: IMAGES.Small8,
  },
]


const ChatData = [
  {
    id: '1',
    title: 'Alex Techie',
    image: IMAGES.car6,
    image2: IMAGES.Small1,
    model: "NIKON CORPORATION, NIKON D5500 ",
    text: "Hello",
    time: 'just now',
    chatcount: '1',
  },
  {
    id: '2',
    title: 'Lily Learns',
    image: IMAGES.car5,
    text: "What's your location? ",
    time: '20min',
    chatcount: '1',
    image2: IMAGES.Small2,
    model: "NIKON CORPORATION, NIKON D5500 ",
  },
  {
    id: '3',
    title: 'Mia Maven',
    image: IMAGES.car4,
    text: "More photos",
    time: '5min',
    image2: IMAGES.Small3,
    model: "NIKON CORPORATION, NIKON D5500 ",
  },
  {
    id: '4',
    title: 'Sophia James',
    image: IMAGES.car3,
    text: "Hello 👋",
    time: '10min',
    image2: IMAGES.Small4,
    model: "NIKON CORPORATION, NIKON D5500 ",
  },
  {
    id: '5',
    title: 'Deepesh gaur',
    image: IMAGES.car2,
    text: "Is it available?",
    time: '1d',
    chatcount: '2',
    image2: IMAGES.Small5,
    model: "NIKON CORPORATION, NIKON D5500 ",
  },
  {
    id: '6',
    title: 'Alex Techie',
    image: IMAGES.car1,
    text: "hmm ",
    time: '5d',
    image2: IMAGES.Small6,
    model: "NIKON CORPORATION, NIKON D5500 ",
  },
  {
    id: '7',
    title: 'Lily Learns',
    image: IMAGES.car2,
    text: "yes bro",
    time: '10d',
    image2: IMAGES.Small7,
    model: "NIKON CORPORATION, NIKON D5500 ",
  },
  {
    id: '8',
    title: 'Mia Maven',
    image: IMAGES.car4,
    text: "Make an offer",
    time: '15d',
    image2: IMAGES.Small8,
    model: "NIKON CORPORATION, NIKON D5500 ",
  },
  {
    id: '9',
    title: 'Sophia James',
    image: IMAGES.car6,
    text: "Reply back soon",
    time: '16d',
    image2: IMAGES.Small9,
    model: "NIKON CORPORATION, NIKON D5500 ",
  },
  {
    id: '10',
    title: 'Deepesh gaur',
    image: IMAGES.car1,
    text: "Are you there? ",
    time: '20d',
    image2: IMAGES.Small10,
    model: "NIKON CORPORATION, NIKON D5500 ",
  },
  {
    id: '11',
    title: 'Alex Techie',
    image: IMAGES.car3,
    text: "When did you buy this",
    time: '25d',
    image2: IMAGES.Small1,
    model: "NIKON CORPORATION, NIKON D5500 ",
  }
];

const Item = ({ title, image, text, time, chatcount, active, navigation, theme, image2, model }) => (
    <View>
      <TouchableOpacity
        onPress={() => navigation.navigate('SingleChat')}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 10,
          paddingVertical: 10,
          paddingLeft: 10,
          marginBottom: 8,
          borderRadius: 15,
          marginHorizontal: 10,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.card,
          borderWidth: 1,
          borderRadius: SIZES.radius,
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 5,
          },
          shadowOpacity: 0.34,
          shadowRadius: 6.27,
          elevation: 5,
        }}
      >
        <View>
          <TouchableOpacity
            style={{ marginRight: 20 }}
          >
            <View>
              <Image
                style={{ width: 50, height: 50, borderRadius: 6 }}
                source={image}
              />
            </View>
            <View style={{ position: 'absolute', bottom: -10, right: -10, borderWidth: 2, borderRadius: 50, borderColor: theme.colors.card }}>
              <Image
                style={{ width: 25, height: 25, borderRadius: 50 }}
                source={image2}
              />
            </View>
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', marginBottom: 5 }}>
            <Text style={{ ...FONTS.fontSm, ...FONTS.fontMedium, color: theme.colors.title, flex: 1 }}>{title}</Text>
            <Text style={{ ...FONTS.fontSm, ...FONTS.fontRegular, color: theme.colors.title, opacity: .4 }}>{time}</Text>
          </View>
          <View style={{ flexDirection: 'row', paddingRight: 60 }}>
            <Text numberOfLines={1} style={{ ...FONTS.fontXs, color: theme.colors.title, flex: 1 }}>{model}</Text>
          </View>
          <View style={{ position: 'absolute', flexDirection: 'row', alignItems: 'center', bottom: 5, right: 5 }}>
            {chatcount &&
              <View style={{ borderRadius: 50, backgroundColor: COLORS.primary, }}>
                <Text style={{ ...FONTS.font, color: '#fff', width: 20, height: 20, alignItems: 'center', textAlign: 'center', }}>{chatcount}</Text>
              </View>
            }
          </View>
          <View style={{ flexDirection: 'row', marginTop: 5 }}>
            <Text style={{ ...FONTS.fontXs, color: theme.colors.text, flex: 1 }}>{text}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
)

const ActiveChat = () => {
  const navigation = useNavigation();

  const theme = useTheme();
  const { colors } = theme;

  return (
    <View style={[GlobalStyleSheet.container,{padding:0}]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 15, gap: 5 }}
      >
        {LiveUserData.map((data, index) => {
          return (
            <TouchableOpacity
              onPress={() => navigation.navigate('SingleChat')}
              key={index}
              style={{ alignItems: 'center', marginBottom: 10, width: 65 }}
            >
              <Image
                style={{ width: 55, height: 55, borderRadius: 12 }}
                source={data.image}
              />
              <Text numberOfLines={1} style={{ ...FONTS.fontMedium, color: colors.title, fontSize: 10, marginTop: 5 }}>{data.title}</Text>
              <View style={{ backgroundColor: COLORS.success, width: 12, height: 12, borderRadius: 50, position: 'absolute', bottom: 20, right: 5, borderWidth: 2, borderColor: colors.card }}></View>
            </TouchableOpacity>
          )
        })}
      </ScrollView>
      <Text style={{ ...FONTS.fontMedium, fontSize: 16, color: colors.title, paddingHorizontal: 15, marginBottom: 10 }}>Messages</Text>
    </View>
  )
}


const Chat = ({ navigation }) => {

  const theme = useTheme();
  const { colors } = theme;

  return (
    <SafeAreaView style={{ backgroundColor: colors.card, flex: 1 }}>
      <View style={GlobalStyleSheet.container}>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border, marginHorizontal: -15, paddingHorizontal: 15 }}>
          <Text style={{ ...FONTS.fontSemiBold, fontSize: 18, color: colors.title, flex: 1 }}>Chats</Text>
          <TouchableOpacity>
            <Image
              style={{ width: 20, height: 20, resizeMode: 'contain', tintColor: colors.title }}
              source={IMAGES.search}
            />
          </TouchableOpacity>
        </View>
      </View>
      <FlatList
        contentContainerStyle={[{paddingBottom: 100 },Platform.OS === 'web' && GlobalStyleSheet.container,{padding:0}]}
        showsVerticalScrollIndicator={false}
        data={ChatData}
        renderItem={({ item }) =>
          <Item
            title={item.title}
            image={item.image}
            image2={item.image2}
            text={item.text}
            isChecked={item.isChecked}
            time={item.time}
            chatcount={item.chatcount}
            active={item.active}
            model={item.model}
            navigation={navigation}
            theme={theme}
          />
        }
        ListHeaderComponent={() => <ActiveChat />}
        keyExtractor={item => item.id}
      />
    </SafeAreaView>
  )
}

export default Chat;