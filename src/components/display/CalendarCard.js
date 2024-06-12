import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { checkMonthLayout, getMonthNum } from '../../utils/Dates';

// ** setup a system for retrieving the user's posts associated to the month displayed
//    and then assign them to the correct image preview

// ** may need to update the variable names used for using the month data

const CalendarCard = ({ navigation, month }) => {
    const today = new Date();
    const [referenceDate, setReferenceDate] = useState(null);
    const [calendarDays, setCalendarDays] = useState();
    const weekdays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

    useEffect(() => {
        if (referenceDate === null) {
            // generate a reference day for specified month
            setReferenceDate(new Date(month.item.year, getMonthNum(month.item.month)));
        } else {
            // create a list of dates for the month being displayed
            setCalendarDays(checkMonthLayout(referenceDate));
        }
    }, [referenceDate]);

    // add system for checking whether or not there is an image to preview to know font color of date
    const ImagePreview = (date, index) => {
        let isToday = false;
        if (date != null) {
            if (date.getFullYear() === today.getFullYear()) {
                if (date.getMonth() === today.getMonth()) {
                    if (date.getDate() === today.getDate()) {
                        isToday = true;
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
                    {isToday 
                        ? <View style={styles.circle}>
                            <Text style={[styles.numberText, { color: 'white' }]}>{date.getDate()}</Text>
                        </View>
                        : <Text style={[styles.numberText, { position: 'absolute' }]}>{date.getDate()}</Text>
                    }
                </Pressable>
            );
        } else {
            return (
                <View key={index} style={styles.imageContainer}/>
            );
        }
    };

    const MonthLayout = () => {
        firstWeekday = calendarDays[0].getDay();    // 0 for Sunday, 1 for Monday, ..., 6 for Saturday

        // create an array representing the month layout, padding start and end with null values
        const monthLayout = Array(7*6).fill(null);
        for (let i = 0; i < calendarDays.length; i++) {
            monthLayout[i + firstWeekday] = calendarDays[i];
        }

        // split into weeks & filter out empty weeks
        const weeks = [];
        for (let i = 0; i < monthLayout.length; i += 7) {
            const week = monthLayout.slice(i, i + 7);
            if (week.some(day => day !== null)) {   // only add weeks that have at least 1 non-null day
                weeks.push(week);
            }
        }

        return (
            <View>
                {weeks.map((week, index) => (
                    <View key={index} style={styles.rowContainer}>
                        {week.map((date, index) => (
                            ImagePreview(date, index)
                        ))}
                    </View>
                ))}
            </View>
        );
    };

    return (
        <View style={{ paddingHorizontal: 15, marginBottom: 15 }}>
            <Text style={styles.monthNameText}>{month.item.month} {month.item.year}</Text>

            <View style={{ marginTop: 5 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
                    {weekdays.map((item, index) => (
                        <View key={index} style={{ width: 40, alignItems: 'center' }}>
                            <Text style={styles.weekdayText}>{item}</Text>
                        </View>
                    ))}
                </View>

                { // wait for calendar days to finish generating
                    calendarDays && MonthLayout()
                }
            </View>
        </View>
    );  
};

const styles = StyleSheet.create({
    monthNameText: {
        fontFamily: 'proxima-nova-semi',
        fontSize: 18,
        marginVertical: 10
    },
    weekdayText: {
        fontFamily: 'proxima-nova-reg',
        fontSize: 14
    },
    rowContainer: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        marginTop: 9
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

export default CalendarCard;