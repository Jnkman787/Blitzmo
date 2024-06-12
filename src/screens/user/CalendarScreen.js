import React from 'react';
import { View, Text, StyleSheet, StatusBar, Platform, Pressable, FlatList } from 'react-native';

import CalendarCard from '../../components/display/CalendarCard';

import { Octicons } from '@expo/vector-icons';

// ** order the months in reverse chronological order

// ** temp
const Months = [
    { month: 'May', year: 2023 },
    { month: 'June', year: 2023 }
];

const CalendarScreen = ({ navigation }) => {
    const CalendarList = () => {
        return (
            <View style={{ flex: 1 }}>
                <FlatList
                    data={Months}
                    renderItem={monthData => <CalendarCard navigation={navigation} month={monthData}/>}
                    showsVerticalScrollIndicator={false}
                    inverted
                    //ListEmptyComponent={}     // <-- won't need?
                    //keyExtractor={}       // <-- add later
                    //onEndReachedThreshold={}  // <-- add later
                    //onEndReached={}       // <-- won't need?
                    //initialNumToRender={}     // <-- add later
                    //maxToRenderPerBatch={}    // <-- add later
                />
            </View>
        );
    };

    return (
        <View style={{ flex: 1, backgroundColor: 'white',
            paddingTop: Platform.OS === 'ios' ? 44 : 0,
            paddingBottom: Platform.OS === 'ios' ? 34.5 : 0
        }}>
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
                    <Text style={{ fontSize: 20, fontFamily: 'proxima-nova-semi' }}>Posts</Text>
                </View>

                {CalendarList()}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    screen: {
        flex: 1
    }
});

export default CalendarScreen;