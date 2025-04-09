import { Dimensions } from 'react-native';
const { width, height } = Dimensions.get('window');

//Guideline sizes are based on standard ~5" screen mobile device
const guidelineBaseWidth = 350;
const guidelineBaseHeight = 680;

const screenWidth = width;
const screenHeight = height;
const textSize = (size,factor = 0.01) =>size+width*factor;
const scale = size => width / guidelineBaseWidth * size;
const verticalScale = size => height / guidelineBaseHeight * size;
const moderateScale = (size, factor = 1) => size + ( scale(size) - size ) * factor;
const maxWidth = 750;

export {scale, verticalScale, moderateScale,maxWidth,screenHeight,screenWidth,textSize};