import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import { width } from '../../utils/Scaling';
import Colors from '../../utils/Colors';

import PostCard from '../../components/display/PostCard';

import CustomIcon from '../../utils/CustomIcon';

// ** temp
const Posts = [
    { id: '1', text: 'first' },
    { id: '2', text: 'second' },
    { id: '3', text: 'third' },
    { id: '4', text: 'fourth' },
    { id: '5', text: 'fifth' }
];

// ** test the user's internet connection when loading the data for the home screen
//    if unsuccessful, display a warning informing them that there is no internet connection
//    instead of displaying the FlatList

// ** check if the user has an internet connection before retrieving posts
// ** show a loading display while retrieving posts from Firebase
// ** limit the number of posts retrieved at a time, loading more as needed while the user
//    scrolls through them
// *  since windowSize has a default value of 21 for FlatList, maybe retrieve 10 posts at a time

// ** create a display for when there are no posts (and maybe no additional posts) to display

const HomeScreen = ({ navigation }) => {
    const slideX = useRef(new Animated.Value(1)).current;
    const scrollX = useRef(new Animated.Value(0)).current;
    //const flatListRef = useRef();

    const [displayOption, setDisplayOption] = useState('Spotlight');
    const [refreshing, setRefreshing] = useState(false);

    function onRefresh () {
        setRefreshing(true);

        // put refresh action here, e.g.,
        // fetchData().then(() => {
        //      setRefreshing(false);
        // });

        setTimeout(() => {      // <-- temp
            setRefreshing(false);
        }, 500);
    };

    /*function onMomentumScrollEnd (e) {
        // Calculate the index of the item that the scroll ended at
        const index = Math.round(e.nativeEvent.contentOffset.x / width);

        // Scroll to that item
        flatListRef.current.scrollToOffset({ offset: index * width, animated: true });
    };*/

    const HeaderOptions = () => {
        return (
            <View style={{ marginTop: 10 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                    <Pressable
                        onPress={() => {
                            setDisplayOption('Friends');
                            Animated.timing(slideX, {
                                toValue: 0,
                                duration: 150,
                                useNativeDriver: true
                            }).start();
                        }}
                        style={{ padding: 10 }}
                    >
                        <Text style={[styles.headerText, { color: displayOption === 'Friends' ? 'white' : Colors.mediumGrey }]}>Friends</Text>
                    </Pressable>
                    <Pressable
                        onPress={() => {
                            setDisplayOption('Spotlight');
                            Animated.timing(slideX, {
                                toValue: 1,
                                duration: 150,
                                useNativeDriver: true
                            }).start();
                        }}
                        style={{ padding: 10 }}
                    >
                        <Text style={[styles.headerText, { color: displayOption === 'Spotlight' ? 'white' : Colors.mediumGrey }]}>Spotlight</Text>
                    </Pressable>
                </View>
                <View style={{ width: 140, alignSelf: 'center' }}>
                    <Animated.View
                        style={{ width: 45, height: 4, backgroundColor: 'white', borderRadius: 20,
                            transform: [{
                                translateX: slideX.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0, 91]
                                })
                            }]
                        }}
                    />
                </View>
            </View>
        );
    };

    // ** look into the FlashList if the FlatList gets too slow at loading more content
    // *  fix the onRefresh for iOS
    // *  find a way for all devices to do the same drag motion/Animation as the iPhone when reaching the end of the list
    // *  maybe show a loading animation every time it needs to retrieve (more) data to use for display
    // *  may not need to use the `initialNumToRender` prop thanks to the windowSize prop;
    return (
        <View style={styles.screen}>
            {HeaderOptions()}
            <Animated.FlatList
                //ref={flatListRef}
                data={Posts}
                //renderItem={postData => <PostCard navigation={navigation} post={postData}/>}
                renderItem={({item, index}) => <PostCard navigation={navigation} index={index} scrollX={scrollX} screen={'Home'}/>}
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
                //onEndReached={}   // <-- write a function for getting more data when the user reaches the end of the list
                refreshing={refreshing}
                //onRefresh={onRefresh}
                //initialNumToRender={}     // <-- add later
                //maxToRenderPerBatch={}    // <-- add later
                //ListEmptyComponent={}     // <-- add later
                //onMomentumScrollEnd={onMomentumScrollEnd}     // <-- perform an action once the scroll action ends
            />
        </View>
    );
};

HomeScreen.navigationOptions = ({ navigation }) => {
    const isFocused = navigation.isFocused();

    return {
        tabBarButton: () => {
            if (isFocused) {
                return (
                    <View style={{ flex: 1, height: 56, alignItems: 'center', justifyContent: 'center' }}>
                        <CustomIcon name='home' size={24} color='white'/>
                        <Text style={{ fontFamily: 'proxima-nova-semi', fontSize: 10.5, color: 'white', marginTop: 5 }}>Home</Text>
                    </View>
                );
            } else {
                return (
                    <Pressable
                        onPress={() => navigation.navigate('Tab', { screen: 'Home' })}
                        style={{ flex: 1, height: 56, alignItems: 'center', justifyContent: 'center' }}
                    >
                        <CustomIcon name='home-outline' size={26} color='#808080'/>
                        <Text style={{ fontFamily: 'proxima-nova-semi', fontSize: 10.5, color: '#808080', marginTop: 5 }}>Home</Text>
                    </Pressable>
                );
            }
        }
    };
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: 'black'
    },
    headerText: {
        fontFamily: 'proxima-nova-semi',
        fontSize: 19
    }
});

export default HomeScreen;