import React, { useState } from 'react';
import { View, Text, StyleSheet, StatusBar, Platform, Pressable, Keyboard } from 'react-native';
import Colors from '../../../utils/Colors';

import LineStringInput from '../../../components/input/LineStringInput';

import { Octicons } from '@expo/vector-icons';

const NameScreen = ({ navigation }) => {
    const [name, setName] = useState('');

    const NextButton = () => {
        if (name.length > 0) {
            return (
                <Pressable
                    onPress={() => navigation.navigate('SetupStack', { screen: 'Email', params: { name } })}
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
                        //onPress={() => navigation.goBack()}
                        onPress={() => {
                            Keyboard.dismiss();
                            navigation.goBack();
                        }}
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

                <Text style={styles.titleText}>Let's get started, {'\n'}what's your name?</Text>
                <LineStringInput text={name} setText={setName} label='Name' topMargin={50} length={20} auto={true}/>
                <Text style={styles.countText}>{name.length}/20</Text>

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
    countText: {
        fontFamily: 'proxima-nova-reg',
        fontSize: 15,
        marginLeft: 70,
        marginTop: 15,
        color: Colors.mediumGrey
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

export default NameScreen;