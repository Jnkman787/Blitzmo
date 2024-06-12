import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, FlatList } from 'react-native';
import Modal from 'react-native-modal';
import Colors from '../../utils/Colors';

import Comment from '../display/Comment';

// ** temp
const data = [
    { id: 1 },
    { id: 2 },
    { id: 3 },
    { id: 4 },
    { id: 5 },
    { id: 6 },
    { id: 7 },
    { id: 8 },
    { id: 9 }
];

// ** check out the following example: https://github.com/react-native-modal/react-native-modal/blob/6624b5abb326470820f9fedec8b3ecdb35520869/example/src/modals/ScrollableModal.tsx

// ** use the same height value (not percentage) regardless of screen size
//    make the height big enough to fit 4 or 5 comments + text input

// ** setup a system for checking the # of comments and assigning it the proper text representation (K, M, etc.)

// ** insert a text input box at the bottom for letting users write comments

// ** setup a loading animation while retrieving the first batch of comments

const CommentBox = ({ visible, setVisible }) => {
    //const [scrollOffset, setScrollOffset] = useState(0);
    //const flatListRef = useRef();

    /*function handleScrollTo ({ y }) {
        if (flatListRef.current) {
            flatListRef.current.scrollTo(y);
            //flatListRef.current.scrollToOffset({ offset: y, animated: true });
        }
    };*/

    const Header = () => {
        return (
            <View style={{ alignItems: 'center' }}>
                <View style={{ height: 5, width: 45, backgroundColor: Colors.mediumGrey, marginTop: 15, borderRadius: 20 }}/>
                <Text style={styles.headerText}># comments</Text>
            </View>
        );
    };

    // ** modify so that the FlatList holds its scroll position when the modal is closed
    return (
        <Modal
            isVisible={visible}
            onBackButtonPress={() => setVisible(false)}
            onBackdropPress={() => setVisible(false)}
            onSwipeComplete={() => setVisible(false)}
            swipeDirection='down'
            animationInTiming={200}
            animationOutTiming={200}
            backdropOpacity={0}
            propagateSwipe={true}   // <-- revisit !!! (unsure why it's not fixing the swipe down issue)
            //scrollTo={handleScrollTo}
            //scrollOffset={scrollOffset}
            scrollOffsetMax={55}  // content height - FlatList height
            style={{ justifyContent: 'flex-end', margin: 0 }}
        >
            <View style={styles.modalContainer}>
                {Header()}

                <View style={{ flex: 1 }}>
                    <FlatList
                        //ref={flatListRef}
                        //onScroll={event => setScrollOffset(event.nativeEvent.contentOffset.y)}
                        //scrollEventThrottle={16}    // 60 times/sec

                        data={data}
                        renderItem={() => <Comment/>}
                        showsVerticalScrollIndicator={false}
                        //ListFooterComponent={}    // <-- add text input for writing comments
                        //ListEmptyComponent={}     // <-- add later
                        //keyExtractor={}   // <-- add later
                        //onEndReachedThreshold={}  // <-- add later
                        //onEndReached={}   // <-- add later
                        //initialNumToRender={}     // <-- add later
                        //maxToRenderPerBatch={}    // <-- add later
                        bounces={false}
                    />
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        backgroundColor: 'white',
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        paddingBottom: Platform.OS === 'ios' ? 20 : 10,     // <-- revisit once I add text input
        height: 500     // <-- revisit once I add text input
    },
    headerText: {
        fontFamily: 'proxima-nova-semi',
        fontSize: 18,
        marginVertical: 10
    }
});

export default CommentBox;