import {encode, decode} from 'base-64';
import * as EditorActions from '../actions/editor';

import { Intent } from "@blueprintjs/core";
import { AppToaster } from "./toaster";

export const SYNC_SERVICE_URL = "http://localhost:7000/"


export function listShared(actions: typeof EditorActions, props: CodePanelData, user: string) {
  let url = SYNC_SERVICE_URL + 'list-shared/' + user;
  return fetch (url, {
    method: 'GET'
  }).then(response => response.text()).then(responseText => {
    const files = JSON.parse(responseText);
    return files;
    });
  //   actions.initApp({
  //     workState: {
  //       wd: props.workState.wd,
  //       files: newFiles
  //     },
  //     authState: props.authState
  //   });
  // });
}
