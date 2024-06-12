import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { ActiveTabContext } from '../../utils/ContextVariables';
import Colors from '../../utils/Colors';

import SearchBar from '../../components/input/SearchBar';

import CustomIcon from '../../utils/CustomIcon';
import { FontAwesome, Ionicons, AntDesign } from '@expo/vector-icons';

// ** retrieve the user's recent searches and trending searches on the app with useEffect

// ** use different display methods based on the selected tab category

// ** run different search functions for obtaining results based on the selected tab

// ** check internet connection before implementing a search
// ** show a loading icon whenever gathering results from entered string

// ** only retrieve a certain number of search results when first executing the search,
//    thus minimizing the number of read operations from Firestore and load time,
//    then load more results as the user scrolls down
// *  (pick different numbers based on the selected tab and the number of results needed to fill the screen)

// ** it appears Firebase has an extension called "Search Firestore with Algolia/Typesense"
//    I wonder if either of them would be of any help for implementing my search

// ** maybe allow users to search for results on the challenge tab using both date & challenge name/description

// ** temp
const recentSearches = ['recent search 1', 'recent search 2', 'recent search 3', 'recent search 4'];
const trendingSearches = ['trending search 1', 'trending search 2', 'trending search 3', 'trending search 4'];

const SearchScreen = ({ navigation }) => {
    const [search, setSearch] = useState(false);    // indicates if a search has been implemented
    const [searchInput, setSearchInput] = useState('');
    const [tabSelected, setTabSelected] = useState('Posts');    // options: Posts, Challenges, Users, Location
    const [results, setResults] = useState([]);

    useEffect(() => {
        if (search) {
            if (searchInput.length > 0) {
                executeSearch();
            } else {
                setSearch(false);   // search bar was blank when tapping search
            }
        } else {
            setResults([]);     // delete results when ending search
        }
    }, [search, tabSelected]);

    useEffect(() => {
        if (searchInput.length === 0) {     // user deletes text in search bar
            setSearch(false);
        }
    }, [searchInput]);

    function executeSearch () {
        //if (searchInput.length > 0) {
        //    setSearch(true);
        //}

        // ** check which tab is currently selected and call upon 1 of the 4 different functions responsible
        //    for searching for items in that category 
        
        // temp code
        //setResults(['temp']);
    };

    // * will need to make 4 different possible components to display based on the selected tab
    const SearchResults = () => {
        if (results.length > 0) {

        } else {    // no results found from search input (maybe move into ListEmptyComponent of FlatLists)
            return (
                <View style={{ alignItems: 'center', marginTop: 150 }}>
                    <AntDesign name='search1' size={100} color='#bfbfbf'/>
                    <Text style={{ fontFamily: 'proxima-nova-semi', fontSize: 20, marginTop: 20 }}>No results found</Text>
                    <Text style={{ fontFamily: 'proxima-nova-reg', fontSize: 16, color: Colors.mediumGrey, marginTop: 10 }}>Try another search</Text>
                </View>
            );
        }
    };

    const SearchDisplay = () => {
        if (search && searchInput.length > 0) {
            return (
                <View style={{ flex: 1, marginTop: 10 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', zIndex: 1 }}>
                        <View>
                            <Pressable
                                onPress={() => setTabSelected('Posts')}
                                style={({pressed}) => [{ padding: 10, opacity: pressed ? tabSelected === 'Posts' ? 1 : 0.2 : 1 }]}
                            >
                                <Text style={[styles.tabText, { color: tabSelected === 'Posts' ? 'black' : Colors.mediumGrey }]}>Posts</Text>
                            </Pressable>
                            <View style={{ height: tabSelected === 'Posts' ? 3 : 0, width: '100%', backgroundColor: 'black', borderRadius: 20 }}/>
                        </View>
                        <View>
                            <Pressable
                                onPress={() => setTabSelected('Challenges')}
                                style={({pressed}) => [{ padding: 10, opacity: pressed ? tabSelected === 'Challenges' ? 1 : 0.2 : 1 }]}
                            >
                                <Text style={[styles.tabText, { color: tabSelected === 'Challenges' ? 'black' : Colors.mediumGrey }]}>Challenges</Text>
                            </Pressable>
                            <View style={{ height: tabSelected === 'Challenges' ? 3 : 0, width: '100%', backgroundColor: 'black', borderRadius: 20 }}/>
                        </View>
                        <View>
                            <Pressable
                                onPress={() => setTabSelected('Users')}
                                style={({pressed}) => [{ padding: 10, opacity: pressed ? tabSelected === 'Users' ? 1 : 0.2 : 1 }]}
                            >
                                <Text style={[styles.tabText, { color: tabSelected === 'Users' ? 'black' : Colors.mediumGrey }]}>Users</Text>
                            </Pressable>
                            <View style={{ height: tabSelected === 'Users' ? 3 : 0, width: '100%', backgroundColor: 'black', borderRadius: 20 }}/>
                        </View>
                        <View>
                            <Pressable
                                onPress={() => setTabSelected('Location')}
                                style={({pressed}) => [{ padding: 10, opacity: pressed ? tabSelected === 'Location' ? 1 : 0.2 : 1 }]}
                            >
                                <Text style={[styles.tabText, { color: tabSelected === 'Location' ? 'black' : Colors.mediumGrey }]}>Location</Text>
                            </Pressable>
                            <View style={{ height: tabSelected === 'Location' ? 3 : 0, width: '100%', backgroundColor: 'black', borderRadius: 20 }}/>
                        </View>
                    </View>
                    <View style={{ height: 1, backgroundColor: Colors.border, bottom: 1, zIndex: 0 }}/>

                    {SearchResults()}
                </View>
            );
        } else {
            return (
                <ScrollView bounces={false}>
                    {recentSearches.length > 0 && <View>
                        <Text style={styles.labelText}>Recent searches</Text>
                        {recentSearches.map((item, index) =>
                            <Pressable
                                key={index}
                                onPress={() => {
                                    setSearchInput(item);
                                    setSearch(true);
                                }}
                                style={({pressed}) => [{ paddingHorizontal: 15, paddingVertical: 8, flexDirection: 'row', alignItems: 'center',
                                    backgroundColor: pressed ? Colors.lightGrey : 'white'
                                }]}
                            >
                                <Ionicons name='time-outline' size={25} color='black' style={{ marginRight: 10 }}/>
                                <Text style={{ fontFamily: 'proxima-nova-semi', fontSize: 17, flex: 1 }}>{item}</Text>
                                <Pressable
                                    //onPress={() => }      // <-- delete from user's search history
                                    style={({pressed}) => [styles.deleteButton, { opacity: pressed ? 0.2 : 1 }]}
                                >
                                    <AntDesign name='close' size={25} color={Colors.mediumGrey}/>
                                </Pressable>
                            </Pressable>
                        )}
                    </View>}

                    <Text style={styles.labelText}>You might enjoy</Text>
                    {trendingSearches.map((item, index) =>
                        <Pressable
                            key={index}
                            onPress={() => {
                                setSearchInput(item);
                                setSearch(true);
                            }}
                            style={({pressed}) => [{ paddingHorizontal: 15, paddingVertical: 8, flexDirection: 'row', alignItems: 'center',
                                backgroundColor: pressed ? Colors.lightGrey : 'white'
                            }]}
                        >
                            <Ionicons name='search' size={25} color='black' style={{ marginRight: 10 }}/>
                            <Text style={{ fontFamily: 'proxima-nova-semi', fontSize: 17, flex: 1 }}>{item}</Text>
                        </Pressable>
                    )}
                </ScrollView>
            );
        }
    };

    return (
        <View style={styles.screen}>
            <SearchBar text={searchInput} setText={setSearchInput} label='Search Blitzmo' search={setSearch}/>

            {SearchDisplay()}
        </View>
    );
};

SearchScreen.navigationOptions = ({ navigation }) => {
    const isFocused = navigation.isFocused();
    const { activeTab } = useContext(ActiveTabContext);

    return {
        tabBarButton: () => {
            if (isFocused) {
                return (
                    <View style={{ flex: 1, height: 56, alignItems: 'center', justifyContent: 'center' }}>
                        <FontAwesome name='search' size={28} color='black' style={{ bottom: 1 }}/>
                        <Text style={{ fontFamily: 'proxima-nova-semi', fontSize: 10.5, color: 'black', marginTop: 3 }}>Search</Text>
                    </View>
                );
            } else {
                return (
                    <Pressable
                        onPress={() => navigation.navigate('Tab', { screen: 'Search' })}
                        style={{ flex: 1, height: 56, alignItems: 'center', justifyContent: 'center' }}
                    >
                        <CustomIcon name='search' size={26} color={activeTab === 'Home' ? '#cccccc' : '#808080'}/>
                        <Text style={{ fontFamily: 'proxima-nova-semi', fontSize: 10.5, color: activeTab === 'Home' ? '#cccccc' : '#808080', marginTop: 5 }}>Search</Text>
                    </Pressable>
                );
            }
        }
    };
};

const styles = StyleSheet.create({
    screen: {
        flex: 1
    },
    labelText: {
        marginTop: 15,
        marginBottom: 5,
        marginLeft: 15,
        fontFamily: 'proxima-nova-semi',
        fontSize: 17,
        color: Colors.mediumGrey
    },
    deleteButton: {
        height: 27,
        width: 27,
        alignItems: 'center',
        justifyContent: 'center'
    },
    tabText: {
        fontFamily: 'proxima-nova-semi',
        fontSize: 17
    }
});

export default SearchScreen;