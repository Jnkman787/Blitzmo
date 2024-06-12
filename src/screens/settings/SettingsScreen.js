import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, Platform, Pressable } from 'react-native';
import { useFocusEffect, StackActions } from '@react-navigation/native';
import * as NavigationBar from 'expo-navigation-bar';
import Modal from 'react-native-modal';
import Colors from '../../utils/Colors';

import { signOut } from 'firebase/auth';
import { auth } from '../../../firebase-config';

import CustomIcon from '../../utils/CustomIcon';
import { Octicons, Ionicons, Entypo, AntDesign, Fontisto } from '@expo/vector-icons';

// ** setup links for sharing and rating app immediately after it gets released on the App/Google Play store
// *  look at HabitZone for code on how to share and rate

// ** (optional) maybe include a language option in future updates

// ** maybe include an option that allows users to report a problem; preventing users
//    from relying on leaving bad reviews

const SettingsScreen = ({ navigation }) => {
    const [modalVisible, setModalVisible] = useState(false);

    useFocusEffect(
        React.useCallback(() => {
            setTimeout(() => {
                if (Platform.OS === 'android') {
                    NavigationBar.setBackgroundColorAsync(Colors.greyBackdrop);
                    NavigationBar.setButtonStyleAsync('dark');
                }
            }, 100);
        }, [])
    );

    useEffect(() => {
        if (Platform.OS === 'android') {
            if (modalVisible) {
                StatusBar.setBackgroundColor('#6e6e6e', true);
            } else {
                StatusBar.setBackgroundColor('transparent');
            }
        }
    }, [modalVisible]);

    function signOutUser () {
        signOut(auth)
        .then(() => {
            // sign-out successful
            navigation.dispatch(StackActions.replace('SetupStack', { screen: 'Opening', params: { signedOut: true } }));
        }).catch(error => console.log(error))
    };

    const SettingsList = () => {
        return (
            <View style={styles.optionListContainer}>
                <Pressable
                    onPress={() => navigation.navigate('SettingsStack', { screen: 'AccountOptions' })}
                    style={({pressed}) => [styles.optionContainer, { backgroundColor: pressed ? '#e6e6e6' : 'white',
                        borderTopLeftRadius: 15, borderTopRightRadius: 15
                    }]}
                >
                    <View style={{ marginHorizontal: 15, width: 25, alignItems: 'center' }}>
                        <CustomIcon name='profile' size={25} color='#b3b3b5'/>
                    </View>
                    <Text style={{ fontFamily: 'proxima-nova-semi', fontSize: 18 }}>Account</Text>
                </Pressable>
                <View style={{ height: 1, backgroundColor: Colors.border }}/>
                <Pressable
                    //onPress={() => }
                    style={({pressed}) => [styles.optionContainer, { backgroundColor: pressed ? '#e6e6e6' : 'white' }]}
                >
                    <View style={{ marginHorizontal: 15, width: 25, alignItems: 'center' }}>
                        <CustomIcon name='shield' size={25} color='#b3b3b5'/>
                    </View>
                    <Text style={{ fontFamily: 'proxima-nova-semi', fontSize: 18 }}>Privacy</Text>
                </Pressable>
                <View style={{ height: 1, backgroundColor: Colors.border }}/>
                <Pressable
                    //onPress={() => }
                    style={({pressed}) => [styles.optionContainer, { backgroundColor: pressed ? '#e6e6e6' : 'white' }]}
                >
                    <View style={{ marginHorizontal: 15, width: 25, alignItems: 'center' }}>
                        <Ionicons name='notifications' size={27} color='#b3b3b5' style={{ right: 1 }}/>
                    </View>
                    <Text style={{ fontFamily: 'proxima-nova-semi', fontSize: 18 }}>Notifications</Text>
                </Pressable>
                <View style={{ height: 1, backgroundColor: Colors.border }}/>
                <Pressable
                    //onPress={() => }
                    style={({pressed}) => [styles.optionContainer, { backgroundColor: pressed ? '#e6e6e6' : 'white',
                        borderBottomRightRadius: 15, borderBottomLeftRadius: 15
                    }]}
                >
                    <View style={{ marginHorizontal: 15, width: 25, alignItems: 'center' }}>
                        <Entypo name='globe' size={24} color='#b3b3b5'/>
                    </View>
                    <Text style={{ fontFamily: 'proxima-nova-semi', fontSize: 18 }}>Time Zone</Text>
                </Pressable>
            </View>
        );
    };

    const AboutList = () => {
        return (
            <View style={[styles.optionListContainer, { marginTop: 25 }]}>
                <Pressable
                    //onPress={() => }
                    style={({pressed}) => [styles.optionContainer, { backgroundColor: pressed ? '#e6e6e6' : 'white',
                        borderTopLeftRadius: 15, borderTopRightRadius: 15
                    }]}
                >
                    <View style={{ marginHorizontal: 15, width: 25, alignItems: 'center' }}>
                        <Fontisto name='share' size={22} color='#b3b3b5'/>
                    </View>
                    <Text style={{ fontFamily: 'proxima-nova-semi', fontSize: 18 }}>Share Blitzmo</Text>
                </Pressable>
                <View style={{ height: 1, backgroundColor: Colors.border }}/>
                <Pressable
                    onPress={() => setModalVisible(true)}
                    style={({pressed}) => [styles.optionContainer, { backgroundColor: pressed ? '#e6e6e6' : 'white' }]}
                >
                    <View style={{ marginHorizontal: 15, width: 25, alignItems: 'center', bottom: 1 }}>
                        <AntDesign name='star' size={25} color='#b3b3b5'/>
                    </View>
                    <Text style={{ fontFamily: 'proxima-nova-semi', fontSize: 18 }}>Rate Blitzmo</Text>
                </Pressable>
                <View style={{ height: 1, backgroundColor: Colors.border }}/>
                <Pressable
                    onPress={() => navigation.navigate('SettingsStack', { screen: 'About' })}
                    style={({pressed}) => [styles.optionContainer, { backgroundColor: pressed ? '#e6e6e6' : 'white',
                        borderBottomRightRadius: 15, borderBottomLeftRadius: 15
                    }]}
                >
                    <View style={{ marginHorizontal: 15, width: 25, alignItems: 'center', bottom: 1 }}>
                        <CustomIcon name='info' size={22} color='#b3b3b5'/>
                    </View>
                    <Text style={{ fontFamily: 'proxima-nova-semi', fontSize: 18 }}>About</Text>
                </Pressable>
            </View>
        );
    };

    return (
        <View style={{ flex: 1, backgroundColor: Colors.greyBackdrop,
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
                    <Text style={{ fontSize: 20, fontFamily: 'proxima-nova-semi' }}>Settings</Text>
                </View>

                {SettingsList()}
                {AboutList()}
                
                <Pressable
                    onPress={() => signOutUser()}
                    style={({pressed}) => [{ marginHorizontal: 15, marginTop: 25, borderRadius: 15, alignItems: 'center', justifyContent: 'center',
                        backgroundColor: pressed ? '#e6e6e6' : 'white', height: 50
                    }]}
                >
                    <Text style={{ fontFamily: 'proxima-nova-semi', fontSize: 18, color: '#dd2334' }}>Log out</Text>
                </Pressable>
                <Text style={styles.versionText}>Version 1.0.0</Text>

                <Modal
                    isVisible={modalVisible}
                    onBackButtonPress={() => setModalVisible(false)}
                    onBackdropPress={() => setModalVisible(false)}
                    backdropTransitionInTiming={400}
                    backdropTransitionOutTiming={100}
                    backdropOpacity={0.55}
                    useNativeDriverForBackdrop={true}
                >
                    <View style={styles.modalContainer}>
                        <AntDesign name='star' size={40} color='#ffa000' style={{ alignSelf: 'center', marginTop: 20 }}/>
                        <View style={{ marginVertical: 20, alignItems: 'center' }}>
                            <Text style={{ fontFamily: 'proxima-nova-semi', fontSize: 20 }}>Do you like Blitzmo?</Text>
                            <Text style={{ fontFamily: 'proxima-nova-reg', fontSize: 16, color: Colors.mediumGrey, marginTop: 15 }}>Please consider leaving a review</Text>
                        </View>
                        <View style={{ flexDirection: 'row', height: 55, borderTopWidth: 0.5 }}>
                            <Pressable
                                onPress={() => setModalVisible(false)}
                                style={({pressed}) => [{ flex: 1, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.5 : 1 }]}
                            >
                                <Text style={{ fontSize: 18, fontFamily: 'proxima-nova-semi' }}>Maybe Later</Text>
                            </Pressable>
                            <View style={{ height: 55, width: 0.75, backgroundColor: 'black' }}/>
                            <Pressable
                                onPress={() => {
                                    setModalVisible(false)
                                    // ** insert code for navigating user to App/Google play store
                                }}
                                style={({pressed}) => [{ flex: 1, backgroundColor: Colors.theme, borderBottomRightRadius: 20, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.5 : 1 }]}
                            >
                                <Text style={{ fontSize: 18, fontFamily: 'proxima-nova-semi', color: 'white' }}>Review</Text>
                            </Pressable>
                        </View>
                    </View>
                </Modal>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: Colors.greyBackdrop
    },
    optionListContainer: {
        backgroundColor: 'white',
        borderRadius: 15,
        marginHorizontal: 15,
        marginTop: 20
    },
    optionContainer: {
        height: 50,
        flexDirection: 'row',
        alignItems: 'center'
    },
    versionText: {
        fontFamily: 'proxima-nova-reg',
        fontSize: 15,
        color: Colors.mediumGrey,
        alignSelf: 'center',
        marginTop: 15
    },
    modalContainer: {
        backgroundColor: 'white',
        borderRadius: 20,
        alignSelf: 'center',
        width: 310
    }
});

export default SettingsScreen;