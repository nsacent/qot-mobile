import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { useTheme } from '@react-navigation/native';
import { SIZES } from '../constants/theme';

const SearchBar = ({
    value,
    onChangeText,
    onSubmitEditing,
    placeholder = 'Search QOT...',
}) => {
    const theme = useTheme();
    const { colors } = theme;

    return (
        <View style={{ justifyContent: 'center' }}>
            <View
                style={{
                    backgroundColor: colors.card,
                    shadowColor: 'rgb(18,9,46)',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 5,
                }}
            >
                <TextInput
                    style={[
                        styles.searchBar,
                        {
                            borderColor: colors.borderColor,
                            backgroundColor: colors.card,
                            color: colors.title,
                        },
                    ]}
                    value={value}
                    onChangeText={onChangeText}
                    onSubmitEditing={onSubmitEditing}
                    returnKeyType="search"
                    autoCorrect={false}
                    placeholder={placeholder}
                    placeholderTextColor={theme.dark ? 'rgba(255,255,255,.6)' : 'rgba(18,9,46,.55)'}
                />
            </View>
            <FeatherIcon
                name="search"
                size={20}
                color={colors.title}
                style={{ position: 'absolute', left: 15, opacity: 0.8 }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    searchBar: {
        height: 48,
        borderWidth: 1,
        borderRadius: SIZES.radius,
        padding: 15,
        paddingLeft: 45,
    },
});

export default SearchBar;
