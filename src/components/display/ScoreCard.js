import React from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import Colors from '../../utils/Colors';

// ** only apply these (except for rank #) if the screen width is < 550
// *  make sure the max name & username length fit
//    perhaps give it a pre-defined width container and modify fontSize if the length is too high
// *  likely will need to apply the same strategy to rank # and score
// *  score can implement K (thousand) and M (million) strategy for minimizing the width of the text
// *  start using K when reaching 10,000 instead of 1,000

// ** need a front bar at the bottom of the screen for displaying the user's rank
//    if they are not in the top 5 (or simply if they're ranked lower than where the user is looking at in the list)

const ScoreCard = ({ navigation, card }) => {
    let firstItem = false;
    if (card.item.rank === 1) { firstItem = true }      // <-- check later if 1 needs to be a string or an int

    return (
        <View style={[styles.cardContainer, { marginTop: firstItem ? 0 : 7.5 }]}>
            <Text style={styles.rankText}>{card.item.rank}</Text>
            <Pressable
                // ** need to include the remaining parameters for navigating to/displaying the user's profile
                //onPress={() => navigation.navigate('ProfileStack', { screen: 'Profile' })}
                style={styles.imageContainer}
            >
                <Image
                    source={require('../../assets/images/profile.png')}
                    style={{ flex: 1, height: undefined, width: undefined }}
                />
            </Pressable>
            <View style={{ marginLeft: 15, paddingVertical: 15, height: '100%', justifyContent: 'space-evenly' }}>
                <Text style={{ fontFamily: 'proxima-nova-semi', fontSize: 18 }}>Name</Text>
                <Text style={{ fontFamily: 'proxima-nova-reg', fontSize: 15, color: Colors.mediumGrey }}>Username</Text>
            </View>
            <View style={{ flex: 1, alignItems: 'flex-end', marginRight: 20 }}>
                <Text style={{ fontFamily: 'proxima-nova-semi', fontSize: 18 }}>{card.item.score}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        height: 75,
        borderRadius: 20,
        marginBottom: 7.5,
        marginHorizontal: 20,
        backgroundColor: 'white',
        flexDirection: 'row',
        alignItems: 'center'
    },
    rankText: {
        fontFamily: 'proxima-nova-semi',
        fontSize: 20,
        width: 50,  // <-- adjust width or fontSize if the rank # is > 999
        textAlign: 'center'
    },
    imageContainer: {
        height: 55,
        width: 55,
        borderRadius: 30,
        overflow: 'hidden'
    }
});

export default ScoreCard;