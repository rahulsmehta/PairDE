
declare interface SaveFileRequest {
  fileName: string;
  encodedSrc: string;
  rid?: string;
}

declare interface CompileFileRequest {
  fileName: string;
  encodedSrc: string;
  rid?: string;
}

declare interface RunFileRequest {
  rid: string;
}

declare type CodeFile  = {
  rawSrc: string;
  fileName: string;
  compileId?: string;
}

declare type WorkState = {
  wd: string;
  files: CodeFile[];
}

declare type AuthState = {
  user?: string;
  isAuthenticated: boolean;
  ticket?: string;
}

declare type CodePanelData = {
  rawSrc: string;
  fileName?: string;
  consoleSrc?: string;
  otherFiles: CodeFile[];
  extraArgs: string[];
  workState: WorkState;
  authState: AuthState;
}

declare type CodePanelState = CodePanelData;

declare type TodoItemId = number;

declare type TodoFilterType = 'SHOW_ALL' | 'SHOW_ACTIVE' | 'SHOW_COMPLETED';

// declare type TodoStoreState = TodoItemData[];
