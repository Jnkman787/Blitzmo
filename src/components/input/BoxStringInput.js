import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, TextInput, Animated, Pressable, Text, Platform } from 'react-native';
import { width } from '../../utils/Scaling';
import Colors from '../../utils/Colors';

const BoxStringInput = ({ text, setText, label, length, topMargin, navigation, warning, multipleLines, scrollDown }) => {
    const slideY = useRef(new Animated.Value(1)).current;
    const [active, setActive] = useState(false);
    const [containerHeight, setContainerHeight] = useState(60);

    useEffect(() => {
        let string = text;
        if (string.length > 0) {
            setActive(true);
        } else { setActive(false); }
    }, []);

    useEffect(() => {
        if (active) {
            Animated.timing(slideY, {
                toValue: 0,
                duration: 100,
                useNativeDriver: true
            }).start();
        } else {
            Animated.timing(slideY, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true
            }).start();
        }
    }, [active]);

    function onChangeText (newText) {
        const numLines = newText.split('\n').length;
        if (numLines <= 3) {
            setText(newText);
        }
    };

    function checkInput () {
        let string = text;
        if (string.length === 0) {
            if (active) {
                setActive(false);
            }
        }
    };

    function onContentSizeChange (event) {
        if (multipleLines) {
            if (Platform.OS === 'android') {
                setContainerHeight(event.nativeEvent.contentSize.height + 17);
            } else if (Platform.OS === 'ios') {
                setContainerHeight(event.nativeEvent.contentSize.height + 41);
            }
        }
    };

    return (
        <View style={[styles.inputContainer, { marginTop: topMargin, borderColor: warning ? '#dd2334' : Colors.mediumGrey, height: containerHeight }]}>
            <Animated.View style={[styles.labelContainer, {
                transform: [{
                    translateY: slideY.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 14]
                    })
            }]}]}>
                <Text style={[styles.labelText, { color: warning ? '#dd2334' : Colors.mediumGrey }]}>{label}</Text>
                {label === 'Bio' 
                    ? text.length > 0 
                        ? <Text style={[styles.labelText, { color: warning ? '#dd2334' : Colors.mediumGrey }]}>{text.length}/100</Text>
                        : null
                    : null
                }
            </Animated.View>
            {label != 'Username' && <TextInput
                value={text}
                //onFocus={() => !active ? setActive(true) : null}
                onFocus={() => {
                    if (!active) { setActive(true); }
                    if (Platform.OS === 'android' && width < 550) {
                        scrollDown();
                    }
                }}
                onBlur={() => checkInput()}
                onChangeText={onChangeText}
                selectionColor={warning ? '#dd2334' : Colors.theme}
                maxLength={length}
                multiline={multipleLines}
                onContentSizeChange={onContentSizeChange}
                autoCorrect={false}
                spellCheck={false}
                autoCapitalize='sentences'
                style={[styles.inputText, { paddingTop: Platform.OS === 'ios' ? multipleLines ? 30 : 20 : 20 }]}
            />}
            {label === 'Username' && <Pressable
                onPress={() => navigation.navigate('SettingsStack', { screen: 'AccountUpdate', params: { element: label, value: text } })}
                style={{ flex: 1, paddingTop: 20, justifyContent: 'center' }}
            >
                <Text style={{ fontFamily: 'proxima-nova-semi', fontSize: 19 }}>{text}</Text>
            </Pressable>}
        </View>
    );
};

const styles = StyleSheet.create({
    inputContainer: {
        backgroundColor: 'white',
        marginHorizontal: 15,
        borderRadius: 15,
        borderWidth: 1,
        paddingHorizontal: 15,
    },
    labelContainer: {
        position: 'absolute',
        top: 7,
        marginHorizontal: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%'
    },
    labelText: {
        fontFamily: 'proxima-nova-reg',
        fontSize: 16
    },
    inputText: {
        flex: 1,
        fontFamily: 'proxima-nova-semi',
        fontSize: 19
    }
});

export default BoxStringInput;