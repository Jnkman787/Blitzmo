import React, { useRef } from 'react';
import { View, Text, StyleSheet, Image, Pressable, Animated } from 'react-native';
import Colors from '../../utils/Colors';

import CustomIcon from '../../utils/CustomIcon';
import { AntDesign } from '@expo/vector-icons';

const FriendSuggestion = ({ navigation }) => {
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
        <View style={{ backgroundColor: 'white', height: 85 }}>
            <Animated.View
                style={{ height: 85, backgroundColor: backgroundColorChange, width: backgroundWidthChange, alignSelf: 'center', position: 'absolute' }}
            />
            <Pressable
                //onPress={() =>}   // <-- navigate to user's profile
                onPressIn={onPressIn}
                style={{ flex: 1, flexDirection: 'row'}}
            >
                <View style={styles.profileIcon}>
                    <Image
                        source={require('../../assets/images/profile.png')}
                        style={{ flex: 1, height: undefined, width: undefined }}
                    />
                </View>
                <View style={{ flex: 1, justifyContent: 'space-evenly', paddingVertical: 3 }}>
                    <Text style={{ fontFamily: 'proxima-nova-semi', fontSize: 18 }}>Name</Text>
                    <Text style={{ fontFamily: 'proxima-nova-reg', fontSize: 16, color: Colors.darkGrey }}>Username</Text>
                    <Text style={{ fontFamily: 'proxima-nova-reg', fontSize: 16, color: Colors.darkGrey }}># mutual friends</Text>
                </View>
                <Pressable
                    // don't change opacity when selected, change color or disappear
                    //onPress={() => }
                    style={({pressed}) => [styles.addButtonContainer, { opacity: pressed ? 0.2 : 1 }]}
                >
                    <View style={{ flexDirection: 'row', flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                        <CustomIcon name='add-friend' size={17} color='white' style={{ bottom: 1, marginRight: 5 }}/>
                        <Text style={{ fontFamily: 'proxima-nova-reg', fontSize: 16, color: 'white' }}>Add</Text>
                    </View>
                </Pressable>
                <Pressable
                    //onPress={() => }
                    style={({pressed}) => [styles.deleteButton, { opacity: pressed ? 0.2 : 1 }]}
                >
                    <AntDesign name='close' size={28} color={Colors.mediumGrey}/>
                </Pressable>
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    profileIcon: {
        height: 60,
        width: 60,
        borderRadius: 30,
        overflow: 'hidden',
        marginLeft: 15,
        marginRight: 12,
        alignSelf: 'center'
    },
    addButtonContainer: {
        width: 75,
        height: 40,
        borderRadius: 30,
        backgroundColor: Colors.theme,
        alignSelf: 'center',
        marginLeft: 10,
        marginRight: 5
    },
    deleteButton: {
        alignSelf: 'center',
        height: 40,
        width: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 5
    }
});

export default FriendSuggestion;