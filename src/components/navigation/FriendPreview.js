import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, Pressable, Animated } from 'react-native';
import Colors from '../../utils/Colors';

import { doc, getDoc, getDocs, query, where, collection } from 'firebase/firestore';
import { db, auth } from '../../../firebase-config';

import CustomIcon from '../../utils/CustomIcon';

// ** modify navigation to chat screen to include any useful parameters

// ** finish coding connect option button (message/add friend)

// ** (optional) test react-native-fast-image to see if it loads profile pictures faster
// *  maybe try using progressive JPEGs or tools to compress the profile images even more

const FriendPreview = ({ navigation, screen, userID }) => {
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [profileImage, setProfileImage] = useState(null);
    const [isFriend, setIsFriend] = useState(true);

    const colorAnimation = useRef(new Animated.Value(0)).current;
    const sizeAnimation = useRef(new Animated.Value(0)).current;

    const backgroundColorChange = colorAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: ['white', '#e6e6e6']
    });

    const backgroundWidthChange = sizeAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: ['70%', '100%']
    });

    useEffect(() => {
        // use the userID to retrieve the user's info
        getUserInfo();

        if (screen === 'profile') {
            // check if they are already in the current user's friend list
            checkIfFriend();
        }
    }, []);

    async function getUserInfo () {
        // retrieve the user document with the name of the user's ID
        const docRef = doc(db, 'users', userID);
        const docSnap = await getDoc(docRef);
        setName(docSnap.data().name);
        setUsername(docSnap.data().username);
        setProfileImage(docSnap.data().profileImageURL);
    };

    async function checkIfFriend () {
        // start by checking if the user being displayed is the current user
        if (userID === auth.currentUser.uid) {
            setIsFriend(true);
            return;
        }

        // setup a query to look for this user in the current user's friend list
        const q = query(collection(db, 'users', auth.currentUser.uid, 'friends', userID), where('userID', '==', userID));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            setIsFriend(true);
        } else {
            setIsFriend(false);
        }
    };

    function onPressIn () {
        Animated.parallel([
            Animated.timing(colorAnimation, {
                toValue: 1,
                duration: 250,
                useNativeDriver: false  // native driver doesn't support color animation
            }),
            Animated.timing(sizeAnimation, {
                toValue: 1,
                duration: 250,
                useNativeDriver: false
            })
        ]).start(() => {
            Animated.parallel([
                Animated.timing(colorAnimation, {
                    toValue: 0,
                    duration: 250,
                    useNativeDriver: false  // native driver doesn't support color animation
                }),
                Animated.timing(sizeAnimation, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: false
                })
            ]).start();
        })
    };

    // switch order of username & name of friend based on which screen the preview is being displayed
    const ProfileDetails = () => {
        if (screen === 'newChat') {
            return (
                <View style={{ flex: 1, justifyContent: 'space-evenly', paddingVertical: 15 }}>
                    <Text style={{ fontFamily: 'proxima-nova-semi', fontSize: 18 }}>{username}</Text>
                    <Text style={{ fontFamily: 'proxima-nova-reg', fontSize: 16, color: Colors.darkGrey }}>{name}</Text>
                </View>
            );
        } else {
            return (
                <View style={{ flex: 1, justifyContent: 'space-evenly', paddingVertical: 15 }}>
                    <Text style={{ fontFamily: 'proxima-nova-semi', fontSize: 18 }}>{name}</Text>
                    <Text style={{ fontFamily: 'proxima-nova-reg', fontSize: 16, color: Colors.darkGrey }}>{username}</Text>
                </View>
            );
        }
    };

    const ConnectOption = () => {
        if (screen === 'userProfile') {
            return (
                <Pressable
                    //onPress={() => }  // <-- navigate to chat screen
                    style={({pressed}) => [styles.messageButtonContainer, { opacity: pressed ? 0.2 : 1 }]}
                >
                    <View style={{ flexDirection: 'row', flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                        <Text style={{ fontFamily: 'proxima-nova-reg', fontSize: 16, color: '#595959' }}>Message</Text>
                    </View>
                </Pressable>
            );
        } else if (screen === 'profile') {
            if (!isFriend) {
                return (
                    <Pressable
                        // don't change opacity when selected, change color or disappear
                        //onPress={() => }
                        style={({pressed}) => [styles.addButtonContainer, { opacity: pressed ? 0.2 : 1 }]}
                    >
                        <View style={{ flexDirection: 'row', flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                            <CustomIcon name='add-friend' size={17} color='white' style={{ bottom: 1, marginRight: 5 }}/>
                            <Text style={{ fontFamily: 'proxima-nova-reg', fontSize: 16, color: 'white' }}>Add</Text>
                        </View>
                    </Pressable>
                );
            }
        }
    };

    return (
        <View style={{ backgroundColor: 'white', height: 80 }}>
            <Animated.View
                style={{ height: 85, backgroundColor: backgroundColorChange, width: backgroundWidthChange, alignSelf: 'center', position: 'absolute' }}
            />
            <Pressable
                onPress={() => {
                    // check if the user being displayed isn't the current user
                    if (userID !== auth.currentUser.uid) {
                        if (screen === 'newChat') {
                            navigation.navigate('InboxStack', { screen: 'Chat' });  // <-- add any useful parameters
                        } else {
                            navigation.push('ProfileStack', { screen: 'Profile', params: { userID, profileUsername: username, profileName: name, profileImageURL: profileImage, friend: isFriend } });
                        }
                    }
                }}
                onPressIn={onPressIn}
                style={{ flex: 1, flexDirection: 'row'}}
            >
                <View style={styles.profileIcon}>
                    <Image
                        source={profileImage ? { uri: profileImage } : require('../../assets/images/profile.png')}
                        style={{ flex: 1, height: undefined, width: undefined }}
                    />
                </View>

                {ProfileDetails()}
                {ConnectOption()}
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    profileIcon: {
        height: 60,
        width: 60,
        borderRadius: 30,
        overflow: 'hidden',
        marginLeft: 15,
        marginRight: 12,
        alignSelf: 'center'
    },
    messageButtonContainer: {
        width: 85,
        height: 40,
        borderRadius: 30,
        borderWidth: 1,
        borderColor: '#595959',
        alignSelf: 'center',
        marginLeft: 10,
        marginRight: 15
    },
    addButtonContainer: {
        width: 75,
        height: 40,
        borderRadius: 30,
        backgroundColor: Colors.theme,
        alignSelf: 'center',
        marginLeft: 10,
        marginRight: 15
    }
});

export default FriendPreview;