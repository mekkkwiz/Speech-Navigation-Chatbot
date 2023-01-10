import { combineReducers } from 'redux';
import message from './message_reducer';

const rootReducer = combineReducers({
    messages: message
});

export default rootReducer;