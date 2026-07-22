import React from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Platform } from 'react-native';
import { useTheme } from '@react-navigation/native';
import Header from '../../../layout/Header';
import { FONTS } from '../../../constants/theme';
import { GlobalStyleSheet } from '../../../constants/StyleSheet';


const data = {
    Location: [
        {
            id: "1",
            title: "aerawerawer"
        },
        {
            id: "2",
            title: "aerawerawer"
        },
        {
            id: "3",
            title: "aerawerawer"
        },
    ],
    Mobile: [
        {
            id: "1",
            title: "mobile Phones",
        },
        {
            id: "2",
            title: "Accessories",
        },
        {
            id: "3",
            title: "Tablets",
        },
    ],
    Properties: [
        {
            id: "1",
            title: "For Sale: Houses & Apartments",
        },
        {
            id: "2",
            title: "For Rent: Houses & Apartments",
        },
        {
            id: "3",
            title: "Lands & Plots",
        },
        {
            id: "4",
            title: "For Rent: Shop & Offices",
        },
        {
            id: "5",
            title: "For Sale: Shop & Offices",
        },
        {
            id: "6",
            title: "PG & Guest Houses",
        },
    ],
    Jobs: [
        {
            id: "1",
            title: "Data entry & Bank office"
        },
        {
            id: "2",
            title: "Sales & Marketing",
        },
        {
            id: "3",
            title: "BPO & Telecaller",
        },
        {
            id: "4",
            title: "Driver",
        },
        {
            id: "5",
            title: "Office Assistant",
        },
        {
            id: "6",
            title: "Delivery & Collection",
        },
        {
            id: "7",
            title: "Delivery & Collection",
        },
        {
            id: "8",
            title: "Teacher",
        },
        {
            id: "9",
            title: "Cook",
        },
        {
            id: "10",
            title: "Designer",
        },
    ],
    Bike: [
        {
            id: "1",
            title: "Motorcycles",
        },
        {
            id: "2",
            title: "Scooters",
        },
        {
            id: "3",
            title: "Spare Parts",
        },
        {
            id: "4",
            title: "Bicycles",
        },
    ],
    Electornics: [
        {
            id: "1",
            title: "TVs, Video - Audio",
        },
        {
            id: "2",
            title: "Kitchen & Other Appliances",
        },
        {
            id: "3",
            title: "Computers & Laptops",
        },
        {
            id: "4",
            title: "Crameras & Lenses",
        },
        {
            id: "5",
            title: "Games & Entertainment",
        },
        {
            id: "6",
            title: "Fridges",
        },
        {
            id: "7",
            title: "Computer Accessories",
        },
        {
            id: "8",
            title: "Hard Disks, Printers & Montiors",
        },
        {
            id: "9",
            title: "ACs",
        },
        {
            id: "10",
            title: "Washing Machaines",
        },
    ],
    Furniture: [
        {
            id: "1",
            title: "Sofa & Dining",
        },
        {
            id: "2",
            title: "Beds & Wardrobes",
        },
        {
            id: "3",
            title: "Home Decor & Garden",
        },
        {
            id: "4",
            title: "Kids Furniture",
        },
        {
            id: "5",
            title: "Other Household itema",
        },
    ],
    Fashion: [
        {
            id: "1",
            title: "Men",
        },
        {
            id: "2",
            title: "Women",
        },
        {
            id: "3",
            title: "Kids",
        },
    ],
    Pets: [
        {
            id: "1",
            title: "Fishes & Aquarium",
        },
        {
            id: "2",
            title: "Pet Food & Accessories",
        },
        {
            id: "3",
            title: "Dogs",
        },
        {
            id: "4",
            title: "Other Pets",
        },
    ],
    Books: [
        {
            id: "1",
            title: "Books",
        },
        {
            id: "2",
            title: "Gym & Fitness",
        },
        {
            id: "3",
            title: "Musical instruments",
        },
        {
            id: "4",
            title: "Sports Equipment",
        },
        {
            id: "5",
            title: "Other Hobbies",
        },
    ],
    Service: [
        {
            id: "1",
            title: "Education & Classes",
        },
        {
            id: "2",
            title: "Tours & Travel",
        },
        {
            id: "3",
            title: "Electronics Repair & Services",
        },
        {
            id: "4",
            title: "Health & Beauty",
        },
        {
            id: "5",
            title: "Home Renovation & Repair",
        },
        {
            id: "6",
            title: "Cleaning & Pest Control",
        },
        {
            id: "7",
            title: "Legal & Documentation Services",
        },
        {
            id: "8",
            title: "Packers & Movers",
        },
        {
            id: "9",
            title: "Other Service",
        },
    ],
}

const Selllist = ({ route, navigation }) => {

    const { cat } = route.params;

    const { colors } = useTheme();

    return (
        <SafeAreaView style={{ backgroundColor: colors.card, flex: 1 }}>
            <Header
                title={cat}
                leftIcon={'back'}
                titleLeft
            />
            <View style={[Platform.OS === 'web' && GlobalStyleSheet.container,{padding:0}]}>
                {data[cat].map((data, index) => (
                    <View key={index} style={{ paddingHorizontal: 15 }}>
                        <TouchableOpacity
                            style={{
                                paddingHorizontal: 15,
                                paddingVertical: 15,
                                borderBottomWidth: 1,
                                borderBottomColor: colors.border
                            }}
                            onPress={() => navigation.navigate('Form')}
                        >
                            <Text style={[FONTS.font, FONTS.fontMedium, { color: colors.title }]}>{data.title}</Text>
                        </TouchableOpacity>
                    </View>
                ))}
            </View>
        </SafeAreaView>
    )
}

export default Selllist