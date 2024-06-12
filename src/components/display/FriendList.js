import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, ActivityIndicator } from 'react-native';
import Colors from '../../utils/Colors';

import { collection, onSnapshot, query, limit } from 'firebase/firestore';
import { db, auth } from '../../../firebase-config';

import BottomRowButton from '../input/BottomRowButton';
import FriendPreview from '../navigation/FriendPreview';
import FriendSuggestion from './FriendSuggestion';
import FriendRequest from './FriendRequest';

import CustomIcon from '../../utils/CustomIcon';

// ** try and only retrieve/list a certain number of friends (10-15) when first loading the friend list;
//    helping to minimize the number of read operations from Firestore
// *  afterwards, either load more friends as the user scrolls down or show a "see all" option
//    which directs the user to a friends list screen with a search bar at the top
// *  maybe the see all option could be an orange button that hovers at the bottom right of the screen
//    that shows up after the user has scrolled down enough for the bottom row buttons to disappear

// ** finish the function for generating friend suggestions
// *  maybe save friend suggestions for a future update; once the app has enough users with which
//    I can start truly generating a list of suggestions

// ** (optional) I currently only save a list of userIDs in the friends useState variable, requiring me to
//    re-retrieve all the data used for display in the friend components each time I re-display the friend list.
//    If I truly want to minimize the list from having to re-load each time it's displayed, I can change it into a
//    list of objects that also stores the other user data values, thereby only having to retrieve it once unless
//    new friends are added or a user's data has been modified since the previous retrieval
// *  Instead of passing the userID; the entire object of user values will be passed to FriendPreview. Likely will
//    also have to pass setFriends and an index, so it knows which object in the friends array it should update
// *  I can keep the getUserInfo function in the FriendPreview component. Simply make it check if the any of the
//    values in the object need to be filled (first retrieval) or updated; otherwise, leave them untouched
// *  same concept can apply to friend requests & suggestions

const FriendList = ({
    navigation, user, ProfileHeader, displayOption, setDisplayOption, loading, setLoading,
    friends, setFriends, friendSuggestions, setFriendSuggestions, friendRequests, setFriendRequests, userID
}) => {
    const scrollY = useRef(new Animated.Value(0)).current;
    const scrollThreashold = 80;   // adjust this value to control when the bottom buttons appear/disappear

    useEffect(() => {
        // setup friend data retrieval process
        const unsubUserFriends = getFriends();

        let unsubFriendRequests;
        if (user) {
            unsubFriendRequests = getFriendRequests();
        }

        return () => {
            unsubUserFriends();
            if (unsubFriendRequests) { unsubFriendRequests(); }
        };
    }, []);

    function getFriends () {
        let docName;
        if (user) { docName = auth.currentUser.uid; }
        else { docName = userID; }

        // define a query for retrieving a limit of 15 documents from a user's collection of friends
        const q = query(collection(db, 'users', docName, 'friends'), limit(15));

        const unsubUserFriends = onSnapshot(q, (snapshot) => {
            let friendList = [];
            snapshot.forEach((doc) => {
                //setFriends(prevArray => [...prevArray, doc.data().userID]);
                friendList.push(doc.data().userID);
            });

            // check if the collection is empty/doesn't exist
            if (friendList.length > 0) {
                // ** (optional) find a way to re-order the friend list in alphabetical order (will be tricky, maybe save for future update)
                setFriends(friendList);
            } else {
                setFriends(null);
            }

            if (loading) {
                setLoading(false);
            }
        });

        if (user && !loading) {     // <-- unsure if needs to be re-located
            // now that I've finished retrieving the user's friends, I can begin generating friend suggestions
            // start by checking if I've already previously generated suggestions
            if (friendSuggestions.length === 0) {
                getFriendSuggestions();
            }
        }

        return unsubUserFriends;
    };

    // ** (optional) decide in a future update if the number of reads performed by the snapshot should be lowered/limited
    // *  I doubt most users will have very many friend requests at a time, but that could always change
    function getFriendRequests () {
        const collectionRef = collection(db, 'users', auth.currentUser.uid, 'friendRequests');

        const unsubFriendRequests = onSnapshot(collectionRef, (snapshot) => {
            let requestList = [];
            snapshot.forEach((doc) => {
                requestList.push(doc.data().userID);
            });

            // check if the collection is empty/doesn't exist
            if (requestList.length > 0) {
                setFriendRequests(requestList);
            } else {
                setFriendRequests([]);
            }
        });

        return unsubFriendRequests;
    };

    async function getFriendSuggestions () {
        // if the user has no friends, don't generate any suggestions
        if (friends === null) { return; }
        else {
            // randomly select the user's friends' friends, ensure the user isn't already friends with them,
            // and count how many friends they have in common with the user
            // generate a max of 10 friend suggestions
        }
    };

    function handleScroll (event) {
        const offsetY = event.nativeEvent.contentOffset.y;
        scrollY.setValue(offsetY);
    };

    const determineDataSource = () => {
        if (user) {
            if (displayOption === 'Friends') { return friends; }
            else if (displayOption === 'Suggestions') { return friendSuggestions; }
            else if (displayOption === 'Requests') { return friendRequests; }
        } else {
            return friends;
        }
    };

    const FriendDisplay = (item) => {   // <-- item = userID
        if (user) {
            if (displayOption === 'Friends') {
                return (
                    <FriendPreview navigation={navigation} screen={'userProfile'} userID={item}/>
                );
            } else if (displayOption === 'Suggestions') {
                return (
                    <FriendSuggestion navigation={navigation}/>
                );
            } else if (displayOption === 'Requests') {
                return (
                    <FriendRequest navigation={navigation} userID={item}/>
                );
            }
        } else {
            return (
                <FriendPreview navigation={navigation} screen={'profile'} userID={item}/>
            );
        }
    };

    const EmptyDisplay = () => {
        let optionText = 'Friends';
        let descriptionText = 'Friends will appear here';

        if (user) {
            if (displayOption === 'Suggestions') {
                optionText = 'Suggestions';
                descriptionText = 'Suggested accounts will appear here';
            } else if (displayOption === 'Requests') {
                optionText = 'Requests';
                descriptionText = 'Friend requests will appear here';
            }
        }

        return (
            <View style={{ alignItems: 'center', paddingTop: 60 }}>
                <CustomIcon name='profile-outline' size={90} color='#bfbfbf'/>
                <Text style={{ fontSize: 20, fontFamily: 'proxima-nova-semi', marginTop: 20 }}>{optionText}</Text>
                <Text style={{ fontSize: 16, fontFamily: 'proxima-nova-reg', marginTop: 15, color: Colors.mediumGrey }}>{descriptionText}</Text>
            </View>
        );
    };

    if (loading) {  // still retrieving data
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
    } else {
        return (
            <View style={{ flex: 1, backgroundColor: 'white' }}>
                <Animated.FlatList
                    key={1}
                    data={determineDataSource()}
                    renderItem={({item}) => FriendDisplay(item)}
                    ListHeaderComponent={ProfileHeader()}
                    ListFooterComponent={() => <View style={{ height: 10 }}/>}
                    ListEmptyComponent={EmptyDisplay()}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                        { useNativeDriver: true, listener: handleScroll }
                    )}
                    showsVerticalScrollIndicator={false}
                    bounces={false}
                    //onEndReachedThreshold={}  // <-- add later
                    //onEndReached={}   // <-- add later
                />
                {user && <Animated.View
                    style={[styles.bottomBarContainer, { paddingHorizontal: '4%',
                        transform: [{
                            translateY: scrollY.interpolate({
                                inputRange: [scrollThreashold, 136],
                                outputRange: [0, 56],
                                extrapolate: 'clamp'
                            })
                        }]
                    }]}
                >
                    <BottomRowButton category={'Friends'} option={'Friends'} currentOption={displayOption} setOption={setDisplayOption}/>
                    <BottomRowButton category={'Friends'} option={'Suggestions'} currentOption={displayOption} setOption={setDisplayOption}/>
                    <BottomRowButton category={'Friends'} option={'Requests'} currentOption={displayOption} setOption={setDisplayOption}/>
                </Animated.View>}
            </View>
        );
    }
};

const styles = StyleSheet.create({
    bottomBarContainer: {
        backgroundColor: 'white',
        height: 56,
        width: '100%',
        position: 'absolute',
        bottom: 0,
        flexDirection: 'row',
        justifyContent: 'space-evenly'
    }
});

export default FriendList;