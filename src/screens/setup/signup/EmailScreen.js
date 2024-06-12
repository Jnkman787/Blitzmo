import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, Platform, Pressable } from 'react-native';
import Colors from '../../../utils/Colors';
import NetInfo from '@react-native-community/netinfo';

import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../../firebase-config';

import LineStringInput from '../../../components/input/LineStringInput';

import { Octicons, AntDesign } from '@expo/vector-icons';

// ** In my terms of service, I should state that all decisions made by the user to complete the challenge
//    cannot be imposed on my app/company. My challenges are very broad and can be completed in more than 1 way, 
//    and therefore, no specific instructions are given for any challenge on how it must be completed. For this
//    reason, if a crime is commited by a user while trying to complete the challenge, it is entirely their fault.

const EmailScreen = ({ navigation, route }) => {
    const { name } = route.params;
    const [email, setEmail] = useState('');
    const [warning, setWarning] = useState(null);
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
    }, [email]);

    // check if the selected email already exists in the users collection
    async function checkEmailList () {
        // check if the user has internet connection
        if (!isConnected) {
            setWarning('No internet connection');
            return;
        }

        const q = query(collection(db, 'users'), where('email', '==', email));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            // email isn't yet in use
            navigation.navigate('SetupStack', { screen: 'Password', params: { name, email } });
        } else {
            // email is already being used
            setWarning('Email is already in use');
        }
    };

    // check if the user entered a valid email
    function checkEmail () {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        const check = re.test(String(email).toLowerCase());

        if (check === false) {
            setWarning('Please enter a valid email');
        } else if (check === true) {
            checkEmailList();
        }
    };

    const NextButton = () => {
        if (email.length > 0) {
            return (
                <Pressable
                    onPress={() => checkEmail()}
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

                <Text style={styles.titleText}>What's your email?</Text>
                <LineStringInput text={email} setText={setEmail} label='Email' topMargin={50} auto={true} warning={warning}/>

                {warning && <View style={{ marginTop: 15, marginLeft: 70, marginRight: 35, flexDirection: 'row', alignItems: 'center' }}>
                    <AntDesign name='warning' size={15} color='#dd2334'/>
                    <Text style={styles.warningText}>{warning}</Text>
                </View>}
                
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: 30, marginTop: 30 }}>
                    <Text style={styles.legalText}>By continuing, you agree to Blitzmo's </Text>
                    <Pressable
                        //onPress={() => }
                        style={({pressed}) => [{ opacity: pressed ? 0.2 : 1 }]}
                    >
                        <Text style={{ fontFamily: 'proxima-nova-semi', fontSize: 16, color: 'black' }}>Terms of Service</Text>
                    </Pressable>
                    <Text style={styles.legalText}> and </Text>
                    <Pressable
                        //onPress={() => }
                        style={({pressed}) => [{ opacity: pressed ? 0.2 : 1 }]}
                    >
                        <Text style={{ fontFamily: 'proxima-nova-semi', fontSize: 16, color: 'black' }}>Privacy Policy</Text>
                    </Pressable>
                    <Text style={styles.legalText}>.</Text>
                </View>

                {NextButton()}
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
    legalText: {
        fontFamily: 'proxima-nova-reg',
        fontSize: 16,
        color: Colors.darkGrey
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
    }
});

export default EmailScreen;