import {StyleSheet} from 'react-native';
import {Colors} from '../../Constants/Colors';
import {moderateScale, verticalScale} from '../../Constants/PixelRatio';

const profileStyle = StyleSheet.create({
  headerView: {
    backgroundColor: Colors.lightGrey,
    padding: moderateScale(5),
    marginTop: verticalScale(5),
  },
  addressTextStyle: {
    color: Colors.black,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.lightBlck2,
    width: '100%',
    marginTop: 5,
    marginBottom: 5,
  },
});

export default profileStyle;
