import React, { useState, useEffect, useCallback } from 'react';
import { View, LogBox } from 'react-native';
import * as Font from 'expo-font';
//import * as SplashScreen from 'expo-splash-screen';
import AppContainer from './src/Routes';
import { ActiveTabContext } from './src/utils/ContextVariables';
import { MenuProvider } from 'react-native-popup-menu';

// ** replace splash.png & adaptive-icon.png files
// *  also update value of backgroundColor for splash in app.json
// *  test if I even need any of this SplashScreen code in App.js (or even expo-splash-screen altogether)

LogBox.ignoreLogs([     // <-- doesn't appear to work anymore (maybe just remove later)
    'Sending `onAnimatedValueUpdate` with no listeners registered.'
]);

// keep the splash screen visible while fetching resources
//SplashScreen.preventAutoHideAsync();

function fetchFonts () {
    return Font.loadAsync({
        'custom-icons': require('./src/assets/fonts/fontello.ttf'),
        'proxima-nova-reg': require('./src/assets/fonts/Proxima-Nova-Regular.ttf'),
        'proxima-nova-semi': require('./src/assets/fonts/Proxima-Nova-Semibold.otf'),
        'proxima-nova-bold': require('./src/assets/fonts/Proxima-Nova-Bold.otf')
    });
};

export default function App() {
    const [dataLoaded, setDataLoaded] = useState(false);
    const [activeTab, setActiveTab] = useState('Home');

    useEffect(() => {
        async function prepare() {
            try {
                // pre-load fonts, make any API calls you need to do here   // <-- likely includes GPT-4
                await fetchFonts();
            } catch (e) {
                console.log(e);
            } finally {
                // tell the application to render
                setDataLoaded(true);
            }
        }

        prepare();
    }, []);

    const onLayoutRootView = useCallback(async () => {
        if (dataLoaded) {
            //await SplashScreen.hideAsync();  // <-- hides the splash screen once the data is loaded
        }
    });

    if (!dataLoaded) {
        return;
    }

    return (
        <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
            <ActiveTabContext.Provider value={{ activeTab, setActiveTab }}>
                <MenuProvider>
                    <AppContainer/>
                </MenuProvider>
            </ActiveTabContext.Provider>
        </View>
    );
};