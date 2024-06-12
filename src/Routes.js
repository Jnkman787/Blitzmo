import React, { useContext } from 'react';
import { View, Platform, StatusBar } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';
import Colors from './utils/Colors';
import { width } from './utils/Scaling';
import { ActiveTabContext } from './utils/ContextVariables';

// navigation
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { CardStyleInterpolators, createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Setup
import OpeningScreen from './screens/setup/OpeningScreen';
import LoginScreen from './screens/setup/LoginScreen';
import NameScreen from './screens/setup/signup/NameScreen';
import EmailScreen from './screens/setup/signup/EmailScreen';
import VerificationScreen from './screens/setup/signup/VerificationScreen';
import PasswordScreen from './screens/setup/signup/PasswordScreen';
import UsernameScreen from './screens/setup/signup/UsernameScreen';
import NotificationsScreen from './screens/setup/signup/NotificationsScreen';
import ReferralScreen from './screens/setup/signup/ReferralScreen';

// Home
import HomeScreen from './screens/home/HomeScreen';

// Search
import SearchScreen from './screens/search/SearchScreen';

// Challenge
import ChallengeButton from './components/navigation/ChallengeButton';
import ChallengeScreen from './screens/challenge/ChallengeScreen';
import LeaderboardScreen from './screens/challenge/LeaderboardScreen';
import CameraScreen from './screens/challenge/CameraScreen';
import PostScreen from './screens/challenge/PostScreen';

// Inbox
import InboxScreen from './screens/inbox/InboxScreen';
import NewChatScreen from './screens/inbox/NewChatScreen';
import ChatScreen from './screens/inbox/ChatScreen';

// User
import UserProfileScreen from './screens/user/UserProfileScreen';
import ProfileScreen from './screens/user/ProfileScreen';
import CalendarScreen from './screens/user/CalendarScreen';
import EditProfileScreen from './screens/user/EditProfileScreen';
import ShowcaseScreen from './screens/user/ShowcaseScreen';

// Settings
import SettingsScreen from './screens/settings/SettingsScreen';
import AccountOptionsScreen from './screens/settings/account/AccountOptionsScreen';
import AccountUpdateScreen from './screens/settings/account/AccountUpdateScreen';
import AboutScreen from './screens/settings/about/AboutScreen';

// navigators
const SetupStackScreens = () => {
    // ** navigate to the tutorial screen after the user finishes signing up
    //    (or just display instructions on HomeScreen)

    const SetupStack = createStackNavigator();

    return (
        <SetupStack.Navigator
            initialRouteName='Opening'
            screenOptions={{
                cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
                headerShown: false,
                gestureEnabled: true
            }}
        >
            <SetupStack.Screen
                name='Opening'
                component={OpeningScreen}
                initialParams={{ signedOut: false }}
            />
            <SetupStack.Screen
                name='Login'
                component={LoginScreen}
                options={{
                    cardStyleInterpolator: CardStyleInterpolators.forNoAnimation,
                    gestureEnabled: false
                }}
            />
            <SetupStack.Screen
                name='Name'
                component={NameScreen}
            />
            <SetupStack.Screen
                name='Email'
                component={EmailScreen}
            />
            <SetupStack.Screen
                name='Verification'
                component={VerificationScreen}
            />
            <SetupStack.Screen
                name='Password'
                component={PasswordScreen}
            />
            <SetupStack.Screen
                name='Username'
                component={UsernameScreen}
            />
            <SetupStack.Screen
                name='Notifications'
                component={NotificationsScreen}
            />
            <SetupStack.Screen
                name='Referral'
                component={ReferralScreen}
            />
        </SetupStack.Navigator>
    );
};

const ChallengeStackScreens = () => {
    const ChallengeStack = createStackNavigator();

    return (
        <ChallengeStack.Navigator
            initialRouteName='Challenge'
            screenOptions={{
                cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
                headerShown: false,
                gestureEnabled: true
            }}
        >
            <ChallengeStack.Screen
                name='Challenge'
                component={ChallengeScreen}
            />
            <ChallengeStack.Screen
                name='Leaderboard'
                component={LeaderboardScreen}
            />
            <ChallengeStack.Screen
                name='Camera'
                component={CameraScreen}
                options={{
                    gestureEnabled: false
                }}
            />
            <ChallengeStack.Screen
                name='Post'
                component={PostScreen}
                options={{
                    cardStyleInterpolator: CardStyleInterpolators.forNoAnimation,
                    gestureEnabled: false
                }}
            />
        </ChallengeStack.Navigator>
    );
};

const InboxStackScreens = () => {
    const InboxStack = createStackNavigator();

    return (
        <InboxStack.Navigator
            initialRouteName='NewChat'
            screenOptions={{
                cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
                headerShown: false,
                gestureEnabled: true
            }}
        >
            <InboxStack.Screen
                name='NewChat'
                component={NewChatScreen}
            />
            <InboxStack.Screen
                name='Chat'
                component={ChatScreen}
            />
        </InboxStack.Navigator>
    );
};

const ProfileStackScreens = () => {
    const ProfileStack = createStackNavigator();

    return (
        <ProfileStack.Navigator
            initialRouteName='Profile'
            screenOptions={{
                cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
                headerShown: false
            }}
        >
            <ProfileStack.Screen
                name='Profile'
                component={ProfileScreen}
            />
            <ProfileStack.Screen
                name='Calendar'
                component={CalendarScreen}
            />
            <ProfileStack.Screen
                name='EditProfile'
                component={EditProfileScreen}
            />
            <ProfileStack.Screen
                name='Showcase'
                component={ShowcaseScreen}
                options={{
                    //gestureEnabled: false     // <-- try and find a way to make this work
                }}
            />
        </ProfileStack.Navigator>
    );
};

const SettingsStackScreens = () => {
    const SettingsStack = createStackNavigator();

    return (
        <SettingsStack.Navigator
            initialRouteName='Settings'
            screenOptions={{
                cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
                headerShown: false,
                gestureEnabled: true,
            }}
        >
            <SettingsStack.Screen
                name='Settings'
                component={SettingsScreen}
            />
            <SettingsStack.Screen
                name='AccountOptions'
                component={AccountOptionsScreen}
            />
            <SettingsStack.Screen
                name='AccountUpdate'
                component={AccountUpdateScreen}
            />
            <SettingsStack.Screen
                name='About'
                component={AboutScreen}
            />
        </SettingsStack.Navigator>
    );
};

const TabScreens = () => {
    const Tab = createBottomTabNavigator();
    const { activeTab, setActiveTab } = useContext(ActiveTabContext);

    function tabColorChange (screenName) {
        setActiveTab(screenName);
        setTimeout(() => {      // <-- may need to move this function back to the HomeScreen.js file
            if (Platform.OS === 'android') {
                if (screenName === 'Home') {
                    NavigationBar.setBackgroundColorAsync('black');
                    NavigationBar.setButtonStyleAsync('light');
                } else {
                    if (activeTab === 'Home') {
                        NavigationBar.setBackgroundColorAsync('white');
                        NavigationBar.setButtonStyleAsync('dark');
                    }
                }
            }
        }, 0);
    };

    return (
        <View style={{ flex: 1, paddingTop: Platform.OS === 'ios' ? 44 : 0,
            backgroundColor: activeTab === 'Home' ? 'black' : activeTab === 'UserProfile' ? Colors.greyBackdrop : 'white'
        }}>
            <StatusBar
                barStyle={activeTab === 'Home' ? 'light-content' : 'dark-content'}
                translucent
                backgroundColor={'transparent'}
            />
            {Platform.OS === 'android' && <View style={{ height: StatusBar.currentHeight }}/>}
            <View style={{ flex: 1, paddingBottom: Platform.OS === 'ios' ? 34.5 : 0,
                backgroundColor: activeTab === 'Home' ? 'black' : 'white'
            }}>
                <Tab.Navigator
                    initialRouteName='Home'
                    screenOptions={{
                        headerShown: false,
                        tabBarHideOnKeyboard: true,
                        tabBarShowLabel: false,
                        tabBarStyle: {
                            backgroundColor: activeTab === 'Home' ? 'black' : 'white',
                            borderTopWidth: activeTab === 'Home' ? width > 550 ? 0.3 : 0.2 : 0.5,
                            borderTopColor: activeTab === 'Home' ? '#666666' : Colors.border,
                            height: 56,
                            elevation: 0,   // remove shadow on Android
                            shadowOpacity: 0    // remove shadow on iOS,
                        }
                    }}
                >
                    <Tab.Screen
                        name='Home'
                        component={HomeScreen}
                        listeners={{
                            focus: () => { tabColorChange('Home'); }
                        }}
                        options={HomeScreen.navigationOptions}
                    />
                    <Tab.Screen
                        name='Search'
                        component={SearchScreen}
                        listeners={{
                            focus: () => { tabColorChange('Search'); }
                        }}
                        options={SearchScreen.navigationOptions}
                    />
                    <Tab.Screen
                        name='ChallengeButton'
                        component={ChallengeButton}
                        options={({ navigation }) => ({
                            tabBarButton: () => <ChallengeButton navigation={navigation}/>
                        })}
                    />
                    <Tab.Screen
                        name='Inbox'
                        component={InboxScreen}
                        listeners={{
                            focus: () => { tabColorChange('Inbox'); }
                        }}
                        options={InboxScreen.navigationOptions}
                    />
                    <Tab.Screen
                        name='UserProfile'
                        component={UserProfileScreen}
                        listeners={{
                            focus: () => { tabColorChange('UserProfile'); }
                        }}
                        options={UserProfileScreen.navigationOptions}
                    />
                </Tab.Navigator>
            </View>
        </View>
    );
};

const MyTheme = {   // <-- re-visit & test this (may be useful for notifications?)
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        background: 'rgb(255, 255, 255)'
    }
};

const AppContainer = () => {
    const Stack = createStackNavigator();

    return (
        <NavigationContainer theme={MyTheme}>
            <Stack.Navigator
                initialRouteName='SetupStack'
                screenOptions={{
                    gestureEnabled: true,
                    headerShown: false
                }}
            >
                <Stack.Screen
                    name='SetupStack'
                    component={SetupStackScreens}
                    options={{
                        cardStyleInterpolator: CardStyleInterpolators.forNoAnimation
                    }}
                />
                <Stack.Screen
                    name='Tab'
                    component={TabScreens}
                    options={{
                        gestureEnabled: false,
                        cardStyleInterpolator: CardStyleInterpolators.forNoAnimation
                    }}
                />
                <Stack.Screen
                    name='ChallengeStack'
                    component={ChallengeStackScreens}
                    options={{
                        gestureEnabled: false,
                        cardStyleInterpolator: CardStyleInterpolators.forScaleFromCenterAndroid,
                        transitionSpec: {
                            open: {
                                animation: 'timing',
                                config: {
                                    duration: 250,
                                    useNativeDriver: true
                                }
                            },
                            /*close: {
                                animation: 'spring',
                                config: {
                                    stiffness: 1000,    // <-- energy at start of animation
                                    damping: 100,   // <-- speed at which it slows down
                                    mass: 3,    // <-- higher mass makes animation slower and bouncier
                                    overshootClamping: true,    // <-- won't go past its end value
                                    restDisplacementThreshold: 0.01,
                                    restSpeedThreshold: 0.01,   // <-- minimum speed to be considered "at rest"
                                    useNativeDriver: true
                                }
                            },*/
                            close: {
                                animation: 'timing',
                                config: {
                                    duration: 100,
                                    useNativeDriver: true
                                }
                            }
                        }
                    }}
                />
                <Stack.Screen
                    name='InboxStack'
                    component={InboxStackScreens}
                    options={{
                        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS
                    }}
                />
                <Stack.Screen
                    name='ProfileStack'
                    component={ProfileStackScreens}
                    options={{
                        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
                        gestureEnabled: false
                    }}
                />
                <Stack.Screen
                    name='SettingsStack'
                    component={SettingsStackScreens}
                    options={{
                        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS
                    }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppContainer;