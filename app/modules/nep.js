/**
 * Created by Andrexxjc on 15/11/2017.
 */

// Constants
export const SET_NEP5 = 'SET_NEP5';
export const ADD_NEP5 = 'ADD_NEP5';
export const ADD_HASH_BALANCE = 'ADD_HASH_BALANCE';

//start with aphelion and rpx on your nep5 contracts
let initialNep5ReducerState = ['0xa0777c3ce2b169d4a23bcba4565e3225a0122d95', '0xecc6b20d3ccac1ee9ef109af5a7cdb85706b1df9'];

// Actions
export function setNep5(nep5){
    return {
        type: SET_NEP5,
        nep5: nep5
    }
}

export function addNep5(hashToAdd){
    return {
        type: ADD_NEP5,
        hash: hashToAdd
    }
}

export function addHashBalance(hashscript, balance){
    return {
        type: ADD_HASH_BALANCE,
        payload: {
            [hashscript]: balance
        }
    }
}


// reducer for nep5 hash contracts. The initial state will include the hash script for Aphelion
export default (state = { nep5: initialNep5ReducerState , balances: {} }, action) => {
    switch (action.type) {
        case SET_NEP5:
            return {...state, nep5: action.nep5 };
        case ADD_NEP5:
            let newState = Object.assign({}, state, { nep5: [ ...state.nep5, action.hash ] });
            return newState;
        case ADD_HASH_BALANCE:
            let balanceState = Object.assign({}, state, { balances: { ...state.balances, ...action.payload }});
            console.log('new balance state', balanceState);
            return balanceState;
        default:
            return state;
    }
};
