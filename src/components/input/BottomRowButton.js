import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import Colors from '../../utils/Colors';

import CustomIcon from '../../utils/CustomIcon';
import { AntDesign } from '@expo/vector-icons';

const BottomRowButton = ({ category, option, currentOption, setOption }) => {
    const colorAnimation = useRef(new Animated.Value(0)).current;
    const sizeAnimation = useRef(new Animated.Value(0)).current;
    const [animationComplete, setAnimationComplete] = useState(false);
    const [isPressed, setIsPressed] = useState(false);

    const buttonWidth = () => {
        if (category === 'Posts') {
            return 100;
        } else {
            if (option === 'Friends') { return 120; }
            else if (option === 'Suggestions') { return 150; }
            else if (option === 'Requests') { return 120; }
        }
    };

    const backgroundColorChange = colorAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: ['white', '#e6e6e6']
    });

    const backgroundSizeChange = sizeAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: ['75%', '95%']
    });

    useEffect(() => {
        if (!isPressed && animationComplete) {
            Animated.parallel([
                Animated.timing(colorAnimation, {
                    toValue: 0,
                    duration: 250,
                    useNativeDriver: false  // native driver doesn't support color animation
                }),
                Animated.timing(sizeAnimation, {
                    toValue: 0,
                    duration: 600,
                    useNativeDriver: false
                })
            ]).start(() => {
                setAnimationComplete(false);
            });
        }
    }, [isPressed, animationComplete]);

    function onPressIn () {
        setOption(option);
        setIsPressed(true);
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
            setAnimationComplete(true);
        });
    };

    function onPressOut () {
        setIsPressed(false);
    };

    const ButtonText = () => {
        if (option === 'Friends') {
            return (
                <Text style={[styles.bottomOptionText, { color: currentOption === 'Friends' ? 'black' : Colors.mediumGrey }]}>Friends</Text>
            );
        } else if (option === 'Suggestions') {
            return (
                <Text style={[styles.bottomOptionText, { color: currentOption === 'Suggestions' ? 'black' : Colors.mediumGrey }]}>Suggestions</Text>
            );
        } else if (option === 'Requests') {
            return (
                <Text style={[styles.bottomOptionText, { color: currentOption === 'Requests' ? 'black' : Colors.mediumGrey }]}>Requests</Text>
            );
        }
    };

    const ButtonContent = () => {
        if (category === 'Posts') {
            return (
                <View style={{ alignItems: 'center' }}>
                    {option === 'Grid' 
                        ? <AntDesign name='appstore1' size={27} color={currentOption === 'Grid' ? 'black' : Colors.mediumGrey} style={{ padding: 5 }}/>
                        : <CustomIcon name='calendar' size={27} color={currentOption === 'Calendar' ? 'black' : Colors.mediumGrey} style={{ padding: 5 }}/>
                    }
                    <View style={{ backgroundColor: 'black', height: 3, width: 45, borderRadius: 20, opacity: currentOption === option ? 1 : 0 }}/>
                </View>
            );
        } else if (category === 'Friends') {
            return (
                <View>
                    {ButtonText()}
                    <View style={{ backgroundColor: 'black', height: 3, borderRadius: 20, opacity: currentOption === option ? 1 : 0 }}/>
                </View>
            );
        }
    };

    return (
        <View style={{ width: buttonWidth(), justifyContent: 'center', alignItems: 'center', height: 56 }}>
            <Animated.View
                style={{ 
                    backgroundColor: backgroundColorChange,
                    width: backgroundSizeChange,
                    height: backgroundSizeChange,
                    borderRadius: 40
                }}
            />
            <Pressable
                onPressIn={onPressIn}
                onPressOut={onPressOut}
                style={styles.buttonContainer}
            >
                {ButtonContent()}
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    buttonContainer: {
        height: '100%',
        width: '100%',
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center'
    },
    bottomOptionText: {
        fontFamily: 'proxima-nova-semi',
        fontSize: 18,
        padding: 5
    }
});

export default BottomRowButton;