import { handleActions } from 'redux-actions';
import * as Actions from '../constants/actions';
import * as EditorActions from '../actions/editor';
import { AppToaster } from "../services/toaster";
import { Intent } from "@blueprintjs/core";
import {encode, decode} from 'base-64';

const initialState: CodePanelData = {
  rawSrc: null,
  isHome: true,
  consoleSrc: "",
  fileName: "",
  rid: null,
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
      rid: state.rid,
      consoleSrc: action.payload.consoleSrc,
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
      rid: state.rid,
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
      rid: state.rid,
      consoleSrc: state.consoleSrc,
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
          rid: "",
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
      rid: state.rid,
      consoleSrc: state.consoleSrc,
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
            rid: "",
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
      rid: "",
      fileName: action.payload.fileName,
      rawSrc: ''
    });
    return {
      rawSrc: '',
      fileName: action.payload.fileName,
      isHome: state.isHome,
      rid: state.rid,
      consoleSrc: state.consoleSrc,
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
      rid: state.rid,
      consoleSrc: state.consoleSrc,
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
      rid: state.rid,
      consoleSrc: state.consoleSrc,
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
    const isDir = (fn) => {
      const re = new RegExp('^[A-Za-z0-9_]*$');
      let toTest = fn.replace('/','').replace('/','');
      return re.test(toTest) && toTest.length > 0;
    }

    // need an updateFile() function that, given rid, finds it in
    // the fs tree and updates its src to state.rawSrc
    const updateFiles = (files: CodeFile[], rid: string) => {
      return files.map(c => {
        if (c.rid == rid) {
          return {
            fileName: c.fileName,
            compileId: c.compileId,
            rawSrc: state.rawSrc,
            rid: c.rid
          }
        } else if (c.children) {
          const newChild = updateFiles(c.children, rid);
          return {
            fileName: c.fileName,
            rid: c.rid,
            rawSrc: null,
            children: newChild
          }
        } else {
          return c;
        }
      });
    }

    const newFiles = updateFiles(state.workState.files, state.rid);
    const newPairFiles: CodeFile[] = state.pairWorkState.files.map((v,i) => {
        return {
          rid: "",
          fileName: v.fileName,
          rawSrc: v.rawSrc,
          isDir: v.isDir,
          children: v.children.map((f,i) => {
            if (f.fileName == state.fileName && !state.isHome) {
              return {
                rid: "",
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

    let newWd = action.payload.workState.wd;
    let newPairWd = state.pairWorkState.wd;
    if (action.payload.pairWorkState) {
      newPairWd = action.payload.pairWorkState.wd;
    }
    return {
      rawSrc: action.payload.rawSrc,
      isHome: action.payload.isHome,
      fileName: action.payload.fileName,
      rid: action.payload.rid,
      consoleSrc: state.consoleSrc,
      extraArgs: state.extraArgs,
      workState: {
        root: state.workState.root,
        wd: newWd,
        files: newFiles
      },
      pairWorkState: {
        root: state.pairWorkState.root,
        wd: newPairWd,
        files: newPairFiles,
        isSlave: state.pairWorkState.isSlave
      },
      authState: state.authState
    };
  },
  [Actions.LOCK_GRANTED]: (state, action) => {
    const newSrc = state.rawSrc;
    return {
        rawSrc: newSrc,
        isHome: state.isHome,
        fileName: state.fileName,
        consoleSrc: state.consoleSrc,
        rid: state.rid,
        extraArgs: state.extraArgs,
        workState: state.workState,
        pairWorkState: {
          wd: state.pairWorkState.wd,
          isSlave: action.payload.pairWorkState.isSlave,
          files: state.pairWorkState.files
        },
        authState: state.authState
    }
  },
  [Actions.INIT_APP]: (state, action) => {
    const { workState } = action.payload;
    if (workState.files.length > 0) {
      const top = workState.files[0];
      return {
        rawSrc: top.rawSrc,
        isHome: state.isHome,
        fileName: top.fileName,
        rid: top.rid,
        consoleSrc: state.consoleSrc,
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
        rid: state.rid,
        consoleSrc: state.consoleSrc,
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
      rid: state.rid,
      consoleSrc: state.consoleSrc,
      extraArgs: state.extraArgs,
      workState: workState,
      pairWorkState: state.pairWorkState,
      authState: authState
    }
  }
}, initialState);
