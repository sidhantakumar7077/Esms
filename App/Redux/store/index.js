import { configureStore } from '@reduxjs/toolkit';
import reducer from "../reducer";


const Store = configureStore({
  reducer
})

export default Store;