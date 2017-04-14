import {encode, decode} from 'base-64';
import * as EditorActions from '../actions/editor';
export const CODE_SERVICE_URL = "http://localhost:5000/"

export function run (uuid: string, className: string, actions: typeof EditorActions) {
  fetch('http://localhost:5000/ping',{
    method: 'GET'
  }).then(response => response.text()).then((responseText) => {
    alert(responseText);
    actions.compileFile({
      rawSrc: responseText,
      fileName: 'HelloWorld.java',
      consoleSrc: responseText
    });
  });
}

export function compile (src: string, fn: string, actions: typeof EditorActions) {
    fetch(CODE_SERVICE_URL + "compile",{
      method: 'POST',
      body: JSON.stringify({
        encoded_src: encode(src),
        file_name: fn
      })
    }).then(r => r.text()).then((resp) => {
      const err = JSON.parse(resp).compiler_errors;
      actions.compileFile({
          rawSrc: src,
          fileName: fn,
          consoleSrc: err ? err : "Compilation successful"
        });
      }
    , error => actions.compileFile({
          rawSrc: src,
          fileName: fn,
          consoleSrc: "Oops! Something went wrong. Please try again."
    }));
  }
