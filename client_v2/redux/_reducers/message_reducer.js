import { createSlice } from '@reduxjs/toolkit'

import {
    SAVE_MESSAGE,
} from '../_actions/types';

// eslint-disable-next-line import/no-anonymous-default-export

const messagesSliceReducer = (state = { messages: [] }, action) => {
    switch (action.type) {
        case SAVE_MESSAGE:
            return {
                ...state,
                messages: state.messages.concat(action.payload)
            };
        default:
            return state;
    }
};

export default messagesSliceReducer;