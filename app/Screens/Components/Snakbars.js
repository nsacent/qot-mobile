import React from 'react';
import { SafeAreaView, ScrollView, View } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useTheme } from '@react-navigation/native';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import Header from '../../layout/Header';
import { Snackbar } from 'react-native-paper';
import ListStyle1 from '../../components/list/ListStyle1';


const Snackbars = () => {

    const {colors} = useTheme();

    const [visible, setVisible] = React.useState(false);
	const [snackText, setSnackText] = React.useState("");
	const [snackType, setSnackType] = React.useState("");
	
	const onDismissSnackBar = () => setVisible(false);

    const onToggleSnackBar = (type,text) => {
		setSnackText(text);
		setSnackType(type);
		setVisible(!visible);
	};

    return (
        <SafeAreaView style={{flex:1,backgroundColor:colors.card}}>
            <View style={{flex:1,backgroundColor:colors.background}}>
                <Header title={'Snackbars'} titleLeft leftIcon={'back'}/>
                <ScrollView>
                    <View style={{...GlobalStyleSheet.container}}>
                        <View style={[GlobalStyleSheet.card,GlobalStyleSheet.shadow,{backgroundColor:colors.card}]}>
                            <View style={GlobalStyleSheet.cardBody}>
                                <ListStyle1
                                    onPress={() => onToggleSnackBar('success',"Something's wrong!")}
                                    arrowRight
                                    icon={<FontAwesome size={20} color={colors.title} name={'check'} />}
                                    title={'Confirmation Snackbar'}
                                />
                                <ListStyle1
                                    onPress={() => onToggleSnackBar('warning',"Something's wrong!")}
                                    arrowRight
                                    icon={<FontAwesome size={20} color={colors.title} name={'warning'} />}
                                    title={'Warning Snackbar'}
                                />
                                <ListStyle1
                                    onPress={() => onToggleSnackBar('info',"We're on it")}
                                    arrowRight
                                    icon={<FontAwesome size={20} color={colors.title} name={'refresh'} />}
                                    title={'Loading Snackbar'}
                                />
                                <ListStyle1
                                    onPress={() => onToggleSnackBar('error',"Error Occured")}
                                    arrowRight
                                    icon={<FontAwesome size={20} color={colors.title} name={'close'} />}
                                    title={'Error Snackbar'}
                                />
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </View>
            <Snackbar
                visible={visible}
                onDismiss={onDismissSnackBar}
            >
                {snackText}
            </Snackbar>
        </SafeAreaView>
    );
};


export default Snackbars;