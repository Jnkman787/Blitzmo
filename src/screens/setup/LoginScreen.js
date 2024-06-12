import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Platform, StatusBar, Animated, TextInput } from 'react-native';
import { width } from '../../utils/Scaling';
import Modal from 'react-native-modal';
import Colors from '../../utils/Colors';
import NetInfo from '@react-native-community/netinfo';

import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../../../firebase-config';

import LineStringInput from '../../components/input/LineStringInput';

import { AntDesign, Octicons } from '@expo/vector-icons';

// ** replace the temp_logo with the official logo later

// ** maybe give users a max number of attempts at logging in

// ** try finding a way to let users also login using their usernames

const LoginScreen = ({ navigation }) => {
    const position = useRef(new Animated.Value(0)).current;
    const position2 = useRef(new Animated.Value(0)).current;
    const position3 = useRef(new Animated.Value(0)).current;
    const position4 = useRef(new Animated.Value(0)).current;
    const opacity = useRef(new Animated.Value(0)).current;
    const opacity2 = useRef(new Animated.Value(0)).current;

    const [modalVisible, setModalVisible] = useState(false);
    const [isConnected, setIsConnected] = useState(false);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [forgottenEmail, setForgottenEmail] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [warning, setWarning] = useState(null);
    const [emailWarning, setEmailWarning] = useState(null);
    const [passwordWarning, setPasswordWarning] = useState(null);
    const [modalWarning, setModalWarning] = useState(null);

    const translateY = position.interpolate({
        inputRange: [0, 1],
        outputRange: [100, 0],
        extrapolate: 'clamp'
    });

    const translateLogo = position.interpolate({
        inputRange: [0, 1],
        outputRange: [width, 0],
        extrapolate: 'clamp'
    });

    const translateTitle = position2.interpolate({
        inputRange: [0, 1],
        outputRange: [width, 0],
        extrapolate: 'clamp'
    });

    const translateInput = position3.interpolate({
        inputRange: [0, 1],
        outputRange: [width, 0],
        extrapolate: 'clamp'
    });

    const translateInput2 = position4.interpolate({
        inputRange: [0, 1],
        outputRange: [width, 0],
        extrapolate: 'clamp'
    });

    const fade = opacity.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1]
    });

    const fade2 = opacity2.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1]
    });

    useEffect(() => {
        openingAnimations();

        // setup a listener for checking the user's internet connection
        const connectionListener = NetInfo.addEventListener(state => {
            setIsConnected(state.isConnected);
        });

        return connectionListener;
    }, []);

    useEffect(() => {
        if (Platform.OS === 'android') {
            if (modalVisible) {
                StatusBar.setBackgroundColor('#737373', true);
            } else {
                StatusBar.setBackgroundColor('transparent');
            }
        }
    }, [modalVisible]);

    useEffect(() => {
        setWarning(null);
        setEmailWarning(null);
    }, [email]);

    useEffect(() => {
        setWarning(null);
        setPasswordWarning(null);
    }, [password]);

    useEffect(() => {
        setModalWarning(null);
    }, [forgottenEmail]);

    function openingAnimations () {
        Animated.parallel([
            Animated.timing(position, {
                toValue: 1,
                duration: 225,
                useNativeDriver: false
            }),
            Animated.timing(position2, {
                toValue: 1,
                delay: 50,
                duration: 225,
                useNativeDriver: false
            }),
            Animated.timing(position3, {
                toValue: 1,
                delay: 100,
                duration: 225,
                useNativeDriver: false
            }),
            Animated.timing(position4, {
                toValue: 1,
                delay: 150,
                duration: 225,
                useNativeDriver: false
            }),
            Animated.timing(opacity, {
                toValue: 1,
                duration: 250,
                useNativeDriver: false
            }),
            Animated.timing(opacity2, {
                toValue: 1,
                duration: 375,
                useNativeDriver: false
            })
        ]).start();
    };

    function closingAnimations () {
        Animated.parallel([
            Animated.timing(position, {
                toValue: 0,
                duration: 225,
                useNativeDriver: false
            }),
            Animated.timing(position2, {
                toValue: 0,
                delay: 50,
                duration: 225,
                useNativeDriver: false
            }),
            Animated.timing(position3, {
                toValue: 0,
                delay: 100,
                duration: 225,
                useNativeDriver: false
            }),
            Animated.timing(position4, {
                toValue: 0,
                delay: 150,
                duration: 225,
                useNativeDriver: false
            }),
            Animated.timing(opacity, {
                toValue: 0,
                duration: 250,
                useNativeDriver: false
            }),
            Animated.timing(opacity2, {
                toValue: 0,
                duration: 375,
                useNativeDriver: false
            })
        ]).start();

        navigation.goBack();
    };

    async function resetPassword () {
        // check if the user has internet connection
        if (!isConnected) {
            setModalWarning('No internet connection');
            return;
        }

        // check if email is being used by any users
        const q = query(collection(db, 'users'), where('email', '==', forgottenEmail));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            setModalWarning('No users are using this email');
        } else {
            sendPasswordResetEmail(auth, forgottenEmail)
            .then(() => {
                setModalVisible(false);
            }).catch(error => console.log(error))
        }
    };

    function loginUser () {
        if (email.length == 0) {
            setEmailWarning('Please enter an email');
        }
        
        if (password.length == 0) {
            setPasswordWarning('Please enter a password');
        }

        if (email.length > 0 && password.length > 0) {
            if (!isConnected) {
                setWarning('No internet connection');
                return;
            }

            signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // signed in
                setEmail('');
                setPassword('');
                navigation.navigate('Tab', { screen: 'Home' });
            }).catch((error) => {
                console.log(error);
                setWarning('Invalid email or password');
            })
        }
    };

    const PasswordDisplayButton = () => {
        if (showPassword) {
            return (
                <Pressable
                    onPress={() => setShowPassword(false)}
                    style={{ marginRight: 16, marginLeft: 12, width: 30, height: 30, alignItems: 'center', top: 1 }}
                >
                    <Octicons name='eye' size={24} color={Colors.darkGrey}/>
                </Pressable>
            );
        } else {
            return (
                <Pressable
                    onPress={() => setShowPassword(true)}
                    style={{ marginRight: 16, marginLeft: 12, width: 30, height: 30, alignItems: 'center', top: 1 }}
                >
                    <Octicons name='eye-closed' size={24} color={Colors.darkGrey}/>
                </Pressable>
            );
        }
    };

    const ResetPasswordButton = () => {
        if (forgottenEmail.length > 0) {
            return (
                <Pressable
                    onPress={() => resetPassword()}
                    style={({pressed}) => [styles.buttonContainer, { opacity: pressed ? 0.3 : 1, marginBottom: 0, marginTop: modalWarning ? 20 : 30 }]}
                >
                    <Text style={styles.buttonText}>Reset Password</Text>
                </Pressable>
            );
        } else {
            return (
                <Pressable
                    style={[styles.buttonContainer, { marginBottom: 0, backgroundColor: '#e6e6e6' }]}
                >
                    <Text style={[styles.buttonText, { color: Colors.mediumGrey }]}>Reset Password</Text>
                </Pressable>
            );
        }
    };

    // height: value (Android) vs flex (iOS)
    // height: width > 550 ? 250 : 190 vs flex: 0.75
    // height: width > 550 ? 417 : 319 vs flex: 1.25
    // height: width > 550 ? 285 : 217 vs flex: 0.85

    return (
        <View style={{ flex: 1, backgroundColor: 'white',
            paddingTop: Platform.OS === 'ios' ? 44 : 0,
            paddingBottom: Platform.OS === 'ios' ? 34.5 : 0
        }}>
            <StatusBar barStyle={'dark-content'} translucent backgroundColor={'transparent'}/>
            {Platform.OS === 'android' && <View style={{ height: StatusBar.currentHeight }}/>}
            <View style={styles.screen}>
                <View style={{ flex: Platform.OS === 'ios' ? 0.75 : null,
                    height: Platform.OS === 'android' ? width > 550 ? 250 : 190 : null,
                    alignItems: 'center', justifyContent: 'center'
                }}>
                    <Animated.Image
                        source={require('../../assets/images/temp_logo.png')}
                        style={{ width: 100, height: 100, top: 30, transform: [{ translateX: translateLogo }], opacity: fade }}
                    />
                </View>

                <View style={{ flex: Platform.OS === 'ios' ? 1.25 : null,
                    height: Platform.OS === 'android' ? width > 550 ? 417 : 319 : null,
                    justifyContent: 'center'
                }}>
                    <Animated.Text style={[styles.titleText, { transform: [{ translateX: translateTitle }], opacity: fade }]}>Log in</Animated.Text>
                    <Animated.View style={{ transform: [{ translateX: translateInput }], opacity: fade2 }}>
                        <LineStringInput text={email} setText={setEmail} label='Email' topMargin={40} warning={warning ? warning : emailWarning}/>
                        {emailWarning && <View style={{ marginTop: 15, marginLeft: 70, flexDirection: 'row', alignItems: 'center' }}>
                            <AntDesign name='warning' size={15} color='#dd2334'/>
                            <Text style={styles.warningText}>{emailWarning}</Text>
                        </View>}
                    </Animated.View>
                    <Animated.View style={{ transform: [{ translateX: translateInput2 }], opacity: fade2 }}>
                        <View style={{ flexDirection: 'row', marginTop: 30 }}>
                            <LineStringInput text={password} setText={setPassword} label='Password' topMargin={0} showPassword={showPassword} warning={warning ? warning : passwordWarning}/>
                            {PasswordDisplayButton()}
                        </View>
                        {passwordWarning && <View style={{ marginTop: 15, marginLeft: 70, flexDirection: 'row', alignItems: 'center' }}>
                            <AntDesign name='warning' size={15} color='#dd2334'/>
                            <Text style={styles.warningText}>{passwordWarning}</Text>
                        </View>}
                        {warning && <View style={{ marginTop: 15, marginLeft: 70, flexDirection: 'row', alignItems: 'center' }}>
                            <AntDesign name='warning' size={15} color='#dd2334'/>
                            <Text style={styles.warningText}>{warning}</Text>
                        </View>}
                        <Pressable
                            onPress={() => setModalVisible(true)}
                            style={({pressed}) => [{ marginTop: 20, marginLeft: 60, alignSelf: 'flex-start', padding: 10, opacity: pressed ? 0.2 : 1 }]}
                        >
                            <Text style={{ fontFamily: 'proxima-nova-semi', fontSize: 16 }}>Forgot password?</Text>
                        </Pressable>
                    </Animated.View>
                </View>

                <View style={{ flex: Platform.OS === 'ios' ? 0.85 : null,
                    height: Platform.OS === 'android' ? width > 550 ? 285 : 217 : null,
                    justifyContent: 'flex-end', alignItems: 'center'
                }}>
                    <Pressable
                        onPress={() => loginUser()}
                        style={({pressed}) => [styles.buttonContainer, { opacity: pressed ? 0.3 : 1 }]}
                    >
                        <Text style={styles.buttonText}>Log in</Text>
                    </Pressable>
                    <Animated.View style={{ transform: [{ translateY }] }}>
                        <Pressable
                            onPress={() => closingAnimations()}
                            style={{ marginBottom: 30, padding: 5 }}
                        >
                            <AntDesign name='close' size={32} color='black'/>
                        </Pressable>
                    </Animated.View>
                </View>

                <Modal
                    isVisible={modalVisible}
                    onBackButtonPress={() => {
                        setModalVisible(false);
                        setForgottenEmail('');
                    }}
                    onBackdropPress={() => {
                        setModalVisible(false);
                        setForgottenEmail('');
                    }}
                    backdropTransitionInTiming={400}
                    backdropTransitionOutTiming={100}
                    backdropOpacity={0.55}
                    useNativeDriverForBackdrop={true}
                >
                    <View style={[styles.modalContainer, { height: modalWarning ? 370 : 360 }]}>
                        <Text style={{ fontFamily: 'proxima-nova-semi', fontSize: 22 }}>Reset Your Password</Text>
                        <Text style={styles.instructionsText}>Lost your password? Please enter your email address. You will receive a link to create a new password via email.</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                value={forgottenEmail}
                                onChangeText={setForgottenEmail}
                                placeholder='Email'
                                placeholderTextColor={Colors.mediumGrey}
                                selectionColor={Colors.theme}
                                keyboardType='email-address'
                                autoCorrect={false}
                                spellCheck={false}
                                autoCapitalize='none'
                                style={styles.inputText}
                            />
                        </View>
                        {modalWarning && <View style={{ marginTop: 15, flexDirection: 'row', alignItems: 'center' }}>
                            <AntDesign name='warning' size={15} color='#dd2334'/>
                            <Text style={styles.warningText}>{modalWarning}</Text>
                        </View>}
                        {ResetPasswordButton()}
                    </View>
                </Modal>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: 'white'
    },
    titleText: {
        fontFamily: 'proxima-nova-bold',
        fontSize: 32,
        color: 'black',
        marginLeft: 30
    },
    buttonContainer: {
        width: 200,
        height: 55,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        backgroundColor: Colors.theme,
        marginTop: 30,
        marginBottom: 62.5
    },
    buttonText: {
        fontFamily: 'proxima-nova-semi',
        fontSize: 18,
        color: 'white'
    },
    modalContainer: {
        borderRadius: 20,
        backgroundColor: 'white',
        //height: 360,
        width: 300,
        alignSelf: 'center',
        alignItems: 'center',
        paddingTop: 30
    },
    instructionsText: {
        width: '100%',
        marginTop: 25,
        paddingHorizontal: 30,
        fontFamily: 'proxima-nova-reg',
        fontSize: 17,
        textAlign: 'center'
    },
    inputContainer: {
        marginTop: 30,
        height: 50,
        borderColor: Colors.mediumGrey,
        backgroundColor: 'white',
        borderRadius: 15,
        borderWidth: 1,
        paddingHorizontal: 15,
        width: '85%'
    },
    inputText: {
        flex: 1,
        fontFamily: 'proxima-nova-reg',
        fontSize: 17
    },
    warningText: {
        fontFamily: 'proxima-nova-reg',
        fontSize: 14,
        color: '#dd2334',
        marginLeft: 10
    }
});

export default LoginScreen;