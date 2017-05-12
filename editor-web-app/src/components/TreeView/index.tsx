import * as React from 'react';
import * as classNames from "classnames";
import MonacoEditor from "react-monaco-editor";
import * as EditorActions from '../../actions/editor';
import { AppToaster } from '../../services/toaster';
import { Intent } from '@blueprintjs/core';
// const io = require('socket.io-client');


interface ITreeViewProps{
  root: CodeFile;
  selected: string; //file or directory rid
}

// interface ITreeViewState {
//   isSlave: boolean;
//   // socket: SocketIOClient.Socket
// }

class TreeView extends React.Component<ITreeViewProps,{}> {


  constructor(props?: ITreeViewProps, context?: any) {
    super(props, context);
  }

  componentDidMount() {}

  private isDir = (fn: string) => {
    const re = new RegExp('^[A-Za-z0-9_]*$');
    let toTest = fn.replace('/','').replace('/','');
    return re.test(toTest) && toTest.length > 0;
  }

  private getWdRec = (cwd: string, rid: string, node: CodeFile): string => {
    if(node.rid == rid && this.isDir(node.fileName)) {
      return cwd + node.fileName + '/';
    } else if (node.rid == rid && !this.isDir(node.fileName)) {
      return cwd;
    } else if (node.children.length > 0) {
      //if node.children.length > 0 then is a directory
      const childNodes = node.children;
      const newCwd = cwd + node.fileName + '/'
      let result = childNodes.map((childFile: CodeFile) => {
        return this.getWdRec(newCwd, rid, childFile);
      });
      result = result.filter((wd: string) => {
        return wd != null;
      });
      if (result.length > 0) {
        return result[0];
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  getWd(fileRid: string) {
    const root = this.props.root;
    const cwd = root.fileName + '/';
    return this.getWdRec(cwd, fileRid, root);
  }


  render() {
    // in the onNodeClick handler in the treeview component,
    // dispatch the CHANGE_FILE event after calling getWd on the
    // particular file - then this can be caught in the reducer
  }

}

export default TreeView;
