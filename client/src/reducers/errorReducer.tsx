const initialState = {};

interface GET_ERRORS {
  type: 'GET_ERRORS';
  payload: any;
}

export default function(state = initialState, action: GET_ERRORS) {
  switch (action.type) {
    case "GET_ERRORS":
      return action.payload;
    default:
      return state;
  }
}