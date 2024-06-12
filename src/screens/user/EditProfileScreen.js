import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, Platform, Pressable, Image, Animated, Keyboard, ScrollView } from 'react-native';
import Modal from 'react-native-modal';
import Colors from '../../utils/Colors';
import * as ImagePicker from 'expo-image-picker';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import NetInfo from '@react-native-community/netinfo';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

import { updateProfile } from 'firebase/auth';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, uploadBytesResumable, deleteObject } from 'firebase/storage';
import { auth, db, storage } from '../../../firebase-config';

import BoxStringInput from '../../components/input/BoxStringInput';

import CustomIcon from '../../utils/CustomIcon';
import { Octicons, Ionicons, AntDesign } from '@expo/vector-icons';

const EditProfileScreen = ({ navigation, route }) => {
    const { name, username, bio, location, profileImage } = route.params;
    const scrollViewRef = useRef();
    const scaleValue = useRef(new Animated.Value(1)).current;

    const [isConnected, setIsConnected] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [keyboardVisible, setKeyboardVisible] = useState(false);

    const [change, setChange] = useState(false);
    const [warningName, setWarningName] = useState(null);
    const [warningBio, setWarningBio] = useState(null);

    const [newProfileImage, setNewProfileImage] = useState(profileImage);
    const [newName, setNewName] = useState(name);
    const [newUsername, setNewUsername] = useState(username);
    const [newBio, setNewBio] = useState(bio);
    const [newLocation, setNewLocation] = useState(location);

    useEffect(() => {
        // setup a listener for checking the user's internet connection
        const connectionListener = NetInfo.addEventListener(state => {
            setIsConnected(state.isConnected);
        });

        const keyboardShowListener = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
        const keyboardHideListener = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));

        // setup a listerner for checking if the username has changed
        const unsubUsername = onSnapshot(doc(db, 'users', auth.currentUser.uid), (doc) => {
            setNewUsername(doc.data().username);
        });

        return () => {
            connectionListener;
            unsubUsername();
            keyboardShowListener.remove();
            keyboardHideListener.remove();
        };
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

    useEffect(() => {
        if (newName !== name) {
            setChange(true);
        } else if (newBio !== bio) {
            setChange(true);
        } else if (newLocation !== location) {
            setChange(true);
        } else if (newProfileImage !== profileImage) {
            setChange(true);
        } else {
            setChange(false);
        }
    }, [newName, newBio, newLocation, newProfileImage]);

    useEffect(() => {
        setWarningName(null);
    }, [newName]);

    useEffect(() => {
        setWarningBio(null);
    }, [newBio]);

    async function uploadImageAsync () {
        const blob = await new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.onload = function () {
              resolve(xhr.response);
            };
            xhr.onerror = function (e) {
              console.log(e);
              reject(new TypeError("Network request failed"));
            };
            xhr.responseType = "blob";
            xhr.open("GET", newProfileImage, true);
            xhr.send(null);
        });

        const storageRef = ref(storage, `profileImages/${auth.currentUser.uid}.jpg`);

        // upload the file to firebase storage
        //await uploadBytes(storageRef, blob);
        await uploadBytesResumable(storageRef, blob);   // <-- maybe implement observer code shown on Firebase
        //https://firebase.google.com/docs/storage/web/upload-files#web-modular-api_1

        blob.close();   // done with the blob, close and release it

        // get the download url for the image file
        const url = await getDownloadURL(storageRef);
        return url;
    };

    async function saveChanges () {
        // if the user has no internet connection, navigate back to their profile without saving
        if (!isConnected) {
            navigation.goBack();
        }

        const docRef = doc(db, 'users', auth.currentUser.uid);

        if (newName !== name) {
            await updateDoc(docRef, { name: newName });
            updateProfile(auth.currentUser, { displayName: newName })
            .then()
            .catch(error => console.log(error))
        }

        if (newBio !== bio) {
            if (newBio.endsWith('\n')) {
                let str = newBio;
                await updateDoc(docRef, { bio: str.slice(0, -1) });
            } else {
                await updateDoc(docRef, { bio: newBio });
            }
        }

        if (newLocation !== location) {
            await updateDoc(docRef, { location: newLocation });
        }

        if (newProfileImage !== profileImage) {
            // check if the newProfileImage is null/deleted
            if (newProfileImage) {
                const uploadURL = await uploadImageAsync();
                await updateDoc(docRef, { profileImageURL: uploadURL });
                updateProfile(auth.currentUser, { photoURL: uploadURL })
                .then()
                .catch(error => console.log(error))
            } else {
                const desertRef = ref(storage, `profileImages/${auth.currentUser.uid}.jpg`);
                // delete from storage
                deleteObject(desertRef)
                .then()
                .catch(error => console.log(error))

                // delete url from document
                await updateDoc(docRef, { profileImageURL: null });

                // delete from profile
                updateProfile(auth.currentUser, { photoURL: '' })   // setting to an empty string = undefined
                .then()
                .catch(error => console.log(error))
            }
        }

        navigation.goBack();
    };

    async function pickImageFromLibrary () {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],     // [width, height]
            quality: 1     // if value is less than 1, image is compressed and file size is reduced, but so is its quality
        });

        if (!result.canceled) {
            //setNewProfileImage(result.assets[0].uri);

            // resize the image so that it's smaller
            const resizedImage = await manipulateAsync(
                result.assets[0].uri,
                [{ resize: { height: 300, width: 300 } }],
                { compress: 1, format: SaveFormat.JPEG }
            );
            setNewProfileImage(resizedImage.uri);
        }
    };

    async function pickImageFromCamera () {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            return;
        }

        let result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1
        });

        if (!result.canceled) {
            //setNewProfileImage(result.assets[0].uri);

            // resize the image so that it's smaller
            const resizedImage = await manipulateAsync(
                result.assets[0].uri,
                [{ resize: { height: 300, width: 300 } }],
                { compress: 1, format: SaveFormat.JPEG }
            );
            setNewProfileImage(resizedImage.uri);
        }
    };

    function onProfilePressIn () {
        Animated.timing(scaleValue, {
            toValue: 0.85,
            duration: 150,
            useNativeDriver: true
        }).start();
    };

    function onProfilePressOut () {
        Animated.timing(scaleValue, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true
        }).start();
    };

    function checkName () {
        if (newName.length < 1) {
            setWarningName('Name must contain between 1 and 20 characters');
        } else { checkBio(); }
    };

    function checkBio () {
        // check if there are empty rows/lines
        if (newBio.includes('\n\n')) {
            setWarningBio('Biography contains invalid characters');
        } else if (newBio.startsWith('\n')) {
            setWarningBio('Biography contains invalid characters');
        } else {
            saveChanges();
        }
    };

    const EditPicture = () => {
        return (
            <Pressable
                onPress={() => setModalVisible(true)}
                onPressIn={onProfilePressIn}
                onPressOut={onProfilePressOut}
                style={{ alignSelf: 'center', marginTop: 15, width: 100 }}
            >
                <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
                    <View style={styles.profileImage}>
                        <Image
                            source={newProfileImage ? { uri: newProfileImage } : require('../../assets/images/profile.png')}
                            style={{ flex: 1, height: undefined, width: undefined }}
                        />
                    </View>
                    <View style={styles.editIconContainer}>
                        <CustomIcon name='edit-outline' size={15} color='white'/>
                    </View>
                </Animated.View>
            </Pressable>
        );
    };

    const InputOptions = () => {
        return (
            <View>
                <BoxStringInput text={newName} setText={setNewName} label='Name' length={20} topMargin={50} warning={warningName}
                    scrollDown={() => scrollViewRef.current.scrollTo({ y: 0, animated: true })}
                />
                {warningName && <View style={{ marginHorizontal: 30, marginTop: 7, flexDirection: 'row', alignItems: 'center' }}>
                    <AntDesign name='warning' size={15} color='#dd2334'/>
                    <Text style={styles.warningText}>{warningName}</Text>
                </View>}

                <BoxStringInput text={newUsername} setText={setNewUsername} label='Username' topMargin={warningName ? 20 : 30} navigation={navigation}/>
                <BoxStringInput text={newBio} setText={setNewBio} label='Bio' length={100} topMargin={30} warning={warningBio} multipleLines={true}
                    scrollDown={() => scrollViewRef.current.scrollTo({ y: 130, animated: true })}
                />
                {warningBio && <View style={{ marginHorizontal: 30, marginTop: 7, flexDirection: 'row', alignItems: 'center' }}>
                    <AntDesign name='warning' size={15} color='#dd2334'/>
                    <Text style={styles.warningText}>{warningBio}</Text>
                </View>}

                <BoxStringInput text={newLocation} setText={setNewLocation} label='Location' length={25} topMargin={30}
                    scrollDown={() => scrollViewRef.current.scrollTo({ y: 180, animated: true })}
                />

                <View style={{ height: 40 }}/>
            </View>
        );
    };

    const SaveButton = () => {
        if (warningName || warningBio) {
            return (
                <Pressable
                    style={[styles.buttonContainer, { backgroundColor: '#e6e6e6' }]}
                >
                    <Text style={[styles.buttonText, { color: Colors.mediumGrey }]}>Save</Text>
                </Pressable>
            );
        } else if (change) {
            return (
                <Pressable
                    onPress={() => checkName()}
                    style={({pressed}) => [styles.buttonContainer, { opacity: pressed ? 0.3 : 1 }]}
                >
                    <Text style={styles.buttonText}>Save</Text>
                </Pressable>
            );
        } else {
            return (
                <Pressable
                    style={[styles.buttonContainer, { backgroundColor: '#e6e6e6' }]}
                >
                    <Text style={[styles.buttonText, { color: Colors.mediumGrey }]}>Save</Text>
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
                    <Text style={{ fontSize: 20, fontFamily: 'proxima-nova-semi' }}>Edit profile</Text>
                </View>

                {Platform.OS === 'ios'
                    ? <KeyboardAwareScrollView
                        extraScrollHeight={-60}
                        bounces={false}
                    >
                        {EditPicture()}
                        {InputOptions()}
                    </KeyboardAwareScrollView>
                    : <ScrollView
                        ref={scrollViewRef}
                        contentContainerStyle={{ flexGrow: 1, justifyContent: 'space-between' }}
                    >
                        <View>
                            {EditPicture()}
                            {InputOptions()}
                        </View>

                        {!keyboardVisible && <View style={{ marginBottom: 10 }}>
                            <View style={{ height: 1, backgroundColor: Colors.border }}/>
                            {SaveButton()}
                        </View>}
                    </ScrollView>
                }

                {Platform.OS === 'ios' && <View style={{ marginBottom: 10 }}>
                    <View style={{ height: 1, backgroundColor: Colors.border }}/>
                    {SaveButton()}
                </View>}

                <Modal
                    isVisible={modalVisible}
                    onBackButtonPress={() => setModalVisible(false)}
                    onBackdropPress={() => setModalVisible(false)}
                    onSwipeComplete={() => setModalVisible(false)}
                    swipeDirection='down'
                    animationInTiming={200}
                    animationOutTiming={500}
                    backdropTransitionInTiming={400}
                    backdropTransitionOutTiming={100}
                    backdropOpacity={0.45}
                    style={{ justifyContent: 'flex-end', margin: 0 }}
                    useNativeDriverForBackdrop={true}
                >
                    <View style={styles.modalContainer}>
                        <View style={{ height: 5, width: 45, backgroundColor: Colors.mediumGrey, marginTop: 15, marginBottom: 5, borderRadius: 20, alignSelf: 'center' }}/>
                        <Pressable
                            onPress={() => {
                                setModalVisible(false);
                                setTimeout(() => {
                                    pickImageFromLibrary();
                                }, 1000);   // <-- 1000 ms needed for iOS, can reduce to 200 ms for Android
                            }}
                            style={({pressed}) => [{ flexDirection: 'row', height: 57, marginTop: 5, alignItems: 'center', backgroundColor: pressed ? '#e6e6e6' : 'white' }]}
                        >
                            <Ionicons name='image-outline' size={25} color='black' style={{ marginLeft: 25, marginRight: 23 }}/>
                            <Text style={{ fontFamily: 'proxima-nova-semi', fontSize: 16 }}>Image gallery</Text>
                        </Pressable>

                        <View style={{ height: 0.5, marginHorizontal: 25, backgroundColor: Colors.border }}/>

                        <Pressable
                            onPress={() => {
                                setModalVisible(false);
                                setTimeout(() => {
                                    pickImageFromCamera();
                                }, 1000);
                            }}
                            style={({pressed}) => [{ flexDirection: 'row', height: 54, alignItems: 'center', backgroundColor: pressed ? '#e6e6e6' : 'white' }]}
                        >
                            <CustomIcon name='camera' size={19} color='black' style={{ marginHorizontal: 25, left: 0.5 }}/>
                            <Text style={{ fontFamily: 'proxima-nova-semi', fontSize: 16 }}>Camera</Text>
                        </Pressable>

                        {newProfileImage !== null && <View>
                            <View style={{ height: 0.5, marginHorizontal: 25, backgroundColor: Colors.border }}/>

                            <Pressable
                                onPress={() => {
                                    setModalVisible(false);
                                    setTimeout(() => {
                                        setNewProfileImage(null);
                                    }, 200);
                                }}
                                style={({pressed}) => [{ flexDirection: 'row', height: 54, alignItems: 'center', backgroundColor: pressed ? '#e6e6e6' : 'white' }]}
                            >
                                <Ionicons name='trash-outline' size={27} color='#dd2334' style={{ marginHorizontal: 23 }}/>
                                <Text style={{ fontFamily: 'proxima-nova-semi', fontSize: 16, color: '#dd2334' }}>Remove picture</Text>
                            </Pressable>
                        </View>}
                    </View>
                </Modal>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    screen: {
        flex: 1
    },
    profileImage: {
        height: 100,
        width: 100,
        borderRadius: 50,
        overflow: 'hidden'
    },
    editIconContainer: {
        zIndex: 1,
        height: 38,
        width: 38,
        borderRadius: 19,
        backgroundColor: Colors.theme,
        borderWidth: 4,
        borderColor: 'white',
        position: 'absolute',
        top: 65,
        left: 65,
        alignItems: 'center',
        justifyContent: 'center'
    },
    modalContainer: {
        backgroundColor: 'white',
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        paddingBottom: Platform.OS === 'ios' ? 30 : 10
    },
    buttonContainer: {
        width: 200,
        height: 55,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        backgroundColor: Colors.theme,
        marginTop: 20
    },
    buttonText: {
        fontFamily: 'proxima-nova-semi',
        fontSize: 18,
        color: 'white'
    },
    warningText: {
        color: '#dd2334',
        fontFamily: 'proxima-nova-reg',
        fontSize: 14,
        marginLeft: 10
    }
});

export default EditProfileScreen;