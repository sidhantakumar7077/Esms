import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import React, { Component, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AuthService from '../Services/Auth';
import { useDispatch } from 'react-redux';
import Login from '../Screen/Auth/Login';
import ForgotPassword from '../Screen/Auth/ForgotPassword';
import SchoolCodeScreen from '../Screen/Auth/SchoolCodeScreen';
// import { setuser } from '../Redux/reducer/User';

// import UploadPhoto from '../Screens/UploadPhoto';


const Stack = createStackNavigator();
// create a component
const AuthStack = () => {

    let dispatch = useDispatch();
    // const { login_status } = useSelector(state => state.User)

    useEffect(() => {
        //  autoLogin();
    }, []);

    return (
        <Stack.Navigator
            initialRouteName='SchoolCodeScreen'
            screenOptions={{
                headerShown: false,
                // gestureEnabled: true,
                // gestureDirection: 'horizontal',
                // ...TransitionPresets.ModalTransition,
            }}
        >
            <Stack.Screen name="SchoolCodeScreen" component={SchoolCodeScreen} />
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
        </Stack.Navigator>
    );
};

export default AuthStack;
