import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, Platform, Pressable } from 'react-native';
import Colors from '../../../utils/Colors';
import NetInfo from '@react-native-community/netinfo';

import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../../firebase-config';

import LineStringInput from '../../../components/input/LineStringInput';

import { Octicons, AntDesign } from '@expo/vector-icons';

const UsernameScreen = ({ navigation, route }) => {
    const { name, email, password } = route.params;
    const [username, setUsername] = useState('');
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
    }, [username]);

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
            // username isn't yet taken
            navigation.navigate('SetupStack', { screen: 'Notifications', params: { name, email, password, username: lowerCaseUsername } });
        } else {
            // username is already taken
            setWarning('Username is already taken');
        }
    };

    // check if username meets criteria
    function checkUsername () {
        const hasSpecialCharacters = /[^a-zA-Z0-9_.]/.test(username);

        if (hasSpecialCharacters) {
            setWarning('Only letters, numbers, underscores, and periods are allowed');
        } else if (username.length < 2) {
            setWarning('Include at least 2 characters in your username');
        } else {
            let lowerCaseUsername = username.toLowerCase();
            setUsername(lowerCaseUsername);
            checkUsernameList(lowerCaseUsername);
        }
    };

    const NextButton = () => {
        if (username.length > 0) {
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

                <Text style={styles.titleText}>Create a username</Text>
                <Text style={styles.instructionsText}>Your username is exclusively yours and can be modified at any time.</Text>
                <LineStringInput text={username} setText={setUsername} label='Username' topMargin={40} length={20} auto={true} warning={warning}/>
                <Text style={[styles.countText, { color: warning ? '#dd2334' : Colors.mediumGrey }]}>{username.length}/20</Text>

                {warning && <View style={{ marginTop: 15, marginLeft: 70, marginRight: 35, flexDirection: 'row', alignItems: 'center' }}>
                    <AntDesign name='warning' size={15} color='#dd2334'/>
                    <Text style={styles.warningText}>{warning}</Text>
                </View>}
                
                <Text style={[styles.instructionsText, { marginTop: 30 }]}>Usernames must be 20 characters or less and contain only letters, numbers, underscores, and periods.</Text>

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

export default UsernameScreen;