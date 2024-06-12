import React from 'react';
import { View, Text, StyleSheet, StatusBar, Platform, Pressable, ScrollView, Image } from 'react-native';
import Colors from '../../../utils/Colors';
import * as Linking from 'expo-linking';

import CustomIcon from '../../../utils/CustomIcon';
import { Octicons, Ionicons, Entypo } from '@expo/vector-icons';

// ** replace the temp_logo with the official logo later

// ** finish creating terms of services and privacy policy

// ** (optional-future update feature) include an option to navigate to a screen that describes the company
//    and how to join/what employees are we looking for

const AboutScreen = ({ navigation }) => {
    return (
        <View style={{ flex: 1, backgroundColor: Colors.greyBackdrop,
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
                    <Text style={{ fontSize: 20, fontFamily: 'proxima-nova-semi' }}>About</Text>
                </View>

                <ScrollView bounces={false}>
                    <View style={styles.logoContainer}>
                        <Image
                            source={require('../../../assets/images/temp_logo.png')}
                            style={{ width: 115, height: 115, borderRadius: 30 }}
                        />
                        <Text style={{ fontSize: 23, fontFamily: 'proxima-nova-semi', marginTop: 20 }}>Blitzmo</Text>
                        <Text style={{ fontSize: 17, fontFamily: 'proxima-nova-reg', marginTop: 10, color: Colors.mediumGrey }}>Version 1.0.0</Text>
                    </View>

                    <Text style={styles.labelText}>Terms and Policies</Text>
                    <Pressable
                        //onPress={() => }
                        style={({pressed}) => [styles.optionContainer, { backgroundColor: pressed ? '#e6e6e6' : 'white',
                            borderTopLeftRadius: 15, borderTopRightRadius: 15, marginTop: 10
                        }]}
                    >
                        <View style={{ marginHorizontal: 15, width: 25, alignItems: 'center' }}>
                            <Ionicons name='document-text' size={27} color='#b3b3b5'/>
                        </View>
                        <Text style={{ fontFamily: 'proxima-nova-semi', fontSize: 18 }}>Terms of Service</Text>
                    </Pressable>
                    <View style={{ height: 1, backgroundColor: Colors.border, marginHorizontal: 15 }}/>
                    <Pressable
                        //onPress={() => }
                        style={({pressed}) => [styles.optionContainer, { backgroundColor: pressed ? '#e6e6e6' : 'white',
                            borderBottomLeftRadius: 15, borderBottomRightRadius: 15
                        }]}
                    >
                        <View style={{ marginHorizontal: 15, width: 25, alignItems: 'center' }}>
                            <Ionicons name='document-text' size={27} color='#b3b3b5'/>
                        </View>
                        <Text style={{ fontFamily: 'proxima-nova-semi', fontSize: 18 }}>Privacy Policy</Text>
                    </Pressable>

                    <Text style={styles.labelText}>Website</Text>
                    <Pressable
                        onPress={() => Linking.openURL('https://blitzmo.com/')}
                        style={({pressed}) => [styles.optionContainer, { backgroundColor: pressed ? '#e6e6e6' : 'white',
                            borderRadius: 15, marginTop: 10
                        }]}
                    >
                        <View style={{ marginHorizontal: 15, width: 25, alignItems: 'center' }}>
                            <Entypo name='globe' size={24} color='#b3b3b5'/>
                        </View>
                        <Text style={{ fontFamily: 'proxima-nova-semi', fontSize: 18 }}>Visit Website</Text>
                    </Pressable>

                    <Text style={styles.labelText}>Developer</Text>
                    <Text style={{ fontSize: 19, fontFamily: 'proxima-nova-reg', marginTop: 10, marginBottom: 5, marginHorizontal: 15 }}>Joshua Matte</Text>
                    <Pressable
                        onPress={() => Linking.openURL('https://www.linkedin.com/in/joshua-matte1/')}
                        style={({pressed}) => [styles.optionContainer, { backgroundColor: pressed ? '#e6e6e6' : 'white',
                            borderRadius: 15, marginTop: 10, marginBottom: 10
                        }]}
                    >
                        <View style={{ marginHorizontal: 15, width: 25, alignItems: 'center' }}>
                            <CustomIcon name='profile' size={25} color='#b3b3b5'/>
                        </View>
                        <Text style={{ fontFamily: 'proxima-nova-semi', fontSize: 18 }}>Visit LinkedIn Profile</Text>
                    </Pressable>
                </ScrollView>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    screen: {
        flex: 1
    },
    logoContainer: {
        backgroundColor: 'white',
        marginHorizontal: 15,
        borderRadius: 15,
        alignItems: 'center',
        paddingVertical: 20,
        marginTop: 20
    },
    labelText: {
        fontSize: 18,
        fontFamily: 'proxima-nova-semi',
        marginHorizontal: 15,
        marginTop: 25
    },
    optionContainer: {
        marginHorizontal: 15,
        height: 50,
        flexDirection: 'row',
        alignItems: 'center'
    }
});

export default AboutScreen;