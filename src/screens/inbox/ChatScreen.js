import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, Platform, Pressable, TextInput, FlatList, KeyboardAvoidingView, TouchableOpacity, TouchableHighlight } from 'react-native';
import Colors from '../../utils/Colors';
import { Menu, MenuTrigger, MenuOptions, MenuOption } from 'react-native-popup-menu';

import ChatMessages from '../../components/display/ChatMessages';

import CustomIcon from '../../utils/CustomIcon';
import { Octicons, Feather, MaterialIcons, Ionicons } from '@expo/vector-icons';

// ** start by checking if the user has an internet connection before retrieving data
// *  display something else if they have no internet connection
// *  set enabledSend to false if they have no internet connection
// *  (optional) if a copy of the messages are saved locally on the device, I can display what's saved
//    but still don't allow the user to send any new messages

// ** look into Cloud Messaging on Firebase to see if it's a better solution than storing and
//    and retrieving conversations on Firestore (it has no cost!)

// ** searching for a chat document by its name (id) is slightly faster than looking for it based on a field value

// ** retrieve the message documents from the messages collection using the orderBy() method,
//    allowing me to retrieve them in reverse chronological order more efficiently than the method I used in StudyConnect
// *  also use the query() method (allowing me to limit the amount retrieved at a time) with the orderBy() method, and then
//    implement both into the onSnapshot() method for retrieving messages
//    (queries should allow me to filter, order, and limit the results when retrieving messages data)
// *  the order in which message documents are listed on Firestore (i.e., alphabetical) has no impact on what
//    order they are retrieved; thus, I can probably just let Firebase auto assign them random names

// ** (re-visit the code in that YouTube video 'Build a Realtime Chat App with React Native and Firebase | Tutorial 2023')
//    make sure to look at the final version of the code at the end of the video since he makes mistakes and fixes them

// ** I wonder if using useCallback on functions related to messaging (sending/retreiving) would
//    make the chat screen run faster/smoother

// ** code functionality of menu options
// *  modify block button so that it can also unblock if the user has already blocked the other

// ** add a "blocked" useState variable and check if either user has blocked the other when opening the screen, setting
//    blocked = True
// *  if blocked = True, set enableSend = False, preventing the user from sending any messages
// *  maybe identify which user blocked who in the variable, so that I know whether or not to show the unblock option in the menu
// *  (optional) make a pop-up display on the screen informing the user that they are blocked from messaging this user

// ** remove any empty spaces at the start and end of message string when the user presses the send button

// ** push FlatList upwards when opening the keyboard (wait until after I finish setting up the reverse list format)

// ** setup push notifications once everything in the Inbox portion of the app is completed that notifies a user
//    when they've received a new message and aren't currently viewing the conversation
// *  or maybe only send a notification if the app isn't currently running/open on their device (or maybe if it's
//    simply just not being displayed on their device; i.e., app can still be running in the background)

// ** (optional) maybe save the chat conversations/messages onto a user's device in addition to saving on the cloud
//    this will allow for faster loading time of the conversation when opening the screen
// *  will likely require a system for checking if the user's stored messages contain all messages stored on the cloud
//    if not, will need to be updated

// ** retrieve/load messages for the specific conversation and display in FlatList
// *  limit the number of messages retrieved at a time, loading more as needed when
//    the user scrolls up (implement same strategy as images in CameraScreen)

// ** since I will likely be retrieving messages in reverse chronological order,    <-- check how the array of retrieved messages is orderd
//    I may need to modify groupMessages() function to sort through the messages in reverse order
// *  maybe also try to retrieve/load messages from the cloud by date at a time so there are no issues with displaying the title/date;
//    otherwise, simply group them by date after their retrieval

// ** temp  (ideal date format YYYY-MM-DD) (revisit time format later)
const data = [
    { userID: 'notUser', text: 'message', sentAtDate: '2022-05-11', sentAtTime: '4:54 PM' },
    { userID: 'notUser', text: 'message 2', sentAtDate: '2023-06-19', sentAtTime: '9:56 PM' },
    { userID: 'notUser', text: 'message 3', sentAtDate: '2023-06-19', sentAtTime: '9:58 PM' },
    { userID: 'user', text: 'message 4', sentAtDate: '2023-06-19', sentAtTime: '10:05 PM' },
    { userID: 'user', text: 'message 5', sentAtDate: '2023-06-19', sentAtTime: '10:06 PM' },
    { userID: 'notUser', text: 'message 6', sentAtDate: '2023-07-17', sentAtTime: '8:56 AM' },
    { userID: 'user', text: 'message 7', sentAtDate: '2023-07-18', sentAtTime: '6:04 PM' }
];

const ChatScreen = ({ navigation }) => {
    const [message, setMessage] = useState('');
    const [messageContainerHeight, setMessageContainerHeight] = useState(50);
    const [enableSend, setEnableSend] = useState(false);
    
    const [messageList, setMessageList] = useState(data);   // <-- replace "data" later
    const [messageSections, setMessageSections] = useState([]);

    useEffect(() => {
        // run the following function after retrieving the messages
        groupMessages();
    }, []);

    // check if the message contains any characters (not just spaces) before providing the send option
    useEffect(() => {
        // ** check if user is online or if they are blocked
        if (message.trim().length > 0) {
            setEnableSend(true);
        } else {
            setEnableSend(false);
        }
    }, [message]);

    // ** re-visit this function after I finish setting up my method for retrieving messages
    //    to see if it needs to be modified or if it can be improved (ask ChatGPT for ways to improve)
    function groupMessages () {
        // first group messages by date
        // then group messages (which share the same date) by user
        const groupedMessages = messageList.reduce((groups, item) => {
            const date = item.sentAtDate;
            if (!groups[date]) {
                groups[date] = [{ userID: item.userID, messages: [item] }];
            } else {
                const lastBatch = groups[date][groups[date].length - 1];
                if (lastBatch.userID === item.userID) {
                    lastBatch.messages.push(item);
                } else {
                    groups[date].push({ userID: item.userID, messages: [item] });
                }
            }
            return groups;
        }, {});

        let currentYear = new Date().getFullYear();

        // after messages have been grouped, sort them into sections with a shared title (date in which they were sent)
        const sections = Object.keys(groupedMessages).map((date) => {
            const dateObj = new Date(date);
            let formattedDate;
            if (dateObj.getFullYear() !== currentYear) {
                formattedDate = dateObj.toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
            } else {
                formattedDate = dateObj.toLocaleString('en-US', { weekday: 'short', month: 'long', day: 'numeric' });
            }
            return { title: formattedDate, data: groupedMessages[date] };
        });
        
        setMessageSections(sections);
    };

    // increase the text input box size to a max of 5 lines before letting the text scroll up/down
    function onContentSizeChange (event) {
        if (event.nativeEvent.contentSize.height < 110) {
            setMessageContainerHeight(event.nativeEvent.contentSize.height + 30);
        }
    };

    const MessagesDisplay = () => {
        return (
            <View style={{ flex: 1 }}>
                <FlatList
                    //inverted      // <-- turn on later
                    data={messageSections}
                    keyExtractor={(item, index) => item.title}
                    showsVerticalScrollIndicator={false}
                    ListFooterComponent={() => <View style={{ height: 5 }}/>}   // <-- switch to header once inverted (and maybe change to a value of 10)
                    //ListEmptyComponent={}     // <-- add later (display something at the start of every new conversation)
                    renderItem={sectionData =>
                        <ChatMessages navigation={navigation} messages={sectionData}/>
                    }
                />
            </View>
        );
    };

    return (
        <View style={{ flex: 1, backgroundColor: Colors.greyBackdrop,
            paddingTop: Platform.OS === 'ios' ? 44 : 0
        }}>
            <StatusBar barStyle={'dark-content'} translucent backgroundColor={'transparent'}/>
            {Platform.OS === 'android' && <View style={{ height: StatusBar.currentHeight }}/>}
            <KeyboardAvoidingView
                style={styles.screen}
                behavior={Platform.OS === 'ios' ? 'height' : undefined}
            >
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
                    <Text style={{ fontSize: 20, fontFamily: 'proxima-nova-semi' }}>Name</Text>

                    <Menu style={{ position: 'absolute', right: Platform.OS === 'android' ? 0 : 5 }}>
                        <MenuTrigger
                            customStyles={{
                                TriggerTouchableComponent: TouchableOpacity
                            }}
                            style={{ alignItems: 'center', width: 55, paddingVertical: Platform.OS === 'android' ? 12 : 5 }}
                        >
                            <Feather name='more-vertical' size={25} color='black'/>
                        </MenuTrigger>
                        <MenuOptions
                            customStyles={{
                                optionsContainer: {
                                    borderRadius: 10,
                                    width: 150,
                                    marginTop: Platform.OS === 'ios' ? 40 : 50,
                                    marginLeft: Platform.OS === 'ios' ? -8 : -10,
                                    shadowOpacity: 0.2
                                }
                            }}
                        >
                            <MenuOption
                                // ** modify option so that the user can unblock if they have already blocked
                                //onSelect={() => }
                                customStyles={{
                                    OptionTouchableComponent: TouchableHighlight,
                                    optionWrapper: {
                                        flexDirection: 'row',
                                        alignItems: 'center'
                                    }
                                }}
                                style={{ height: 50, paddingLeft: 5 }}
                            >
                                <MaterialIcons name='block' size={25} color='#dd2334' style={{ marginHorizontal: 5 }}/>
                                <Text style={{ fontFamily: 'proxima-nova-semi', fontSize: 17, color: '#dd2334' }}>Block Name</Text>
                            </MenuOption>
                            <View style={{ height: 1, backgroundColor: Colors.border }}/>
                            <MenuOption
                                //onSelect={() => }
                                customStyles={{
                                    OptionTouchableComponent: TouchableHighlight,
                                    optionWrapper: {
                                        flexDirection: 'row',
                                        alignItems: 'center'
                                    }
                                }}
                                style={{ height: 50, paddingLeft: 5 }}
                            >
                                <Ionicons name='trash-outline' size={25} color='#dd2334' style={{ marginHorizontal: 5 }}/>
                                <Text style={{ fontFamily: 'proxima-nova-semi', fontSize: 17, color: '#dd2334' }}>Delete chat</Text>
                            </MenuOption>
                        </MenuOptions>
                    </Menu>
                </View>
                <View style={{ height: 1, backgroundColor: Colors.border }}/>

                {MessagesDisplay()}
            
                <View style={styles.messageContainer}>
                    <View style={[styles.messageInputContainer, { height: messageContainerHeight }]}>
                        <TextInput
                            value={message}
                            placeholder='Send a message...'
                            placeholderTextColor={Colors.darkGrey}
                            onChangeText={setMessage}
                            selectionColor={Colors.theme}
                            multiline
                            autoCorrect={false}
                            spellCheck={true}
                            autoCapitalize='sentences'
                            onContentSizeChange={onContentSizeChange}
                            //maxLength={}  // <-- optional
                            style={styles.messageInputText}
                        />
                    </View>
                    {enableSend
                        ? <Pressable
                            //onPress={() => }      // <-- dismiss the keyboard
                            style={({pressed}) => [styles.sendButtonContainer, { opacity: pressed ? 0.2 : 1, backgroundColor: Colors.theme }]}
                        >
                            <CustomIcon name='share' size={20} color={'white'} style={{ right: 1, top: 1 }}/>
                        </Pressable>
                        : <View style={[styles.sendButtonContainer, { backgroundColor: Colors.greyBackdrop }]}>
                            <CustomIcon name='share' size={20} color={Colors.mediumGrey} style={{ right: 1, top: 1 }}/>
                        </View>
                    }
                </View>
            </KeyboardAvoidingView>
            <View style={{ paddingBottom: Platform.OS === 'ios' ? 34.5 : 0, backgroundColor: 'white' }}/>
        </View>
    );
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: Colors.greyBackdrop
    },
    messageContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingVertical: 15,
        paddingHorizontal: 10,
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20
    },
    sendButtonContainer: {
        height: 40,
        width: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 10,
        bottom: 5
    },
    messageInputContainer: {
        flex: 1,
        paddingHorizontal: 12,
        paddingVertical: 12,
        backgroundColor: Colors.greyBackdrop,
        borderRadius: 25
    },
    messageInputText: {
        flex: 1,
        fontFamily: 'proxima-nova-reg',
        fontSize: 18,
        bottom: Platform.OS === 'ios' ? 2 : 0
    },
    menuContainer: {
        backgroundColor: 'white',
        borderRadius: 10,
        width: 225,
        height: 150,
        shadowOpacity: 0,
        elevation: 0
    }
});

export default ChatScreen;