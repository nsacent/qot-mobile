import React from 'react';
import { View } from 'react-native';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';

const ReviewStars = ({ rating = 0, size = 14, activeColor = '#F59E0B', inactiveColor = '#D7DCE5' }) => {
    const numericRating = Number(rating || 0);

    return (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {[1, 2, 3, 4, 5].map((value) => (
                <FontAwesomeIcon
                    key={value}
                    name={numericRating >= value ? 'star' : 'star-o'}
                    size={size}
                    color={numericRating >= value ? activeColor : inactiveColor}
                    style={{ marginRight: value < 5 ? 3 : 0 }}
                />
            ))}
        </View>
    );
};

export default ReviewStars;
