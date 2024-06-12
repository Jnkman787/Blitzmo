import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Pressable, Linking } from 'react-native';

import { AntDesign } from '@expo/vector-icons';

const Warning = ({ message, visible, setVisible }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true
            }).start();
    
            setTimeout(() => {
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 500,
                    useNativeDriver: true
                }).start(() => {
                    setVisible(false);
                });
            }, 5000);
        }
    }, [visible]);

    return (
        <Animated.View style={[styles.warningContainer, { opacity: fadeAnim }]}>
            <AntDesign name='warning' size={23} color='#ff1a1a' style={{ marginRight: 15, top: 10 }}/>
            <View>
                <Text style={styles.warningText}>{message}</Text>
                <Pressable
                    onPress={() => Linking.openSettings()}
                    style={{ height: 40, width: 80, justifyContent: 'center' }}
                >
                    <Text style={{ fontFamily: 'proxima-nova-bold', fontSize: 15, color: '#1a75ff' }}>SETTINGS</Text>
                </Pressable>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    warningContainer: {
        width: 355,
        height: 130,
        borderRadius: 20,
        backgroundColor: '#333333',
        alignSelf: 'center',
        position: 'absolute',
        bottom: 40,
        flexDirection: 'row',
        paddingHorizontal: 15,
        paddingVertical: 20
    },
    warningText: {
        fontFamily: 'proxima-nova-semi',
        fontSize: 18,
        color: 'white',
        paddingRight: 20
    }
});

export default Warning;