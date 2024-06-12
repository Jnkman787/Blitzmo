import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Pressable, Platform, ActivityIndicator } from 'react-native';
import Colors from '../../utils/Colors';
import { width } from '../../utils/Scaling';

//import BottomRowButton from '../input/BottomRowButton';
import CalendarPreview from './CalendarPreview';

import { Ionicons } from '@expo/vector-icons';

// ** when retrieving another user's posts (!user), check the selected audience for each post (friends only or everyone)
//    and then check if the user is friends with the current user to decide whether or not to include them for display
// *  will need to pass the 'isFriend' variable from the ProfileScreen

// ** include calendar display in a future update
// *  leave the code for the calendary display option unfinished for now

// ** temp
const data = [];
const data2 = [
    { id: 1 },
    { id: 2 },
    { id: 3 },
    { id: 4 },
    { id: 5 },
    { id: 6 },
    { id: 7 },
    { id: 8 },
    { id: 9 },
    { id: 10 },
    { id: 11 },
    { id: 12 }
];

const PostList = ({ navigation, user, ProfileHeader, displayOption, setDisplayOption, loading, setLoading,
    posts, setPosts, username
}) => {
    const scrollY = useRef(new Animated.Value(0)).current;
    const scrollThreashold = 80;   // adjust this value to control when the bottom buttons appear/disappear

    useEffect(() => {
        setLoading(false);  // <-- relocate to where posts finished getting retrieved
    }, []);

    function handleScroll (event) {
        const offsetY = event.nativeEvent.contentOffset.y;
        scrollY.setValue(offsetY);
    };

    // ** gotta decide if images should be cut off to fit in the box or stretched
    // *  if the aspect ratio is the same, I can likely just leave resizeMode='cover'
    const GridView = (index) => {
        return (
            <Pressable
                onPress={() => navigation.navigate('ProfileStack', { screen: 'Showcase' })}     // <-- will need to pass parameters
                style={{ width: (width - 24) / 3, aspectRatio: 3 / 4, backgroundColor: 'white',
                    marginRight: (index + 1) % 3 === 0 ? 6 : 0,
                    marginLeft: 6, 
                    marginTop: 6
                }}
            >
                {({ pressed }) => (
                    <View style={{ flex: 1, borderRadius: 5, overflow: 'hidden', backgroundColor: '#d9d9d9' }}>
                        {/* insert image here */}
                        <View style={{ position: 'absolute', top: 0, left: 0, bottom: 0, right: 0, backgroundColor: pressed ? Colors.mediumGrey : 'transparent' }}/>
                    </View>
                )}
            </Pressable>
        );
    };

    const EmptyDisplay = () => {
        if (user) {
            return (
                <View style={{ alignItems: 'center', paddingTop: 60, paddingHorizontal: 20 }}>
                    <Ionicons name='images-outline' size={80} color='#bfbfbf'/>
                    <Text style={{ fontSize: 19, fontFamily: 'proxima-nova-semi', marginTop: 15, textAlign: 'center' }}>Complete today's challenge</Text>
                    <Pressable
                        onPress={() => navigation.navigate('ChallengeStack', { screen: 'Challenge' })}
                        style={({pressed}) => [styles.startButton, { opacity: pressed ? 0.2 : 1 }]}
                    >
                        <Text style={{ fontSize: 18, fontFamily: 'proxima-nova-semi', color: 'white' }}>Start</Text>
                    </Pressable>
                </View>
            );
        } else {
            let descriptionText = `Challenges completed by ${username} will appear here`;
            return (
                <View style={{ alignItems: 'center', paddingTop: 60, paddingHorizontal: 20 }}>
                    <Text style={{ fontSize: 20, fontFamily: 'proxima-nova-semi' }}>No posts yet</Text>
                    <Text style={{ fontSize: 16, fontFamily: 'proxima-nova-reg', marginTop: 15, textAlign: 'center', color: Colors.mediumGrey }}>{descriptionText}</Text>
                </View>
            );
        }
    };

    const PostsDisplay = () => {
        if (displayOption === 'Grid') {
            return (
                <Animated.FlatList
                    key={3}
                    data={data}
                    numColumns={3}
                    renderItem={({ index }) => GridView(index)}
                    ListHeaderComponent={ProfileHeader()}
                    ListFooterComponent={() => <View style={{ height: user ? 5 : Platform.OS === 'android' ? 5 : 25 }}/>}
                    ListEmptyComponent={EmptyDisplay()}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                        { useNativeDriver: true, listener: handleScroll }
                    )}
                    showsVerticalScrollIndicator={false}
                    bounces={false}
                    //keyExtractor={}   // <-- add later unless I already provide each post with a unique value ("key") in the data
                    //onEndReachedThreshold={}  // <-- add later
                    //onEndReached={}   // <-- add later
                    //initialNumToRender={}     // <-- add later
                    //maxToRenderPerBatch={}    // <-- add later
                />
            );
        } else if (displayOption === 'Calendar') {
            return (
                <View style={{ flex: 1 }}>
                    {ProfileHeader()}
                    <View style={{ flex: 1, paddingHorizontal: 15 }}>
                        <CalendarPreview navigation={navigation}/>
                    </View>
                </View>
            );
        }
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
                {PostsDisplay()}
                {/*<Animated.View
                    style={[styles.bottomBarContainer, { paddingHorizontal: '5%', height: user ? 56 : Platform.OS === 'ios' ? 70 : 56,
                        transform: [{
                            translateY: scrollY.interpolate({
                                inputRange: [scrollThreashold, 136],
                                //outputRange: [0, 56],
                                outputRange: user ? [0, 56] : [0, Platform.OS === 'ios' ? 70 : 56],
                                extrapolate: 'clamp'
                            })
                        }]
                    }]}
                >
                    <BottomRowButton category={'Posts'} option={'Grid'} currentOption={displayOption} setOption={setDisplayOption}/>
                    <BottomRowButton category={'Posts'} option={'Calendar'} currentOption={displayOption} setOption={setDisplayOption}/>
                </Animated.View>*/}
            </View>
        );
    }
};

const styles = StyleSheet.create({
    bottomBarContainer: {
        backgroundColor: 'white',
        width: '100%',
        position: 'absolute',
        bottom: 0,
        flexDirection: 'row',
        justifyContent: 'space-evenly'
    },
    startButton: {
        width: 85,
        height: 47,
        borderRadius: 30,
        marginTop: 20,
        backgroundColor: Colors.theme,
        alignItems: 'center',
        justifyContent: 'center'
    }
});

export default PostList;