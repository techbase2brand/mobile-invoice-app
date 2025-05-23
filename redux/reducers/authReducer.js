// redux/reducers/authReducer.js
const initialState = {
    token: null,
  };
  
  const authReducer = (state = initialState, action) => {
    switch (action.type) {
      case 'SET_TOKEN':
        return {
          ...state,
          token: action.payload,
        };
      case 'LOGOUT':
        return {
          ...state,
          token: null,
        };
      default:
        return state;
    }
  };
  
  export default authReducer;
  