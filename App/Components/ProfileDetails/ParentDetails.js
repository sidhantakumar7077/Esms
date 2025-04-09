import { Image, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { TextStyles, appStyles } from '../../Constants/Fonts'
import { Colors } from '../../Constants/Colors'
import { moderateScale, screenHeight } from '../../Constants/PixelRatio'
import { Images } from '../../Constants/Images'
import { useSelector } from 'react-redux'
import { useTheme } from '@react-navigation/native'

// const ParentData = [
//   { personType: 'Father', name: 'Oliver Thomas', contactNo: '8976546767', profession: 'Teacher', relation: null, email: null, address: null, image: Images.fatherImage },
//   { personType: 'Mother', name: 'Caroline Thomas', contactNo: '8926548790', profession: 'Teacher', relation: null, email: null, address: null, image: Images.motherImage },
//   { personType: 'Guardian', name: 'Oliver Thomas', contactNo: '8976546767', profession: 'Teacher', relation: 'Father', email: 'oliverThomas123@gmail.com', address: 'West Brooklyn', image: Images.guardianImage },
// ];

const ParentDetails = () => {
  const { userData, profileData } = useSelector(state => state.User);
  const [parentDetails, setParentDetails] = useState([]);
  const {colors} = useTheme();


  useEffect(() => {
    let fatherDetails = profileData?.parents?.father;
    let motherDetails = profileData?.parents?.mother;
    
    // let gourdianDetails = profileData?.parents?.mother;
    setParentDetails([
      { personType: 'Father', name: fatherDetails.father_name, contactNo: fatherDetails?.father_phone, profession: fatherDetails?.father_occupation, relation: null, email: null, address: null, image: Images.fatherImage },
      { personType: 'Mother', name: motherDetails?.mother_name, contactNo: motherDetails?.mother_phone, profession: motherDetails?.mother_occupation, relation: null, email: null, address: null, image: Images.motherImage },
      // { personType: 'Guardian', name: 'Oliver Thomas', contactNo: '8976546767', profession: 'Teacher', relation: 'Father', email: 'oliverThomas123@gmail.com', address: 'West Brooklyn', image: Images.guardianImage },
    ]);
  }, [profileData]);

  return (
    <View style={{ padding: 15, backgroundColor: colors.background, height: 600, paddingTop: 0 }}>
      {parentDetails.map((item, index) => {
        return (
          <View style={styles.itemRow}>
            <View style={{ flex: 1, justifyContent: 'center', }}>
              <View style={{ width: moderateScale(75), alignItems: 'center' }}>
                <Image
                  source={item.image}
                  style={{
                    height: moderateScale(70),
                    width: moderateScale(70),
                    borderRadius: moderateScale(70),
                    borderWidth: 0.5,
                    borderColor: colors.text
                  }}
                />
                <Text style={{ ...TextStyles.title, marginTop: 5,color:colors.text }}>{item.personType}</Text>
              </View>
            </View>

            <View style={{ flex: 1.5, justifyContent: 'center' }}>
              <View style={{ flexDirection: 'row', marginVertical: 5 }}>
                <Image
                  source={Images.username}
                  style={{
                    height: 16,
                    width: 16,
                    marginTop: 3,
                    tintColor:colors.text
                  }}
                />
                <Text style={{ ...TextStyles.keyText, marginLeft: 10,color:colors.text }}>{item.name || 'NA'}</Text>
              </View>
              <View style={{ flexDirection: 'row', marginVertical: 5 }}>
                <Image
                  source={Images.phoneCall}
                  style={{
                    height: 16,
                    width: 16,
                    marginTop: 3,
                    tintColor:colors.text
                  }}
                />
                <Text style={{ ...TextStyles.keyText, marginLeft: 10,color:colors.text }}>{item.contactNo || 'NA'}</Text>
              </View>
              <View style={{ flexDirection: 'row', marginVertical: 5 }}>
                <Image
                  source={Images.profession}
                  style={{
                    height: 18,
                    width: 18,
                    marginTop: 3,
                    tintColor:colors.text
                  }}
                />
                <Text style={{ ...TextStyles.keyText, marginLeft: 10,color:colors.text }}>{item.profession || 'NA'}</Text>
              </View>

              {item.relation && <View style={{ flexDirection: 'row', marginVertical: 5 }}>
                <Image
                  source={Images.relation}
                  style={{
                    height: 18,
                    width: 18,
                    marginTop: 3,
                    tintColor:colors.text
                  }}
                />
                <Text style={{ ...TextStyles.keyText, marginLeft: 10,color:colors.text }}>{item.relation}</Text>
              </View>}
              {item.email && <View style={{ flexDirection: 'row', marginVertical: 5 }}>
                <Image
                  source={Images.email}
                  style={{
                    height: 18,
                    width: 18,
                    marginTop: 3,
                    tintColor:colors.text
                  }}
                />
                <Text style={{ ...TextStyles.keyText, marginLeft: 10,color:colors.text }}>{item.email}</Text>
              </View>}
              {item.address && <View style={{ flexDirection: 'row', marginVertical: 5 }}>
                <Image
                  source={Images.address}
                  style={{
                    height: 18,
                    width: 18,
                    marginTop: 3,
                    tintColor:colors.text
                  }}
                />
                <Text style={{ ...TextStyles.keyText, marginLeft: 10 ,color:colors.text}}>{item.address}</Text>
              </View>}

            </View>
          </View>
        )
      })}


      {/* <View style={styles.itemRow}>
        <View style={{ flex: 1, justifyContent: 'center', }}>
          <View style={{ width: moderateScale(75), alignItems: 'center' }}>
            <Image
              source={Images.fatherImage}
              style={{
                height: moderateScale(75),
                width: moderateScale(75),
                borderRadius: moderateScale(75)
              }}
            />
            <Text style={{ ...TextStyles.title, marginTop: 5 }}>Mother</Text>
          </View>
        </View>

        <View style={{ flex: 1, justifyContent: 'center' }}>
          <View style={{ flexDirection: 'row', marginVertical: 5 }}>
            <Image
              source={Images.username}
              style={{
                height: 16,
                width: 16,
                marginTop: 3
              }}
            />
            <Text style={{ ...TextStyles.keyText, marginLeft: 10 }}>Oliver Thomas</Text>
          </View>
          <View style={{ flexDirection: 'row', marginVertical: 5 }}>
            <Image
              source={Images.phoneCall}
              style={{
                height: 16,
                width: 16,
                marginTop: 3
              }}
            />
            <Text style={{ ...TextStyles.keyText, marginLeft: 10 }}>7609874687</Text>
          </View>
          <View style={{ flexDirection: 'row', marginVertical: 5 }}>
            <Image
              source={Images.profession}
              style={{
                height: 18,
                width: 18,
                marginTop: 3
              }}
            />
            <Text style={{ ...TextStyles.keyText, marginLeft: 10 }}>Doctor</Text>
          </View>
        </View>
      </View> */}

    </View>
  )
}

export default ParentDetails

const styles = StyleSheet.create({
  itemRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.2,
    padding: 15,
  }
})