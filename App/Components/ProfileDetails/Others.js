import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { TextStyles, appStyles } from '../../Constants/Fonts'
import { Colors } from '../../Constants/Colors'
import { screenHeight } from '../../Constants/PixelRatio'
import { useSelector } from 'react-redux'
import { useTheme } from '@react-navigation/native'

const Others = () => {
  const { userData, profileData } = useSelector(state => state.User);
  const {colors} = useTheme();


  return (
    <View style={{ padding: 15, backgroundColor: colors.background, height: 600 }}>
      {userData.type == 'student' && <View>
        {/* <View style={appStyles.itmRow}>
          <Text style={TextStyles.keyText}>RTE</Text>
          <Text style={TextStyles.valueText}>No</Text>
        </View> */}
        <View style={appStyles.itmRow}>
          <Text style={{...TextStyles.keyText,color:colors.text}}>Category</Text>
          <Text style={{...TextStyles.valueText,color:colors.text}}>{profileData.others.category || 'NA'}</Text>
        </View>
        <View style={appStyles.itmRow}>
          <Text style={{...TextStyles.keyText,color:colors.text}}>Caste</Text>
          <Text style={{...TextStyles.valueText,color:colors.text}}>{profileData.others.cast || 'NA'}</Text>
        </View>
        <View style={appStyles.itmRow}>
          <Text style={{...TextStyles.keyText,color:colors.text}}>Pickup Point</Text>
          <Text style={{...TextStyles.valueText,color:colors.text}}>{profileData?.others?.pickup_point}</Text>
        </View>
        <View style={appStyles.itmRow}>
          <Text style={{...TextStyles.keyText,color:colors.text}}>Vehicle Route</Text>
          <Text style={{...TextStyles.valueText,color:colors.text}}>{profileData?.others?.route}</Text>
        </View>
        <View style={appStyles.itmRow}>
          <Text style={{...TextStyles.keyText,color:colors.text}}>Vehicle Number</Text>
          <Text style={{...TextStyles.valueText,color:colors.text}}>{profileData?.others?.vehicle_no}</Text>
        </View>
        <View style={appStyles.itmRow}>
          <Text style={{...TextStyles.keyText,color:colors.text}}>Driver Name</Text>
          <Text style={{...TextStyles.valueText,color:colors.text}}>{profileData?.others?.driver_name}</Text>
        </View>
        <View style={appStyles.itmRow}>
          <Text style={{...TextStyles.keyText,color:colors.text}}>Driver Contact</Text>
          <Text style={{...TextStyles.valueText,color:colors.text}}>{profileData?.others?.driver_contact}</Text>
        </View>
        {/* <View style={appStyles.itmRow}>
          <Text style={{...TextStyles.keyText,color:colors.text}}>Hostel Room</Text>
          <Text style={{...TextStyles.valueText,color:colors.text}}>{profileData?.others?.hostel_room || 'NA'}</Text>
        </View>
        <View style={appStyles.itmRow}>
          <Text style={{...TextStyles.keyText,color:colors.text}}>Room No</Text>
          <Text style={{...TextStyles.valueText,color:colors.text}}>{profileData?.others?.room_no}</Text>
        </View>
        <View style={appStyles.itmRow}>
          <Text style={{...TextStyles.keyText,color:colors.text}}>Room Type</Text>
          <Text style={{...TextStyles.valueText,color:colors.text}}>{profileData?.others?.room_type}</Text>
        </View> */}
        {/* <View style={appStyles.itmRow}>
          <Text style={{...TextStyles.keyText,color:colors.text}}>Previous School</Text>
          <Text style={{...TextStyles.valueText,color:colors.text}}>{profileData?.others?.prev_school}</Text>
        </View> */}
        {/* <View style={appStyles.itmRow}>
          <Text style={{...TextStyles.keyText,color:colors.text}}>National Id Number</Text>
          <Text style={{...TextStyles.valueText,color:colors.text}}>{profileData?.others?.national_id}</Text>
        </View>
        <View style={appStyles.itmRow}>
          <Text style={{...TextStyles.keyText,color:colors.text}}>Local Id Number</Text>
          <Text style={{...TextStyles.valueText,color:colors.text}}>{profileData?.others?.local_id}</Text>
        </View> */}
        <View style={appStyles.itmRow}>
          <Text style={{...TextStyles.keyText,color:colors.text}}>Religion</Text>
          <Text style={{...TextStyles.valueText,color:colors.text}}>{profileData.others.religion || 'NA'}</Text>
        </View>
      </View>}
      <View style={appStyles.itmRow}>
        <Text style={{...TextStyles.keyText,color:colors.text}}>Blood Group</Text>
        <Text style={{...TextStyles.valueText,color:colors.text}}>{profileData.others.blood_group || 'NA'}</Text>
      </View>
      <View style={appStyles.itmRow}>
        <Text style={{...TextStyles.keyText,color:colors.text}}>Height</Text>
        <Text style={{...TextStyles.valueText,color:colors.text}}>{profileData.others.height || 'NA'}</Text>
      </View>
      <View style={appStyles.itmRow}>
        <Text style={{...TextStyles.keyText,color:colors.text}}>Weight</Text>
        <Text style={{...TextStyles.valueText,color:colors.text}}>{profileData.others.weight || 'NA'}</Text>
      </View>
      {userData?.type == 'driver' && <View style={appStyles.itmRow}>
        <Text style={{...TextStyles.keyText,color:colors.text}}>Basic Salary</Text>
        <Text style={{...TextStyles.valueText,color:colors.text}}>{profileData.others.basic_salary || 'NA'}</Text>
      </View>}
      <View style={appStyles.itmRow}>
        <Text style={{...TextStyles.keyText,color:colors.text}}>Account Title</Text>
        <Text style={{...TextStyles.valueText,color:colors.text}}>{profileData?.others?.acc_title || 'NA'}</Text>
      </View>
      <View style={appStyles.itmRow}>
        <Text style={{...TextStyles.keyText,color:colors.text}}>Bank Name</Text>
        <Text style={{...TextStyles.valueText,color:colors.text}}>{profileData?.others?.bank_name || 'NA'}</Text>
      </View>
      <View style={appStyles.itmRow}>
        <Text style={{...TextStyles.keyText,color:colors.text}}>Bank Account Number</Text>
        <Text style={{...TextStyles.valueText,color:colors.text}}>{profileData?.others?.bank_acc_number || 'NA'}</Text>
      </View>
      <View style={appStyles.itmRow}>
        <Text style={TextStyles.keyText}>IFSC Code</Text>
        <Text style={{...TextStyles.valueText,color:colors.text}}>{profileData?.others?.ifsc_code || 'NA'}</Text>
      </View>

    </View>
  )
}

export default Others

const styles = StyleSheet.create({})