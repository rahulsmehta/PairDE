import { handleActions } from 'redux-actions';
import * as Actions from '../constants/actions';
import * as EditorActions from '../actions/editor';
import {encode, decode} from 'base-64';

// const initialFile: CodeFile = {
//   rawSrc: "//your code here",
//   fileName: "Untitled.java"
// }
const initialState: CodePanelData = {
  rawSrc: "",
  consoleSrc: "",
  fileName: "",
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
      workState: action.payload.workState
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
    const updatedFiles: CodeFile[] = state.workState.files.map((c, i) => {
      if (c.fileName == state.fileName) {
        return {
          fileName: action.payload.fileName,
          compileId: c.compileId,
          rawSrc: c.rawSrc
        }
      } else {
        return c;
      }
    });
    return {
      rawSrc: action.payload.rawSrc,
      fileName: action.payload.fileName,
      consoleSrc: state.consoleSrc,
      otherFiles: updatedFiles,
      extraArgs: state.extraArgs,
      workState: {
        wd: state.workState.wd,
        files: updatedFiles
      }
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
  [Actions.CHANGE_SRC_FILE]: (state, action) => {
    // alert(action.payload.fileName);
    // alert(action.payload.rawSrc);
    // before returning state, update rawSrc for the org file
    // in workState

    const newFiles = state.workState.files.map((v,i) => {
      if (v.fileName == state.fileName) {
        return {
          fileName: v.fileName,
          compileId: v.compileId,
          rawSrc: state.rawSrc
        };
      } else {
        return v;
      }
    });

    return {
      rawSrc: action.payload.rawSrc,
      fileName: action.payload.fileName,
      consoleSrc: state.consoleSrc,
      otherFiles: state.otherFiles,
      extraArgs: state.extraArgs,
      workState: {
        wd: state.workState.wd,
        files: newFiles
      }
    };
  },
  [Actions.INIT_APP]: (state, action) => {
    // alert(JSON.stringify(action.payload.workState));
    const { workState } = action.payload;
    if (workState.files.length > 0) {
      const top = workState.files[0];
      return {
        rawSrc: top.rawSrc,
        fileName: top.fileName,
        consoleSrc: state.consoleSrc,
        otherFiles: state.otherFiles,
        extraArgs: state.extraArgs,
        workState: action.payload.workState
      }
    } else {
      return {
        rawSrc: "",
        fileName: "Untitled.java",
        consoleSrc: state.consoleSrc,
        otherFiles: state.otherFiles,
        extraArgs: state.extraArgs,
        workState: action.payload.workState
      }
    }
  }
}, initialState);
