import React, { useRef } from 'react';
import { View, Text, StyleSheet, Image, Pressable, Animated } from 'react-native';
import Colors from '../../utils/Colors';

// ** may need to check that all messages that were sent on a specific date have been displayed
//    before displaying the title/date at the top
//    (likely why it would be best to retrieve all messages by date at a time)

// ** retrieve the user's profile image using their username/userID

// ** the height animation will work properly (shift upwards) once the FlatList is inverted

const ChatMessages = ({ navigation, messages }) => {
    function revealTimeSent (heightValue, fadeValue) {
        Animated.parallel([
            Animated.timing(heightValue, {
                toValue: 25,
                duration: 220,
                useNativeDriver: false      // height is not supported by native driver
            }),
            Animated.timing(fadeValue, {
                toValue: 1,
                duration: 80,
                useNativeDriver: false
            })
        ]).start(() => {
            Animated.parallel([
                Animated.timing(heightValue, {
                    toValue: 0,
                    duration: 220,
                    delay: 1800,
                    useNativeDriver: false
                }),
                Animated.timing(fadeValue, {
                    toValue: 0,
                    duration: 80,
                    delay: 1800,
                    useNativeDriver: false
                })
            ]).start();
        })
    };

    // individual messages sent by the user
    const UserChatMessage = (message, index) => {
        const heightValue = useRef(new Animated.Value(0)).current;
        const fadeValue = useRef(new Animated.Value(0)).current;

        return (
            <View key={index}>
                <Pressable
                    onPress={() => revealTimeSent(heightValue, fadeValue)}
                    style={[styles.messageTextContainer, { backgroundColor: '#313435', maxWidth: '70%' }]}
                >
                    <Text style={[styles.messageText, { color: 'white' }]}>{message.text}</Text>
                </Pressable>
                <Animated.View style={{ height: heightValue, opacity: fadeValue, justifyContent: 'center', alignSelf: 'flex-end' }}>
                    <Text style={styles.timeText}>{message.sentAtTime}</Text>
                </Animated.View>
            </View>
        );
    };

    // individual messages sent by the user's friend
    const FriendChatMessage = (message, index) => {
        const heightValue = useRef(new Animated.Value(0)).current;
        const fadeValue = useRef(new Animated.Value(0)).current;

        return (
            <View key={index}>
                <Pressable
                    onPress={() => revealTimeSent(heightValue, fadeValue)}
                    style={[styles.messageTextContainer, { backgroundColor: 'white' }]}
                >
                    <Text style={styles.messageText}>{message.text}</Text>
                </Pressable>
                <Animated.View style={{ height: heightValue, opacity: fadeValue, justifyContent: 'center', alignItems: 'flex-start' }}>
                    <Text style={styles.timeText}>{message.sentAtTime}</Text>
                </Animated.View>
            </View>
        );
    };

    // groups of messages sent by the same user on the same date without interruption
    const MessageBatch = (batch, index) => {
        // ** start by checking whether or not the batch of messages was sent by the user

        if (batch.userID === 'user') {      // <-- replace "user" with the user's ID
            return (
                <View key={index} style={{ alignItems: 'flex-end', paddingRight: 12, marginVertical: 4 }}>
                    {batch.messages.map((message, index) =>
                        UserChatMessage(message, index)
                    )}
                </View>
            );
        } else {
            return (
                <View key={index} style={{ flexDirection: 'row', alignItems: 'flex-end', marginVertical: 4 }}>
                    <Pressable
                        //onPress={() => }  // <-- navigate to user's profile
                        style={({pressed}) => [styles.profileIcon, { opacity: pressed ? 0.2 : 1 }]}
                    >
                        <Image
                            source={require('../../assets/images/profile.png')}
                            style={{ flex: 1, height: undefined, width: undefined }}
                        />
                    </Pressable>
                    
                    <View style={{ maxWidth: '70%' }}>
                        {batch.messages.map((message, index) =>
                            FriendChatMessage(message, index)
                        )}
                    </View>
                </View>
            );
        }
    };

    return (
        <View>
            <View style={{ alignItems: 'center', marginVertical: 10 }}>
                <Text style={styles.sectionTitle}>{messages.item.title}</Text>
            </View>

            {messages.item.data.map((batch, index) =>
                MessageBatch(batch, index)
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    sectionTitle: {
        fontFamily: 'proxima-nova-reg', fontSize: 15, color: Colors.mediumGrey
    },
    profileIcon: {
        height: 40,
        width: 40,
        borderRadius: 20,
        overflow: 'hidden',
        marginLeft: 12,
        marginRight: 8
    },
    messageTextContainer: {
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderRadius: 20,
        marginVertical: 2
    },
    messageText: {
        fontFamily: 'proxima-nova-reg',
        fontSize: 17
    },
    timeText: {
        fontFamily: 'proxima-nova-reg',
        fontSize: 15,
        color: Colors.mediumGrey
    }
});

export default ChatMessages;