import React, { useState } from 'react';
import {
    Image,
    SafeAreaView,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import CustomButton from '../../components/CustomButton';
import FacebookSignInButton from '../../components/FacebookSignInButton';
import GoogleSignInButton from '../../components/GoogleSignInButton';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import { COLORS, FONTS, IMAGES } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';

const SignIn = ({ navigation }) => {
    const theme = useTheme();
    const { colors } = theme;
    const { signIn } = useAuth();
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSignIn = async () => {
        if (!identifier.trim() || !password) {
            setError('Enter your phone number or email and password.');
            return;
        }

        setError('');
        setIsSubmitting(true);
        try {
            await signIn({ identifier, password, keepSignedIn: true });
            navigation.reset({
                index: 0,
                routes: [{ name: 'DrawerNavigation' }],
            });
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputStyle = {
        backgroundColor: colors.input,
        color: colors.title,
        borderColor: colors.border,
        paddingLeft: 20,
        height: 48,
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps="handled"
            >
                <View style={{ ...GlobalStyleSheet.container, flex: 1 }}>
                    <View style={{ marginBottom: 30, alignItems: 'center', marginTop: 30 }}>
                        <Image
                            style={{ height: 51, width: 162, resizeMode: 'contain', marginBottom: 20 }}
                            source={theme.dark ? IMAGES.logowhite : IMAGES.logo}
                        />
                        <Text style={{ ...FONTS.h3, color: colors.title, marginBottom: 6 }}>
                            Welcome back
                        </Text>
                        <Text style={{ ...FONTS.font, color: colors.text, textAlign: 'center' }}>
                            Sign in to buy and sell with QOT Uganda.
                        </Text>
                    </View>

                    {Boolean(error) && (
                        <View style={{ backgroundColor: '#FDECEC', borderRadius: 10, padding: 12, marginBottom: 16 }}>
                            <Text style={{ ...FONTS.fontSm, color: COLORS.danger }}>{error}</Text>
                        </View>
                    )}

                    <View style={GlobalStyleSheet.inputGroup}>
                        <Text style={[GlobalStyleSheet.label, { color: colors.title }]}>Phone number or email</Text>
                        <TextInput
                            style={[GlobalStyleSheet.shadow2, inputStyle]}
                            value={identifier}
                            onChangeText={setIdentifier}
                            autoCapitalize="none"
                            autoCorrect={false}
                            keyboardType="email-address"
                            placeholder="e.g. 0700 000 001"
                            placeholderTextColor={colors.textLight}
                            returnKeyType="next"
                        />
                    </View>

                    <View style={GlobalStyleSheet.inputGroup}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Text style={[GlobalStyleSheet.label, { color: colors.title }]}>Password</Text>
                            <TouchableOpacity
                                onPress={() => navigation.navigate('ResetPassword')}
                                activeOpacity={0.75}
                                style={{ paddingVertical: 5, paddingLeft: 12, marginTop: -5 }}
                            >
                                <Text style={[FONTS.fontSm, FONTS.fontTitle, { color: COLORS.primary }]}>Forgot password?</Text>
                            </TouchableOpacity>
                        </View>
                        <View>
                            <TouchableOpacity
                                onPress={() => setShowPassword((value) => !value)}
                                style={{
                                    position: 'absolute',
                                    zIndex: 1,
                                    height: 48,
                                    width: 48,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    right: 0,
                                }}
                            >
                                <FeatherIcon
                                    name={showPassword ? 'eye' : 'eye-off'}
                                    color={colors.title}
                                    size={18}
                                />
                            </TouchableOpacity>
                            <TextInput
                                style={[GlobalStyleSheet.shadow2, inputStyle, { paddingRight: 48 }]}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                                placeholder="Enter your password"
                                placeholderTextColor={colors.textLight}
                                returnKeyType="done"
                                onSubmitEditing={handleSignIn}
                            />
                        </View>
                    </View>

                    <CustomButton
                        onPress={handleSignIn}
                        disabled={isSubmitting}
                        color={COLORS.primary}
                        title={isSubmitting ? 'Signing in...' : 'Sign in'}
                    />

                    <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 19 }}>
                        <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
                        <Text style={[FONTS.fontSm, { color: colors.text, marginHorizontal: 12 }]}>or</Text>
                        <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
                    </View>

                    <GoogleSignInButton navigation={navigation} />
                    <FacebookSignInButton navigation={navigation} />

                    <View style={{ marginTop: 22 }}>
                        <Text style={{ ...FONTS.font, color: colors.title, textAlign: 'center', marginBottom: 12 }}>
                            New to QOT Uganda?
                        </Text>
                        <CustomButton
                            onPress={() => navigation.navigate('SignUp')}
                            outline
                            color={COLORS.secondary}
                            title="Create an account"
                        />
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default SignIn;
