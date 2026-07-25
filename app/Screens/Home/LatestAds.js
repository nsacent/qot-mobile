import React from 'react';
import { View, ScrollView } from 'react-native';
import CardStyle1 from '../../components/Card/CardStyle1';
import { useTheme } from '@react-navigation/native';

const LatestAds = ({ items = [], horizontal = false }) => {
    const { colors } = useTheme();

    if (!items.length) return null;

    if (horizontal) {
        return (
            <View style={{ marginHorizontal: -15, backgroundColor: colors.card }}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingLeft: 15, paddingBottom: 15, paddingTop: 10 }}
                >
                    {items.map((item) => (
                        <View key={item.id} style={{ marginRight: 10, width: 170 }}>
                            <CardStyle1 item={item} />
                        </View>
                    ))}
                </ScrollView>
            </View>
        );
    }

    return (
        <View
            style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                paddingTop: 10,
                paddingBottom: 5,
            }}
        >
            {items.map((item) => (
                <View key={item.id} style={{ width: '48.5%', marginBottom: 11 }}>
                    <CardStyle1 item={item} />
                </View>
            ))}
        </View>
    );
};

export default React.memo(LatestAds);
