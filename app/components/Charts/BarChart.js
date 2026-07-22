import React from 'react';
import { BarChart } from 'react-native-chart-kit';
import { useTheme } from '@react-navigation/native';
import { COLORS, SIZES } from '../../constants/theme';

const BasicBarChart = () => {
    
    const {colors} = useTheme();

    const data = {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        datasets: [
          {
            data: [20, 45, 28, 80, 99, 43]
          }
        ]
    };

    return (
        <>
            <BarChart
                data={data}
                width={SIZES.width - 60 > SIZES.container ? SIZES.container - 60 : SIZES.width - 60}
                height={220}
                yAxisLabel="$"
                fromZero={true}
                chartConfig={{
                    backgroundColor: "#fff",
                    backgroundGradientFrom: colors.card,
                    backgroundGradientTo: colors.card,
                    fillShadowGradientFrom: '#5384d7',
                    fillShadowGradientFromOpacity:.35,
                    fillShadowGradientTo: '#5384d7',
                    decimalPlaces: 2, // optional, defaults to 2dp
                    color: () =>  '#5384d7',
                    labelColor: () => colors.text,
                    style: {
                        borderRadius: 16
                    },
                    propsForDots: {
                        r: "6",
                        strokeWidth: "2",
                        stroke: "#fff"
                    },
                    propsForBackgroundLines: {
                        stroke: colors.text,
                        strokeOpacity: .3,
                    }
                }}
                verticalLabelRotation={0}
            />
        </>
    );
};


export default BasicBarChart;