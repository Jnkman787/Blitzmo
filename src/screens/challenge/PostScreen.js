import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, StatusBar, Platform, Pressable, Image, TextInput, Keyboard, ScrollView, Animated, PanResponder } from 'react-native';
import Modal from 'react-native-modal';
import Colors from '../../utils/Colors';
import * as Location from 'expo-location';
import { width } from '../../utils/Scaling';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import axios from 'axios';
//import { PinchGestureHandler, State } from 'react-native-gesture-handler';
//import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

import Warning from '../../components/display/Warning';

import CustomIcon from '../../utils/CustomIcon';
import { AntDesign, Ionicons, Entypo, MaterialIcons } from '@expo/vector-icons';

// ** try fixing the issue on Android where the textInput doesn't get shifted upwards upon opening the
//    keyboard if it was previously closed using the navigation bar

// ** check if the user has any internet connection prior to posting the image or checking for their location

// ** find out how small I can resize the post image before uploading it that it still looks good on the HomeScreen

// ** allow the user to modify the image by zooming in and out, as well as rotating, etc.
//    may need to use PanResponder for this
// *  potential backup option: provide user ability to pick between resizeMode 'cover' or 'contain' with
//    button in bottom left corner of image container (look at Instagram)

const PostScreen = ({ navigation, route }) => {
    const { image } = route.params;
    const scrollViewRef = useRef();
    //const scale = useRef(new Animated.Value(1)).current;  // <-- for zooming
    //const pan = useRef(new Animated.ValueXY()).current;   // <-- for cropping
    //const [lastDragPosition, setLastDragPosition] = useState({x: 0, y: 0});   // <-- for cropping
    
    const [audienceModalVisible, setAudienceModalVisible] = useState(false);
    const [locationModalVisible, setLocationModalVisible] = useState(false);
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    
    //const [postImage, setPostImage] = useState(image);
    const [caption, setCaption] = useState('');
    const [audience, setAudience] = useState('Friends');    // <-- retrieve value saved as default on profile through useEffect
    const [locationEnabled, setLocationEnabled] = useState(false);  // <-- retrieve value saved as default on profile through useEffect
    const [location, setLocation] = useState(null);
    const [showWarning, setShowWarning] = useState(false);

    /*const onPinchEvent = Animated.event(  // <-- for zooming
        [{ nativeEvent: { scale } }],
        { useNativeDriver: true }
    );*/

    /*const panResponder = PanResponder.create({    // <-- for cropping
        onStartShouldSetPanResponder: () => true,
        onPanResponderMove: Animated.event([
            null,
            { dx: pan.x, dy: pan.y }
        ], { useNativeDriver: false }),
        onPanResponderRelease: () => {
            setLastDragPosition({
                x: pan.x._value,
                y: pan.y._value
            });

            // reset pan position for the view
            //pan.setValue({x: 0, y: 0});

            //pan.extractOffset();
        }
    });*/

    useEffect(() => {
        const keyboardShowListener = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
        const keyboardHideListener = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));

        return () => {
            keyboardShowListener.remove();
            keyboardHideListener.remove();
        };
    }, []);

    useEffect(() => {
        if (locationEnabled) {
            (async () => {
                let { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    setLocationEnabled(false);
                    setShowWarning(true);
                    return;
                }

                try {
                    let location = await Location.getCurrentPositionAsync({});
                    getLocation(location.coords.latitude, location.coords.longitude);
                } catch {
                    // android user likely has their device's location turned off
                    setLocationEnabled(false);
                }
            })();
        }
    }, [locationEnabled]);

    /*async function cropImage () {
        const x = lastDragPosition.x;
        const y = lastDragPosition.y;

        // crop the image according to the dragged position
        const croppedImage = await manipulateAsync(
            postImage.uri,
            [{ crop: { originX: x, originY: y, width: postImage.width, height: postImage.height } }],
            { compress: 1, format: SaveFormat.PNG, base64: false }
        );

        //console.log(croppedImage);

        // set the new cropped image
        setPostImage(croppedImage);

        //navigation.navigate('ChallengeStack', { screen: 'Test', params: { image: postImage } });
        navigation.navigate('ChallengeStack', { screen: 'Test', params: { image: croppedImage } });
    };*/

    /*async function zoomImage (event) {    // <-- maybe try removing async?
        if (event.nativeEvent.oldState === State.ACTIVE) {
            const scaleFactor = event.nativeEvent.scale;

            // resize the image using the scale factor
            const resizedImage = await manipulateAsync(
                postImage.uri,
                //[{ resize: { width: image.width * scaleFactor, height: image.height * scaleFactor } }],
                [{ resize: { width: image.width * scaleFactor } }],     // resize width and preserve aspect ratio
                { compress: 1, format: SaveFormat.PNG, base64: false }
            );

            console.log(resizedImage);

            // replace the source image with the resized image
            setPostImage(resizedImage);
        }
    };*/

    async function getLocation (latitude, longitude) {
        try {
            const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);

            let data = response.data;
            if (data) {
                let city = data.address.city || data.address.town || data.address.village;
                let country = data.address.country;
                setLocation(city + ', ' + country);
            }
        } catch {
            console.log('error finding location');  // <-- revisit?
        }
    };

    // maximize the number of lines of text the user can have for the caption to 4 lines
    function onChangeText (newText) {
        const numLines = newText.split('\n').length;

        if (newText.startsWith('\n')) {
            setCaption(newText.slice(1));
        } else if (numLines <= 4) {
            setCaption(newText);
        }
    };

    // remove any empty lines at the end of the caption
    function trimEmptyLines () {
        if (caption.startsWith('\n')) {
            let text = caption;
            setCaption(text.slice(1));
        }
        if (caption.endsWith('\n')) {
            let text = caption;
            setCaption(text.slice(0, -1));
        }
    };

    const CaptionInput = () => {
        return (
            <View style={[styles.inputContainer, { borderColor: keyboardVisible ? 'white' : Colors.darkGrey }]}>
                <TextInput
                    value={caption}
                    onFocus={() => {
                        if (Platform.OS === 'android') {
                            scrollViewRef.current.scrollTo({ y: 220, animated: true });
                        }
                    }}
                    placeholder='Write a caption...'
                    placeholderTextColor={Colors.darkGrey}
                    //onChangeText={setCaption}
                    onChangeText={onChangeText}
                    selectionColor={Colors.theme}
                    maxLength={100}     // <-- revisit
                    multiline
                    autoCorrect={false}
                    spellCheck={true}
                    autoCapitalize='sentences'
                    //onSubmitEditing={null}    // <-- called when the user presses the Enter key
                    style={styles.inputText}
                />
            </View>
        );
    };

    const PostOptions = () => {
        return (
            <View style={{ paddingVertical: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                <Pressable
                    onPress={() => setAudienceModalVisible(true)}
                    style={({pressed}) => [styles.optionButtonContainer, { opacity: pressed ? 0.2 : 1 }]}
                >
                    {audience === 'Friends'
                        ? <Ionicons name='people' size={28} color='white' style={{ transform: [{ scaleX: -1 }] }}/>
                        : <Entypo name='globe' size={28} color='white'/>
                    }
                </Pressable>
                <Pressable
                    onPress={() => {    // <-- if locationEnabled = true, wait for the value to be acquired
                        trimEmptyLines();
                    }}
                    style={({pressed}) => [styles.postButtonContainer, { opacity: pressed ? 0.2 : 1 }]}
                >
                    <CustomIcon name='post' size={35} color='white' style={{ right: 1, top: 2 }}/>
                </Pressable>
                <Pressable
                    onPress={() => setLocationModalVisible(true)}
                    style={({pressed}) => [styles.optionButtonContainer, { opacity: pressed ? 0.2 : 1 }]}
                >
                    {locationEnabled === true
                        ? <MaterialIcons name='location-on' size={34} color='white'/>
                        : <MaterialIcons name='location-off' size={34} color='white'/>
                    }
                </Pressable>
            </View>
        );
    };

    return (
        <View style={{ flex: 1, backgroundColor: 'black',
            paddingTop: Platform.OS === 'ios' ? 44 : 0,
            paddingBottom: Platform.OS === 'ios' ? 34.5 : 0
        }}>
            <StatusBar barStyle={'light-content'} translucent backgroundColor={'transparent'}/>
            {Platform.OS === 'android' && <View style={{ height: StatusBar.currentHeight }}/>}
            <View style={styles.screen}>
                {Platform.OS === 'ios' && <KeyboardAwareScrollView bounces={false}>
                    <View style={{ height: Platform.OS === 'ios' ? 45 : 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                        <Pressable
                            onPress={() => navigation.goBack()}
                            style={({pressed}) => [styles.closeButtonContainer, { opacity: pressed ? 0.2 : 1 }]}
                        >
                            <AntDesign name='close' size={24} color='white'/>
                        </Pressable>
                        <Text style={{ fontSize: 35, fontFamily: 'proxima-nova-semi', color: 'white', top: 2 }}>02:37:06</Text>
                    </View>

                    {/*<View style={styles.imageContainer}>     // <-- for zooming
                        {/*<PinchGestureHandler
                            onGestureEvent={onPinchEvent}
                            onHandlerStateChange={zoomImage}
                        >
                            <Animated.Image
                                source={{ uri: postImage.uri }}
                                style={{ flex: 1, height: undefined, width: undefined, transform: [{ scale }] }}
                                //resizeMode='contain'
                            />
                        </PinchGestureHandler>/}

                        <Image
                            source={{ uri: postImage.uri }}
                            style={{ flex: 1, height: undefined, width: undefined }}
                            //resizeMode='contain'
                        />
                    </View>*/}

                    {/*<View     // <-- for cropping
                        //{...panResponder.panHandlers}
                        //style={[styles.imageContainer, { transform: [{ translateX: pan.x }, { translateY: pan.y }] }]}
                        style={styles.imageContainer}
                    >
                        <Animated.Image
                            {...panResponder.panHandlers}
                            source={{ uri: postImage.uri }}
                            style={{ flex: 1, transform: pan.getTranslateTransform() }}
                        />
                    </View>*/}

                    <View style={styles.imageContainer}>
                        <Image
                            source={{ uri: image.uri }}
                            style={{ flex: 1, height: undefined, width: undefined }}
                        />
                    </View>

                    {CaptionInput()}
                    {PostOptions()}
                </KeyboardAwareScrollView>}

                {Platform.OS === 'android' && <ScrollView ref={scrollViewRef}>
                    <View style={{ height: Platform.OS === 'ios' ? 45 : 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                        <Pressable
                            onPress={() => navigation.goBack()}
                            style={({pressed}) => [styles.closeButtonContainer, { opacity: pressed ? 0.2 : 1 }]}
                        >
                            <AntDesign name='close' size={24} color='white'/>
                        </Pressable>
                        <Text style={{ fontSize: 35, fontFamily: 'proxima-nova-semi', color: 'white', top: 2 }}>02:37:06</Text>
                    </View>

                    <View style={styles.imageContainer}>
                        <Image
                            source={{ uri: image.uri }}
                            style={{ flex: 1, height: undefined, width: undefined }}
                        />
                    </View>

                    {CaptionInput()}
                    {PostOptions()}
                </ScrollView>}

                {showWarning && <Warning message='Location services are disabled on your device. Please enable them to share your location.' visible={showWarning} setVisible={setShowWarning}/>}

                <Modal
                    isVisible={audienceModalVisible}
                    onBackButtonPress={() => setAudienceModalVisible(false)}
                    onBackdropPress={() => setAudienceModalVisible(false)}
                    onSwipeComplete={() => setAudienceModalVisible(false)}
                    swipeDirection='down'
                    animationInTiming={200}
                    animationOutTiming={500}
                    backdropOpacity={0.45}
                    style={{ justifyContent: 'flex-end', margin: 0 }}
                    useNativeDriverForBackdrop={true}
                >
                    <View style={styles.modalContainer}>
                        <View style={{ height: 5, width: 45, backgroundColor: Colors.mediumGrey, marginTop: 15, marginBottom: 5, borderRadius: 20, alignSelf: 'center' }}/>
                        <Text style={{ fontFamily: 'proxima-nova-bold', fontSize: 18, textAlign: 'center', marginTop: 15 }}>Audience</Text>
                        <Pressable
                            onPress={() => {
                                setAudienceModalVisible(false);
                                setAudience('Friends');
                            }}
                            style={({pressed}) => [{ flexDirection: 'row', height: 57, marginTop: 10, alignItems: 'center', backgroundColor: pressed ? '#e6e6e6' : 'white' }]}
                        >
                            <Ionicons name='people' size={24} color='black' style={{ marginHorizontal: 25, transform: [{ scaleX: -1 }] }}/>
                            <Text style={{ fontFamily: 'proxima-nova-semi', fontSize: 16, flex: 1 }}>Friends only</Text>
                            <View style={styles.circle}>
                                {audience === 'Friends' && <View style={styles.dot}/>}
                            </View>
                        </Pressable>
                        <View style={{ height: 0.5, marginHorizontal: 25, backgroundColor: Colors.border }}/>
                        <Pressable
                            onPress={() => {
                                setAudienceModalVisible(false);
                                setAudience('Everyone');
                            }}
                            style={({pressed}) => [{ flexDirection: 'row', height: 57, alignItems: 'center', backgroundColor: pressed ? '#e6e6e6' : 'white' }]}
                        >
                            <Entypo name='globe' size={24} color='black' style={{ marginHorizontal: 25 }}/>
                            <Text style={{ fontFamily: 'proxima-nova-semi', fontSize: 16, flex: 1 }}>Everyone</Text>
                            <View style={styles.circle}>
                                {audience === 'Everyone' && <View style={styles.dot}/>}
                            </View>
                        </Pressable>
                    </View>
                </Modal>

                <Modal
                    isVisible={locationModalVisible}
                    onBackButtonPress={() => setLocationModalVisible(false)}
                    onBackdropPress={() => setLocationModalVisible(false)}
                    onSwipeComplete={() => setLocationModalVisible(false)}
                    swipeDirection='down'
                    animationInTiming={200}
                    animationOutTiming={500}
                    backdropOpacity={0.45}
                    style={{ justifyContent: 'flex-end', margin: 0 }}
                    useNativeDriverForBackdrop={true}
                >
                    <View style={styles.modalContainer}>
                        <View style={{ height: 5, width: 45, backgroundColor: Colors.mediumGrey, marginTop: 15, marginBottom: 5, borderRadius: 20, alignSelf: 'center' }}/>
                        <Text style={{ fontFamily: 'proxima-nova-bold', fontSize: 18, textAlign: 'center', marginTop: 15 }}>Location</Text>
                        <Pressable
                            onPress={() => {
                                setLocationModalVisible(false);
                                setLocationEnabled(false);
                            }}
                            style={({pressed}) => [{ flexDirection: 'row', height: 57, marginTop: 10, alignItems: 'center', backgroundColor: pressed ? '#e6e6e6' : 'white' }]}
                        >
                            <MaterialIcons name='location-off' size={30} color='black' style={{ marginHorizontal: 25 }}/>
                            <Text style={{ fontFamily: 'proxima-nova-semi', fontSize: 16, flex: 1 }}>Location off</Text>
                            <View style={styles.circle}>
                                {locationEnabled === false && <View style={styles.dot}/>}
                            </View>
                        </Pressable>
                        <View style={{ height: 0.5, marginHorizontal: 25, backgroundColor: Colors.border }}/>
                        <Pressable
                            onPress={() => {
                                setLocationModalVisible(false);
                                setLocationEnabled(true);
                            }}
                            style={({pressed}) => [{ flexDirection: 'row', height: 57, alignItems: 'center', backgroundColor: pressed ? '#e6e6e6' : 'white' }]}
                        >
                            <MaterialIcons name='location-on' size={30} color='black' style={{ marginHorizontal: 25 }}/>
                            <Text style={{ fontFamily: 'proxima-nova-semi', fontSize: 16, flex: 1 }}>Location on</Text>
                            <View style={styles.circle}>
                                {locationEnabled === true && <View style={styles.dot}/>}
                            </View>
                        </Pressable>
                    </View>
                </Modal>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: 'black'
    },
    closeButtonContainer: {
        borderWidth: 1,
        borderColor: 'white',
        height: 40,
        width: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        left: 15
    },
    imageContainer: {
        marginTop: 10,
        width: width > 550 ? (width * 0.8) : width,
        aspectRatio: 3 / 4,
        alignSelf: 'center',
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: Colors.darkGrey
    },
    inputContainer: {
        borderWidth: 1,
        //marginHorizontal: 10,
        paddingHorizontal: 15,
        paddingVertical: 5,
        marginTop: 10,
        borderRadius: 15,
        height: 75,
        width: width > 550 ? (width * 0.8) : (width - 20),
        alignSelf: 'center'
    },
    inputText: {
        flex: 1,
        fontFamily: 'proxima-nova-reg',
        fontSize: 16,
        color: 'white'
    },
    optionButtonContainer: {
        height: 50,
        width: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#262626'
    },
    postButtonContainer: {
        height: 75,
        width: 75,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 35,
        backgroundColor: Colors.theme
    },
    modalContainer: {
        backgroundColor: 'white',
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        paddingBottom: Platform.OS === 'ios' ? 30 : 10
    },
    circle: {
        height: 30,
        width: 30,
        borderRadius: 15,
        borderColor: '#a6a6a6',
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 20
    },
    dot: {
        height: 16,
        width: 16,
        backgroundColor: Colors.theme,
        borderRadius: 8,
        zIndex: 1
    }
});

export default PostScreen;