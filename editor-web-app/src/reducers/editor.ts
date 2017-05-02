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
  otherFiles: [],
  extraArgs: [],
  workState: {
    wd: '/',
    files: []
  }
};

export default handleActions<CodePanelState, CodePanelData>({
  [Actions.COMPILE_FILE]: (state, action) => {
    //alert(action.payload.otherFiles[0].compileId);
    return {
      rawSrc: state.rawSrc,
      fileName: state.fileName,
      consoleSrc: action.payload.consoleSrc,
      otherFiles: action.payload.otherFiles,
      extraArgs: state.extraArgs,
      workState: state.workState
    };
  },
  [Actions.SAVE_FILE]: (state, action) => {
    return state;
  },
  [Actions.RUN_FILE]: (state, action) => {
    return {
      rawSrc: state.rawSrc,
      fileName: state.fileName,
      otherFiles: state.otherFiles,
      consoleSrc: action.payload.consoleSrc,
      extraArgs: state.extraArgs,
      workState: state.workState
    };
  },
  [Actions.UPDATE_SRC]: (state, action) => {
    console.log(state.otherFiles);
    return {
      rawSrc: action.payload.rawSrc,
      fileName: state.fileName,
      consoleSrc: state.consoleSrc,
      otherFiles: state.otherFiles,
      extraArgs: state.extraArgs,
      workState: state.workState
    };
  },
  [Actions.RENAME_CURRENT]: (state, action) => {
    //alert('Renaming ' + state.fileName + ' to ' + action.payload.fileName);
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
      otherFiles: updatedFiles,
      extraArgs: state.extraArgs,
      workState: state.workState
    }
  },
  [Actions.ARG_CHANGE]: (state, action) => {
    return {
      rawSrc: state.rawSrc,
      fileName: state.fileName,
      consoleSrc: state.consoleSrc,
      otherFiles: state.otherFiles,
      extraArgs: action.payload.extraArgs,
      workState: state.workState
    }
  },
  [Actions.INIT_APP]: (state, action) => {
    alert(JSON.stringify(action.payload.workState));
    return {
      rawSrc: state.rawSrc,
      fileName: state.fileName,
      consoleSrc: state.consoleSrc,
      otherFiles: state.otherFiles,
      extraArgs: state.extraArgs,
      workState: action.payload.workState
    }
  }
}, initialState);
