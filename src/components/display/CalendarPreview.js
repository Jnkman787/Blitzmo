import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import Colors from '../../utils/Colors';
import { generateWeeklyCalendarDates } from '../../utils/Dates';

// ** make numbers white if there is an image, black if there is not

// ** after obtaining the 14 dates, setup a system for retrieving the user's posts associated to those 14 days
//    and then assign them, along with the dates, to the correct image preview

const CalendarPreview = ({ navigation }) => {
    const referenceDate = new Date();
    const [dates, setDates] = useState([]);

    useEffect(() => {
        setDates(generateWeeklyCalendarDates(13, 0, referenceDate));
    }, []);

    // add system for checking whether or not there is an image to preview to know font color of date
    const ImagePreview = (date, index) => {
        let today = false;
        if (date.getFullYear() === referenceDate.getFullYear()) {
            if (date.getMonth() === referenceDate.getMonth()) {
                if (date.getDate() === referenceDate.getDate()) {
                    today = true;
                }
            }
        }

        // ** add <Image> component
        return (
            <Pressable
                //onPress={() => }
                style={styles.imageContainer}
                key={index}
            >
                {today 
                    ? <View style={styles.circle}>
                        <Text style={[styles.numberText, { color: 'white' }]}>{date.getDate()}</Text>
                    </View>
                    : <Text style={[styles.numberText, { position: 'absolute' }]}>{date.getDate()}</Text>
                }
            </Pressable>
        );
    };

    const WeekLayout = () => {
        // split dates into 2 rows
        const rows = [];
        for (let i = 0; i < dates.length; i += 7) {
            rows.push(dates.slice(i, i + 7));
        }

        return (
            <View>
                {rows.map((row, index) => (
                    <View key={index} style={styles.rowLayout}>
                        {row.map((date, index) => (
                            ImagePreview(date, index)
                        ))}
                    </View>
                ))}
            </View>
        );
    };

    return (
        <View style={styles.calendarContainer}>
            { // wait for dates to finish generating
                dates && WeekLayout()
            }

            <Pressable
                onPress={() => navigation.navigate('ProfileStack', { screen: 'Calendar' })}
                style={styles.buttonContainer}
            >
                <Text style={{ fontFamily: 'proxima-nova-semi', fontSize: 18 }}>View All</Text>
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    calendarContainer: {
        backgroundColor: Colors.greyBackdrop,
        borderRadius: 10
    },
    rowLayout: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        marginHorizontal: 6,
        marginTop: 11
    },
    imageContainer: {
        width: 40,
        height: 57,
        borderRadius: 8,
        overflow: 'hidden',
        //borderWidth: 1,
        //borderColor: 'black',
        alignItems: 'center',
        justifyContent: 'center'
    },
    numberText: {
        fontFamily: 'proxima-nova-semi',
        fontSize: 18
    },
    circle: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: 'black',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute'
    },
    buttonContainer: {
        alignSelf: 'center',
        height: 45,
        width: 125,
        backgroundColor: 'white',
        marginVertical: 30,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10
    }
});

export default CalendarPreview;