import { handleActions } from 'redux-actions';
import * as Actions from '../constants/actions';
import * as EditorActions from '../actions/editor';
import {encode, decode} from 'base-64';

const initialState: CodePanelData = {
  rawSrc: "//your code here",
  consoleSrc: "",
  fileName: "Untitled",
  otherFiles: {}
};

export default handleActions<CodePanelState, CodePanelData>({
  [Actions.COMPILE_FILE]: (state, action) => {
    return {
      rawSrc: state.rawSrc,
      fileName: state.rawSrc,
      consoleSrc: action.payload.consoleSrc,
      otherFiles: state.otherFiles
    };
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
      consoleSrc: state.consoleSrc,
      otherFiles: state.otherFiles
    };
  }
}, initialState);
