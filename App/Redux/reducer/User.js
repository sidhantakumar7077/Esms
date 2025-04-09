import { createSlice } from '@reduxjs/toolkit'

export const UserSlice = createSlice({
  name: 'user',
  initialState: {
    userData: null,
    login_status: false,
    vehicleDetails:null,
    profileData:{personal:null,parents:null,others:null},
    appSetting: { darkMode: false, notification: true },
      defultSetting: {
    statusCode: 200,
    status: true,
    error: null,
    message: "",
    base_url: "https://esmsv2.scriptlab.in/",
    school_name: "Vidyasagar Nursery ",
    phone: "9064671252",
    email: "gkpublicschool01@gmail.com",
    app_logo: "https://esmsv2.scriptlab.in/uploads/school_content/logo/app_logo/1702535065-1024512406657a9f99b6105!logo-no-background (1).png?1740076279"
}
  },
  reducers: {
    setuser(state, action) {
      state.userData = action.payload
      state.login_status = true
    },
    logout(state, action) {
      state.userData = {}
      state.login_status = false;
    },
    setVehicleDetails(state, action) {
      state.vehicleDetails = action.payload
    },
    setProfileData(state, action) {
      state.profileData = action.payload
    },
    setAppSetting(state, action) {
      state.appSetting = action.payload
    },
    setDefultSetting(state, action) {
      state.defultSetting = action.payload
    },
  }
})
export const { setuser, logout,setVehicleDetails,setProfileData,setAppSetting,setDefultSetting} = UserSlice.actions;

export default UserSlice.reducer;