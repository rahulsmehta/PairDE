import { createAction } from 'redux-actions';
import * as Actions from '../constants/actions';

export const saveFile = createAction<CodePanelData>(Actions.SAVE_FILE);
export const compileFile = createAction<CodePanelData>(Actions.COMPILE_FILE);
export const runFile = createAction<CodePanelData>(Actions.RUN_FILE);
export const deleteFile = createAction<CodePanelData>(Actions.DELETE_FILE);
export const createFile = createAction<CodePanelData>(Actions.CREATE_FILE);

export const updateSrc = createAction<CodePanelData>(Actions.UPDATE_SRC);
export const consoleUpdated = createAction<CodePanelData>(Actions.CONSOLE_UPDATED);

export const renameCurrent = createAction<CodePanelData>(Actions.RENAME_CURRENT);

export const argChange = createAction<CodePanelData>(Actions.ARG_CHANGE);

export const initApp = createAction<CodePanelData>(Actions.INIT_APP);

export const changeSrcFile = createAction<CodePanelData>(Actions.CHANGE_SRC_FILE);
