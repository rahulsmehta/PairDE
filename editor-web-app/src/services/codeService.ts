import {encode, decode} from 'base-64';
import * as EditorActions from '../actions/editor';
import {AppToaster} from './toaster';
import * as storageService from './storageService';
import {Intent} from '@blueprintjs/core';
import * as Utils from '../utils';
export const CODE_SERVICE_URL = Utils.isProd() ?
  "http://ec2-34-207-206-82.compute-1.amazonaws.com:5000/" : "http://localhost:5000/"

function getUuidAndFile(files: CodeFile[], fileName: string){
  const result = visitFiles(files, fileName);
  const path = result[0].split('/');
  return {
    uuid: path[2],
    className: path[3]
  };
}
function visitFiles(files: CodeFile[], rid: string) {
  let r = files.map(c => {
    if (c.rid == rid) {
      return c.compileId;
    } else if (c.children) {
      let res = visitFiles(c.children, rid);
      res = res.filter(v => v != null);
      return res[0];
    } else {
      return null;
    }
  })
  r = r.filter(v => v != null);
  return r;
}

function getUuidAndFilePair(files: CodeFile[], fileName: string){
  const childArrs: CodeFile[][] = files.map((f,i) => {
    return f.children;
  });
  const childNodes = childArrs.reduce((l,cf) => {
    return l.concat(cf)
  })
  const f = childNodes.filter((fn) => {
    return fn.fileName == fileName;
  });
  const path = f[0].compileId.split('/');
  return {
    uuid: path[2],
    className: path[3]
  };
}

export async function validateTicket (ticket: string, props: CodePanelData,
  actions: typeof EditorActions) {
  const url = CODE_SERVICE_URL + 'validate/' + ticket;
  return fetch(url, {
    method: 'GET'
  }).then(response => response.text()).then((user) => {
    if (user != "failure"){
      const listUrl = storageService.STORAGE_SERVICE_URL + 'list-full/' + user;
      return fetch (listUrl, {
        method: 'GET'
      }).then(response => response.text()).then(responseText => {
        const files = JSON.parse(responseText);
        const newFiles = files.map((c) => {
          return {
            fileName: c.fileName,
            rawSrc: decode(c.rawSrc)
          }
        });
        const obj = ({
          workState: {
            files: newFiles,
            wd:'/' + user + '/'
          },
          authState: {
            isAuthenticated: true,
            user: user,
            ticket: ticket
          }});
          return new Promise<string>((res, rej) => {
            res(JSON.stringify(obj));
          });
        });
    }
  });
}

export function run (props: CodePanelData, actions: typeof EditorActions) {
  const validateArgs = (args) => {
    return (args.indexOf('>') == -1) && (args.indexOf('<') == -1);
  }
  const {workState, pairWorkState} = props;
  const {uuid,className} = props.isHome ? getUuidAndFile(workState.files, props.rid) :
    getUuidAndFilePair(pairWorkState.files, props.fileName);
  const url = CODE_SERVICE_URL + 'run/' + uuid + '/' + className;
  if (!validateArgs(props.extraArgs)) {
    AppToaster.show({
      intent: Intent.DANGER,
      message: "Invalid command line arguments"
    });
    return;
  }
  fetch(url,{
    method: 'POST',
    body: JSON.stringify ({
      extra_args: props.extraArgs
    })
  }).then(response => response.text()).then((responseText) => {
    actions.runFile({
      consoleSrc: responseText
    });
  });
}

export function compile (props: CodePanelData, actions: typeof EditorActions) {
    let path = "";
    if (props.isHome)
      path = props.workState.wd + props.fileName;
    else
      path = props.pairWorkState.wd + props.fileName;
    fetch(CODE_SERVICE_URL + "compile" + path,{
      method: 'POST',
      body: JSON.stringify({
        encoded_src: encode(props.rawSrc),
        file_name: props.fileName
      })
    }).then(r => r.text()).then((resp) => {
      const {compiler_errors, class_path} = JSON.parse(resp);
      const updateCompileId = (files: CodeFile[]): CodeFile[] => {
        return files.map((c) => {
          if (c.rid == props.rid) {
            console.log('updating ' + c.fileName);
            let result = c;
            result['compileId'] = class_path;
            return result;
          } else if (c.children) {
            let result = c;
            result['children'] = updateCompileId(c.children);
            return result;
          } else {
            return c;
          }
        });
      }
      const updatedFiles = updateCompileId(props.workState.files);
      /* props.workState.files.map((c: CodeFile, i) => {
        if (c.rid == props.rid && props.isHome) {
          return {
            rawSrc: c.rawSrc,
            fileName: c.fileName,
            compileId: class_path,
            rid: c.rid
          }
        } else if (c.children) {
          let result = c;

        }
        else {
          return c;
        }
      }); */
      const updatedPairFiles: CodeFile[] = props.pairWorkState.files.map((v, i) => {
        return {
          rid: "",
          fileName: v.fileName,
          rawSrc: v.rawSrc,
          isDir: v.isDir,
          children: v.children.map((f,i) => {
            if (f.fileName == props.fileName && !props.isHome) {
              return {
                rid: "",
                fileName: f.fileName,
                rawSrc: f.rawSrc,
                compileId: class_path
              }
            } else {
              return f;
            }
          })
        }

      });
      actions.compileFile({
          rawSrc: props.rawSrc,
          fileName: props.fileName,
          consoleSrc: compiler_errors ? compiler_errors :
            "Sucessfully compiled " + props.fileName,
          workState: {
            root: props.workState.root,
            wd: props.workState.wd,
            files: updatedFiles
          },
          pairWorkState: {
            wd: props.pairWorkState.wd,
            files: updatedPairFiles,
            isSlave: props.pairWorkState.isSlave
          }
        });
      }
    , error => actions.compileFile({
          rawSrc: props.rawSrc,
          fileName: props.fileName,
          consoleSrc: "Oops! Something went wrong. Please try again."
    }));
  }
