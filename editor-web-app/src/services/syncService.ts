import {encode, decode} from 'base-64';
import * as EditorActions from '../actions/editor';

import { Intent } from "@blueprintjs/core";
import { AppToaster } from "./toaster";

import * as Utils from '../utils';
export const SYNC_SERVICE_URL = Utils.isProd() ?
  "http://ec2-34-207-206-82.compute-1.amazonaws.com:9000/" : "http://localhost:9000/"


export function listShared(actions: typeof EditorActions, props: CodePanelData, user: string) {
  let url = SYNC_SERVICE_URL + 'list-shared/' + user;
  return fetch (url, {
    method: 'GET'
  }).then(response => response.text()).then(responseText => {
    const files: CodeFile[] = JSON.parse(responseText);
    const decodedFiles:CodeFile[] = files.map((c,i) => {
      return {
          rid: c.rid,
          fileName: c.fileName,
          rawSrc: c.rawSrc,
          isDir: c.isDir,
          children: c.children.map((f,i) => {
            return {
              fileName: f.fileName,
              rawSrc: f.rawSrc == null ? null : decode(f.rawSrc),
              isDir: f.isDir,
              rid: f.rid
            }
          })
      }
    })
    return decodedFiles;
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
