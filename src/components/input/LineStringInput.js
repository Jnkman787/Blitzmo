import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, Pressable } from 'react-native';
import Colors from '../../utils/Colors';

import CustomIcon from '../../utils/CustomIcon';
import { AntDesign } from '@expo/vector-icons';

const LineStringInput = ({ text, setText, label, topMargin, length, auto, warning, showPassword }) => {
    const [keyboard, setKeyboard] = useState('default');

    useEffect(() => {
        if (label === 'Email') {
            setKeyboard('email-address');
        } else if (label === 'Code') {
            setKeyboard('number-pad');
        } else {
            setKeyboard('default');
        }
    }, []);

    const DisplayIcon = () => {
        if (label === 'Email') {
            return ( <CustomIcon name='at-sign' size={23} color={Colors.mediumGrey}/> );
        } else if (label.includes('Password') || label === 'Code') {
            return ( <CustomIcon name='lock-outline' size={25} color={Colors.mediumGrey} style={{ left: 1.5 }}/> );
        } else if (label === 'Name' || label === 'Username') {
            return ( <CustomIcon name='profile-outline' size={23} color={Colors.mediumGrey}/> );
        }
    };

    const DeleteButton = () => {
        if (text.length > 0) {
            return (
                <Pressable
                    onPress={() => setText('')}
                    style={{ height: 20, width: 20, marginHorizontal: 5 }}
                >
                    <AntDesign name='closecircle' size={20} color={Colors.mediumGrey}/>
                </Pressable>
            );
        }
    };

    return (
        <View style={{ backgroundColor: 'white', flexDirection: 'row', marginTop: topMargin, marginLeft: 30,
            flex: label.includes('Password') ? 1 : null, marginRight: label.includes('Password') ? 0 : 30
        }}>
            <View style={styles.iconContainer}>
                {DisplayIcon()}
            </View>
            <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', height: 35 }}>
                    <TextInput
                        autoFocus={auto}
                        placeholder={label}
                        placeholderTextColor={'#bfbfbf'}
                        value={text}
                        onChangeText={setText}
                        selectionColor={Colors.theme}
                        maxLength={length}
                        keyboardType={keyboard}
                        autoCorrect={false}
                        spellCheck={false}
                        autoCapitalize='none'
                        secureTextEntry={label.includes('Password') ? !showPassword ? true : false : false}
                        style={styles.inputText}
                    />
                    {DeleteButton()}
                </View>
                <View style={{ height: 1, width: '100%', backgroundColor: warning ? '#dd2334' : Colors.mediumGrey }}/>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    iconContainer: {
       width: 40,
       height: 30
    },
    inputText: {
        flex: 1,
        height: 35,
        fontFamily: 'proxima-nova-reg',
        fontSize: 17,
        bottom: 8
    }
});

export default LineStringInput;