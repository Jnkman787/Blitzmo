import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, Platform, Pressable, ScrollView, Keyboard } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as NavigationBar from 'expo-navigation-bar';
import Colors from '../../../utils/Colors';
import NetInfo from '@react-native-community/netinfo';

import { updatePassword, updateEmail, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../../../../firebase-config';

import LineStringInput from '../../../components/input/LineStringInput';

import { Octicons, AntDesign } from '@expo/vector-icons';

const AccountUpdateScreen = ({ navigation, route }) => {
    const { element, value } = route.params;     // <-- check which account element is getting updated
    const [accountDetail, setAccountDetail] = useState(value);
    const [currentPassword, setCurrentPassword] = useState('');
    const [warning, setWarning] = useState(null);
    const [passwordWarning, setPasswordWarning] = useState(null);
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const [isConnected, setIsConnected] = useState(false);

    useFocusEffect(
        React.useCallback(() => {
            setTimeout(() => {
                if (Platform.OS === 'android') {
                    NavigationBar.setBackgroundColorAsync('white');
                    NavigationBar.setButtonStyleAsync('dark');
                }
            }, 100);
        }, [])
    );

    useEffect(() => {
        // setup a listener for checking the user's internet connection
        const connectionListener = NetInfo.addEventListener(state => {
            setIsConnected(state.isConnected);
        });

        const keyboardShowListener = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
        const keyboardHideListener = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));

        return () => {
            connectionListener;
            keyboardShowListener.remove();
            keyboardHideListener.remove();
        };
    }, []);

    useEffect(() => {
        setWarning(null);
        setPasswordWarning(null);
    }, [accountDetail, currentPassword]);

    // check if the selected username already exists in the profiles collection
    async function checkUsernameList (lowerCaseUsername) {
        if (!isConnected) {
            setWarning('No internet connection');
            return;
        }
        
        // define a query for documents with the field (username) with the same value as the entered username
        const q = query(collection(db, 'users'), where('username', '==', lowerCaseUsername));

        // execute the query
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            // username isn't yet taken, update username
            const docRef = doc(db, 'users', auth.currentUser.uid);
            await updateDoc(docRef, { username: lowerCaseUsername });
            navigation.goBack();
        } else {
            // username is already taken
            setWarning('Username is already taken');
        }
    };

    // check if username meets criteria
    function checkUsername () {
        const hasSpecialCharacters = /[^a-zA-Z0-9_.]/.test(accountDetail);

        if (hasSpecialCharacters) {
            setWarning('Only letters, numbers, underscores, and periods are allowed');
        } else if (accountDetail.length < 2) {
            setWarning('Include at least 2 characters in your username');
        } else {
            let lowerCaseUsername = accountDetail.toLowerCase();
            setAccountDetail(lowerCaseUsername);
            checkUsernameList(lowerCaseUsername);
        }
    };

    // update user's email in both authentication and firestore storage
    async function updateUserEmail () {
        const docRef = doc(db, 'users', auth.currentUser.uid);
        await updateDoc(docRef, { email: accountDetail });

        updateEmail(auth.currentUser, accountDetail)
        .then(() => {
            // email has been updated
            navigation.goBack();
        })
        .catch(error => console.log(error))
    };

    // check if the selected email already exists in the users collection
    async function checkEmailList () {
        if (!isConnected) {
            setWarning('No internet connection');
            return;
        }

        const q = query(collection(db, 'users'), where('email', '==', accountDetail));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {  // email isn't yet taken
            const credential = EmailAuthProvider.credential(
                auth.currentUser.email,
                currentPassword
            );

            // re-authenticate the user/check if they entered the correct password
            reauthenticateWithCredential(auth.currentUser, credential)
            .then(() => {
                updateUserEmail();
            }).catch(error => {
                console.log(error);
                // user likely entered wrong password
                setPasswordWarning('Incorrect password');
            })
        } else {
            // email is already being used
            setWarning('Email is already in use');
        }
    };

    // check if the user entered a valid email
    function checkEmail () {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        const check = re.test(String(accountDetail).toLowerCase());

        if (check === false) {
            setWarning('Please enter a valid email');
        } else if (check === true) {
            checkEmailList();
        }
    };

    // check if the password uses at least 1 letter & 1 number
    async function checkPassword () {
        const hasLetter = /[a-zA-Z]/.test(accountDetail);
        const hasNumber = /\d/.test(accountDetail);

        if (!hasLetter) {
            setWarning('Include at least 1 letter in your password');
        } else if (!hasNumber) {
            setWarning('Include at least 1 number in your password');
        } else {
            if (!isConnected) {
                setWarning('No internet connection');
                return;
            }

            const credential = EmailAuthProvider.credential(
                auth.currentUser.email,
                currentPassword
            );

            // re-authenticate the user/check if they entered the correct password
            reauthenticateWithCredential(auth.currentUser, credential)
            .then(() => {
                // update user's password
                updatePassword(auth.currentUser, accountDetail)
                .then(() => {
                    // password has been updated
                    navigation.goBack();
                })
                .catch(error => console.log(error))
            }).catch(error => {
                console.log(error);
                // user likely entered wrong password
                setPasswordWarning('Incorrect password');
            })
        }
    };

    const WarningText = () => {
        if (warning) {
            return (
                <View style={{ marginTop: 15, marginLeft: 70, marginRight: 35, flexDirection: 'row', alignItems: 'center' }}>
                    <AntDesign name='warning' size={15} color='#dd2334'/>
                    <Text style={styles.warningText}>{warning}</Text>
                </View>
            );
        }
    };

    // update instructions based on the element being updated
    const InstructionsText = () => {
        if (element === 'Username') {
            return (
                <View style={{ flex: 1 }}>
                    <Text style={styles.instructionsText}>Your username is exclusively yours and can be modified at any time.</Text>
                    <LineStringInput text={accountDetail} setText={setAccountDetail} label='Username' topMargin={40} length={20} auto={false} warning={warning}/>
                    <Text style={[styles.countText, { color: warning ? '#dd2334' : Colors.mediumGrey }]}>{accountDetail.length}/20</Text>
                    {WarningText()}

                    <Text style={[styles.instructionsText, { marginTop: 30 }]}>Usernames must be 20 characters or less and contain only letters, numbers, underscores, and periods.</Text>
                </View>
            );
        } else if (element === 'Password') {
            return (
                <View style={{ flex: 1 }}>
                    <Text style={styles.instructionsText}>Please enter your current password and your new password.</Text>
                    <View style={{ paddingRight: 30, marginTop: 40, flexDirection: 'row' }}>
                        <LineStringInput text={currentPassword} setText={setCurrentPassword} label='Current Password' topMargin={0} auto={false} warning={passwordWarning} showPassword={true}/>
                    </View>
                    {passwordWarning && <View style={{ marginTop: 15, marginLeft: 70, marginRight: 35, flexDirection: 'row', alignItems: 'center' }}>
                        <AntDesign name='warning' size={15} color='#dd2334'/>
                        <Text style={styles.warningText}>{passwordWarning}</Text>
                    </View>}

                    <View style={{ paddingRight: 30, marginTop: 40, flexDirection: 'row' }}>
                        <LineStringInput text={accountDetail} setText={setAccountDetail} label='New Password' topMargin={0} auto={false} warning={warning} showPassword={true}/>
                    </View>
                    {WarningText()}

                    <Text style={[styles.instructionsText, { marginTop: 30 }]}>Your password must have at least 8 characters {'('}include letters and numbers{')'}.</Text>
                </View>
            );
        } else if (element === 'Email') {
            return (
                <View style={{ flex: 1 }}>
                    <Text style={styles.instructionsText}>This email is linked to your account and can be modified at any time.</Text>
                    <LineStringInput text={accountDetail} setText={setAccountDetail} label='Email' topMargin={40} auto={false} warning={warning}/>
                    {WarningText()}

                    <View style={{ paddingRight: 30, marginTop: 40, flexDirection: 'row' }}>
                        <LineStringInput text={currentPassword} setText={setCurrentPassword} label='Current Password' topMargin={0} auto={false} warning={passwordWarning} showPassword={true}/>
                    </View>
                    {passwordWarning && <View style={{ marginTop: 15, marginLeft: 70, marginRight: 35, flexDirection: 'row', alignItems: 'center' }}>
                        <AntDesign name='warning' size={15} color='#dd2334'/>
                        <Text style={styles.warningText}>{passwordWarning}</Text>
                    </View>}

                    <Text style={[styles.instructionsText, { marginTop: 30 }]}>Please enter your current password to validate a change of email.</Text>
                </View>
            );
        }
    };

    const UpdateButton = () => {
        if (element === 'Username' && accountDetail.length > 0 && accountDetail !== value) {
            return (
                <Pressable
                    onPress={() => checkUsername()}
                    style={({pressed}) => [styles.buttonContainer, { opacity: pressed ? 0.3 : 1 }]}
                >
                    <Text style={styles.buttonText}>Update</Text>
                </Pressable>
            );
        } else if (element === 'Email' && accountDetail.length > 0 && accountDetail !== value && currentPassword.length > 0) {
            return (
                <Pressable
                    onPress={() => checkEmail()}
                    style={({pressed}) => [styles.buttonContainer, { opacity: pressed ? 0.3 : 1 }]}
                >
                    <Text style={styles.buttonText}>Update</Text>
                </Pressable>
            );
        } else if (element === 'Password' && accountDetail.length > 7 && currentPassword.length > 0) {
            return (
                <Pressable
                    onPress={() => checkPassword()}
                    style={({pressed}) => [styles.buttonContainer, { opacity: pressed ? 0.3 : 1 }]}
                >
                    <Text style={styles.buttonText}>Update</Text>
                </Pressable>
            );
        } else {
            return (
                <Pressable
                    style={[styles.buttonContainer, { backgroundColor: '#e6e6e6' }]}
                >
                    <Text style={[styles.buttonText, { color: Colors.mediumGrey }]}>Update</Text>
                </Pressable>
            );
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: 'white',
            paddingTop: Platform.OS === 'ios' ? 44 : 0,
            paddingBottom: Platform.OS === 'ios' ? 34.5 : 0
        }}>
            <StatusBar barStyle={'dark-content'} translucent backgroundColor={'transparent'}/>
            {Platform.OS === 'android' && <View style={{ height: StatusBar.currentHeight }}/>}
            <View style={styles.screen}>
                <View style={{ height: Platform.OS === 'ios' ? 45 : 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                    <Pressable
                        onPress={() => navigation.goBack()}
                        style={({pressed}) => [{ position: 'absolute', left: Platform.OS === 'android' ? 5 : 9, opacity: pressed ? 0.2 : 1,
                            paddingVertical: Platform.OS === 'android' ? 12 : 5,
                            paddingHorizontal: Platform.OS === 'android' ? 14 : 12
                        }]}
                    >
                        <Octicons
                            name={Platform.OS === 'android' ? 'arrow-left' : 'chevron-left'}
                            size={Platform.OS === 'android' ? 25 : 33}
                            color='black'
                        />
                    </Pressable>
                    <Text style={{ fontSize: 20, fontFamily: 'proxima-nova-semi' }}>{element}</Text>
                </View>

                <ScrollView contentContainerStyle={{ flex: 1, justifyContent: 'space-between' }} bounces={false}>
                    {InstructionsText()}
                    
                    {Platform.OS === 'android' && !keyboardVisible && <View style={{ height: 90, backgroundColor: 'white' }}>
                        <View style={{ height: 1, backgroundColor: Colors.border }}/>
                        {UpdateButton()}
                    </View>}
                    {Platform.OS === 'ios' && <View style={{ height: 90, backgroundColor: 'white' }}>
                        <View style={{ height: 1, backgroundColor: Colors.border }}/>
                        {UpdateButton()}
                    </View>}
                </ScrollView>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: 'white'
    },
    instructionsText: {
        fontFamily: 'proxima-nova-reg',
        fontSize: 16,
        color: Colors.darkGrey,
        marginHorizontal: 30,
        marginTop: 20
    },
    countText: {
        fontFamily: 'proxima-nova-reg',
        fontSize: 15,
        marginLeft: 70,
        marginTop: 15
    },
    buttonContainer: {
        width: 200,
        height: 55,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        backgroundColor: Colors.theme,
        marginTop: 20
    },
    buttonText: {
        fontFamily: 'proxima-nova-semi',
        fontSize: 18,
        color: 'white'
    },
    warningText: {
        fontFamily: 'proxima-nova-reg',
        fontSize: 14,
        color: '#dd2334',
        marginLeft: 10
    }
});

export default AccountUpdateScreen;