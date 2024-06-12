import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, Pressable, Platform, StatusBar, ActivityIndicator } from 'react-native';
import { ActiveTabContext } from '../../utils/ContextVariables';
import { useFocusEffect } from '@react-navigation/native';
import * as NavigationBar from 'expo-navigation-bar';
import Modal from 'react-native-modal';
import Colors from '../../utils/Colors';
import NetInfo from '@react-native-community/netinfo';

import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../../../firebase-config';

import PostList from '../../components/display/PostList';
import FriendList from '../../components/display/FriendList';

import CustomIcon from '../../utils/CustomIcon';
import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';

// ** will need to implement the use of K (thousand) and M (million) in the value of postCount and friendCount,
//    ensuring the text value can always fit in the pressable container
// *  start using K when reaching 10,000 instead of 1,000
// *  to implement K and M, check and modify the values directly before assigning them to postCount or friendCount

// ** try storing some of the user's basic profile info locally on their device (maybe using AsyncStorage)
//    this way, if they navigate to settings or the edit profile screen, I can load the locally stored data
//    when they have no internet connection instead of relying on route parameters
// *  maybe just load the locally stored data on those screens regardless and I can simply just keep it
//    up to date by updating it when it doesn't match what's stored on Firebase
// *  other option is to deny user the ability to navigate to those screens when they have no internet connection

const UserProfileScreen = ({ navigation }) => {
    const [username, setUsername] = useState('-');
    const [name, setName] = useState(auth.currentUser.displayName);
    const [bio, setBio] = useState(null);
    const [location, setLocation] = useState(null);
    const [profileImage, setProfileImage] = useState(auth.currentUser.photoURL);
    const [postCount, setPostCount] = useState('-');
    const [friendCount, setFriendCount] = useState('-');

    const [posts, setPosts] = useState([]);
    const [friends, setFriends] = useState([]);
    const [friendSuggestions, setFriendSuggestions] = useState([]);
    const [friendRequests, setFriendRequests] = useState([]);

    const [isConnected, setIsConnected] = useState(null);
    const [loading, setLoading] = useState(true);

    const [menuVisible, setMenuVisible] = useState(false);
    const [categoryOption, setCategoryOption] = useState('Posts');      // Posts or Friends
    const [postsDisplayOption, setPostsDisplayOption] = useState('Grid');   // Grid or Calendar
    const [friendsDisplayOption, setFriendsDisplayOption] = useState('Friends');     // Friends, Suggestions, or Requests

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
        });

        return () => {
            connectionListener;
        };
    }, []);

    useEffect(() => {
        if (isConnected) {
            // listen for changes in a user's profile info
            const unsubUserInfo = getUserInfo();

            return () => {
                unsubUserInfo();
            };
        }
    }, [isConnected]);

    useEffect(() => {
        if (Platform.OS === 'android') {
            if (menuVisible) {
                StatusBar.setBackgroundColor('#858585', true);
            } else {
                StatusBar.setBackgroundColor('transparent');
            }
        }
    }, [menuVisible]);

    function getUserInfo () {
        const unsubUserInfo = onSnapshot(doc(db, 'users', auth.currentUser.uid), (doc) => {
            setUsername(doc.data().username);
            setProfileImage(doc.data().profileImageURL);
            setName(doc.data().name);
            setBio(doc.data().bio);
            setLocation(doc.data().location);
            setFriendCount(doc.data().friendCount);
            setPostCount(doc.data().postCount);
        });

        return unsubUserInfo;
    };

    const CategoryOptions = () => {
        return (
            <View style={styles.categoryContainer}>
                <Pressable
                    style={({pressed}) => [styles.categoryButton, { 
                        opacity: pressed ? categoryOption === 'Posts' ? 1 : 0.2 : 1,
                        backgroundColor: categoryOption === 'Posts' ? 'black' : Colors.greyBackdrop,
                        marginRight: 10
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
            </View>
        );
    };

    const ProfileHeader = () => {
        let headerText = null;
        if (isConnected && !loading) {
            if (categoryOption === 'Posts') {
                if (postsDisplayOption === 'Calendar') { headerText = 'Last 14 days'; }
            } else {
                if (friendsDisplayOption === 'Friends' && friends !== null) { headerText = 'Friends ' + friendCount; }
                else if (friendsDisplayOption === 'Suggestions' && friendSuggestions.length > 0) { headerText = 'People you may know'; }
                else if (friendsDisplayOption === 'Requests' && friendRequests.length > 0) { headerText = 'Requests ' + friendRequests.length; }
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
                    user={true}
                    ProfileHeader={ProfileHeader}
                    displayOption={postsDisplayOption}
                    setDisplayOption={setPostsDisplayOption}
                    loading={loading}
                    setLoading={setLoading}
                    posts={posts}
                    setPosts={setPosts}
                />
            );
        } else if (categoryOption === 'Friends') {
            return (
                <FriendList
                    navigation={navigation}
                    user={true}
                    ProfileHeader={ProfileHeader}
                    displayOption={friendsDisplayOption}
                    setDisplayOption={setFriendsDisplayOption}
                    loading={loading}
                    setLoading={setLoading}
                    friends={friends}
                    setFriends={setFriends}
                    friendSuggestions={friendSuggestions}
                    setFriendSuggestions={setFriendSuggestions}
                    friendRequests={friendRequests}
                    setFriendRequests={setFriendRequests}
                />
            );
        }
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
            return (
                ListType()
            );
        }
    };

    return (
        <View style={styles.screen}> 
            <View style={{ height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
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
                            setTimeout(() => {
                                navigation.navigate('SettingsStack', { screen: 'Settings' });
                            }, 200);
                        }}
                        style={({pressed}) => [{ flexDirection: 'row', height: 57, marginTop: 5, alignItems: 'center', backgroundColor: pressed ? '#e6e6e6' : 'white' }]}
                    >
                        <Ionicons name='settings-outline' size={25} color='black' style={{ marginHorizontal: 25 }}/>
                        <Text style={{ fontFamily: 'proxima-nova-semi', fontSize: 16 }}>Settings</Text>
                    </Pressable>

                    <View style={{ height: 0.5, marginHorizontal: 25, backgroundColor: Colors.border }}/>

                    <Pressable
                        onPress={() => {
                            setMenuVisible(false);
                            setTimeout(() => {
                                navigation.navigate('ProfileStack', { screen: 'EditProfile', params: { name, username, bio, location, profileImage } });
                            }, 200);
                        }}
                        style={({pressed}) => [{ flexDirection: 'row', height: 54, alignItems: 'center', backgroundColor: pressed ? '#e6e6e6' : 'white' }]}
                    >
                        <CustomIcon name='edit-outline' size={24} color='black' style={{ marginHorizontal: 25 }}/>
                        <Text style={{ fontFamily: 'proxima-nova-semi', fontSize: 16 }}>Edit profile</Text>
                    </Pressable>
                </View>
            </Modal>
        </View>
    );
};

UserProfileScreen.navigationOptions = ({ navigation }) => {
    const isFocused = navigation.isFocused();
    const { activeTab } = useContext(ActiveTabContext);

    return {
        tabBarButton: () => {
            if (isFocused) {
                return (
                    <View style={{ flex: 1, height: 56, alignItems: 'center', justifyContent: 'center' }}>
                        <CustomIcon name='profile' size={26} color='black'/>
                        <Text style={{ fontFamily: 'proxima-nova-semi', fontSize: 10.5, color: 'black', marginTop: 5 }}>Profile</Text>
                    </View>
                );
            } else {
                return (
                    <Pressable
                        onPress={() => navigation.navigate('Tab', { screen: 'UserProfile' })}
                        style={{ flex: 1, height: 56, alignItems: 'center', justifyContent: 'center' }}
                    >
                        <CustomIcon name='profile-outline' size={26} color={activeTab === 'Home' ? '#cccccc' : '#808080'}/>
                        <Text style={{ fontFamily: 'proxima-nova-semi', fontSize: 10.5, color: activeTab === 'Home' ? '#cccccc' : '#808080', marginTop: 5 }}>Profile</Text>
                    </Pressable>
                );
            }
        }
    };
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
        marginTop: 10,
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
        borderRadius: 20
    },
    countText: {
        fontFamily: 'proxima-nova-semi',
        fontSize: 20
    },
    categoryText: {
        fontFamily: 'proxima-nova-reg',
        fontSize: 14
    },
    menuContainer: {
        backgroundColor: 'white',
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        paddingBottom: Platform.OS === 'ios' ? 30 : 10
    }
});

export default UserProfileScreen;