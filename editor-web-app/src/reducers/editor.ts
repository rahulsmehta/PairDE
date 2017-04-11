import { handleActions } from 'redux-actions';
import * as Actions from '../constants/actions';
import {encode, decode} from 'base-64';

const initialState: CodePanelData = {
  rawSrc: "//your code here"
};

export default handleActions<CodePanelState, CodePanelData>({
  [Actions.COMPILE_FILE]: (state, action) => {
    alert('compile THIS: \n'+encode(state.rawSrc));
    return state;
  },
  [Actions.SAVE_FILE]: (state, action) => {
    return state;
  },
  [Actions.RUN_FILE]: (state, action) => {
    return state;
  },
  [Actions.UPDATE_SRC]: (state, action) => {
    return {
      rawSrc: action.payload.rawSrc,
      fileName: state.fileName,
      consoleSrc: state.consoleSrc
    };
  }
}, initialState);
