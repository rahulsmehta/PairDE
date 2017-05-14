import * as React from 'react';
import * as classNames from "classnames";
import * as EditorActions from '../../actions/editor';
import { AppToaster } from '../../services/toaster';
import * as codeService from "../../services/codeService";
import { Breadcrumb, Classes, Button, ITreeNode, Tree, Tooltip,
         Position, Intent, Popover, EditableText} from "@blueprintjs/core";


interface ITreeViewProps{
  root: CodeFile;
  selected: string; //file or directory rid
  isHome: boolean;
  actions: typeof EditorActions;
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

  private getWdRec (cwd: string, rid: string, node: CodeFile): string {
    if(node.rid == rid && this.isDir(node.fileName)) {
      let newCwd = cwd + node.fileName;
      if (newCwd.charAt(newCwd.length - 1) != '/')
        newCwd += '/'
      return newCwd;
    } else if (node.rid == rid && !this.isDir(node.fileName)) {
      let newCwd = cwd;
      if (cwd.charAt(cwd.length - 1) != '/')
        newCwd += '/'
      return newCwd;
    } else if (node.children) {
      //if node.children.length > 0 then is a directory
      const childNodes = node.children;
      const newCwd = cwd + node.fileName;
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

  private getWd(fileRid: string): string {
    const root = this.props.root;
    return this.getWdRec("", fileRid, root);
  }

  private getFileRec (rid: string, node: CodeFile): CodeFile {
    if(node.rid == rid && this.isDir(node.fileName)) {
      return node;
    } else if (node.rid == rid && !this.isDir(node.fileName)) {
      return node;
    } else if (node.children) {
      //if node.children.length > 0 then is a directory
      const childNodes = node.children;
      let result = childNodes.map((childFile: CodeFile) => {
        return this.getFileRec(rid, childFile);
      });
      result = result.filter((f) => {
        return f != null;
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

  private getFile(fileRid: string): CodeFile {
    const root = this.props.root;
    return this.getFileRec(fileRid, root);
  }

  private buildTreeView (root: CodeFile): ITreeNode[] {
    let rootNode = this.buildTreeViewRec(root);
    return [rootNode];
  }

  private buildTreeViewRec (node: CodeFile): ITreeNode {
    let resultNode: ITreeNode = null;
    if (!node.fileName) {
      resultNode = {
        id: node.rid,
        label: this.props.root.fileName,
        hasCaret: true,
        iconName: 'folder-close',
        isExpanded: true
      }
    } else {
      const isCode = (node.fileName.indexOf('.java') != -1);
      const icon = isCode ? 'code' : 'folder-close';
      resultNode = {
        id: node.rid,
        label: node.fileName,
        hasCaret: !isCode,
        iconName: icon,
        isExpanded: true
      }
    }
    if (this.props.selected == node.rid && this.props.isHome)
      resultNode['isSelected'] = true;
    if (node.children) {
      let childNodes: ITreeNode[] = node.children.map((cf) => {
        return this.buildTreeViewRec(cf);
      });
      resultNode['childNodes'] = childNodes;
      return resultNode;
    } else {
      return resultNode;
    }
  }


  render() {
    const nodes = this.buildTreeView(this.props.root);
    const { actions } = this.props;
    return (
      <Tree
        contents = {nodes}
        onNodeClick = {((node, _) => {
          const rid = node.id.toString();
          const codeFile = this.getFile(rid);
          const wd = this.getWd(rid);
          const src = codeFile.rawSrc;

          if (src != null) { //is a code file
            actions.changeSrcFile({
              fileName: node.label,
              rawSrc: src,
              isHome: true,
              rid: rid,
              workState: {
                wd: wd
              }
            });
          } else {
            if (node.id != 'root'){
              actions.changeSrcFile({
                fileName: node.label,
                rawSrc: null,
                isHome: true,
                rid: rid,
                workState: {
                  wd: wd
                }
              });
            }
          }
        })}
      />
    )

  }

}

export default TreeView;
