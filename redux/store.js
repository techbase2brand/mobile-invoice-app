// redux/store.js
import { createStore, combineReducers } from 'redux';
import authReducer from './reducers/authReducer';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
};

const rootReducer = combineReducers({
  auth: persistReducer(persistConfig, authReducer),
});

export const store = createStore(rootReducer);
export const persistor = persistStore(store);
