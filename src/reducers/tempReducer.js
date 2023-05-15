import { GET_TEMP } from '../actions/types';

const initialState = {
    isLoaded: false,
    communityData: false,
};

export default function(state = initialState, action) {
  switch (action.type) {
    case GET_TEMP:
      return {
        ...state,
        isLoaded: true,
        communityData: action.payload,
      };
    default:
      return state;
  }
}
