import React from 'react';
import { View, Text, StyleSheet, StatusBar, Platform, Image, Pressable } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as NavigationBar from 'expo-navigation-bar';
import Colors from '../../utils/Colors';
import { width } from '../../utils/Scaling';

import CustomIcon from '../../utils/CustomIcon';
import { AntDesign } from '@expo/vector-icons';

// ** check if the user has any internet connection and display something else if they don't
// *  don't show the 2 navigation buttons if the user has no internet

const ChallengeScreen = ({ navigation }) => {
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

    // either increase height of the container or reduce the font size of the text 
    // when the challenge doesn't fit in the container
    const ChallengeContainer = () => {
        return (
            <View style={styles.challengeTextContainer}>
                <Text style={{ fontFamily: 'proxima-nova-semi', fontSize: 20 }}>Bring a smile to a stranger's face</Text>
            </View>
        );
    };

    // ** (optional) perhaps make this a button that sends the user to a screen that lists
    //    which friends have already completed the challenge (maybe save for later version)
    const FriendsCompletion = () => {
        let friendCount = 7;    // <-- temp

        // ** after retrieving which friends have already completed the challenge,
        //    I will also have to save their profile images to display here

        if (friendCount === 0) {
            return (
                <View style={[styles.friendContainer, { height: 40 }]}>
                    <Text style={[styles.labelText, { textAlign: 'center', fontSize: 15 }]}>Be the first in your group of{'\n'}friends to finish the challenge</Text>
                    <View style={{ height: 30, width: 30, marginLeft: 20 }}>
                        <Image
                            source={require('../../assets/images/target.png')}
                            style={{ flex: 1, height: undefined, width: undefined }}
                        />
                    </View>
                </View>
            );
        } else if (friendCount === 1) {
            return (
                <View style={styles.friendContainer}>
                    <Text style={[styles.labelText, { textAlign: 'center', fontSize: 15 }]}>1 of your friends has{'\n'}already finished it</Text>
                    <View style={[styles.imageContainer, { marginLeft: 20 }]}>
                        <Image
                            source={require('../../assets/images/profile.png')}
                            style={{ flex: 1, height: undefined, width: undefined }}
                        />
                    </View>
                </View>
            );
        } else {
            let imageRowWidth = 60;
            let numExtra;
            if (friendCount === 3) { imageRowWidth = 80;  }
            else if (friendCount === 4) { imageRowWidth = 100; }
            else if (friendCount >= 5) {
                imageRowWidth = 120;
                numExtra = friendCount - 4;
                if (numExtra > 99) { numExtra = 99; }
            }

            return (
                <View style={styles.friendContainer}>
                    <Text style={[styles.labelText, { textAlign: 'center', fontSize: 15 }]}>{friendCount} of your friends have{'\n'}already finished it</Text>
                    <View style={{ flexDirection: 'row', marginLeft: 20, width: imageRowWidth }}>
                        <View style={styles.imageContainer}>
                            <Image
                                source={require('../../assets/images/profile.png')}
                                style={{ flex: 1, height: undefined, width: undefined }}
                            />
                        </View>
                        <View style={[styles.imageContainer, { right: 20 }]}>
                            <Image
                                source={require('../../assets/images/profile.png')}
                                style={{ flex: 1, height: undefined, width: undefined }}
                            />
                        </View>
                        {friendCount >= 3 && <View style={[styles.imageContainer, { right: 40 }]}>
                            <Image
                                source={require('../../assets/images/profile.png')}
                                style={{ flex: 1, height: undefined, width: undefined }}
                            />
                        </View>}
                        {friendCount >= 4 && <View style={[styles.imageContainer, { right: 60 }]}>
                            <Image
                                source={require('../../assets/images/profile.png')}
                                style={{ flex: 1, height: undefined, width: undefined }}
                            />
                        </View>}
                        {friendCount === 5 && <View style={[styles.imageContainer, { right: 80 }]}>
                            <Image
                                source={require('../../assets/images/profile.png')}
                                style={{ flex: 1, height: undefined, width: undefined }}
                            />
                        </View>}
                        {friendCount > 5 && <View style={[styles.imageContainer, { right: 80, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.darkGrey }]}>
                            <Text style={{ color: 'white', fontFamily: 'proxima-nova-reg', fontSize: 13 }}>+{numExtra}</Text>
                        </View>}
                    </View>
                </View>
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
                <View style={styles.blackContainer}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={styles.headerText}>TODAY'S{'\n'}CHALLENGE</Text>
                        <Pressable
                            onPress={() => navigation.goBack()}
                            style={({pressed}) => [styles.closeButtonContainer, { opacity: pressed ? 0.2 : 1 }]}
                        >
                            <AntDesign name='close' size={24} color='white'/>
                        </Pressable>
                    </View>
                    
                    <View style={{ flexDirection: 'row', marginTop: width > 550 ? '10%' : 40 }}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.labelText}>Difficulty:</Text>
                            <Text style={{ fontFamily: 'proxima-nova-semi', fontSize: 25, color: 'white', marginTop: 5 }}>EASY</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.labelText}>Time:</Text>
                            <View style={{ flexDirection: 'row', marginTop: 5, alignItems: 'center' }}>
                                <Text style={{ fontFamily: 'proxima-nova-semi', fontSize: 25, color: 'white' }}>3</Text>
                                <Text style={[styles.labelText, { marginLeft: 5 }]}>Hours</Text>
                            </View>
                        </View>
                    </View>

                    {ChallengeContainer()}
                    {FriendsCompletion()}
                </View>

                <Text style={{ fontFamily: 'proxima-nova-semi', fontSize: 45, alignSelf: 'center', marginVertical: '10%' }}>02:37:06</Text>
                <View style={{ width: '100%', height: 1, backgroundColor: Colors.border }}/>
                
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                    <Pressable
                        style={({pressed}) => [styles.buttonContainer, { backgroundColor: Colors.lightGrey, opacity: pressed ? 0.2 : 1 }]}
                        onPress={() => navigation.navigate('ChallengeStack', { screen: 'Leaderboard' })}
                    >
                        <CustomIcon name='leaderboard' size={35} color='black'/>
                    </Pressable>
                    <Pressable
                        style={({pressed}) => [styles.buttonContainer, { backgroundColor: Colors.theme, marginLeft: '25%', opacity: pressed ? 0.2 : 1 }]}
                        // * change the button if the user has completed the challenge
                        onPress={() => navigation.navigate('ChallengeStack', { screen: 'Camera' })}
                    >
                        <CustomIcon name='arrow' size={35} color='white' style={{ left: 3 }}/>
                    </Pressable>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    screen: {
        flex: 1
    },
    blackContainer: {
        backgroundColor: 'black',
        marginHorizontal: 10,
        marginTop: Platform.OS === 'android' ? 10 : 0,
        borderRadius: 20,
        padding: width > 550 ? '5%' : 20
    },
    headerText: {
        fontFamily: 'proxima-nova-bold',
        fontSize: 26,
        color: 'white'
    },
    closeButtonContainer: {
        borderWidth: 1,
        borderColor: 'white',
        height: 40,
        width: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center'
    },
    labelText: {
        fontFamily: 'proxima-nova-reg',
        fontSize: 16,
        color: 'white'
    },
    challengeTextContainer: {
        backgroundColor: 'white',
        marginTop: width > 550 ? '10%' : 40,
        alignSelf: 'center',
        width: width > 550 ? 400 : '100%',
        height: 90,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15
    },
    friendContainer: {
        flexDirection: 'row',
        marginTop: width > 550 ? '10%' : 40,
        marginBottom: 10,
        paddingHorizontal: 20,
        alignSelf: 'center',
        alignItems: 'center'
    },
    imageContainer: {
        height: 40,
        width: 40,
        borderRadius: 20,
        borderWidth: 3,
        borderColor: 'black',
        backgroundColor: 'black'
    },
    buttonContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center'
    }
});

export default ChallengeScreen;