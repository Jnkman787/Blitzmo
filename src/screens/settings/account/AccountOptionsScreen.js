import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, Platform, Pressable, TextInput } from 'react-native';
import { useFocusEffect, StackActions } from '@react-navigation/native';
import * as NavigationBar from 'expo-navigation-bar';
import Modal from 'react-native-modal';
import Colors from '../../../utils/Colors';
import NetInfo from '@react-native-community/netinfo';
import * as Updates from 'expo-updates';

import { deleteUser, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { auth } from '../../../../firebase-config';

import CustomIcon from '../../../utils/CustomIcon';
import { Octicons, AntDesign } from '@expo/vector-icons';

const AccountOptionsScreen = ({ navigation }) => {
    const [isConnected, setIsConnected] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [password, setPassword] = useState('');
    const [modalWarning, setModalWarning] = useState(null);

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
        // setup a listener for checking the user's internet connection
        const connectionListener = NetInfo.addEventListener(state => {
            setIsConnected(state.isConnected);
        });

        return connectionListener;
    }, []);

    useEffect(() => {
        if (Platform.OS === 'android') {
            if (modalVisible) {
                StatusBar.setBackgroundColor('#6e6e6e', true);
            } else {
                StatusBar.setBackgroundColor('transparent');
            }
        }
    }, [modalVisible]);

    useEffect(() => {
        setModalWarning(false);
    }, [password]);

    async function deleteAccount () {
        if (!isConnected) {
            setModalWarning('No internet connection');
            return;
        }

        const credential = EmailAuthProvider.credential(
            auth.currentUser.email,
            password
        );

        // re-authenticate the user/check if they entered the correct password
        reauthenticateWithCredential(auth.currentUser, credential)
        .then(() => {
            setModalVisible(false);
            // delete user profile
            deleteUser(auth.currentUser)
            .then(() => {
                // user deleted, navigate to opening screen
                //navigation.dispatch(StackActions.replace('SetupStack', { screen: 'Opening' }));

                // user deleted, restart the app
                Updates.reloadAsync();  // <-- should work once the app is released on the app/google play store
            }).catch(error => console.log(error))
        }).catch(error => {
            console.log(error);
            // user likely entered wrong password
            setModalWarning('Incorrect password');
        })
    };

    const DeleteButton = () => {
        if (password.length > 0) {
            return (
                <Pressable
                    onPress={() => deleteAccount()}
                    style={({pressed}) => [styles.buttonContainer, { opacity: pressed ? 0.3 : 1, marginTop: modalWarning ? 20 : 30 }]}
                >
                    <Text style={styles.buttonText}>Delete</Text>
                </Pressable>
            );
        } else {
            return (
                <Pressable
                    style={[styles.buttonContainer, { backgroundColor: '#e6e6e6' }]}
                >
                    <Text style={[styles.buttonText, { color: Colors.mediumGrey }]}>Delete</Text>
                </Pressable>
            );
        }
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
                    <Text style={{ fontSize: 20, fontFamily: 'proxima-nova-semi' }}>Account</Text>
                </View>

                <View style={styles.optionListContainer}>
                    <Pressable
                        onPress={() => navigation.navigate('SettingsStack', { screen: 'AccountUpdate', params: { element: 'Email', value: auth.currentUser.email } })}
                        style={({pressed}) => [styles.optionContainer, { backgroundColor: pressed ? '#e6e6e6' : 'white',
                            borderTopLeftRadius: 15, borderTopRightRadius: 15
                        }]}
                    >
                        <View style={{ marginHorizontal: 15, width: 25, alignItems: 'center' }}>
                            <CustomIcon name='at-sign' size={24} color='#b3b3b5'/>
                        </View>
                        <Text style={{ fontFamily: 'proxima-nova-semi', fontSize: 18 }}>Change Email</Text>
                    </Pressable>
                    <View style={{ height: 1, backgroundColor: Colors.border }}/>
                    <Pressable
                        onPress={() => navigation.navigate('SettingsStack', { screen: 'AccountUpdate', params: { element: 'Password', value: '' } })}
                        style={({pressed}) => [styles.optionContainer, { backgroundColor: pressed ? '#e6e6e6' : 'white',
                            borderBottomLeftRadius: 15, borderBottomRightRadius: 15
                        }]}
                    >
                        <View style={{ marginHorizontal: 15, width: 25, alignItems: 'center' }}>
                            <CustomIcon name='lock' size={26} color='#b3b3b5'/>
                        </View>
                        <Text style={{ fontFamily: 'proxima-nova-semi', fontSize: 18 }}>Change Password</Text>
                    </Pressable>
                </View>

                <Pressable
                    onPress={() => setModalVisible(true)}
                    style={({pressed}) => [{ marginHorizontal: 15, marginTop: 25, borderRadius: 15, alignItems: 'center', justifyContent: 'center',
                        backgroundColor: pressed ? '#e6e6e6' : 'white', height: 50
                    }]}
                >
                    <Text style={{ fontFamily: 'proxima-nova-semi', fontSize: 18, color: '#dd2334' }}>Delete Account</Text>
                </Pressable>

                <Modal
                    isVisible={modalVisible}
                    onBackButtonPress={() => {
                        setModalVisible(false);
                        setPassword('');
                    }}
                    onBackdropPress={() => {
                        setModalVisible(false);
                        setPassword('');
                    }}
                    backdropTransitionInTiming={400}
                    backdropTransitionOutTiming={100}
                    backdropOpacity={0.55}
                    useNativeDriverForBackdrop={true}
                >
                    <View style={[styles.modalContainer, { height: modalWarning ? 315 : 300 }]}>
                        <Text style={{ fontFamily: 'proxima-nova-semi', fontSize: 22 }}>Delete Account</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                value={password}
                                onChangeText={setPassword}
                                placeholder='Password'
                                placeholderTextColor={Colors.mediumGrey}
                                selectionColor={Colors.theme}
                                autoCorrect={false}
                                spellCheck={false}
                                autoCapitalize='none'
                                style={{ flex: 1, fontFamily: 'proxima-nova-reg', fontSize: 17 }}
                            />
                        </View>
                        {modalWarning && <View style={{ marginTop: 15, flexDirection: 'row', alignItems: 'center' }}>
                            <AntDesign name='warning' size={15} color='#dd2334'/>
                            <Text style={styles.warningText}>{modalWarning}</Text>
                        </View>}
                        {DeleteButton()}
                        <Pressable
                            onPress={() => {
                                setModalVisible(false);
                                setPassword('');
                            }}
                            style={({pressed}) => [styles.buttonContainer, { backgroundColor: 'white', opacity: pressed ? 0.3 : 1,
                                borderColor: 'black', borderWidth: 1, marginTop: 20
                            }]}
                        >
                            <Text style={[styles.buttonText, { color: 'black' }]}>Cancel</Text>
                        </Pressable>
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
    buttonContainer: {
        width: 200,
        height: 55,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        backgroundColor: Colors.theme,
        marginTop: 30
    },
    buttonText: {
        fontFamily: 'proxima-nova-semi',
        fontSize: 18,
        color: 'white'
    },
    modalContainer: {
        backgroundColor: 'white',
        borderRadius: 20,
        width: 300,
        alignSelf: 'center',
        alignItems: 'center',
        padding: 20,
    },
    inputContainer: {
        marginTop: 25,
        height: 50,
        borderColor: Colors.mediumGrey,
        borderRadius: 15,
        borderWidth: 1,
        paddingHorizontal: 15,
        width: '100%'
    },
    warningText: {
        fontFamily: 'proxima-nova-reg',
        fontSize: 14,
        color: '#dd2334',
        marginLeft: 10
    }
});

export default AccountOptionsScreen;