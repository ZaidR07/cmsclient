import { configureStore } from '@reduxjs/toolkit'
import { combineReducers } from 'redux'
import adminReducer from "../slices/adminSlice"


import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist'
import storage from 'redux-persist/lib/storage' // default: localStorage for web

const rootReducer = combineReducers({
  admin : adminReducer,
})

// persist config
const persistConfig = {
  key: 'root',
  storage,
}

// wrap reducer with persistReducer
const persistedReducer = persistReducer(persistConfig, rootReducer)

// store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Required for redux-persist
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
})

// persistor (used later)
export const persistor = persistStore(store)

// types
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch