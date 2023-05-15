import { combineReducers } from 'redux';
// import authReducer from './authReducer';
// import errorReducer from './errorReducer';
// import profileReducer from './profileReducer';
// import postReducer from './postReducer';
// import pageReducer from './pageReducer';
import tempReducer from './tempReducer';

export default combineReducers({
//   auth: authReducer,
//   errors: errorReducer,
//   profile: profileReducer,
//   post: postReducer,
//   page: pageReducer,
    temp: tempReducer
});
