import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Platform, Pressable, StatusBar, Animated } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';
import { useFocusEffect } from '@react-navigation/native';
import { width } from '../../utils/Scaling';
import Modal from 'react-native-modal';
import Colors from '../../utils/Colors';

import PostCard from '../../components/display/PostCard';

import { Octicons, Feather } from '@expo/vector-icons';

// ** finish the Home Screen before attempting to complete the Showcase Screen
// *  this way I have all the technical aspects setup and figured out

// ** check if the ability to navigate by swiping back needs to be disabled in order
//    for the horizontal scroll between posts to work; if yes, set gestureEnabled to false

// ** update the date and challenge info each time a user scrolls between posts

// ** test the user's internet connection when attempting to load the user's posts
//    if unsuccessful, display a warning informing them that there is no internet connection
//    instead of displaying the FlatList

// ** code functionality of menu options
// *  also display different menu options based on whether or not it's the user's own post
//    (i.e., don't show edit or delete options for another user's post)
// *  (optional) include a menu option that allows users to change their selected audience for the post

// ** check if the selected audience for the post is friends only
//    if yes, perhaps display something somewhere that says "Friends only" (showcase screen only, not on HomeScreen)
// *  look at the "Followers only" text on Tasha's TikTok posts for an example design

// ** (optional) create a display for when there are no additional posts to display
// *  this is optional since the list will simply no longer scroll when it reaches the end of the list

// ** temp (retrieve a few of the closest posts dated before and after the one being showcased when loading the screen)
// *  find a way for the FlatList to show the post located in the middle of the list instead of starting at the top of the list
// *  since windowSize has a default value of 21 for FlatList, maybe retrieve 5-10 posts at a time
const Posts = [
    { id: '1', text: 'first' },
    { id: '2', text: 'second' },
    { id: '3', text: 'third' },
    { id: '4', text: 'fourth' },
    { id: '5', text: 'fifth' }
];

const ShowcaseScreen = ({ navigation }) => {
    const scrollX = useRef(new Animated.Value(0)).current;

    const [challengeVisible, setChallengeVisible] = useState(false);

    useFocusEffect(
        React.useCallback(() => {
            setTimeout(() => {
                if (Platform.OS === 'android') {
                    NavigationBar.setBackgroundColorAsync('black');
                    NavigationBar.setButtonStyleAsync('light');
                }
            }, 100);
        }, [])
    );

    return (
        <View style={{ flex: 1, backgroundColor: 'black',
            paddingTop: Platform.OS === 'ios' ? 44 : 0,
            paddingBottom: Platform.OS === 'ios' ? 34.5 : 0
        }}>
            <StatusBar barStyle={'light-content'} translucent backgroundColor={'transparent'}/>
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
                            color='white'
                        />
                    </Pressable>
                    <Text style={{ fontSize: 22, fontFamily: 'proxima-nova-semi', color: 'white' }}>May 14, 2023</Text>
                    <Pressable
                        onPress={() => setChallengeVisible(true)}
                        style={({pressed}) => [{ position: 'absolute', right: Platform.OS === 'android' ? 5 : 9, opacity: pressed ? 0.2 : 1,
                            paddingVertical: Platform.OS === 'android' ? 12 : 5,
                            paddingHorizontal: Platform.OS === 'android' ? 14 : 12
                        }]}
                    >
                        <Feather name='info' size={26} color='white'/>
                    </Pressable>
                </View>

                <Animated.FlatList
                    //ref={}    // <-- figure out if needed
                    data={Posts}
                    renderItem={({item, index}) => <PostCard navigation={navigation} index={index} scrollX={scrollX} screen={'Showcase'}/>}
                    //keyExtractor={}   // <-- add later unless I already provide each post with a unique value ("key") in the data
                    horizontal
                    decelerationRate={'fast'}
                    pagingEnabled
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                        { useNativeDriver: true }
                    )}
                    showsHorizontalScrollIndicator={false}
                    onEndReachedThreshold={0.5}
                    //onEndReached={}           // <-- add later
                    //refresing={}              // <-- add later
                    //initialNumToRender={}     // <-- add later
                    //maxToRenderPerBatch={}    // <-- add later
                    //onMomentumScrollEnd={}    // <-- add later
                />

                <Modal
                    isVisible={challengeVisible}
                    onBackButtonPress={() => setChallengeVisible(false)}
                    onBackdropPress={() => setChallengeVisible(false)}
                    onSwipeComplete={() => setChallengeVisible(false)}
                    swipeDirection='down'
                    animationInTiming={200}
                    animationOutTiming={500}
                    backdropOpacity={0.45}
                    style={{ justifyContent: 'flex-end', margin: 0 }}
                    useNativeDriverForBackdrop={true}
                >
                    <View style={styles.modalContainer}>
                        <View style={{ height: 5, width: 45, backgroundColor: Colors.mediumGrey, marginVertical: 15, borderRadius: 20, alignSelf: 'center' }}/>

                        <View style={{ paddingHorizontal: width > 550 ? '5%' : 20 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text style={{ fontFamily: 'proxima-nova-bold', fontSize: 26 }}>DAILY{'\n'}CHALLENGE</Text>
                                <View>
                                    <Text style={{ fontFamily: 'proxima-nova-reg', fontSize: 16 }}>Difficulty:</Text>
                                    <Text style={{ fontFamily: 'proxima-nova-semi', fontSize: 25, marginTop: 5 }}>EASY</Text>
                                </View>
                            </View>

                            <View style={styles.challengeTextContainer}>
                                <Text style={{ fontFamily: 'proxima-nova-semi', fontSize: 20, color: 'white' }}>Bring a smile to a stranger's face</Text>
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: 'black'
    },
    modalContainer: {
        backgroundColor: 'white',
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        paddingBottom: Platform.OS === 'ios' ? 45 : 25
    },
    challengeTextContainer: {
        backgroundColor: 'black',
        marginTop: width > 550 ? '10%' : 40,
        alignSelf: 'center',
        width: width > 550 ? 400 : '100%',
        height: 90,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15
    }
});

export default ShowcaseScreen;