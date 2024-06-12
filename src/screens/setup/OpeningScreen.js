import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Platform, StatusBar, Animated, Image } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';
import { useIsFocused, StackActions } from '@react-navigation/native';
import Colors from '../../utils/Colors';
import NetInfo from '@react-native-community/netinfo';

import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../../firebase-config';

const images = [
    require('../../assets/images/challenge.png'),
    require('../../assets/images/unlock.png'),
    require('../../assets/images/cape.png')
];

const imageStyles = [
    { width: 170, height: 170 },
    { width: 127, height: 170 },
    { width: 142, height: 170 }
];

const titles = [
    'Fun Challenges',
    'Unlock Potential',
    'Adventure Awaits!'
];

const mottos = [
    'Embark on exciting challenges every day and have fun along the way',
    'Discover new heights and limitless possibilities',
    'Stay motivated with engaging daily quests for an adventure-filled day'
];

// ** display something if the user isn't connected to the internet
// *  maybe a small pop-up at the top of the screen like on TikTok
// *  or maybe use one of those toast pop-ups like on StudyConnect

const OpeningScreen = ({ navigation, route }) => {
    const { signedOut } = route.params;
    const position = useRef(new Animated.Value(1)).current;
    const imageScale = useRef(new Animated.Value(1)).current;
    const textScale = useRef(new Animated.Value(1)).current;
    const opacity = useRef(new Animated.Value(1)).current;
    const openingOpacity = useRef(new Animated.Value(1)).current;
    
    const [isConnected, setIsConnected] = useState(false);
    const [loading, setLoading] = useState(true);   // <-- used to load user from Firebase
    const [imageIndex, setImageIndex] = useState(0);
    const isFocused = useIsFocused();
    const [stopAnimation, setStopAnimation] = useState(false);

    const translateX = position.interpolate({
        inputRange: [0, 1, 2],
        outputRange: [170, 0, -170],
        extrapolate: 'clamp'
    });

    const fade = opacity.interpolate({
        inputRange: [0, 1, 2],
        outputRange: [0, 1, 0]
    });

    const fade2 = openingOpacity.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1]
    });

    useEffect(() => {
        // setup a listener for checking the user's internet connection
        const connectionListener = NetInfo.addEventListener(state => {
            setIsConnected(state.isConnected);
        });

        return connectionListener;
    }, []);

    useEffect(() => {
        // check if the user just signed out
        if (signedOut) {
            setLoading(false);
            if (Platform.OS === 'android') {
                NavigationBar.setBackgroundColorAsync('white');
                NavigationBar.setButtonStyleAsync('dark');
            }
        } else if (isConnected) {
            // check if the user is already signed in
            onAuthStateChanged(auth, user => {
                if (user) {
                    // user is signed in, replace OpeningScreen with HomeScreen
                    navigation.dispatch(StackActions.replace('Tab', { screen: 'Home' }));
                } else {
                    setLoading(false);
                    if (Platform.OS === 'android') {
                        NavigationBar.setBackgroundColorAsync('white');
                        NavigationBar.setButtonStyleAsync('dark');
                    }
                }
            })
        }
    }, [isConnected]);

    useEffect(() => {
        if (isFocused) {
            if (stopAnimation) {
                position.setValue(1);
                imageScale.setValue(1);
                textScale.setValue(1);
                opacity.setValue(1);
                setImageIndex(0);
                setStopAnimation(false);
    
                Animated.timing(openingOpacity, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: false
                }).start();
            }
        }
    }, [isFocused]);

    useEffect(() => {
        if (!stopAnimation) {
            imageTransition();
        }
    }, [imageIndex, stopAnimation]);

    function closingAnimation () {
        setStopAnimation(true);
        Animated.timing(openingOpacity, {
            toValue: 0,
            duration: 250,
            useNativeDriver: false
        }).start(() => navigation.navigate('SetupStack', { screen: 'Login' }));
    };

    function imageTransition () {
        Animated.parallel([
            Animated.timing(position, {
                toValue: 1,
                duration: 750,
                useNativeDriver: false
            }),
            Animated.timing(imageScale, {
                toValue: 1,
                duration: 750,
                useNativeDriver: false
            }),
            Animated.timing(opacity, {
                toValue: 1,
                duration: 650,
                useNativeDriver: false
            }),
            Animated.timing(textScale, {
                toValue: 1,
                duration: 750,
                useNativeDriver: false
            })
        ]).start(() => {
            Animated.parallel([
                Animated.timing(position, {
                    toValue: 2,
                    delay: 1500,
                    duration: 750,
                    useNativeDriver: false
                }),
                Animated.timing(imageScale, {
                    toValue: 0.15,
                    delay: 1500,
                    duration: 750,
                    useNativeDriver: false
                }),
                Animated.timing(opacity, {
                    toValue: 2,
                    delay: 1600,
                    duration: 650,
                    useNativeDriver: false
                }),
                Animated.timing(textScale, {
                    toValue: 0.25,
                    delay: 1600,
                    duration: 750,
                    useNativeDriver: false
                })
            ]).start(() => {
                position.setValue(0);
                setImageIndex((imageIndex + 1) % images.length);
            })
        });
    };

    // still loading user data
    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <Image
                    source={require('../../../assets/splash.png')}
                    style={{ flex: 1, width: undefined, height: undefined }}
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
                <Animated.View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', opacity: fade2 }}>
                    <Animated.Image
                        source={images[imageIndex]}
                        style={[imageStyles[imageIndex], { transform: [{ translateX }, { scale: imageScale }], opacity: fade }]}
                    />
                    <Animated.Text style={[styles.titleText, { transform: [{ scale: textScale }], opacity: fade }]}>
                        {titles[imageIndex]}
                    </Animated.Text>
                    <View style={{ paddingHorizontal: 40 }}>
                        <Animated.Text style={[styles.mottoText, { transform: [{ scale: textScale }], opacity: fade }]}>
                            {mottos[imageIndex]}
                        </Animated.Text>
                    </View>

                    <View style={{ flexDirection: 'row', marginTop: 40 }}>
                        <View style={[styles.dot, { backgroundColor: imageIndex === 0 ? Colors.theme : 'white' }]}/>
                        <View style={[styles.dot, { marginHorizontal: 25, backgroundColor: imageIndex === 1 ? Colors.theme : 'white' }]}/>
                        <View style={[styles.dot, { backgroundColor: imageIndex === 2 ? Colors.theme : 'white' }]}/>
                    </View>
                </Animated.View>

                <Pressable
                    onPress={() => closingAnimation()}
                    style={[styles.buttonContainer, { backgroundColor: Colors.theme, marginBottom: 20 }]}
                >
                    <Text style={[styles.buttonText, { color: 'white' }]}>Log in</Text>
                </Pressable>
                <Animated.View style={{ opacity: fade2 }}>
                    <Pressable
                        onPress={() => navigation.navigate('SetupStack', { screen: 'Name' })}
                        style={({pressed}) => [styles.buttonContainer, { backgroundColor: 'white', opacity: pressed ? 0.3 : 1,
                            borderColor: 'black', borderWidth: 1, marginBottom: 60
                        }]}
                    >
                        <Text style={[styles.buttonText, { color: 'black' }]}>Sign up</Text>
                    </Pressable>
                </Animated.View>
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
        marginTop: 40
    },
    mottoText: {
        fontFamily: 'proxima-nova-reg',
        fontSize: 17,
        color: '#404040',
        marginTop: 25,
        textAlign: 'center'
    },
    dot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        borderWidth: 1.5,
        borderColor: Colors.theme
    },
    buttonContainer: {
        width: 200,
        height: 55,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center'
    },
    buttonText: {
        fontFamily: 'proxima-nova-semi',
        fontSize: 18
    },
    loadingContainer: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        zIndex: 2
    }
});

export default OpeningScreen;