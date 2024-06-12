import React from 'react';
import { View, StyleSheet, Pressable, Platform } from 'react-native';
import Colors from '../../utils/Colors';

import CustomIcon from '../../utils/CustomIcon';

const ChallengeButton = ({ navigation }) => {
    return (
        <Pressable
            onPress={() => navigation.navigate('ChallengeStack', { screen: 'Challenge' })}
            style={styles.buttonContainer}
        >
            <View style={styles.circleContainer}>
                <CustomIcon name='challenge' size={26} color='white' style={{ left: Platform.OS === 'ios' ? 0.1 : 0 }}/>
            </View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    buttonContainer: {
        flex: 1,
        height: 56,
        alignItems: 'center',
        justifyContent: 'center',
        bottom: 2
    },
    circleContainer: {
        height: 42,
        width: 42,
        backgroundColor: Colors.theme,
        borderRadius: 21,
        alignItems: 'center',
        justifyContent: 'center'
    }
});

export default ChallengeButton;