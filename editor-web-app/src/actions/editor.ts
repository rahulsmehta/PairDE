import { createAction } from 'redux-actions';
import * as Actions from '../constants/actions';

export const saveFile = createAction<CodePanelData>(Actions.SAVE_FILE);
export const compileFile = createAction<CodePanelData>(Actions.COMPILE_FILE);
export const runFile = createAction<CodePanelData>(Actions.RUN_FILE);

export const updateSrc = createAction<CodePanelData>(Actions.UPDATE_SRC);

export const consoleUpdated = createAction<CodePanelData>(Actions.CONSOLE_UPDATED);
