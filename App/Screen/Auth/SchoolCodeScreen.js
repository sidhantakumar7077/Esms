import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Image,
    Alert,
    StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../../Constants/Colors';
import { textSize } from '../../Constants/PixelRatio';
import { Images } from '../../Constants/Images';
import UseApi from '../../ApiConfig';
import Toast from 'react-native-simple-toast';

const SchoolCodeScreen = ({ navigation }) => {
    const [schoolCode, setSchoolCode] = useState('');
    const { Request } = UseApi();

    const verifySchoolCode = async () => {
        if (!schoolCode.trim()) {
            Toast.show('Please enter school code');
            return;
        }

        try {
            const response = await Request('getSchoolSetting', 'POST', { school_code: schoolCode });

            if (response?.status) {
                await AsyncStorage.setItem('school_code', schoolCode);
                await AsyncStorage.setItem('school_settings', JSON.stringify(response?.data));

                navigation.replace('Login'); // navigate to Login screen
            } else {
                Toast.show(response?.message || 'Invalid School Code');
            }
        } catch (err) {
            console.error('School Code Error:', err);
            Toast.show('Something went wrong');
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor={Colors.black} barStyle="light-content" />

            <Image
                source={Images.logoImage}
                style={{ width: 200, height: 80, resizeMode: 'contain', marginBottom: 20 }}
            />
            <Text style={styles.heading}>Enter Your School Code</Text>

            <TextInput
                value={schoolCode}
                onChangeText={setSchoolCode}
                placeholder="School Code"
                placeholderTextColor="gray"
                style={styles.input}
            />

            <TouchableOpacity onPress={verifySchoolCode} style={styles.button}>
                <Text style={styles.buttonText}>Continue</Text>
            </TouchableOpacity>
        </View>
    );
};

export default SchoolCodeScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    heading: {
        fontSize: textSize(18),
        fontWeight: '600',
        marginBottom: 20,
        color: Colors.black,
    },
    input: {
        width: '100%',
        height: 50,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 16,
        fontSize: textSize(14),
        backgroundColor: Colors.inputBackground || '#f7f7f7',
        color: Colors.black,
        borderColor: '#ccc',
        marginBottom: 20,
    },
    button: {
        backgroundColor: Colors.tangerine,
        paddingVertical: 12,
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
    },
    buttonText: {
        color: Colors.btnText,
        fontSize: textSize(16),
        fontWeight: 'bold',
    },
});
