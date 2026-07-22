import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Image } from 'react-native';
import { FONTS, IMAGES } from '../../constants/theme';
import { useNavigation, useTheme } from '@react-navigation/native';

const iconsBySlug = {
    vehicles: IMAGES.cat1,
    'phones-tablets': IMAGES.cat2,
    property: IMAGES.cat3,
    jobs: IMAGES.cat4,
    agriculture: IMAGES.cat5,
    electronics: IMAGES.cat6,
    furniture: IMAGES.cat7,
    'home-furniture': IMAGES.cat7,
    fashion: IMAGES.cat8,
    pets: IMAGES.cat9,
    'sports-hobbies': IMAGES.cat10,
    services: IMAGES.cat11,
};

export const categoryIcon = (slug) => iconsBySlug[slug] || IMAGES.cat6;

const CategoryList = ({ categories = [] }) => {
    const theme = useTheme();
    const { colors } = theme;
    const navigation = useNavigation();

    return (
        <View style={{ marginHorizontal: -15 }}>
            <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={categories}
                keyExtractor={(item) => String(item.id)}
                contentContainerStyle={{ paddingLeft: 15 }}
                renderItem={({ item }) => (
                    <View style={{ width: 88, marginRight: 4 }}>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('Items', {
                                cat: item.name,
                                categorySlug: item.slug,
                            })}
                            style={{ alignItems: 'center' }}
                        >
                            <View
                                style={{
                                    height: 64,
                                    width: 64,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: 20,
                                    backgroundColor: theme.dark ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.05)',
                                    marginBottom: 6,
                                }}
                            >
                                <Image
                                    source={categoryIcon(item.slug)}
                                    style={{ height: 40, width: 40, resizeMode: 'contain' }}
                                />
                            </View>
                            <Text
                                numberOfLines={2}
                                style={[FONTS.fontXs, { color: colors.title, textAlign: 'center' }]}
                            >
                                {item.name}
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}
            />
        </View>
    );
};

export default React.memo(CategoryList);
