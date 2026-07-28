import { useContext } from 'react';
import { BottomTabBarHeightContext } from '@react-navigation/bottom-tabs';

const useBottomTabContentPadding = (minimumPadding = 24, breathingRoom = 20) => {
    const tabBarHeight = useContext(BottomTabBarHeightContext) || 0;

    return Math.max(minimumPadding, tabBarHeight + breathingRoom);
};

export default useBottomTabContentPadding;
