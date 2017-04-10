
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


declare type TodoItemId = number;

declare type TodoFilterType = 'SHOW_ALL' | 'SHOW_ACTIVE' | 'SHOW_COMPLETED';

// declare type TodoStoreState = TodoItemData[];
