import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Accordion from 'react-native-collapsible/Accordion';
import FeatherIcon from "react-native-vector-icons/Feather";
import { COLORS, FONTS } from '../../constants/theme';
import { useTheme } from '@react-navigation/native';

const ClassicAccordion = () => {

    const {colors} = useTheme();

    const [activeSections, setActiveSections] = useState([0]);
    const setSections = (sections) => {
        setActiveSections(
        sections.includes(undefined) ? [] : sections
        );
    };
    
    const SECTIONS = [
        {
            title: 'Who Can Benefit from Classified?',
            content: 'Global Reach: Classified allows businesses to reach a global customer base. With an online store, you can sell your products or services to customers anywhere in the world.',
        },
        {
            title: '10 Ways to Maximize Your Profits.',
            content: 'Global Reach: Classified allows businesses to reach a global customer base. With an online store, you can sell your products or services to customers anywhere in the world.',
        },
        {
            title: 'Exploring the Benefits of Classified',
            content: 'Global Reach: Classified allows businesses to reach a global customer base. With an online store, you can sell your products or services to customers anywhere in the world.',
        },
        {
            title: 'The Impact of Classified on Business',
            content: 'Global Reach: Classified allows businesses to reach a global customer base. With an online store, you can sell your products or services to customers anywhere in the world.',
        },
    ];

    const AccordionHeader = (item, _, isActive) => {
        return(
            <View style={{
                flexDirection:'row',
                alignItems:'center',
                paddingVertical:12,
            }}>
                <View
                    style={{
                        height:26,
                        width:26,
                        borderRadius:26,
                        backgroundColor:COLORS.secondary,
                        marginRight:12,
                        alignItems:'center',
                        justifyContent:'center',
                    }}
                >
                    <FeatherIcon size={16} color={COLORS.white} name={isActive ? 'minus' : 'plus'}/>
                </View>
                <Text style={[FONTS.font,FONTS.fontTitle,{color:colors.title,flex:1}]}>{item.title}</Text>
            </View>
        )
    }

    const AccordionBody = (item, _, isActive) => {
        return(
            <View style={{marginBottom:15,paddingLeft:38}}>
                <Text style={[FONTS.fontSm,{color:colors.text,lineHeight:20}]}>{item.content}</Text>
            </View>
        )
    }

    return (
        <>
            <Accordion
                sections={SECTIONS}
                duration={300}
                sectionContainerStyle={{
                    borderBottomWidth:1,
                    borderBottomColor:colors.border,
                    paddingVertical:4,
                }}
                activeSections={activeSections}
                onChange={setSections}
                touchableComponent={TouchableOpacity}
                renderHeader={AccordionHeader}
                renderContent={AccordionBody}
            />
        </>
    );
};

export default ClassicAccordion;