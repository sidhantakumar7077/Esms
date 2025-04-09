import { ScrollView, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { TextStyles, appStyles } from '../../Constants/Fonts'
import { Colors } from '../../Constants/Colors'
// import { screenHeight } from '../../Constants/PixelRatio'

const ProcessingFees = () => {
  return (
    <ScrollView style={{
      backgroundColor: Colors.white2,
      width: '100%',
    }}>
      <View style={{ ...appStyles.main, width: '95%', marginTop: 10 }}>
        <View style={{ ...appStyles.card }}>
          <View style={appStyles.titleRow}>
            <Text style={TextStyles.title2}>Grand Total</Text>
          </View>
          <View style={{ padding: 10, flexDirection: 'row' }}>
            <View style={{ flex: 1, paddingHorizontal: 3.5 }}>
              <Text style={{ ...TextStyles.keyText, flex: null }}>Total Fees</Text>
              <Text style={{ ...TextStyles.valueText, marginTop: 2, flex: null }}>{'\u20B9'}878500.00</Text>
            </View>
            <View style={{ flex: 1, paddingHorizontal: 3.5 }}>
              <Text style={{ ...TextStyles.keyText, flex: null }}>Discount</Text>
              <Text style={{ ...TextStyles.valueText, marginTop: 2, flex: null }}>{'\u20B9'}8500.00</Text>
            </View>
            <View style={{ flex: 1, paddingHorizontal: 3.5 }}>
              <Text style={{ ...TextStyles.keyText, flex: null }}>Fine</Text>
              <Text style={{ ...TextStyles.valueText, marginTop: 2, flex: null }}>{'\u20B9'}500.00</Text>
            </View>
            <View style={{ flex: 1, paddingHorizontal: 3.5 }}>
              <Text style={{ ...TextStyles.keyText, flex: null }}>Paid</Text>
              <Text style={{ ...TextStyles.valueText, marginTop: 2, flex: null }}>{'\u20B9'}178500.00</Text>
            </View>
          </View>
        </View>
        <Text style={{ alignSelf: 'center', marginTop: 50 }}>No data found !</Text>
      </View>
    </ScrollView>
  )
}

export default ProcessingFees

const styles = StyleSheet.create({})