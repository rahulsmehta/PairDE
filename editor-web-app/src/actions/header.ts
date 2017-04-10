import { createAction } from 'redux-actions';
import * as Actions from '../constants/actions';

export const saveFile = createAction<SaveFileRequest>(Actions.SAVE_FILE);
export const compileFile = createAction<CompileFileRequest>(Actions.COMPILE_FILE);
export const runFile = createAction<RunFileRequest>(Actions.RUN_FILE);
