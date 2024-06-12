import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, Platform, Pressable } from 'react-native';
import Colors from '../../../utils/Colors';

import LineStringInput from '../../../components/input/LineStringInput';

import { Octicons } from '@expo/vector-icons';

// ** re-visit this screen in a future update

// ** check if the code entered is correct when the user taps Next

const VerificationScreen = ({ navigation }) => {
    const [code, setCode] = useState('');   // <-- may need to change to an int?
    const [timer, setTimer] = useState(60);

    useEffect(() => {
        const interval = setInterval(() => {
            setTimer((prevTimer) => prevTimer - 1);
        }, 1000);

        // cleanup interval on unmount
        return () => clearInterval(interval);
    }, []);

    const NextButton = () => {
        if (code.length > 0) {
            return (
                <Pressable
                    onPress={() => navigation.navigate('SetupStack', { screen: 'Password' })}
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

    const ResendButton = () => {
        if (timer > 0) {
            return (
                <Pressable
                    //onPress={() => }      // <-- resend the code
                    style={[styles.buttonContainer, { backgroundColor: '#e6e6e6', marginTop: 20 }]}
                >
                    <Text style={[styles.buttonText, { color: Colors.mediumGrey }]}>Resend in {timer}s</Text>
                </Pressable>
            );
        } else {
            return (
                <Pressable
                    onPress={() => setTimer(30)}  // <-- resend the code
                    style={({pressed}) => [styles.buttonContainer, { 
                        opacity: pressed ? 0.3 : 1, marginTop: 20, backgroundColor: 'white', borderColor: 'black', borderWidth: 1
                    }]}
                >
                    <Text style={[styles.buttonText, { color: 'black' }]}>Resend</Text>
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

                <Text style={styles.titleText}>Enter the 6-digit code</Text>
                <Text style={styles.infoText}>Your code was sent to {'['}insert email address{']'}.</Text>
                <LineStringInput text={code} setText={setCode} label='Code' topMargin={40} length={6} auto={true}/>

                {NextButton()}
                {ResendButton()}
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
    infoText: {
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
    }
});

export default VerificationScreen;