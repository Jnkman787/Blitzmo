import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, Platform, Pressable, Animated, Linking, FlatList, Image, ActivityIndicator } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import Colors from '../../utils/Colors';
import { width } from '../../utils/Scaling';
import { Camera, CameraType } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import { PinchGestureHandler } from 'react-native-gesture-handler';
import { manipulateAsync, FlipType } from 'expo-image-manipulator';

import CustomIcon from '../../utils/CustomIcon';
import { Octicons, Ionicons } from '@expo/vector-icons';

// utility function to clamp the value between a range
function clamp(value, min, max) {
    return Math.min(Math.max(min, value), max);
};

const CameraScreen = ({ navigation }) => {
    const isFocused = useIsFocused();

    const slideX = useRef(new Animated.Value(1)).current;
    const scaleValue = useRef(new Animated.Value(1)).current;
    const spinValue = useRef(new Animated.Value(0)).current;
    const rotationMultiplier = useRef(1);

    const [captureOption, setCaptureOption] = useState('Camera');       // camera or upload image
    const [cameraPermission, requestPermission] = Camera.useCameraPermissions();
    const [cameraType, setCameraType] = useState(CameraType.back);      // front or back camera
    const [flashMode, setFlashMode] = useState(Camera.Constants.FlashMode.off);
    const [zoom, setZoom] = useState(0);
    const [processing, setProcessing] = useState(false);    // is camera processing
    const cameraRef = useRef(null);

    const [images, setImages] = useState([]);
    const [after, setAfter] = useState(null);
    const [hasNextPage, setHasNextPage] = useState(true);
    const [libraryPermission, setLibraryPermission] = useState(null);

    const spin = spinValue.interpolate({
        inputRange: [0, 360],
        outputRange: ['0deg', '360deg']
    });

    useFocusEffect(
        React.useCallback(() => {
            setTimeout(() => {
                if (Platform.OS === 'android') {
                    NavigationBar.setBackgroundColorAsync('black');
                    NavigationBar.setButtonStyleAsync('light');
                }
            }, 100);
        }, [])
    );

    useEffect(() => {
        if (captureOption === 'Upload') {
            (async () => {
                const { status } = await MediaLibrary.requestPermissionsAsync();
                setLibraryPermission(status);
                if (status === 'granted') {
                    loadImages();
                }
            })();
        }
    }, [captureOption]);

    async function loadImages () {
        if (!hasNextPage) return;

        const media = await MediaLibrary.getAssetsAsync({
            after,
            mediaType: 'photo',
            sortBy: MediaLibrary.SortBy.creationTime
        });

        setImages(images => [...images, ...media.assets]);
        setAfter(media.endCursor);
        setHasNextPage(media.hasNextPage);
    };

    async function takePicture () {
        if (cameraRef.current) {
            const options = { quality: 1, base64: true, skipProcessing: true };
            const data = await cameraRef.current.takePictureAsync(options);

            // flip the image horizontally if it was taken with the front facing camera
            if (data) {
                if (cameraType === CameraType.front) {
                    setProcessing(true);
                    const flippedImage = await manipulateAsync(
                        data.uri,
                        [{ flip: FlipType.Horizontal }]
                    );
                    data.uri = flippedImage.uri;
                }
            }

            setProcessing(false);
            navigation.navigate('ChallengeStack', { screen: 'Post', params: { image: data }});
        }
    };

    function changeZoom (event) {
        const { scale } = event.nativeEvent;
        let newZoom;
        if (scale >= 1) {
            newZoom = (scale - 1) * 0.005 + zoom;
        } else if (scale < 1) {
            newZoom = (scale - 1) * 0.01 + zoom;
        }
        newZoom = clamp(newZoom, 0, 1);
        setZoom(newZoom);
    };

    function toggleFlash () {
        if (flashMode === Camera.Constants.FlashMode.off) {
            setFlashMode(Camera.Constants.FlashMode.on);
        } else if (flashMode === Camera.Constants.FlashMode.on) {
            setFlashMode(Camera.Constants.FlashMode.off);
        }
    };

    function toggleCameraType () {
        setZoom(0);
        setCameraType(current => (current === CameraType.back ? CameraType.front : CameraType.back));

        Animated.timing(spinValue, {
            toValue: 180 * rotationMultiplier.current,
            duration: 500,
            useNativeDriver: true
        }).start();
        rotationMultiplier.current++;
    };

    function onShutterPressIn () {
        Animated.timing(scaleValue, {
            toValue: 0.85,
            duration: 150,
            useNativeDriver: true
        }).start();
    };

    function onShutterPressOut () {
        Animated.timing(scaleValue, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true
        }).start();
    };

    const CameraDisplay = () => {
        if (!cameraPermission) {
            // Camera permissions are still loading
            return <View/>;
        }
        
        if (!cameraPermission.granted) {
            // Camera permissions are not granted yet
            return (
                <View style={[styles.cameraContainer, { alignItems: 'center', justifyContent: 'center' }]}>
                    <Text style={{ fontFamily: 'proxima-nova-bold', fontSize: 23, color: 'white' }}>Allow access to camera</Text>
                    <Text style={{ fontFamily: 'proxima-nova-reg', fontSize: 18, color: 'white', marginTop: 30, textAlign: 'center', paddingHorizontal: 20 }}>
                        To utilize the camera, please grant the necessary permission. You have the flexibility to modify
                        your preferences in your device settings at any time.
                    </Text>
                    <Pressable
                        onPress={() => {
                            if (Platform.OS === 'android') {
                                requestPermission();
                            } else {
                                //Linking.openSettings();
                                requestPermission();
                            }
                        }}
                        style={{ width: 275, height: 80, borderRadius: 15, backgroundColor: 'white', marginTop: 50, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }}
                    >
                        <CustomIcon name='camera' size={19} color='black' style={{ marginRight: 10 }}/>
                        <Text style={{ fontFamily: 'proxima-nova-semi', fontSize: 18 }}>Access camera</Text>
                    </Pressable>
                </View>
            );
        }

        if (cameraPermission) {
            return (
                <View style={styles.cameraContainer}>
                    <PinchGestureHandler
                        onGestureEvent={(event) => changeZoom(event)}
                    >
                        <Camera
                            style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end' }}
                            ref={cameraRef}
                            type={cameraType}
                            flashMode={flashMode}
                            zoom={zoom}
                            autoFocus={Camera.Constants.AutoFocus.on}
                        />
                    </PinchGestureHandler>
                </View>
            );
        }
    };

    const LibraryDisplay = () => {
        if (libraryPermission === null) {
            // library/images permissions are still loading
            return <View/>;
        }

        if (libraryPermission === 'granted') {
            return (
                <View style={{ flex: 1, paddingBottom: 57 }}>
                    <FlatList
                        data={images}
                        numColumns={3}
                        keyExtractor={(item => item.id)}    // <-- revisit later
                        showsVerticalScrollIndicator={false}
                        onEndReached={loadImages}
                        onEndReachedThreshold={0.5}
                        //initialNumToRender={}     // <-- add later?
                        //maxToRenderPerBatch={}    // <-- add later?
                        renderItem={({ item, index }) => (
                            <Pressable
                                onPress={() => navigation.navigate('ChallengeStack', { screen: 'Post', params: { image: item }})}
                                style={[styles.imageContainer, {
                                    marginLeft: index % 3 === 0 ? 0 : 2,
                                    marginTop: index < 3 ? 0 : 2
                                }]}
                            >
                                <Image
                                    source={{ uri: item.uri }}
                                    style={{ flex: 1, height: undefined, width: undefined }}
                                />
                            </Pressable>
                        )}
                    />
                </View>
            );
        } else {
            return (
                <View style={{ flex: 1, paddingBottom: 57, alignItems: 'center', justifyContent: 'center' }}>
                    <View style={{ width: 125, height: 116 }}>
                        <Image
                            source={require('../../assets/images/images.png')}
                            style={{ flex: 1, height: undefined, width: undefined }}
                        />
                    </View>
                    <Text style={{ fontFamily: 'proxima-nova-bold', fontSize: 23, color: 'white', marginTop: 80 }}>Allow access to photos</Text>
                    <Text style={{ fontFamily: 'proxima-nova-reg', fontSize: 18, color: 'white', marginTop: 30, textAlign: 'center', paddingHorizontal: 20 }}>
                        To access photos, go to settings to changes your preferences at any time.
                    </Text>
                    <Pressable
                        onPress={() => Linking.openSettings()}
                        style={{ width: 250, height: 60, borderRadius: 10, backgroundColor: Colors.theme, alignItems: 'center', justifyContent: 'center', marginTop: 80 }}
                    >
                        <Text style={{ fontFamily: 'proxima-nova-semi', fontSize: 18, color: 'white' }}>Change settings</Text>
                    </Pressable>
                </View>
            );
        }
    };

    const CaptureOptions = () => {
        return (
            <View style={{ marginVertical: 10 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                    <Pressable
                        onPress={() => {
                            Animated.timing(slideX, {
                                toValue: 0,
                                duration: 150,
                                useNativeDriver: true
                            }).start();
                            setTimeout(() => {
                                setCaptureOption('Upload');
                            }, 150);
                        }}
                        style={{ paddingHorizontal: 15 }}
                    >
                        <Text style={[styles.captureText, { color: captureOption === 'Upload' ? 'white' : Colors.mediumGrey }]}>Upload</Text>
                    </Pressable>
                    <Pressable
                        onPress={() => {
                            Animated.timing(slideX, {
                                toValue: 1,
                                duration: 150,
                                useNativeDriver: true
                            }).start();
                            setTimeout(() => {
                                setCaptureOption('Camera');
                            }, 150);
                        }}
                        style={{ paddingHorizontal: 15 }}
                    >
                        <Text style={[styles.captureText, { color: captureOption === 'Camera' ? 'white' : Colors.mediumGrey }]}>Camera</Text>
                    </Pressable>
                </View>
                <View style={{ width: 140, alignSelf: 'center', marginTop: 10 }}>
                    <Animated.View
                        style={{ width: 45, height: 4, backgroundColor: 'white', borderRadius: 20,
                            transform: [{
                                translateX: slideX.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0, 95]
                                })
                            }]
                        }}
                    />
                </View>
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
                            color='white'
                        />
                    </Pressable>
                    <Text style={{ fontSize: 35, fontFamily: 'proxima-nova-semi', color: 'white', top: 2 }}>02:37:06</Text>
                </View>

                {isFocused
                    ? captureOption === 'Camera' ? CameraDisplay() : LibraryDisplay()
                    : null
                }

                <View style={{ position: 'absolute', bottom: 0, width: '100%', zIndex: 1 }}>
                    {captureOption === 'Camera' && <View style={styles.cameraOptions}>
                        <Pressable
                            onPress={() => toggleFlash()}
                        >
                            {flashMode === Camera.Constants.FlashMode.off
                                ? <Ionicons name='flash-off' size={35} color='white'/>
                                : <Ionicons name='flash' size={35} color='white'/>
                            }
                        </Pressable>
                        <Pressable
                            onPress={() => takePicture()}
                            onPressIn={onShutterPressIn}
                            onPressOut={onShutterPressOut}
                        >
                            <Animated.View
                                style={[styles.shutterButton, { transform: [{ scale: scaleValue }] }]}
                            />
                        </Pressable>
                        <Pressable
                            onPress={() => toggleCameraType()}
                        >
                            <Animated.View style={{ transform: [{ rotate: spin }] }}>
                                <CustomIcon name='flip' size={35} color='white'/>
                            </Animated.View>
                        </Pressable>
                    </View>}

                    <View style={{ backgroundColor: captureOption === 'Upload' ? 'black' : 'transparent' }}>
                        {CaptureOptions()}
                    </View>
                </View>

                {processing && <View style={styles.loadingContainer}>
                    <ActivityIndicator
                        size={Platform.OS === 'android' ? 60 : 'large'}
                        color={Colors.theme}
                    />
                </View>}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: 'black'
    },
    captureText: {
        fontFamily: 'proxima-nova-semi',
        fontSize: 20
    },
    cameraContainer: {
        marginTop: 10,
        width: width > 550 ? (width * 0.8) : width,
        aspectRatio: 3 / 4,
        alignSelf: 'center',
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: Colors.darkGrey
    },
    cameraOptions: {
        marginBottom: 20,
        paddingHorizontal: 50,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    shutterButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 6,
        borderColor: 'white'
    },
    imageContainer: {
        width: (width - 4) / 3,
        aspectRatio: 3 / 4
    },
    loadingContainer: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        marginTop: Platform.OS === 'ios' ? 45 : 56,
        paddingBottom: 60,
        zIndex: 2,
        backgroundColor: 'black',
        alignItems: 'center',
        justifyContent: 'center'
    }
});

export default CameraScreen;