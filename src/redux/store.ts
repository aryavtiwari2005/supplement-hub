// src/redux/store.ts
import { configureStore, combineReducers } from '@reduxjs/toolkit'
import cartReducer from './cartSlice'
import wishlistReducer from './wishlistSlice'
import themeReducer from './themeSlice'  // Ensure this is created
import { 
  persistStore, 
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER
} from 'redux-persist'
import storage from 'redux-persist/lib/storage'

// Combine reducers
const rootReducer = combineReducers({
  cart: cartReducer,
  wishlist: wishlistReducer,
  theme: themeReducer
})

// Persist configuration
const persistConfig = {
  key: 'root',
  version: 1,
  storage,
  whitelist: ['cart', 'wishlist', 'theme']
}

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer)

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          FLUSH,
          REHYDRATE,
          PAUSE,
          PERSIST,
          PURGE,
          REGISTER
        ]
      }
    })
})

// Export store and persistor
export const persistor = persistStore(store)

// Export types
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
