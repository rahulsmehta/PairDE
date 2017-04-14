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

export function compile (props: CodePanelData, actions: typeof EditorActions) {
    fetch(CODE_SERVICE_URL + "compile",{
      method: 'POST',
      body: JSON.stringify({
        encoded_src: encode(props.rawSrc),
        file_name: props.fileName
      })
    }).then(r => r.text()).then((resp) => {
      const {compiler_errors, class_path} = JSON.parse(resp);
      const updatedFiles = props.otherFiles.map((c: CodeFile, i) => {
        if (c.fileName == props.fileName) {
          return {
            rawSrc: c.rawSrc,
            fileName: c.fileName,
            compileId: class_path
          }
        }
      });
      actions.compileFile({
          rawSrc: props.rawSrc,
          fileName: props.fileName,
          consoleSrc: compiler_errors ? compiler_errors : "Compilation successful",
          otherFiles: updatedFiles
        });
      }
    , error => actions.compileFile({
          rawSrc: props.rawSrc,
          fileName: props.fileName,
          consoleSrc: "Oops! Something went wrong. Please try again."
    }));
  }
