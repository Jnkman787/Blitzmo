import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Image, Animated, TouchableOpacity, TouchableHighlight } from 'react-native';
import { width } from '../../utils/Scaling';
import Colors from '../../utils/Colors';
import { Menu, MenuTrigger, MenuOptions, MenuOption } from 'react-native-popup-menu';

import CommentBox from '../../components/display/CommentBox';

import CustomIcon from '../../utils/CustomIcon';
import { Feather, AntDesign, Ionicons, SimpleLineIcons } from '@expo/vector-icons';

// ** check if the user provided a location with their post by turning on their location when posting the image
//    if not, don't include it with the header details

// ** provide users with the ability to zoom in on a picture with pinching gestures on the image
//    but automatically set the image back to its original size when they let go of the image

// ** modify the menu options provided based on which screen this is being displayed on

// ** maybe find a way to turn off the ScrollView / replace it with a View if the user's post has no caption

// ** will need to implement the use of K (thousand) and M (million) in the value of numlikes and numComments,
//    ensuring the text value can always fit in the pressable container
// *  start using K when reaching 10,000 instead of 1,000
// *  to implement K and M, check and modify the values directly before assigning them to numLikes or numComments

// ** if caption doesn't fit, show a "more..." option at the end of it (look at Instagram)

// ** (optional) if post images don't pre-load as anticipated while scrolling; since these images will be larger,
//    perhaps try using something like react-native-fast-image to help load them faster
// *  other options include: using tools that can compress the images even smaller without noticeable quality loss,
//    or using progressive JPEGs to make the images appear to load faster (this option doesn't work with the built-in Image component)

const PostCard = ({ navigation, index, scrollX, screen }) => {
    const colorAnimation = useRef(new Animated.Value(0)).current;
    const scaleValue = useRef(new Animated.Value(1)).current;
    const [animationComplete, setAnimationComplete] = useState(false);
    const [isPressed, setIsPressed] = useState(false);

    const [commentsVisible, setCommentsVisible] = useState(false);
    const [like, setLike] = useState(false);    // <-- temp until I setup database

    const backgroundColorChange = colorAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: ['black', '#ec0040']
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

    const HeaderDetails = () => {
        return (
            <View style={{ marginTop: 10, marginHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between' }}>
                <Pressable
                    onPress={() => {
                        if (screen === 'Home') {
                            // ** need to provide additional parameters
                            //navigation.navigate('ProfileStack', { screen: 'Profile' })
                        }
                    }}
                    style={{ flexDirection: 'row' }}
                >
                    <View style={styles.profileIcon}>
                        <Image
                            source={require('../../assets/images/profile.png')}
                            style={{ flex: 1, height: undefined, width: undefined }}
                        />
                    </View>
                    <View style={{ marginLeft: 10 }}>
                        <Text style={styles.usernameText}>username</Text>
                        <View style={{ flex: 1, alignItems: 'center', flexDirection: 'row', alignItems: 'flex-end' }}>
                            <CustomIcon name='location' size={18} color='white'/>
                            <Text style={styles.locationText}>City, Country</Text>
                        </View>
                    </View>
                </Pressable>

                <Menu style={{ alignSelf: 'center' }}>
                    <MenuTrigger
                        customStyles={{
                            TriggerTouchableComponent: TouchableOpacity
                        }}
                        style={{ alignItems: 'center' }}
                    >
                        <Feather name='more-vertical' size={25} color='white'/>
                    </MenuTrigger>
                    <MenuOptions
                        customStyles={{
                            optionsContainer: {
                                borderRadius: 10,
                                width: 150,
                                marginTop: 35,
                                marginLeft: 5,
                                shadowOpacity: 0.2
                            }
                        }}
                    >
                        <MenuOption
                            //onSelect={() => }
                            customStyles={{
                                OptionTouchableComponent: TouchableHighlight,
                                optionWrapper: {
                                    flexDirection: 'row',
                                    alignItems: 'center'
                                }
                            }}
                            style={{ height: 50, paddingLeft: 5 }}
                        >
                            <SimpleLineIcons name='cloud-download' size={26} color='black' style={{ marginHorizontal: 7 }}/>
                            <Text style={{ fontFamily: 'proxima-nova-semi', fontSize: 17 }}>Download</Text>
                        </MenuOption>
                        <View style={{ height: 1, backgroundColor: Colors.border }}/>
                        <MenuOption
                            //onSelect={() => }
                            customStyles={{
                                OptionTouchableComponent: TouchableHighlight,
                                optionWrapper: {
                                    flexDirection: 'row',
                                    alignItems: 'center'
                                }
                            }}
                            style={{ height: 50, paddingLeft: 5 }}
                        >
                            <Ionicons name='trash-outline' size={25} color='#dd2334' style={{ marginLeft: 7, marginRight: 8 }}/>
                            <Text style={{ fontFamily: 'proxima-nova-semi', fontSize: 17, color: '#dd2334' }}>Delete</Text>
                        </MenuOption>
                    </MenuOptions>
                </Menu>
            </View>
        );
    };

    const ButtonOptions = () => {
        return (
            <View style={{ marginHorizontal: 20, marginTop: 10, marginBottom: 5, flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row' }}>
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
                    >
                        <Animated.View style={[styles.buttonContainer, { backgroundColor: backgroundColorChange }]}>
                            <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
                                <AntDesign name='heart' size={25} color='white'/>
                            </Animated.View>
                            <Text style={styles.buttonText}>1.1M</Text>
                        </Animated.View>
                    </Pressable>

                    <Pressable
                        onPress={() => setCommentsVisible(true)}
                        style={({pressed}) => [styles.buttonContainer, { backgroundColor: 'black', marginLeft: 5, opacity: pressed ? 0.2 : 1 }]}
                    >
                        <Ionicons name='chatbubble-ellipses' size={28} color='white' style={{ marginTop: -3, marginBottom: -1 }}/>
                        <Text style={styles.buttonText}>33.2K</Text>
                    </Pressable>
                </View>
                <Pressable
                    //onPress={() =>}
                    style={({pressed}) => [{ justifyContent: 'center', alignItems: 'center', paddingHorizontal: 7, opacity: pressed ? 0.2 : 1 }]}
                >
                    <CustomIcon name='share' size={24} color='white'/>
                </Pressable>
            </View>
        );
    };

    // calculates position relative to current scroll position
    // -1 <-- 0 --> 1
    const position = Animated.subtract(index * width, scrollX);
    const opacity = position.interpolate({
        inputRange: [-width, 0, width],
        outputRange: [0.2, 1, 0.2],
        extrapolate: 'clamp'
    });

    // ** maybe just alter the opacity of the items above and below the image container
    return (
        <Animated.ScrollView style={[styles.swipeArea, { opacity }]} bounces={false}>
            {/* alter width area for tablet screen size if I can find a better layout */}
            <View style={{ width: width > 550 ? (width * 0.95) : width, alignSelf: 'center' }}>
                {HeaderDetails()}
                <View style={styles.imageContainer}></View>
                
                {ButtonOptions()}
                <Text style={styles.captionText}>Insert caption here ...</Text>
            </View>
            <View style={{ height: 10 }}/>
            
            <CommentBox visible={commentsVisible} setVisible={setCommentsVisible}/>
        </Animated.ScrollView>
    );
};

const styles = StyleSheet.create({
    swipeArea: {
        flex: 1,
        width: width
    },
    profileIcon: {
        height: 40,
        width: 40,
        borderRadius: 20,
        overflow: 'hidden'
    },
    usernameText: {
        color: 'white',
        fontFamily: 'proxima-nova-semi',
        fontSize: 18
    },
    locationText: {
        color: Colors.mediumGrey,
        fontFamily: 'proxima-nova-reg',
        fontSize: 15,
        marginLeft: 5
    },
    imageContainer: {
        width: width > 550 ? (width * 0.8) : (width * 0.95),
        //width: width > 550 ? (width * 0.87) : width,  // <-- use different dimensions for showcase screen
        aspectRatio: 3 / 4,
        marginTop: 10,
        borderRadius: 20,
        alignSelf: 'center',
        //overflow: 'hidden',   // <-- include once I put inside an image component
        borderColor: 'white',   // <-- temp
        borderWidth: 1.5   // <-- temp
    },
    captionText: {
        color: 'white',
        fontFamily: 'proxima-nova-reg',
        fontSize: 15,
        marginHorizontal: 20
    },
    buttonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 7,
        borderRadius: 20
    },
    buttonText: {
        color: 'white',
        fontFamily: 'proxima-nova-reg',
        fontSize: 14,
        marginLeft: 8
    }
});

export default PostCard;