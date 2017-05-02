import {encode, decode} from 'base-64';
import * as EditorActions from '../actions/editor';
export const STORAGE_SERVICE_URL = "http://localhost:4000/"

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
          alert('Save successful!');
        } else {
          alert('Something went wrong');
        }
      })
    }

export function listPath(path: string, actions: typeof EditorActions, props: CodePanelData) {
  const url = STORAGE_SERVICE_URL + 'list-path' + path;
  const fileUrl = STORAGE_SERVICE_URL + 'load-rid/';
  const grabContent = url => fetch(url)
    .then(res => res.text()).then(obj => {
      return obj;
    })
  fetch(url, {
    method: 'GET'
  }).then(response => response.text()).then((responseText) => {
    const rids: string[] = JSON.parse(responseText);
    const urls: string[] = rids.map((rid) => {
      return fileUrl + rid;
    });
    Promise.all(urls.map(grabContent)).then((val) => {
      const objs = val.map(v => JSON.parse(v));
      const newFiles = objs.map((v,i) => {
        return {
          rawSrc: decode(v['contents']),
          fileName: v['name']
        };
      })
      actions.initApp({
        workState: {
          wd: props.workState.wd,
          files: newFiles
        }
      })
    });

  });
}
