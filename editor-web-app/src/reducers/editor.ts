import { handleActions } from 'redux-actions';
import * as Actions from '../constants/actions';
import * as EditorActions from '../actions/editor';
import {encode, decode} from 'base-64';

const initialFile: CodeFile = {
  rawSrc: "//your code here",
  fileName: "Untitled.java"
}
const initialState: CodePanelData = {
  rawSrc: initialFile.rawSrc,
  consoleSrc: "",
  fileName: initialFile.fileName,
  otherFiles: [initialFile]
};

export default handleActions<CodePanelState, CodePanelData>({
  [Actions.COMPILE_FILE]: (state, action) => {
    return {
      rawSrc: state.rawSrc,
      fileName: state.fileName,
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
  },
  [Actions.RENAME_CURRENT]: (state, action) => {
    alert('Renaming ' + state.fileName + ' to ' + action.payload.fileName);
    const updatedFiles = state.otherFiles.map((c: CodeFile, i) => {
      if (c.fileName == state.fileName){
        return {
          rawSrc: c.rawSrc,
          compileId: c.compileId,
          fileName: action.payload.fileName
        };
      } else {
        return c
      }
    });
    return {
      rawSrc: action.payload.rawSrc,
      fileName: action.payload.fileName,
      consoleSrc: state.consoleSrc,
      otherFiles: updatedFiles
    }
  }
}, initialState);
