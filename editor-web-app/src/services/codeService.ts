import {encode, decode} from 'base-64';
import * as EditorActions from '../actions/editor';
export const CODE_SERVICE_URL = "http://localhost:5000/"

function getUuidAndFile(files: CodeFile[], fileName: string){
  const result = files.filter((c: CodeFile, i) => {
    return c.fileName == fileName;
  });
  const path = result[0].compileId.split('/');
  return {
    uuid: path[2],
    className: path[3]
  };
}

export function run (props: CodePanelData, actions: typeof EditorActions) {
  const {uuid,className} = getUuidAndFile(props.otherFiles, props.fileName);
  const url = CODE_SERVICE_URL + 'run/' + uuid + '/' + className;
  fetch(url,{
    method: 'POST',
    body: JSON.stringify ({
      extra_args: props.extraArgs
    })
  }).then(response => response.text()).then((responseText) => {
    // alert(responseText);
    actions.runFile({
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
        } else {
          return c;
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
