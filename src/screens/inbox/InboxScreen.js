import React, { useContext } from 'react';
import { View, Text, StyleSheet, Platform, Pressable, FlatList } from 'react-native';
import { ActiveTabContext } from '../../utils/ContextVariables';
import Colors from '../../utils/Colors';

import MessagePreview from '../../components/navigation/MessagePreview';

import CustomIcon from '../../utils/CustomIcon';

// ** create a display for when a user's inbox is empty

// ** check if the user has an internet connection before retrieving data
// *  display something else if they have no internet connection

// ** honestly, after thinking it through, creating/having an inbox collection consisting of userIDs &
//    the timestamp for the most recently sent message (using option 1) will greatly lower the amount of
//    backend work required on the Inbox Screen (making things quick and easy)

// ** likely only need to retrieve a list of userIDs (from the user's Inbox collection) for users with whom 
//    the user has messaged/been messaged by to provide to the MessagePreview
// *  the retrieval of userIDs will have to be done with a snapshot, keeping the InboxScreen list up to date
//    in case there any modifications to the user's number of chats
// *  then the MessagePreview components can individually use the userID to find and retrieve any data it
//    needs for display (just like the FriendPreview component)

// ** decide later if I should list message previews for blocked conversations
// *  using an inbox collection for retrieving the list of conversations instead of using a query to simply
//    retrieve all of the chat documents involving the current user is likely a good idea since it automatically
//    only lists conversations that aren't blocked
// *  since blocking someone simply stops the conversation from continuing but doesn't delete it, the list of
//    documents in the chats collection will also contain blocked conversations; requiring that I check each
//    document if it's blocked before knowing whether to include it in the display list
// *  if I choose option 2 for figuring out how to order the list of users, I shouldn't bother using an inbox
//    collection as I have to go retrieve data from all the documents anyways

// ** display something if the inbox screen is empty (user has no conversations)

// ** finding a way to list the message previews in reverse chronological order:
//    (option 1) store a timestamp variable in each inbox document containing the sent time/date for the
//    most recently sent message (will have to be updated each time a message is sent)
//    (option 2) otherwise, after getting the list of userIDs, use them to go and retrieve the most recent time/date
//    from each individual conversation
// *  if the timestamp value is already in each inbox document, I can simply retrieve them in reverse-chronological order
// *  if I have to go and find the timestamps after retrieving the inbox documents, I can use them
//    to re-order the userID values in reverse-chronological order
// *  option 1 may require a little bit more prep work (having to constantly update the timestamp value) and a bit
//    more storage, but will significantly decrease the number of read operations and speed up the load time
// *  strategy used for StudyConnect for listing InboxScreen in chronological order was very inefficient;
//    ChatGPT shows a much quicker solution in which I only need to retrieve 1 document instead of all of them

// ** temp
const data = [
    { id: 1 },
    { id: 2 },
    { id: 3 },
    { id: 4 },
    { id: 5 },
    { id: 6 }
];

const InboxScreen = ({ navigation }) => {
    return (
        <View style={styles.screen}>
            <View style={{ height: Platform.OS === 'ios' ? 45 : 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 20, fontFamily: 'proxima-nova-semi' }}>Inbox</Text>
                <Pressable
                    onPress={() => navigation.navigate('InboxStack', { screen: 'NewChat' })}
                    style={({pressed}) => [{ position: 'absolute', right: Platform.OS === 'android' ? 5 : 9, opacity: pressed ? 0.2 : 1,
                        paddingVertical: Platform.OS === 'android' ? 12 : 5,
                        paddingHorizontal: Platform.OS === 'android' ? 14 : 12
                    }]}
                >
                    <CustomIcon name='new-chat' size={20} color='black'/>
                </Pressable>
            </View>
            <View style={{ height: 1, backgroundColor: Colors.border }}/>

            <FlatList
                data={data}
                renderItem={messageData => <MessagePreview navigation={navigation}/>}
                ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: Colors.border, marginLeft: 82 }}/>}
                showsVerticalScrollIndicator={false}
                //ListEmptyComponent={}     // <-- add later
                //keyExtractor={}   // <-- add later
                //onEndReachedThreshold={}  // <-- decide if needed later
                //onEndReached={}   // <-- decided if needed later
            />
        </View>
    );
};

InboxScreen.navigationOptions = ({ navigation }) => {
    const isFocused = navigation.isFocused();
    const { activeTab } = useContext(ActiveTabContext);

    return {
        tabBarButton: () => {
            if (isFocused) {
                return (
                    <View style={{ flex: 1, height: 56, alignItems: 'center', justifyContent: 'center' }}>
                        <CustomIcon name='inbox' size={26} color='black'/>
                        <Text style={{ fontFamily: 'proxima-nova-semi', fontSize: 10.5, color: 'black', marginTop: 5 }}>Inbox</Text>
                    </View>
                );
            } else {
                return (
                    <Pressable
                        onPress={() => navigation.navigate('Tab', { screen: 'Inbox' })}
                        style={{ flex: 1, height: 56, alignItems: 'center', justifyContent: 'center' }}
                    >
                        <CustomIcon name='inbox-outline' size={26} color={activeTab === 'Home' ? '#cccccc' : '#808080'}/>
                        <Text style={{ fontFamily: 'proxima-nova-semi', fontSize: 10.5, color: activeTab === 'Home' ? '#cccccc' : '#808080', marginTop: 5 }}>Inbox</Text>
                    </Pressable>
                );
            }
        }
    };
};

const styles = StyleSheet.create({
    screen: {
        flex: 1
    }
});

export default InboxScreen;