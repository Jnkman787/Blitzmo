import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, Pressable, Animated } from 'react-native';
import Colors from '../../utils/Colors';

import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../../../firebase-config';

import { AntDesign } from '@expo/vector-icons';

const FriendRequest = ({ navigation, userID }) => {
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [profileImage, setProfileImage] = useState(null);

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
    }, []);

    async function getUserInfo () {
        // retrieve the user document with the name of the user's ID
        const docRef = doc(db, 'users', userID);
        const docSnap = await getDoc(docRef);
        setName(docSnap.data().name);
        setUsername(docSnap.data().username);
        setProfileImage(docSnap.data().profileImageURL);
    };

    async function acceptRequest () {
        // add this user as a friend for the current user
        await setDoc(doc(db, 'users', auth.currentUser.uid, 'friends', userID), { userID: userID });

        // add the current user as a friend for this user
        await setDoc(doc(db, 'users', userID, 'friends', auth.currentUser.uid), { userID: auth.currentUser.uid });

        // delete this user's friend request to the current user
        await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'friendRequests', userID));
    };

    async function deleteRequest () {
        await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'friendRequests', userID));
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

    return (
        <View style={{ backgroundColor: 'white', height: 80 }}>
            <Animated.View
                style={{ height: 85, backgroundColor: backgroundColorChange, width: backgroundWidthChange, alignSelf: 'center', position: 'absolute' }}
            />
            <Pressable
                onPress={() => navigation.navigate('ProfileStack', { screen: 'Profile', params: { userID, profileUsername: username, profileName: name, profileImageURL: profileImage } })}
                onPressIn={onPressIn}
                style={{ flex: 1, flexDirection: 'row'}}
            >
                <View style={styles.profileIcon}>
                    <Image
                        source={profileImage ? { uri: profileImage } : require('../../assets/images/profile.png')}
                        style={{ flex: 1, height: undefined, width: undefined }}
                    />
                </View>
                <View style={{ flex: 1, justifyContent: 'space-evenly', paddingVertical: 15 }}>
                    <Text style={{ fontFamily: 'proxima-nova-semi', fontSize: 18 }}>{name}</Text>
                    <Text style={{ fontFamily: 'proxima-nova-reg', fontSize: 16, color: Colors.darkGrey }}>{username}</Text>
                </View>
                <Pressable
                    onPress={() => acceptRequest()}
                    style={({pressed}) => [styles.acceptButtonContainer, { opacity: pressed ? 0.2 : 1 }]}
                >
                    <Text style={{ fontFamily: 'proxima-nova-reg', fontSize: 16, color: 'white' }}>Accept</Text>
                </Pressable>
                <Pressable
                    onPress={() => deleteRequest()}
                    style={({pressed}) => [styles.deleteButton, { opacity: pressed ? 0.2 : 1 }]}
                >
                    <AntDesign name='close' size={28} color={Colors.mediumGrey}/>
                </Pressable>
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
    acceptButtonContainer: {
        width: 75,
        height: 40,
        borderRadius: 30,
        backgroundColor: Colors.theme,
        alignSelf: 'center',
        marginLeft: 10,
        marginRight: 5,
        alignItems: 'center',
        justifyContent: 'center'
    },
    deleteButton: {
        alignSelf: 'center',
        height: 40,
        width: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 5
    }
});

export default FriendRequest;