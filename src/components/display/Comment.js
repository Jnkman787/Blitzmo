import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, Pressable, Animated } from 'react-native';
import Colors from '../../utils/Colors';

import { AntDesign } from '@expo/vector-icons';

const Comment = () => {
    const colorAnimation = useRef(new Animated.Value(0)).current;
    const scaleValue = useRef(new Animated.Value(1)).current;
    const [animationComplete, setAnimationComplete] = useState(false);
    const [isPressed, setIsPressed] = useState(false);

    const [like, setLike] = useState(false);    // <-- temp until I setup database

    const backgroundColorChange = colorAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: ['#f2f2f2', '#ec0040']
    });

    useEffect(() => {
        if (!isPressed && animationComplete) {
            Animated.timing(scaleValue, {
                toValue: 1,
                duration: 150,
                useNativeDriver: true
            }).start(() => {
                setAnimationComplete(false);
            });
        }
    }, [isPressed, animationComplete]);

    function onIconPressIn () {
        setIsPressed(true);
        Animated.timing(scaleValue, {
            toValue: 0.75,
            duration: 150,
            useNativeDriver: true
        }).start(() => {
            setAnimationComplete(true);    
        });
    };

    function onIconPressOut () {
        setIsPressed(false);
    };

    return (
        <Pressable style={{ flexDirection: 'row', paddingTop: 20, backgroundColor: 'white' }}>
            <Pressable
                //onPress={() =>}   // <-- navigate to user profile
                style={({pressed}) => [styles.profileIcon, { backgroundColor: pressed ? Colors.mediumGrey : 'white' }]}
            >
                <Image
                    source={require('../../assets/images/profile.png')}
                    style={{ flex: 1, height: undefined, width: undefined }}
                />
            </Pressable>

            <View style={{ flex: 1, paddingRight: 15 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.nameText}>Name</Text>
                    <Text style={styles.dateText}> • 17m</Text>
                </View>
                <Text style={styles.commentText}>comment ...</Text>

                <Pressable
                    onPress={() => {
                        setLike(current => !current);   // <-- replace later
                        
                        let toValue;
                        if (like) { toValue = 0; }  // <-- check if variable name needs to be changed
                        else { toValue = 1; }
                        Animated.timing(colorAnimation, {
                            toValue,
                            duration: 250,
                            useNativeDriver: false
                        }).start();
                    }}
                    onPressIn={onIconPressIn}
                    onPressOut={onIconPressOut}
                    style={{ alignSelf: 'flex-start' }}
                >
                    <Animated.View style={[styles.likeButtonContainer, { backgroundColor: backgroundColorChange }]}>
                        <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
                            {like ? <AntDesign name='heart' size={20} color='white'/>
                                : <AntDesign name='hearto' size={20} color={Colors.darkGrey}/>
                            }
                        </Animated.View>
                        <Text style={[styles.likeCountText, { color: like ? 'white' : Colors.darkGrey }]}>3381</Text>
                    </Animated.View>
                </Pressable>
            </View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    profileIcon: {
        height: 40,
        width: 40,
        borderRadius: 20,
        marginLeft: 15,
        marginRight: 12,
        overflow: 'hidden'
    },
    nameText: {
        fontFamily: 'proxima-nova-semi',
        fontSize: 15
    },
    dateText: {
        fontFamily: 'proxima-nova-reg',
        fontSize: 14,
        color: Colors.mediumGrey
    },
    commentText: {
        fontFamily: 'proxima-nova-reg',
        fontSize: 17,
        marginTop: 5,
        marginBottom: 6
    },
    likeButtonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 20,
        right: 8
    },
    likeCountText: {
        fontFamily: 'proxima-nova-reg',
        fontSize: 14,
        marginLeft: 5
    }
});

export default Comment;