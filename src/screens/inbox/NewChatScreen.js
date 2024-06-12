import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, Platform, Pressable, SectionList, FlatList, ActivityIndicator } from 'react-native';
import Colors from '../../utils/Colors';
import NetInfo from '@react-native-community/netinfo';

import SearchBar from '../../components/input/SearchBar';
import FriendPreview from '../../components/navigation/FriendPreview';

import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../../firebase-config';

import CustomIcon from '../../utils/CustomIcon';
import { Octicons, MaterialIcons, AntDesign } from '@expo/vector-icons';

// ** (optional) decide if the search bar should still be displayed if the user has no friends

const NewChatScreen = ({ navigation }) => {
    const [friends, setFriends] = useState([]);
    const [friendSections, setFriendSections] = useState([]);

    const [search, setSearch] = useState('');
    const [results, setResults] = useState([]);

    const [isConnected, setIsConnected] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // setup a listener for checking the user's internet connection each time they open the screen
        const connectionListener = NetInfo.addEventListener(state => {
            setIsConnected(state.isConnected);
            if (state.isConnected) {
                getFriends();
            }
        });

        return () => {
            connectionListener;
        };
    }, []);

    useEffect(() => {
        if (search.length > 0) {
            executeSearch();
        } else {
            setResults([]);     // reset search results
        }
    }, [search]);

    async function getFriends () {
        // retrieve the user's list of friends
        const querySnapshot = await getDocs(collection(db, 'users', auth.currentUser.uid, 'friends'));

        // retrieve each friend's name & username and make a list of objects
        let friendData = [];
        for (let i = 0; i < querySnapshot.docs.length; i++) {
            const docRef = doc(db, 'users', querySnapshot.docs[i].id);
            const docSnap = await getDoc(docRef);
            friendData.push({ userID: docSnap.data().userID, name: docSnap.data().name, username: docSnap.data().username });
        }

        // sort the friendData alphabetically by name
        friendData.sort((a, b) => a.name.localeCompare(b.name));

        setFriends(friendData);
        setupFriendSections(friendData);
    };

    // divide the list of friends into alphabetical sections based on name
    function setupFriendSections (friendData) {
        const sectionsArray = [];
        friendData.forEach((friend) => {
            // check if the first character in the user's name is a letter
            // if yes, capitalize it
            // if no, set it to the value '#'
            const firstCharacter = /^[a-zA-Z]/.test(friend.name.charAt(0)) ? friend.name.charAt(0).toUpperCase() : '#';

            // look for a section with the same title as the first letter of the current object's name
            const section = sectionsArray.find(section => section.title === firstCharacter);

            if (section) {
                // if a section found, just push the current object to that section's data array
                section.data.push(friend.userID);
            } else {
                // if no section is found, create a new section and push it to the sectionsArray
                sectionsArray.push({ title: firstCharacter, data: [friend.userID] });
            }
        });

        setFriendSections(sectionsArray);
        setLoading(false);
    };

    function executeSearch () {
        // check each friend in the friends list to see if either their name or username includes the search input
        // make all values lowercase while comparing to minimize barriers
        const matchingFriends = friends
        .filter(friend =>
            friend.name.toLowerCase().includes(search.toLowerCase()) ||
            friend.username.toLowerCase().includes(search.toLowerCase())
        )
        .map(friend => friend.userID);  // from the filtered list, extract just the userID values

        setResults(matchingFriends);
    };

    const EmptyFriendDisplay = () => {
        return (
            <View style={{ alignItems: 'center', marginTop: '40%' }}>
                <CustomIcon name='profile-outline' size={90} color='#bfbfbf'/>
                <Text style={{ fontSize: 17, fontFamily: 'proxima-nova-reg', marginTop: 15 }}>Friends will appear here</Text>
            </View>
        );
    };

    const EmptySearchDisplay = () => {
        return (
            <View style={{ alignItems: 'center', marginTop: '40%' }}>
                <AntDesign name='search1' size={100} color='#bfbfbf'/>
                <Text style={{ fontFamily: 'proxima-nova-semi', fontSize: 20, marginTop: 20 }}>No results found</Text>
                <Text style={{ fontFamily: 'proxima-nova-reg', fontSize: 16, color: Colors.mediumGrey, marginTop: 10 }}>Try another search</Text>
            </View>
        );
    };

    const FriendsList = () => {
        // display search results if there's any value in the search bar
        if (search.length > 0) {
            return (
                <FlatList
                    data={results}
                    renderItem={({item}) => <FriendPreview navigation={navigation} screen={'newChat'} userID={item}/>}
                    ListHeaderComponent={() => <View style={{ height: 5 }}/>}
                    ListEmptyComponent={EmptySearchDisplay()}
                    showsVerticalScrollIndicator={false}
                    bounces={false}
                />
            );
        } else {
            return (
                <SectionList
                    sections={friendSections}
                    renderItem={({item}) => <FriendPreview navigation={navigation} screen={'newChat'} userID={item}/>}
                    renderSectionHeader={({ section: { title } }) => (
                        <View style={{ backgroundColor: 'white' }}>
                            <Text style={styles.sectionLabel}>{title}</Text>
                        </View>
                    )}
                    ListHeaderComponent={() => <Text style={styles.friendsLabel}>Friends</Text>}
                    ListEmptyComponent={EmptyFriendDisplay()}
                    showsVerticalScrollIndicator={false}
                    stickySectionHeadersEnabled={true}
                    bounces={false}
                />
            );
        }
    };

    const ContentDisplay = () => {
        if (isConnected === false) {    // user is offline
            return (
                <View style={{ flex: 1, alignItems: 'center', marginTop: '35%' }}>
                    <Text style={{ fontFamily: 'proxima-nova-semi', fontSize: 21 }}>No internet connection</Text>
                    <Text style={{ fontFamily: 'proxima-nova-reg', fontSize: 16, marginTop: 15 }}>Please check your internet connection</Text>
                    <MaterialIcons name='wifi-off' size={45} color='black' style={{ marginTop: 30 }}/>
                </View>
            );
        } else if (isConnected === null || loading) {      // still checking if user is online or retrieving data
            return (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator
                        size={Platform.OS === 'android' ? 60 : 'large'}
                        color={Colors.theme}
                    />
                </View>
            );
        } else if (isConnected === true) {      // user is online & data is done loading
            return (
                <View>
                    <SearchBar text={search} setText={setSearch} label='Search friends'/>

                    {FriendsList()}
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
                    <Text style={{ fontSize: 20, fontFamily: 'proxima-nova-semi' }}>New chat</Text>
                </View>

                {ContentDisplay()}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    screen: {
        flex: 1
    },
    friendsLabel: {
        marginTop: 15,
        marginBottom: 12,
        marginLeft: 15,
        fontFamily: 'proxima-nova-semi',
        fontSize: 17,
        color: Colors.mediumGrey
    },
    sectionLabel: {
        fontFamily: 'proxima-nova-reg',
        fontSize: 17,
        color: Colors.mediumGrey,
        marginLeft: 15
    }
});

export default NewChatScreen;