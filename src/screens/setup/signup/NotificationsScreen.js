import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, StatusBar, Platform, Pressable, Linking } from 'react-native';
import Modal from 'react-native-modal';
import Colors from '../../../utils/Colors';
import * as Notifications from 'expo-notifications';

import { Octicons } from '@expo/vector-icons';

const NotificationsScreen = ({ navigation, route }) => {
    const { name, email, password, username } = route.params;

    const [notificationToken, setNotificationToken] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        setTimeout(() => {
            registerForPushNotificationsAsync();
        }, 400);
    }, []);

    useEffect(() => {
        if (Platform.OS === 'android') {
            if (modalVisible) {
                StatusBar.setBackgroundColor('#8e8e8e', true);
            } else {
                StatusBar.setBackgroundColor('transparent');
            }
        }
    }, [modalVisible]);

    async function registerForPushNotificationsAsync() {    // <-- include similar function in settings notification screen (with modifications)
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        // acquire token and setup notification channel before requesting permission
        // this way, everything is pre-setup if the user manually enables notifications later
        const token = (await Notifications.getExpoPushTokenAsync({
            projectId: 'aa51738d-3c13-4c6c-8215-1bf4163822a4'
        })).data;

        setNotificationToken(token);

        if (Platform.OS === 'android') {
            Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C'
            });
        }

        if (existingStatus !== 'granted') {
            try {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            } catch {
                // user likely denied it in the past and now it can't ask again
            }
        }

        if (finalStatus !== 'granted') {
            // user chose not to enable notifications
            return;
        }

        // notifications are enabled, navigate to next screen
        setModalVisible(false);
        navigation.navigate('SetupStack', { screen: 'Referral', params: { name, email, password, username, notificationToken: token } });
    };

    const AllowButton = () => {
        return (
            <Pressable
                onPress={() => setModalVisible(true)}
                style={({pressed}) => [styles.buttonContainer, { opacity: pressed ? 0.3 : 1 }]}
            >
                <Text style={styles.buttonText}>Allow</Text>
            </Pressable>
        );
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

                <Text style={styles.titleText}>When do daily challenges take place?</Text>
                <Text style={styles.instructionsText}>
                    Blitzmo's daily challenges are scheduled at different times each day, thus it's best to enable
                    notifications to receive alerts once a challenge begins.
                </Text>

                {AllowButton()}

                <Pressable
                    onPress={() => navigation.navigate('SetupStack', { screen: 'Referral', params: { name, email, password, username, notificationToken } })}
                    style={({pressed}) => [styles.buttonContainer, { 
                        opacity: pressed ? 0.3 : 1, marginTop: 20, backgroundColor: 'white', borderColor: 'black', borderWidth: 1
                    }]}
                >
                    <Text style={[styles.buttonText, { color: 'black' }]}>Skip</Text>
                </Pressable>

                <Modal
                    isVisible={modalVisible}
                    onBackButtonPress={() => setModalVisible(false)}
                    onBackdropPress={() => setModalVisible(false)}
                    backdropTransitionInTiming={400}
                    backdropTransitionOutTiming={100}
                    backdropOpacity={0.45}
                    useNativeDriverForBackdrop={true}
                >
                    <View style={styles.modalContainer}>
                        <Text style={{ fontFamily: 'proxima-nova-semi', fontSize: 22 }}>Enable Notifications</Text>
                        <Text style={styles.notificationsText}>Notifications can be enabled in your device settings at any time</Text>
                        <Pressable
                            onPress={() => {
                                setModalVisible(false);
                                navigation.navigate('SetupStack', { screen: 'Referral', params: { name, email, password, username, notificationToken } });
                            }}
                            style={({pressed}) => [styles.buttonContainer, { opacity: pressed ? 0.3 : 1 }]}
                        >
                            <Text style={styles.buttonText}>Next</Text>
                        </Pressable>
                        <Pressable
                            onPress={() => Linking.openSettings()}
                            style={({pressed}) => [styles.buttonContainer, { 
                                opacity: pressed ? 0.3 : 1, marginTop: 20, backgroundColor: 'white', borderColor: 'black', borderWidth: 1
                            }]}
                        >
                            <Text style={[styles.buttonText, { color: 'black' }]}>Open Settings</Text>
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
    modalContainer: {
        borderRadius: 20,
        backgroundColor: 'white',
        height: 320,
        width: 300,
        alignSelf: 'center',
        alignItems: 'center',
        paddingTop: 30
    },
    notificationsText: {
        width: '100%',
        marginTop: 25,
        paddingHorizontal: 30,
        fontFamily: 'proxima-nova-reg',
        fontSize: 17,
        textAlign: 'center'
    }
});

export default NotificationsScreen;