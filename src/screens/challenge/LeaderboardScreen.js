import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, StatusBar, Platform, Animated, Image, FlatList, Pressable } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as NavigationBar from 'expo-navigation-bar';
import Colors from '../../utils/Colors';

import ScoreCard from '../../components/display/ScoreCard';

import { Octicons, Feather } from '@expo/vector-icons';

// ** only retrieve a certain number of users on the leaderboard at a time (minimizing read operations and load time),
//    and get more as necessary when scrolling down the list (similar to image library on Camera Screen)
// *  check if the current user is included in the first generated list of users on the leaderboard;
//    if not, retrieve them separately so I can display them separately at the bottom of the screen
// *  will likely need to compare the current user's rank to the rank of the lowest user on the list every time it's
//    updated so I know when to no longer display them separately

// ** temp
const Cards = [
    { rank: 1, score: 233 },
    { rank: 2, score: 200 },
    { rank: 3, score: 186 },
    { rank: 4, score: 175 },
    { rank: 5, score: 156 },
    { rank: 6, score: 145 },
    { rank: 7, score: 132 },
    { rank: 8, score: 117 },
    { rank: 9, score: 103 },
    { rank: 10, score: 85 }
];

// ** create a display for when no users have posted yet and thus, there are no users to list on the leaderboard

// ** include instructions somewhere that explain how the point systems works

// ** maybe add a button that brings the user back to the top of the screen once they scroll low enough

// ** (optional) if the app gets popular enough, perhaps there can be a daily and/or weekly prize displayed on the leaderboard screen

const LeaderboardScreen = ({ navigation }) => {
    const slideX = useRef(new Animated.Value(0)).current;
    const [listOption, setListOption] = useState('Friends');    // Friends or Overall
    const [timeframe, setTimeframe] = useState('Today');

    useFocusEffect(
        React.useCallback(() => {
            setTimeout(() => {
                if (Platform.OS === 'android') {
                    NavigationBar.setBackgroundColorAsync(Colors.greyBackdrop);
                    NavigationBar.setButtonStyleAsync('dark');
                }
            }, 110);
        }, [])
    );

    const HeaderOptions = () => {
        return (
            <View style={{ marginTop: 10 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', zIndex: 1 }}>
                    <View>
                        <Pressable
                            onPress={() => setListOption('Friends')}
                            style={({pressed}) => [{ padding: 10, opacity: pressed ? listOption === 'Friends' ? 1 : 0.2 : 1 }]}
                        >
                            <Text style={[styles.headerText, { color: listOption === 'Friends' ? 'black' : Colors.mediumGrey }]}>Friends</Text>
                        </Pressable>
                        <View style={{ height: listOption === 'Friends' ? 3 : 0, width: '100%', backgroundColor: 'black', borderRadius: 20 }}/>
                    </View>
                    <View>
                        <Pressable
                            onPress={() => setListOption('Overall')}
                            style={({pressed}) => [{ padding: 10, opacity: pressed ? listOption === 'Overall' ? 1 : 0.2 : 1 }]}
                        >
                            <Text style={[styles.headerText, { color: listOption === 'Overall' ? 'black' : Colors.mediumGrey }]}>Overall</Text>
                        </Pressable>
                        <View style={{ height: listOption === 'Overall' ? 3 : 0, width: '100%', backgroundColor: 'black', borderRadius: 20 }}/>
                    </View>
                </View>
                <View style={{ height: 1, backgroundColor: Colors.border, bottom: 1, zIndex: 0 }}/>
            </View>
        );
    };

    const TimeframeOptions = () => {
        return (
            <View style={styles.timeframeContainer}>
                <Animated.View 
                    style={{ height: 50, width: 85, borderRadius: 23, backgroundColor: 'black', position: 'absolute',
                        transform: [{
                            translateX: slideX.interpolate({
                                inputRange: [0, 1, 2],
                                outputRange: [0, 85, 170]
                            })
                        }]
                    }}
                />
                <Pressable
                    style={({pressed}) => [styles.timeframeButton, { opacity: pressed ? timeframe === 'Today' ? 1 : 0.2 : 1 }]}
                    onPress={() =>{
                        setTimeframe('Today');
                        Animated.timing(slideX, {
                            toValue: 0,
                            duration: 250,
                            useNativeDriver: true
                        }).start();
                    }}
                >
                    <Text style={[styles.buttonText, { color: timeframe === 'Today' ? 'white' : 'black' }]}>Today</Text>
                </Pressable>
                <Pressable
                    style={({pressed}) => [styles.timeframeButton, { opacity: pressed ? timeframe === 'Week' ? 1 : 0.2 : 1 }]}
                    onPress={() => {
                        setTimeframe('Week');
                        Animated.timing(slideX, {
                            toValue: 1,
                            duration: 250,
                            useNativeDriver: true
                        }).start();
                    }}
                >
                    <Text style={[styles.buttonText, { color: timeframe === 'Week' ? 'white' : 'black' }]}>Week</Text>
                </Pressable>
                <Pressable
                    style={({pressed}) => [styles.timeframeButton, { opacity: pressed ? timeframe === 'Month' ? 1 : 0.2 : 1 }]}
                    onPress={() => {
                        setTimeframe('Month');
                        Animated.timing(slideX, {
                            toValue: 2,
                            duration: 250,
                            useNativeDriver: true
                        }).start();
                    }}
                >
                    <Text style={[styles.buttonText, { color: timeframe === 'Month' ? 'white' : 'black' }]}>Month</Text>
                </Pressable>
            </View>
        );
    };

    const ListHeader = () => {
        return (
            <View style={{ backgroundColor: 'white' }}>
                <View>
                    <View style={{ height: 120, width: 120, alignSelf: 'center', marginVertical: 30 }}>
                        <Image
                            source={require('../../assets/images/trophy.png')}
                            style={{ flex: 1, height: undefined, width: undefined }}
                        />
                    </View>
                    {TimeframeOptions()}
                </View>
                <View style={{ height: 20, backgroundColor: Colors.greyBackdrop, borderTopLeftRadius: 20, borderTopRightRadius: 20, marginTop: 20 }}/>
            </View>
        );
    };

    return (
        <View style={{ flex: 1, paddingTop: Platform.OS === 'ios' ? 44 : 0 }}>
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
                    <Text style={{ fontSize: 20, fontFamily: 'proxima-nova-semi' }}>Leaderboard</Text>
                    <Pressable
                        //onPress={() => }  // <-- open a modal or navigate to another screen that provides instructions for the score system
                        style={({pressed}) => [{ position: 'absolute', right: Platform.OS === 'android' ? 5 : 9, opacity: pressed ? 0.2 : 1,
                            paddingVertical: Platform.OS === 'android' ? 12 : 5,
                            paddingHorizontal: Platform.OS === 'android' ? 14 : 12
                        }]}
                    >
                        <Feather name='info' size={26} color='black'/>
                    </Pressable>
                </View>

                {HeaderOptions()}

                <View style={{ flex: 1, backgroundColor: Colors.greyBackdrop }}>
                    <FlatList
                        data={Cards}
                        renderItem={cardData => <ScoreCard navigation={navigation} card={cardData}/>}
                        ListHeaderComponent={ListHeader()}
                        ListFooterComponent={() => <View style={{ height: Platform.OS === 'android' ? 5 : 15 }}/>}
                        showsVerticalScrollIndicator={false}
                        //ListEmptyComponent={} // <-- add later
                        //keyExtractor={}   // <-- add later
                        //onEndReachedThreshold={}  // <-- add later
                        //onEndReached={}   // <-- add later
                        //initialNumToRender={}     // <-- add later
                        //maxToRenderPerBatch={}    // <-- add later
                        bounces={false}
                    />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    screen: {
        flex: 1
    },
    headerText: {
        fontFamily: 'proxima-nova-semi',
        fontSize: 19
    },
    timeframeContainer: {
        backgroundColor: Colors.greyBackdrop,
        borderRadius: 23,
        alignSelf: 'center',
        flexDirection: 'row',
        height: 50
    },
    timeframeButton: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 85
    },
    buttonText: {
        fontFamily: 'proxima-nova-semi',
        fontSize: 18
    }
});

export default LeaderboardScreen;