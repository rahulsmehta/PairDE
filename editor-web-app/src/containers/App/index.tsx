import * as React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as classNames from "classnames";
import { RootState } from '../../reducers';
import * as EditorActions from '../../actions/editor';

import * as codeService from '../../services/codeService';
import * as storageService from '../../services/storageService';
import * as syncService from '../../services/syncService';
import * as Utils from '../../utils';

import Editor from "../../components/Editor";
import PairEditor from "../../components/PairEditor";
import Console from "../../components/Console";
import Navbar from "../../components/Navbar";



import * as style from './style.css';

import MonacoEditor from "react-monaco-editor";
const PanelGroup = require("react-panelgroup");
import { Breadcrumb, Classes, Button, ITreeNode, Tree, Tooltip,
         Position, Intent, Popover, EditableText} from "@blueprintjs/core";

const io = require('socket.io-client');
const ioPath = Utils.isProd() ? "http://ec2-34-207-206-82.compute-1.amazonaws.com:9000" : "http://localhost:9000";
let socket = io(ioPath, {transports: ['websocket']});

import { encode } from 'base-64';

interface AppProps {
  editor: CodePanelData;
  actions: typeof EditorActions;
};

interface AppState {
}

class App extends React.Component<AppProps, AppState>{

  componentDidMount() {
    const { editor, actions } = this.props;
    const workState = editor.workState;
    const tokens = window.location.href.split('ticket=');
    if (tokens.length > 1 && !editor.authState.isAuthenticated) {
      const ticket = tokens[1];
      codeService.validateTicket(ticket, editor, actions).then((str) => {
        let validateAction = JSON.parse(str);
        syncService.listShared(actions, editor, validateAction.authState.user).then((responseObj) => {
          validateAction['pairWorkState'] = {
            wd: '/shared',
            files: responseObj,
            isSlave: editor.pairWorkState.isSlave
          }
          validateAction['authState'] = {
            isAuthenticated: true,
            user: validateAction.authState.user,
            ticket: ticket
          }
          actions.initApp(validateAction);
        })
      })
    } else if (editor.authState.isAuthenticated){
      storageService.listPath(workState.wd, actions, editor);
    }
  }

  render () {
    const { editor, actions, children } = this.props;
    const { workState, pairWorkState } = editor;

    const fileNodes: ITreeNode[] = workState.files.map((c: CodeFile, i) => {
      const isDir = (c.fileName.indexOf('.java') != -1);
      const icon = isDir ? 'code' : 'folder-close';
      let result = {
        hasCaret: !isDir,
        iconName: icon,
        label: c.fileName,
        id: i
      }
      if (editor.fileName == c.fileName && editor.isHome) {
        result['isSelected'] = true;
      }
      return result;
    });
    const treeNodes: ITreeNode[] = [
      {
        hasCaret: false,
        iconName: "folder-close",
        label: workState.wd,
        id: 10,
        isExpanded: true,
        childNodes: fileNodes
      }
    ]

    const mapChildNodes = (c: CodeFile, i): ITreeNode => {
      const code = (c.isDir == undefined || !c.isDir);
      let result = {
        id: i,
        label: c.fileName,
        iconName: code ? 'code' : 'folder-close'
      }
      if ((c.fileName == editor.fileName) && !editor.isHome)
        result['isSelected'] = true;
      return result;
    };
    const pairFileNodes: ITreeNode[] = pairWorkState.files.map((file: CodeFile, i) => {
      return {
        id: i,
        label: file.fileName,
        iconName: 'folder-close',
        isExpanded: true,
        childNodes: file.children.map((c,j) => mapChildNodes(c, 10*i + j))
      }
    });



    const editorComponent = (editor.isHome) ? (
      <Editor src={editor.rawSrc} actions={actions}
        isEmpty={editor.workState.files.length == 0}
      />
    ) : (
      <PairEditor src={editor.rawSrc} actions={actions}
        isEmpty={false}
        isSlave={editor.pairWorkState.isSlave}
        fileName={editor.fileName}
        socket={socket}
      />
    )

    const defaultView = (
      <div className = {classNames(style.default, "pt-app")} >
        <Navbar actions={actions}
          codeService={codeService}
          storageService={storageService}
          editor={editor}
          isSlave={editor.pairWorkState.isSlave}
          socket={socket}
        />

        <PanelGroup
          id = "split-panel" borderColor="darkgray" spacing={5}
          panelWidths={[{size: 240, minSize:0, resize: "dynamic"},]}
          style={{paddingLeft: "10px"}}
        >
          <div style={{paddingLeft: 5}}>
            <b>My Documents</b>
            <Tree
              contents = {treeNodes}
              onNodeClick = {((node, _) => {
                const getSrc = fileName => {
                  const f = workState.files.filter((fn) => {
                    return fn.fileName == node.label;
                  });
                  return {src: f[0].rawSrc, id: node.id};
                }
                if (node.iconName == 'code'){
                  const {src} = getSrc(node.label);
                  actions.changeSrcFile({
                    fileName: node.label,
                    rawSrc: src,
                    isHome: true
                  });
                }
                else
                  alert('Dir!');
              })}
            />

            <br />
            <b>Partner Assignments</b>
            <Tree
              contents = {pairFileNodes}
              onNodeClick = {((node, _) => {
                const getSrc = fileName => {
                  const childArrs: CodeFile[][] = pairWorkState.files.map((f,i) => {
                    return f.children;
                  });
                  const childNodes = childArrs.reduce((l,cf) => {
                    return l.concat(cf)
                  })
                  const f = childNodes.filter((fn) => {
                    return fn.fileName == node.label;
                  });
                  return {src: f[0].rawSrc, id: node.id};
                }
                if (node.iconName == 'code'){
                  const {src, id} = getSrc(node.label);
                  const parentIdx = (Math.floor(parseInt(id.toString())/10));
                  const parentDir = '/shared/' + pairWorkState.files[parentIdx].fileName + '/';
                  actions.changeSrcFile({
                    fileName: node.label,
                    rawSrc: src,
                    isHome: false,
                    pairWorkState: {
                      wd: parentDir,
                    }
                  });
                }
                else
                  alert('Dir!');
              })}
            />
          </div>
          <PanelGroup direction = "column" id = "console-panel" borderColor = "darkgray"
            spacing = {5}
            panelWidths = {[{size: 400, minSize: 0, resize: "dynamic"}]}
          >
          {editorComponent}
          <Console src={editor.consoleSrc} />
          </PanelGroup>

        </PanelGroup>
      </div>
    );
    return defaultView;
  }
}


function mapStateToProps(state: RootState) {
  return {
    editor: state.editor
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(EditorActions as any, dispatch)
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
