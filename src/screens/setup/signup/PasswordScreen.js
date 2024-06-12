import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, Platform, Pressable } from 'react-native';
import Colors from '../../../utils/Colors';

import LineStringInput from '../../../components/input/LineStringInput';

import { Octicons, AntDesign } from '@expo/vector-icons';

const PasswordScreen = ({ navigation, route }) => {
    const { name, email } = route.params;
    const [password, setPassword] = useState('');
    const [warning, setWarning] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        setWarning(null);
    }, [password]);

    // check if the password uses at least 1 letter & 1 number
    function checkPassword () {
        const hasLetter = /[a-zA-Z]/.test(password);
        const hasNumber = /\d/.test(password);

        if (!hasLetter) {
            setWarning('Include at least 1 letter in your password');
        } else if (!hasNumber) {
            setWarning('Include at least 1 number in your password');
        } else {
            navigation.navigate('SetupStack', { screen: 'Username', params: { name, email, password } });
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

    const NextButton = () => {
        if (password.length < 8) {
            return (
                <Pressable
                    style={[styles.buttonContainer, { backgroundColor: '#e6e6e6' }]}
                >
                    <Text style={[styles.buttonText, { color: Colors.mediumGrey }]}>Next</Text>
                </Pressable>
            );
        } else {
            return (
                <Pressable
                    onPress={() => checkPassword()}
                    style={({pressed}) => [styles.buttonContainer, { opacity: pressed ? 0.3 : 1 }]}
                >
                    <Text style={styles.buttonText}>Next</Text>
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

                <Text style={styles.titleText}>Create a password</Text>
                <Text style={styles.instructionsText}>Create a password with at least 8 characters {'('}include letters and numbers{')'}.</Text>
                
                <View style={{ flexDirection: 'row', marginTop: 40 }}>
                    <LineStringInput text={password} setText={setPassword} label='Password' topMargin={0} auto={true} warning={warning} showPassword={showPassword}/>
                    {PasswordDisplayButton()}
                </View>

                {warning && <View style={{ marginTop: 15, marginLeft: 70, marginRight: 35, flexDirection: 'row', alignItems: 'center' }}>
                    <AntDesign name='warning' size={15} color='#dd2334'/>
                    <Text style={styles.warningText}>{warning}</Text>
                </View>}

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

export default PasswordScreen;