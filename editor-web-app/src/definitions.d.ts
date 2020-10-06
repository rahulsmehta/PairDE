
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
  rid: string;
  rawSrc: string;
  fileName: string;
  compileId?: string;
  isDir?: boolean;
  children?: CodeFile[];
}

declare type WorkState = {
  root?: string;
  wd: string;
  files: CodeFile[];
  isSlave?: boolean;
}

declare type AuthState = {
  user?: string;
  isAuthenticated: boolean;
  ticket?: string;
}

declare type CodePanelData = {
  rawSrc: string;
  isHome: boolean;
  rid: string;
  fileName?: string;
  consoleSrc?: string;
  extraArgs: string[];
  workState: WorkState;
  pairWorkState: WorkState;
  authState: AuthState;
}

declare type CodePanelState = CodePanelData;

declare type TodoItemId = number;

declare type TodoFilterType = 'SHOW_ALL' | 'SHOW_ACTIVE' | 'SHOW_COMPLETED';

// declare type TodoStoreState = TodoItemData[];
