import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Image, Pressable, Animated } from 'react-native';
import Colors from '../../utils/Colors';

// ** may need to use a snapshot listener for retrieving data so that the values displayed
//    stay up to date (i.e., send/receive new messages or modify displayed time/date)
// *  since the InboxScreen will already be using a snapshot listener as well for the retrieval of userIDs;
//    wait and see if that already continuously re-renders the MessagePreview components, thus continuously
//    re-running their retrieval of data (thereby not needing to use a snapshot listener)
// *  based on a test I did with the FriendList & FriendPreview, there's a good chance I will still need
//    to use a snapshot listener on the MessagePreview, despite using one on the InboxScreen (but still check)

// ** include functions for checking the name and message length (cut off with ... if too long)
// *  the message can continue underneath the date/time text

// ** display something that shows/informs the user that they have received new messages which they haven't
//    yet seen (if possible, include a number indicating how many new messages)
// *  this will likely require me to store a field value (seenBy(userID)) for each user in the chat document
//    which indicates whether or not they have seen the latest message(s) in the chat
// *  if I want to track/count how many messages a user hasn't yet seen, I may need to store this field value on
//    each individual message document instead of just once on the overall chat document
// *  the field value will be set to True for whoever sent the latest message and False for the other; but,
//    the value will be set to True for the other user if they open or have open the chat screen for this
//    particular conversation

// ** date format: Month/Day/Year (only show the year if it's not this year)
// *  show a weekday (e.g., "Sunday") if the message was sent within the last 6 or 7 days
// *  show "Yesterday" if the message was sent yesterday
// *  show a time if the message was sent today (e.g., "5:35 PM") (12-hour format)

const MessagePreview = ({ navigation }) => {
    const [name, setName] = useState('');
    const [time, setTime] = useState('');
    const [message, setMessage] = useState('');
    const [profileImage, setProfileImage] = useState(null);
    const [messageSeen, setMessageSeen] = useState(true);
    const [unseenCount, setUnseenCount] = useState(null);   // <-- optional

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
        <View style={{ height: 75 }}>
            <Animated.View
                style={{ height: 75, backgroundColor: backgroundColorChange, width: backgroundWidthChange, alignSelf: 'center', position: 'absolute' }}
            />
            <Pressable
                onPress={() => navigation.navigate('InboxStack', { screen: 'Chat' })}
                onPressIn={onPressIn}
                //onLongPress={}    // <-- (optional) provide a pop-up modal with options for the conversation
                style={{ flex: 1, flexDirection: 'row' }}
            >
                <View style={styles.profileIcon}>
                    <Image
                        source={require('../../assets/images/profile.png')}
                        style={{ flex: 1, height: undefined, width: undefined }}
                    />
                </View>
                <View style={{ flex: 1, justifyContent: 'space-evenly', paddingVertical: 15 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{ fontFamily: 'proxima-nova-semi', fontSize: 18 }}>Name</Text>
                        <Text style={styles.dateTimeText}>5/28/2023</Text>
                    </View>
                    <Text style={{ fontFamily: 'proxima-nova-reg', fontSize: 15, color: Colors.darkGrey }}>Recent message...</Text>
                </View>                
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    profileIcon: {
        height: 55,
        width: 55,
        borderRadius: 30,
        marginLeft: 15,
        marginRight: 12,
        alignSelf: 'center'
    },
    dateTimeText: {
        fontFamily: 'proxima-nova-reg',
        fontSize: 15,
        color: Colors.mediumGrey,
        marginRight: 15
    }
});

export default MessagePreview;