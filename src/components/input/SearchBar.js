import React from 'react';
import { View, StyleSheet, TextInput, Pressable } from 'react-native';
import Colors from '../../utils/Colors';

import { Ionicons, AntDesign } from '@expo/vector-icons';

const SearchBar = ({ text, setText, label, search }) => {
    const DeleteButton = () => {
        if (text.length > 0) {
            return (
                <Pressable
                    onPress={() => setText('')}
                    style={{ height: 25, width: 25, marginHorizontal: 7, alignItems: 'center', justifyContent: 'center' }}
                >
                    <AntDesign name='closecircle' size={20} color={Colors.mediumGrey}/>
                </Pressable>
            );
        }
    };
    
    return (
        <View style={styles.searchBarContainer}>
            <Ionicons name='search' size={27} color='black' style={{ marginHorizontal: 15 }}/>
            <TextInput
                placeholder={label}
                placeholderTextColor={Colors.mediumGrey}
                value={text}
                onChangeText={setText}
                selectionColor={Colors.theme}
                returnKeyType='search'
                autoCorrect={false}
                autoCapitalize='none'
                spellCheck={false}
                onSubmitEditing={() => {    // execute search after user presses return key
                    if (label === 'Search Blitzmo') {   // only execute on search screen
                        search(true);
                    }
                }}
                style={styles.inputText}
            />
            {DeleteButton()}
        </View>
    );
};

const styles = StyleSheet.create({
    searchBarContainer: {
        alignItems: 'center',
        backgroundColor: '#e6e6e6',
        borderRadius: 30,
        marginHorizontal: 15,
        height: 45,
        flexDirection: 'row',
        marginTop: 10
    },
    inputText: {
        flex: 1,
        height: 45,
        fontFamily: 'proxima-nova-reg',
        fontSize: 17
    }
});

export default SearchBar;