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
    const isDir = (fn) => {
      const re = new RegExp('^[A-Za-z0-9_]*$');
      let toTest = fn.replace('/','').replace('/','');
      return re.test(toTest) && toTest.length > 0;
    }
    const renameFileRec = (files: CodeFile[], rid: string): CodeFile[] => {
      return files.map(c => {
        if (c.rid == rid) {
          let newFile = c;
          c.fileName = action.payload.fileName;
          return c;
        } else if (isDir(c.fileName)) {
          let newFile = c;
          let newChildren = renameFileRec(c.children, rid);
          newFile.children = newChildren;
          return newFile;
        } else {
          return c;
        }
      });
    }
    const updatedFiles: CodeFile[] = renameFileRec(state.workState.files, state.rid);
    let newWd = state.workState.wd;
    if (isDir(action.payload.fileName)) {
      //update wd
      let tokens = newWd.split('/');
      tokens[tokens.length-2] = action.payload.fileName;
      newWd = tokens.join('/');
    }
    //todo: above, make it recursive to rename stuff nested within dirs,
    //todo #2: when renaming a directory, update the working dir as well
    return {
      rawSrc: state.rawSrc,
      isHome: state.isHome,
      fileName: action.payload.fileName,
      rid: state.rid,
      consoleSrc: state.consoleSrc,
      extraArgs: state.extraArgs,
      workState: {
        wd: newWd,
        files: updatedFiles,
        root: state.workState.root
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
    const isDir = (fn) => {
      const re = new RegExp('^[A-Za-z0-9_]*$');
      let toTest = fn.replace('/','').replace('/','');
      return re.test(toTest) && toTest.length > 0;
    }
    const toInsert: CodeFile = {
      rid: action.payload.rid,
      fileName: action.payload.fileName,
      rawSrc: ''
    };
    const updateFiles = (files: CodeFile[], rid: string): CodeFile[] => {
      return files.map(c => {
        if (c.rid == rid) {
          return {
            fileName: c.fileName,
            compileId: c.compileId,
            rawSrc: action.payload.rawSrc,
            rid: c.rid,
            children: c.children
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
    // so we want to insert toInsert in the CodeFile
    // corresponding to state.workState.wd
    const insertFileRec = (files: CodeFile[], cwd: string): CodeFile[] => {
      if (cwd == state.workState.wd){
        let newFiles = files;
        if (!newFiles)
          newFiles = []
        newFiles.push(toInsert);
        return newFiles;
      } else {
        return files.map(c => {
          if (isDir(c.fileName)) {
            const newWd = cwd + c.fileName + '/';
            const newChild = insertFileRec(c.children, newWd);
            let newDir = c;
            newDir.children = newChild;
            return newDir;
          } else {
            return c;
          }
        });
      }
    }
    let newFiles = updateFiles(state.workState.files, state.rid);
    newFiles = insertFileRec(newFiles, state.workState.root);
    let newWd = isDir(action.payload.fileName) ? state.workState.wd + action.payload.fileName + '/' :
      state.workState.wd;
    return {
      rawSrc: '',
      fileName: action.payload.fileName,
      isHome: state.isHome,
      rid: action.payload.rid,
      consoleSrc: state.consoleSrc,
      extraArgs: state.extraArgs,
      workState: {
        wd: newWd,
        files: newFiles,
        root: state.workState.root
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
    const isDir = (fn) => {
      const re = new RegExp('^[A-Za-z0-9_]*$');
      let toTest = fn.replace('/','').replace('/','');
      return re.test(toTest) && toTest.length > 0;
    }
    const deleteRec = (files: CodeFile[], rid) => {
      return files.filter(c => {
        if (c.rid == rid) {
          return null;
        } else if (isDir(c.fileName)) {
          const newFile = c;
          newFile.children = deleteRec(c.children, rid);
          return newFile;
        } else {
          return c;
        }
      });
    };

    const newFiles = deleteRec(state.workState.files, action.payload.rid);
    const newFile = (newFiles.length > 0) ? newFiles[0] : {
      rawSrc: '',
      fileName: '',
      rid: ''
    }
    let newWd = state.workState.root;
    // if (isDir(action.payload.fileName)) {
    //   //update wd
    //   let tokens = newWd.split('/');
    //   tokens = tokens.slice(0,tokens.length-2);
    //   tokens.push('')
    //   newWd = tokens.join('/');
    // }
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
      rid: newFile.rid,
      consoleSrc: state.consoleSrc,
      extraArgs: state.extraArgs,
      workState: {
        wd: newWd,
        files: newFiles,
        root: state.workState.root
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
            rid: c.rid,
            children: c.children
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

    const newFiles = isDir(action.payload.fileName) ?
      state.workState.files : updateFiles(state.workState.files, state.rid);
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
