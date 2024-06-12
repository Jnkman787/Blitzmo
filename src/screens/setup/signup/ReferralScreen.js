import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, Platform, Pressable, ActivityIndicator } from 'react-native';
import Colors from '../../../utils/Colors';
import NetInfo from '@react-native-community/netinfo';

import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../../../firebase-config';

import LineStringInput from '../../../components/input/LineStringInput';

import { Octicons, AntDesign } from '@expo/vector-icons';

// ** check if the entered username for referral exists when the user taps Next

// ** add text/instructions that informs the user that they will receive benefits/bonus points
//    by inputting a fellow user's username (increasing the chances of them doing it)

// ** decide later if I should make a tutorial screen

const ReferralScreen = ({ navigation, route }) => {
    const { name, email, password, username, notificationToken } = route.params;

    const [referralUsername, setReferralUsername] = useState('');
    const [warning, setWarning] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // setup a listener for checking the user's internet connection
        const connectionListener = NetInfo.addEventListener(state => {
            setIsConnected(state.isConnected);
        });

        return connectionListener;
    }, []);

    useEffect(() => {
        setWarning(null);
    }, [referralUsername]);

    function registerUser () {
        // check if the user has internet connection
        if (!isConnected) {
            setWarning('No internet connection');
            return;
        }

        setProcessing(true);

        createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // update profile display name with user's name
            updateProfile(auth.currentUser, { displayName: name })
            .then(() => {
                // add profile document to my profile collection
                const docData = {
                    userID: auth.currentUser.uid,
                    name: name,
                    username: username,
                    email: email,
                    profileImageURL: null,
                    notificationToken: notificationToken,
                    bio: '',
                    location: '',
                    friendCount: 0,
                    postCount: 0
                    //timeZone: <-- ?? include Firebase as well ??
                };

                setDoc(doc(db, 'users', auth.currentUser.uid), docData)
                .then(() => {
                    navigation.navigate('Tab', { screen: 'UserProfile' });  // <-- ** maybe navigate to HomeScreen and display swipe instructions (similar to Tinder)
                }).catch(error => console.log(error))
            }).catch(error => console.log(error))
        }).catch(error => console.log(error))
    };

    function checkUsername () {
        // modify function to check username bank later
        setWarning('Username does not exist');
    };

    const NextButton = () => {
        if (referralUsername.length > 0) {
            return (
                <Pressable
                    onPress={() => checkUsername()}
                    style={({pressed}) => [styles.buttonContainer, { opacity: pressed ? 0.3 : 1 }]}
                >
                    <Text style={styles.buttonText}>Next</Text>
                </Pressable>
            );
        } else {
            return (
                <Pressable
                    style={[styles.buttonContainer, { backgroundColor: '#e6e6e6' }]}
                >
                    <Text style={[styles.buttonText, { color: Colors.mediumGrey }]}>Next</Text>
                </Pressable>
            );
        }
    };

    // processing registration of new user
    if (processing) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator
                    size={Platform.OS === 'android' ? 60 : 'large'}
                    color={Colors.theme}
                />
            </View>
        );
    }

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
                </View>

                <Text style={styles.titleText}>Invited by a friend?</Text>
                <Text style={styles.instructionsText}>Were you referred to this app by someone? If yes, input their username here.</Text>
                <LineStringInput text={referralUsername} setText={setReferralUsername} label='Username' topMargin={40} length={20} auto={false} warning={warning}/>

                {warning && <View style={{ marginTop: 15, marginLeft: 70, marginRight: 35, flexDirection: 'row', alignItems: 'center' }}>
                    <AntDesign name='warning' size={15} color='#dd2334'/>
                    <Text style={styles.warningText}>{warning}</Text>
                </View>}

                {NextButton()}

                <Pressable
                    onPress={() => registerUser()}
                    style={({pressed}) => [styles.buttonContainer, {
                        opacity: pressed ? 0.3 : 1, marginTop: 20, backgroundColor: 'white', borderColor: 'black', borderWidth: 1
                    }]}
                >
                    <Text style={[styles.buttonText, { color: 'black' }]}>Skip</Text>
                </Pressable>
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
        marginLeft: Platform.OS === 'android' ? 17 : 18,
        marginTop: Platform.OS === 'ios' ? 10 : 0
    },
    instructionsText: {
        fontFamily: 'proxima-nova-reg',
        fontSize: 16,
        color: Colors.darkGrey,
        marginHorizontal: 30,
        marginTop: 20
    },
    buttonContainer: {
        width: 200,
        height: 55,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        backgroundColor: Colors.theme,
        marginTop: 40
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
    },
    loadingContainer: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        paddingBottom: 60,
        zIndex: 2,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center'
    }
});

export default ReferralScreen;