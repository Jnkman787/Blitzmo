import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, Pressable, StatusBar, Platform, ActivityIndicator } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';
import { useFocusEffect } from '@react-navigation/native';
import Modal from 'react-native-modal';
import Colors from '../../utils/Colors';
import NetInfo from '@react-native-community/netinfo';

import { doc, getDoc, setDoc, query, collection, where, getDocs, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../../../firebase-config';

import PostList from '../../components/display/PostList';
import FriendList from '../../components/display/FriendList';

import CustomIcon from '../../utils/CustomIcon';
import { Octicons, Ionicons, MaterialIcons, Feather, AntDesign } from '@expo/vector-icons';

// ** will need to implement the use of K (thousand) and M (million) in the value of postCount and friendCount,
//    ensuring the text value can always fit in the pressable container
// *  start using K when reaching 10,000 instead of 1,000
// *  to implement K and M, check and modify the values directly before assigning them to postCount or friendCount

// ** send the user a notification if they've been sent a friend request

// ** finish adding ability to block a user
// *  also add ability to unblock a user if they are already blocked
// *  likely want to make a collection called "blocked users"

// ** include the report user option in a future update
// *  leave the code for the report button unfinished for now

// ** check if this user blocked the current user
// *  include a blocked display similar to the private display that says the current user has been blocked
// *  maybe remove the connect option button as well if blocked

// ** might be faster if I just pass route parameters that inform me if the user is a friend, sent a friend request, or received one

const ProfileScreen = ({ navigation, route }) => {
    const { userID, profileUsername, profileName, profileImageURL, friend } = route.params;
    const [username, setUsername] = useState(profileUsername ? profileUsername : '-');
    const [name, setName] = useState(profileName ? profileName : '-');
    const [bio, setBio] = useState(null);
    const [location, setLocation] = useState(null);
    const [profileImage, setProfileImage] = useState(profileImageURL ? profileImageURL : null);
    const [postCount, setPostCount] = useState('-');
    const [friendCount, setFriendCount] = useState('-');
    
    const [isFriend, setIsFriend] = useState(friend);
    const [friendRequest, setFriendRequest] = useState(null);   // Sent or Received

    const [posts, setPosts] = useState([]);
    const [friends, setFriends] = useState([]);

    const [isConnected, setIsConnected] = useState(null);
    const [loading, setLoading] = useState(true);

    const [menuVisible, setMenuVisible] = useState(false);
    const [categoryOption, setCategoryOption] = useState('Posts');      // Posts or Friends
    const [postsDisplayOption, setPostsDisplayOption] = useState('Grid');   // Grid or Calendar

    const privateProfile = true;    // ** <-- temp

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

    useEffect(() => {
        // setup a listener for checking the user's internet connection each time they open the screen
        const connectionListener = NetInfo.addEventListener(state => {
            setIsConnected(state.isConnected);
            if (state.isConnected) {
                getUserInfo();
                checkIfFriend();
            }
        });

        return () => {
            connectionListener;
        };
    }, []);

    useEffect(() => {
        if (Platform.OS === 'android') {
            if (menuVisible) {
                StatusBar.setBackgroundColor('#858585', true);
            } else {
                StatusBar.setBackgroundColor('transparent');
            }
        }
    }, [menuVisible]);

    async function getUserInfo () {
        // retrieve the user document with the name of the user's ID
        const docRef = doc(db, 'users', userID);
        const docSnap = await getDoc(docRef);
        setProfileImage(docSnap.data().profileImageURL);
        setUsername(docSnap.data().username);
        setName(docSnap.data().name);
        setBio(docSnap.data().bio);
        setLocation(docSnap.data().location);
        setPostCount(docSnap.data().postCount);
        setFriendCount(docSnap.data().friendCount);
    };

    async function checkIfFriend () {
        // check the current user's friend list and look for this user
        const q = query(collection(db, 'users', auth.currentUser.uid, 'friends'), where('userID', '==', userID));
        const querySnapshot = await getDocs(q);

        // check if there are any results
        if (!querySnapshot.empty) {
            setIsFriend(true);
        } else {
            checkIfRequestReceived();
        }
    };

    async function checkIfRequestReceived () {
        // check if this user has already received a friend request from the current user
        const q = query(collection(db, 'users', userID, 'friendRequests'), where('userID', '==', auth.currentUser.uid));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            setFriendRequest('Received');
        } else {
            checkIfRequestSent();
        }
    };

    async function checkIfRequestSent () {
        // check if this user already sent the current user a friend request
        const q = query(collection(db, 'users', auth.currentUser.uid, 'friendRequests'), where('userID', '==', userID));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            setFriendRequest('Sent');
        }
    };

    async function addFriend () {
        if (friendRequest === 'Sent') {     // accept the user's friend request
            setFriendRequest(null);
            setIsFriend(true);

            // add this user as a friend for the current user
            await setDoc(doc(db, 'users', auth.currentUser.uid, 'friends', userID), { userID: userID });

            // add the current user as a friend for this user
            await setDoc(doc(db, 'users', userID, 'friends', auth.currentUser.uid), { userID: auth.currentUser.uid });
            setFriendCount(friendCount + 1);    // <-- update local friendCount value

            // delete this user's friend request to the current user
            await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'friendRequests', userID));
        } else {    // send a friend request
            await setDoc(doc(db, 'users', userID, 'friendRequests', auth.currentUser.uid), { userID: auth.currentUser.uid });
            setFriendRequest('Received');
        }
    };

    async function unsendRequest () {
        await deleteDoc(doc(db, 'users', userID, 'friendRequests', auth.currentUser.uid));
        setFriendRequest(null);
    };

    async function removeFriend () {
        setIsFriend(false);

        // remove this user from the current user's friend list
        await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'friends', userID));

        // remove the current user from this user's friend list
        await deleteDoc(doc(db, 'users', userID, 'friends', auth.currentUser.uid));
        setFriendCount(friendCount - 1);
    };

    const ConnectOption = () => {
        if (friendRequest === 'Received') {
            return (
                <Pressable
                    onPress={() => unsendRequest()}      // unsend friend request
                    style={({pressed}) => [styles.friendButton, { backgroundColor: Colors.greyBackdrop, opacity: pressed ? 0.2 : 1 }]}
                >
                    <CustomIcon name='request-sent' size={23} color='black'/>
                </Pressable>
            );
        } else if (!isFriend || friendRequest === 'Sent') {
            return (
                <Pressable
                    onPress={() => addFriend()}
                    style={({pressed}) => [styles.friendButton, { backgroundColor: Colors.theme, opacity: pressed ? 0.2 : 1 }]}
                >
                    <CustomIcon name='add-friend' size={23} color='white'/>
                </Pressable>
            );
        } else if (isFriend) {
            return (
                <Pressable
                    //onPress={() => }      // <-- navigate to the chat screen
                    style={({pressed}) => [styles.messageButton, { opacity: pressed ? 0.2 : 1 }]}
                >
                    <Ionicons name='chatbubble-ellipses' size={27} color='black'/>
                </Pressable>
            );
        }
    };

    const CategoryOptions = () => {
        return (
            <View style={styles.categoryContainer}>
                <Pressable
                    style={({pressed}) => [styles.categoryButton, { 
                        opacity: pressed ? categoryOption === 'Posts' ? 1 : 0.2 : 1,
                        backgroundColor: categoryOption === 'Posts' ? 'black' : Colors.greyBackdrop
                    }]}
                    onPress={() => setCategoryOption('Posts')}
                >
                    <Text style={[styles.countText, { color: categoryOption === 'Posts' ? 'white' : 'black' }]}>{postCount}</Text>
                    <Text style={[styles.categoryText, { color: categoryOption === 'Posts' ? '#cccccc' : '#808080' }]}>Posts</Text>
                </Pressable>
                <Pressable
                    style={({pressed}) => [styles.categoryButton, { 
                        opacity: pressed ? categoryOption === 'Friends' ? 1 : 0.2 : 1,
                        backgroundColor: categoryOption === 'Friends' ? 'black' : Colors.greyBackdrop
                    }]}
                    onPress={() => {
                        setCategoryOption('Friends');
                        // check if the friend data retrieval has already taken place
                        if (friends !== null) {
                            if (friends.length === 0) { setLoading(true); }
                        }
                    }}
                >
                    <Text style={[styles.countText, { color: categoryOption === 'Friends' ? 'white' : 'black' }]}>{friendCount}</Text>
                    <Text style={[styles.categoryText, { color: categoryOption === 'Friends' ? '#cccccc' : '#808080' }]}>Friends</Text>
                </Pressable>
                {ConnectOption()}
            </View>
        );
    };

    const ProfileHeader = () => {
        let headerText = null;
        if (isConnected && !loading) {
            if (!privateProfile || isFriend) {
                if (categoryOption === 'Posts') {
                    if (postsDisplayOption === 'Calendar') { headerText = 'Last 14 days'; }
                } else {
                    if (friends !== null) { headerText = 'Friends ' + friendCount; }
                }
            }
        }

        return (
            <View style={{ backgroundColor: 'white' }}>
                <View style={{ backgroundColor: Colors.greyBackdrop, height: 104, top: 0, position: 'absolute', width: '100%' }}/>
                <View style={styles.profileImage}>
                    <Image
                        source={profileImage ? { uri: profileImage } : require('../../assets/images/profile.png')}
                        style={{ flex: 1, height: undefined, width: undefined, borderRadius: 70 }}
                    />
                </View>
                <Text style={styles.nameText}>{name}</Text>
                {bio && <Text style={styles.bioText}>{bio}</Text>}
                {CategoryOptions()}
                <View style={{ height: 1, backgroundColor: Colors.border }}/>

                {headerText &&
                    <Text style={{ fontFamily: 'proxima-nova-semi', fontSize: 17, color: Colors.mediumGrey, marginLeft: 15, marginVertical: 10 }}>{headerText}</Text>
                }
            </View>
        );
    };

    const ListType = () => {
        if (categoryOption === 'Posts') {
            return (
                <PostList
                    navigation={navigation}
                    ProfileHeader={ProfileHeader}
                    displayOption={postsDisplayOption}
                    setDisplayOption={setPostsDisplayOption}
                    loading={loading}
                    setLoading={setLoading}
                    posts={posts}
                    setPosts={setPosts}
                    username={username}
                />
            );
        } else if (categoryOption === 'Friends') {
            return (
                <FriendList
                    navigation={navigation}
                    ProfileHeader={ProfileHeader}
                    loading={loading}
                    setLoading={setLoading}
                    friends={friends}
                    setFriends={setFriends}
                    userID={userID}
                />
            );
        }
    };

    const PrivateDisplay = () => {
        return (
            <View style={{ flex: 1, backgroundColor: 'white' }}>
                {ProfileHeader()}
                <View style={{ alignItems: 'center', marginHorizontal: 25 }}>
                    <Text style={{ fontFamily: 'proxima-nova-bold', fontSize: 20, marginTop: 60 }}>This account is private</Text>
                    <Text style={{ fontFamily: 'proxima-nova-reg', fontSize: 17, marginTop: 20, textAlign: 'center' }}>
                        Add this user to your friends list to view their content and participate in discussion
                    </Text>
                </View>
            </View>
        );
    };

    const ContentDisplay = () => {
        if (isConnected === false) {     // user is offline
            return (
                <View style={{ flex: 1, backgroundColor: 'white'}}>
                    {ProfileHeader()}
    
                    <View style={{ alignItems: 'center', marginTop: 30 }}>
                        <Text style={{ fontFamily: 'proxima-nova-semi', fontSize: 21 }}>No internet connection</Text>
                        <Text style={{ fontFamily: 'proxima-nova-reg', fontSize: 16, marginTop: 15 }}>Please check your internet connection</Text>
                        <MaterialIcons name='wifi-off' size={45} color='black' style={{ marginTop: 30 }}/>
                    </View>
                </View>
            );
        } else if (isConnected === null) {     // still checking if user is online
            return (
                <View style={{ flex: 1, backgroundColor: 'white' }}>
                    {ProfileHeader()}

                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                        <ActivityIndicator
                            size={Platform.OS === 'android' ? 60 : 'large'}
                            color={Colors.theme}
                        />
                    </View>
                </View>
            );
        } else if (isConnected === true) {      // user is online
            if (!privateProfile || isFriend) {
                return (
                    ListType()
                );
            } else {
                return (
                    PrivateDisplay()
                );
            }
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: Colors.greyBackdrop, paddingTop: Platform.OS === 'ios' ? 44 : 0 }}>
            <StatusBar barStyle={'dark-content'} translucent backgroundColor={'transparent'}/>
            {Platform.OS === 'android' && <View style={{ height: StatusBar.currentHeight }}/>}
            <View style={styles.screen}>
                <View style={{ height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
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
                    <View style={{ alignItems: 'center', marginTop: location ? 5 : 0 }}>
                        <Text style={{ fontSize: 20, fontFamily: 'proxima-nova-semi' }}>{username}</Text>
                        {location && <Text style={{ fontSize: 15, fontFamily: 'proxima-nova-reg', marginTop: 5 }}>{location}</Text>}
                    </View>
                    <Pressable
                        onPress={() => setMenuVisible(true)}
                        style={({pressed}) => [styles.menuButton, { opacity: pressed ? 0.2 : 1 }]}
                    >
                        <Feather name='menu' size={20} color='black'/>
                    </Pressable>
                </View>
                
                {ContentDisplay()}

                <Modal
                    isVisible={menuVisible}
                    onBackButtonPress={() => setMenuVisible(false)}
                    onBackdropPress={() => setMenuVisible(false)}
                    onSwipeComplete={() => setMenuVisible(false)}
                    swipeDirection='down'
                    animationInTiming={200}
                    animationOutTiming={500}
                    backdropTransitionInTiming={400}
                    backdropTransitionOutTiming={100}
                    backdropOpacity={0.45}
                    style={{ justifyContent: 'flex-end', margin: 0 }}
                    useNativeDriverForBackdrop={true}
                >
                    <View style={styles.menuContainer}>
                        <View style={{ height: 5, width: 45, backgroundColor: Colors.mediumGrey, marginTop: 15, marginBottom: 5, borderRadius: 20, alignSelf: 'center' }}/>
                        <Pressable
                            onPress={() => {
                                setMenuVisible(false);
                                // add code for blocking user
                            }}
                            style={({pressed}) => [{ flexDirection: 'row', height: 57, marginTop: 5, alignItems: 'center', backgroundColor: pressed ? '#e6e6e6' : 'white' }]}
                        >
                            <MaterialIcons name='block' size={26} color='#dd2334' style={{ marginHorizontal: 24 }}/>
                            <Text style={{ fontFamily: 'proxima-nova-semi', fontSize: 16, color: '#dd2334' }}>Block {name}</Text>
                        </Pressable>

                        {isFriend && <View>
                            <View style={{ height: 0.5, marginHorizontal: 25, backgroundColor: Colors.border }}/>

                            <Pressable
                                onPress={() => {
                                    setMenuVisible(false);
                                    removeFriend();
                                }}
                                style={({pressed}) => [{ flexDirection: 'row', height: 54, alignItems: 'center', backgroundColor: pressed ? '#e6e6e6' : 'white' }]}
                            >
                                <Ionicons name='person-remove-outline' size={27} color='#dd2334' style={{ marginLeft: 25, marginRight: 22, transform: [{ scaleX: -1 }] }}/>
                                <Text style={{ fontFamily: 'proxima-nova-semi', fontSize: 16, color: '#dd2334' }}>Remove friend</Text>
                            </Pressable>
                        </View>}

                        {/*<View style={{ height: 0.5, marginHorizontal: 25, backgroundColor: Colors.border }}/>

                        <Pressable
                            onPress={() => {
                                setMenuVisible(false);
                                // add code for reporting user
                            }}
                            style={({pressed}) => [{ flexDirection: 'row', height: 54, alignItems: 'center', backgroundColor: pressed ? '#e6e6e6' : 'white' }]}
                        >
                            <AntDesign name='warning' size={25} color='#dd2334' style={{ marginHorizontal: 25 }}/>
                            <Text style={{ fontFamily: 'proxima-nova-semi', fontSize: 16, color: '#dd2334' }}>Report {name}</Text>
                        </Pressable>*/}
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
    menuButton: {
        position: 'absolute',
        right: 15,
        backgroundColor: 'white',
        height: 35,
        width: 35,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center'
    },
    profileImage: {
        height: 140,
        width: 140,
        borderRadius: 70,
        overflow: 'hidden',
        alignSelf: 'center',
        padding: 10,
        backgroundColor: Colors.greyBackdrop,
        marginTop: 5
    },
    nameText: {
        fontFamily: 'proxima-nova-semi',
        fontSize: 20,
        marginTop: 15,
        textAlign: 'center'
    },
    bioText: {
        fontFamily: 'proxima-nova-reg',
        fontSize: 15,
        marginTop: 10,
        textAlign: 'center',
        marginHorizontal: 30
    },
    categoryContainer: {
        alignSelf: 'center',
        flexDirection: 'row',
        marginVertical: 15
    },
    categoryButton: {
        alignItems: 'center',
        justifyContent: 'space-evenly',
        paddingVertical: 3,
        width: 100,
        height: 55,
        borderRadius: 20,
        marginRight: 10
    },
    countText: {
        fontFamily: 'proxima-nova-semi',
        fontSize: 20
    },
    categoryText: {
        fontFamily: 'proxima-nova-reg',
        fontSize: 14
    },
    friendButton: {
        height: 55,
        width: 55,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center'
    },
    messageButton: {
        height: 55,
        width: 55,
        borderRadius: 20,
        backgroundColor: Colors.greyBackdrop,
        alignItems: 'center',
        justifyContent: 'center'
    },
    menuContainer: {
        backgroundColor: 'white',
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        paddingBottom: Platform.OS === 'ios' ? 30 : 10
    }
});

export default ProfileScreen;