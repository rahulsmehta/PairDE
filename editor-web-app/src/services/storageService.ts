import {encode, decode} from 'base-64';
import * as EditorActions from '../actions/editor';

import { Intent } from "@blueprintjs/core";
import { AppToaster } from "./toaster";

import * as Utils from '../utils';
export const STORAGE_SERVICE_URL = Utils.isProd() ?
  "http://ec2-34-207-206-82.compute-1.amazonaws.com:4000/" : "http://localhost:4000/";

const fixPath = (url) => {
  if(url.charAt(url.length-1) == '/' && url.length > 1)
    return url.substring(0,url.length)
  else
    return url
}

export function create(path: string, isDir: boolean, rawSrc: string,
  actions: typeof EditorActions) {

  const url = STORAGE_SERVICE_URL + 'create-path' + path;
  const tokens = path.split('/');
  const fn = tokens[tokens.length-1];
  fetch(url, {
    method: 'POST',
    body: JSON.stringify({
      isDir: isDir,
      contents: ''
    })
  }).then(response => response.text()).then(responseText => {
    if(responseText == 'success'){
      actions.createFile({
        fileName: fn,
        rawSrc: rawSrc
      });
    }
    else if(responseText == "file already exists") {
      AppToaster.show({
        message: "Resource already exists!",
        intent: Intent.DANGER,
        iconName: "edit"
      })
    }
    else {
      AppToaster.show({
        message: "Failed to create " + fn + "!",
        intent: Intent.DANGER,
        iconName: "cross"
      })
    }
  })
}

export function deleteFile(path: string, actions: typeof EditorActions) {
  const url = STORAGE_SERVICE_URL + 'delete-path' + path;
  fetch(url, {
    method: 'DELETE'
  }).then(response => response.text()).then(responseText => {
    const responseBody = JSON.parse(responseText);
    if(responseBody['n'] == 1) {
      const tokens = path.split('/');
      const fn = tokens[tokens.length-1];
      actions.deleteFile({
        fileName: fn
      });
    }
  })
}

export function renameFile(path: string, newName: string, actions: typeof EditorActions){
      const url = fixPath(STORAGE_SERVICE_URL + 'rename-path' + path);
      fetch(url, {
        method: 'POST',
        body: JSON.stringify({
          newName: newName
        })
      }).then(response => response.text()).then(responseText => {
        if(responseText == 'success'){
          actions.renameCurrent({
            fileName: newName
          });
        }
        else if(responseText == "file already exists") {
          AppToaster.show({
            message: "File already exists!",
            intent: Intent.DANGER,
            iconName: "edit"
          })
        }
      })
    }

export function saveFile(path: string, contents: string, actions: typeof EditorActions,
    props: CodePanelData) {
      const url = STORAGE_SERVICE_URL + 'update-path' + path;
      fetch(url, {
        method: 'POST',
        body: JSON.stringify({
          contents: encode(contents)
        })
      }).then(response => response.text()).then(responseText => {
        if (responseText == 'success') {
          AppToaster.show({
            message: "Saved successfully!",
            intent: Intent.SUCCESS,
            iconName: "floppy-disk"
          });
        } else {
          AppToaster.show({
            message: "Something went wrong",
            intent: Intent.DANGER,
            iconName: "floppy-disk"
          });
        }
      })
    }


export function listPath(path: string, props: CodePanelData) {
  let url = fixPath(STORAGE_SERVICE_URL + 'list-full' + path);
  return fetch (url, {
    method: 'GET'
  }).then(response => response.text()).then(responseText => {
    const files = JSON.parse(responseText);
    const newFiles: CodeFile[] = files.map((c) => {
      let childFiles = null;
      if (c.children) {
        childFiles = c.children;
      }
      return {
        fileName: c.fileName,
        rawSrc: c.rawSrc == null ? null : decode(c.rawSrc),
        rid: c.rid,
        children: childFiles
      }
    });
    return newFiles;
    });
}
