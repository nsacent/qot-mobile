import React, { useState } from 'react';
import {
    Image,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Checkbox } from 'react-native-paper';
import { useTheme } from '@react-navigation/native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import CustomButton from '../../components/CustomButton';
import GoogleSignInButton from '../../components/GoogleSignInButton';
import UgandanPhoneInput from '../../components/UgandanPhoneInput';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import { COLORS, FONTS, IMAGES } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { isValidUgandanMobile } from '../../utils/phoneNumbers';

const SignUp = ({ navigation }) => {
    const theme = useTheme();
    const { colors } = theme;
    const { signUp } = useAuth();
    const [form, setForm] = useState({
        fullName: '',
        phone: '',
        email: '',
        password: '',
        passwordConfirm: '',
    });
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const setField = (field) => (value) => {
        setForm((current) => ({ ...current, [field]: value }));
    };

    const handleSignUp = async () => {
        if (!form.fullName.trim() || !form.phone.trim() || !form.email.trim() || !form.password) {
            setError('Full name, phone number, email, and password are required.');
            return;
        }
        if (!isValidUgandanMobile(form.phone)) {
            setError('Enter a valid Ugandan mobile number beginning with +2567.');
            return;
        }
        if (form.password.length < 8) {
            setError('Your password must contain at least 8 characters.');
            return;
        }
        if (form.password !== form.passwordConfirm) {
            setError('The passwords do not match.');
            return;
        }
        if (!acceptedTerms) {
            setError('Please accept the Terms and Privacy Policy to continue.');
            return;
        }

        setError('');
        setIsSubmitting(true);
        try {
            const createdUser = await signUp(form);
            navigation.reset(createdUser.is_verified ? {
                index: 0,
                routes: [{ name: 'DrawerNavigation' }],
            } : {
                index: 1,
                routes: [
                    { name: 'DrawerNavigation' },
                    { name: 'VerifyAccount' },
                ],
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
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
            >
                <View style={{ ...GlobalStyleSheet.container, flex: 1 }}>
                    <View style={{ marginBottom: 24, alignItems: 'center', marginTop: 24 }}>
                        <Image
                            accessibilityLabel="QOT"
                            style={{ height: 54, width: 160, resizeMode: 'contain', marginBottom: 16 }}
                            source={IMAGES.qotLogo}
                        />
                        <Text style={{ ...FONTS.h3, marginBottom: 6, color: colors.title }}>
                            Create your QOT account
                        </Text>
                        <Text style={{ ...FONTS.font, color: colors.text, textAlign: 'center' }}>
                            Join Uganda's marketplace in a few seconds.
                        </Text>
                    </View>

                    {Boolean(error) && (
                        <View style={{ backgroundColor: '#FDECEC', borderRadius: 10, padding: 12, marginBottom: 16 }}>
                            <Text style={{ ...FONTS.fontSm, color: COLORS.danger }}>{error}</Text>
                        </View>
                    )}

                    {[
                        ['fullName', 'Full name', 'Your full name', 'default'],
                    ].map(([field, label, placeholder, keyboardType]) => (
                        <View key={field} style={GlobalStyleSheet.inputGroup}>
                            <Text style={[GlobalStyleSheet.label, { color: colors.title }]}>{label}</Text>
                            <TextInput
                                style={[GlobalStyleSheet.shadow2, inputStyle]}
                                value={form[field]}
                                onChangeText={setField(field)}
                                placeholder={placeholder}
                                placeholderTextColor={colors.textLight}
                                keyboardType={keyboardType}
                                autoCapitalize={field === 'email' ? 'none' : 'words'}
                                autoCorrect={false}
                            />
                        </View>
                    ))}

                    <View style={GlobalStyleSheet.inputGroup}>
                        <Text style={[GlobalStyleSheet.label, { color: colors.title }]}>Ugandan phone number</Text>
                        <UgandanPhoneInput value={form.phone} onChangeText={setField('phone')} returnKeyType="next" />
                        <Text style={[FONTS.fontXs, { color: colors.text, marginTop: 6 }]}>Only +2567 mobile numbers are accepted.</Text>
                    </View>

                    <View style={GlobalStyleSheet.inputGroup}>
                        <Text style={[GlobalStyleSheet.label, { color: colors.title }]}>Email address</Text>
                        <TextInput
                            style={[GlobalStyleSheet.shadow2, inputStyle]}
                            value={form.email}
                            onChangeText={setField('email')}
                            placeholder="you@example.com"
                            placeholderTextColor={colors.textLight}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    </View>

                    {[
                        ['password', 'Password'],
                        ['passwordConfirm', 'Confirm password'],
                    ].map(([field, label]) => (
                        <View key={field} style={GlobalStyleSheet.inputGroup}>
                            <Text style={[GlobalStyleSheet.label, { color: colors.title }]}>{label}</Text>
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
                                    value={form[field]}
                                    onChangeText={setField(field)}
                                    secureTextEntry={!showPassword}
                                    placeholder={field === 'password' ? 'At least 8 characters' : 'Repeat your password'}
                                    placeholderTextColor={colors.textLight}
                                />
                            </View>
                        </View>
                    ))}

                    <Checkbox.Item
                        onPress={() => setAcceptedTerms((value) => !value)}
                        position="leading"
                        label="I agree to the Terms and Privacy Policy"
                        color={COLORS.primary}
                        uncheckedColor={colors.textLight}
                        status={acceptedTerms ? 'checked' : 'unchecked'}
                        style={{ paddingHorizontal: 0, paddingVertical: 5, marginBottom: 12 }}
                        labelStyle={{ ...FONTS.font, color: colors.title, textAlign: 'left' }}
                    />

                    <CustomButton
                        onPress={handleSignUp}
                        disabled={isSubmitting}
                        color={COLORS.primary}
                        title={isSubmitting ? 'Creating account...' : 'Create account'}
                    />

                    <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 19 }}>
                        <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
                        <Text style={[FONTS.fontSm, { color: colors.text, marginHorizontal: 12 }]}>or</Text>
                        <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
                    </View>

                    <GoogleSignInButton navigation={navigation} mode="sign-up" />
                    <Text style={[FONTS.fontXs, { color: colors.text, textAlign: 'center', lineHeight: 17, marginTop: 10 }] }>
                        By continuing with Google, you agree to QOT's Terms and Privacy Policy.
                    </Text>

                    <View style={{ flexDirection: 'row', marginTop: 18, marginBottom: 24, justifyContent: 'center' }}>
                        <Text style={{ ...FONTS.font, color: colors.text, marginRight: 5 }}>
                            Already have an account?
                        </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
                            <Text style={{ ...FONTS.font, color: COLORS.primary }}>Sign in</Text>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity onPress={() => navigation.reset({ index: 0, routes: [{ name: 'DrawerNavigation' }] })} style={{ minHeight: 44, marginTop: -18, marginBottom: 20, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={[FONTS.fontSm, FONTS.fontTitle, { color: COLORS.primary }]}>Browse QOT without signing in</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default SignUp;
