const isEmpty = require("is-empty");

const initialState = {
  isAuthenticated: false,
  user: {},
  loading: false
};


interface USER_LOADING {
  type: 'USER_LOADING';
}
interface SET_CURRENT_USER {
  type: 'SET_CURRENT_USER';
  payload: any;
}

type AuthenticationAction =
  | USER_LOADING
  | SET_CURRENT_USER

export default function (state = initialState, action: AuthenticationAction) {
  switch (action.type) {
    case "SET_CURRENT_USER":
      return {
        ...state,
        isAuthenticated: !isEmpty(action.payload),
        user: action.payload
      };
    case "USER_LOADING":
      return {
        ...state,
        loading: true
      };
    default:
      return state;
  }
}