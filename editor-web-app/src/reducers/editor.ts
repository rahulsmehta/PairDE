import { handleActions } from 'redux-actions';
import * as Actions from '../constants/actions';
import * as EditorActions from '../actions/editor';
import { AppToaster } from "../services/toaster";
import { Intent } from "@blueprintjs/core";
import {encode, decode} from 'base-64';

const initialState: CodePanelData = {
  rawSrc: "",
  isHome: true,
  consoleSrc: "",
  fileName: "",
  otherFiles: [],
  extraArgs: [],
  workState: {
    wd: '/',
    files: []
  },
  pairWorkState: {
    wd: '/shared/',
    files: [],
    isSlave: true
  },
  authState: {
    isAuthenticated: false
  }
};

export default handleActions<CodePanelState, CodePanelData>({
  [Actions.COMPILE_FILE]: (state, action) => {
    return {
      rawSrc: state.rawSrc,
      isHome: state.isHome,
      fileName: state.fileName,
      consoleSrc: action.payload.consoleSrc,
      otherFiles: action.payload.otherFiles,
      extraArgs: state.extraArgs,
      workState: action.payload.workState,
      pairWorkState: action.payload.pairWorkState,
      authState: state.authState
    };
  },
  [Actions.SAVE_FILE]: (state, action) => {
    return state;
  },
  [Actions.RUN_FILE]: (state, action) => {
    return {
      rawSrc: state.rawSrc,
      isHome: state.isHome,
      fileName: state.fileName,
      otherFiles: state.otherFiles,
      consoleSrc: action.payload.consoleSrc,
      extraArgs: state.extraArgs,
      workState: state.workState,
      pairWorkState: state.pairWorkState,
      authState: state.authState
    };
  },
  [Actions.UPDATE_SRC]: (state, action) => {
    return {
      rawSrc: action.payload.rawSrc,
      isHome: state.isHome,
      fileName: state.fileName,
      consoleSrc: state.consoleSrc,
      otherFiles: state.otherFiles,
      extraArgs: state.extraArgs,
      workState: state.workState,
      pairWorkState: state.pairWorkState,
      authState: state.authState
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
      rawSrc: state.rawSrc,
      isHome: state.isHome,
      fileName: action.payload.fileName,
      consoleSrc: state.consoleSrc,
      otherFiles: updatedFiles,
      extraArgs: state.extraArgs,
      workState: {
        wd: state.workState.wd,
        files: updatedFiles
      },
      pairWorkState: state.pairWorkState,
      authState: state.authState
    }
  },
  [Actions.CREATE_FILE]: (state, action) => {
    AppToaster.show({
      message: "Successfully created " + action.payload.fileName + "!",
      intent: Intent.SUCCESS,
      iconName: "tick"
    });
    let newFiles = state.workState.files;
    if (newFiles.length > 0) {
      newFiles = newFiles.map((c) => {
        if(c.fileName == state.fileName) {
          return {
            fileName: c.fileName,
            compileId: c.compileId,
            rawSrc: action.payload.rawSrc
          }
        } else {
          return c;
        }
      });
    }
    newFiles.push({
      fileName: action.payload.fileName,
      rawSrc: ''
    });
    return {
      rawSrc: '',
      fileName: action.payload.fileName,
      isHome: state.isHome,
      consoleSrc: state.consoleSrc,
      otherFiles: state.otherFiles,
      extraArgs: state.extraArgs,
      workState: {
        wd: state.workState.wd,
        files: newFiles
      },
      pairWorkState: state.pairWorkState,
      authState: state.authState
    }
  },
  [Actions.ARG_CHANGE]: (state, action) => {
    return {
      rawSrc: state.rawSrc,
      isHome: state.isHome,
      fileName: state.fileName,
      consoleSrc: state.consoleSrc,
      otherFiles: state.otherFiles,
      extraArgs: action.payload.extraArgs,
      workState: state.workState,
      pairWorkState: state.pairWorkState,
      authState: state.authState
    }
  },
  [Actions.DELETE_FILE]: (state, action) => {
    const newFiles = state.workState.files.filter((c) => {
      return c.fileName != action.payload.fileName
    });
    const newFile = (newFiles.length > 0) ? newFiles[0] : {
      rawSrc: '',
      fileName: ''
    }
    AppToaster.clear();
    AppToaster.show({
      message: "Successfully deleted!",
      intent: Intent.SUCCESS,
      iconName: 'trash'
    });
    return {
      rawSrc: newFile.rawSrc,
      isHome: state.isHome,
      fileName: newFile.fileName,
      consoleSrc: state.consoleSrc,
      otherFiles: state.otherFiles,
      extraArgs: state.extraArgs,
      workState: {
        wd: state.workState.wd,
        files: newFiles
      },
      pairWorkState: state.pairWorkState,
      authState: state.authState
    };
  },
  [Actions.CHANGE_SRC_FILE]: (state, action) => {
    // before returning state, update rawSrc for the org file
    // in workState

    const newFiles = state.workState.files.map((v,i) => {
      if (v.fileName == state.fileName && state.isHome) {
        return {
          fileName: v.fileName,
          compileId: v.compileId,
          rawSrc: state.rawSrc
        };
      } else {
        return v;
      }
    });

    const newPairFiles: CodeFile[] = state.pairWorkState.files.map((v,i) => {
        return {
          fileName: v.fileName,
          rawSrc: v.rawSrc,
          isDir: v.isDir,
          children: v.children.map((f,i) => {
            if (f.fileName == state.fileName && !state.isHome) {
              return {
                fileName: f.fileName,
                compileId: f.compileId,
                rawSrc: state.rawSrc
              }
            } else {
              return f;
            }
          })
        };
    });

    let newPairWd = state.pairWorkState.wd;
    if (action.payload.pairWorkState) {
      // alert(action.payload.pairWorkState.wd);
      newPairWd = action.payload.pairWorkState.wd;
    }
    return {
      rawSrc: action.payload.rawSrc,
      isHome: action.payload.isHome,
      fileName: action.payload.fileName,
      consoleSrc: state.consoleSrc,
      otherFiles: state.otherFiles,
      extraArgs: state.extraArgs,
      workState: {
        wd: state.workState.wd,
        files: newFiles
      },
      pairWorkState: {
        wd: newPairWd,
        files: newPairFiles,
        isSlave: state.pairWorkState.isSlave
      },
      authState: state.authState
    };
  },
  [Actions.INIT_APP]: (state, action) => {
    const { workState } = action.payload;
    if (workState.files.length > 0) {
      const top = workState.files[0];
      return {
        rawSrc: top.rawSrc,
        isHome: state.isHome,
        fileName: top.fileName,
        consoleSrc: state.consoleSrc,
        otherFiles: state.otherFiles,
        extraArgs: state.extraArgs,
        workState: action.payload.workState,
        pairWorkState: action.payload.pairWorkState,
        authState: action.payload.authState
      }
    } else {
      return {
        rawSrc: "",
        isHome: state.isHome,
        fileName: "Untitled.java",
        consoleSrc: state.consoleSrc,
        otherFiles: state.otherFiles,
        extraArgs: state.extraArgs,
        workState: action.payload.workState,
        pairWorkState: action.payload.pairWorkState,
        authState: action.payload.authState
      }
    }
  },
  [Actions.LOG_IN]: (state, action) => {
    const {authState, workState} = action.payload;
    return {
      rawSrc: state.rawSrc,
      isHome: state.isHome,
      fileName: state.fileName,
      consoleSrc: state.consoleSrc,
      otherFiles: state.otherFiles,
      extraArgs: state.extraArgs,
      workState: workState,
      pairWorkState: state.pairWorkState,
      authState: authState
    }
  }
}, initialState);
