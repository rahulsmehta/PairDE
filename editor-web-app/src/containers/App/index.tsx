import * as React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as classNames from "classnames";
import { RootState } from '../../reducers';
import * as EditorActions from '../../actions/editor';

import * as codeService from '../../services/codeService';
import * as storageService from '../../services/storageService';
import * as syncService from '../../services/syncService';

import Editor from "../../components/Editor";
import PairEditor from "../../components/PairEditor";
import Console from "../../components/Console";
import Navbar from "../../components/Navbar";


import * as style from './style.css';

import MonacoEditor from "react-monaco-editor";
const PanelGroup = require("react-panelgroup");
import { Breadcrumb, Classes, Button, ITreeNode, Tree, Tooltip,
         Position, Intent, Popover, EditableText} from "@blueprintjs/core";

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
            files: responseObj
          }
          actions.initApp(validateAction);
        })
      })
    } else if (editor.authState.isAuthenticated){
      storageService.listPath(workState.wd, actions, editor);
    }
  }

  renderAuthView(){
    return (
      <div className = {classNames(style.default, "pt-app")} >
        <div className="pt-non-ideal-state">
          <div className="pt-non-ideal-state-visual pt-non-ideal-state-icon">
          <span className="pt-icon pt-icon-user"></span>
        </div>
          <h4 className="pt-non-ideal-state-title">You are not signed in!</h4>
          <div className="pt-non-ideal-state-description">
            <a className={"pt-button pt-intent-primary"}
              href={"https://fed.princeton.edu/cas/login?service=http%3A%2F%2Flocalhost%3A3000%2F"}>
              Login with CAS </a>
          </div>
        </div>
      </div>
    );
  }

    render() {
      if (!this.props.editor.authState.isAuthenticated) {
        return this.renderAuthView();
      } else {
        return this.renderDefaultView();
      }
    }

  renderDefaultView() {
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
        childNodes: file.children.map((c,i) => mapChildNodes(c, 2*i + 1))
      }
    });

    const defaultView = (
      <div className = {classNames(style.default, "pt-app")} >
        <Navbar actions={actions}
          codeService={codeService}
          storageService={storageService}
          editor={editor}
        />

        <PanelGroup
          id = "split-panel" borderColor="darkgray" spacing={5}
          panelWidths={[{size: 200, minSize:0, resize: "dynamic"},]}
          style={{paddingLeft: "10px"}}
        >
          <div>
            <b>My Documents</b>
            <Tree
              contents = {treeNodes}
              onNodeClick = {((node, _) => {
                const getSrc = fileName => {
                  const f = workState.files.filter((fn) => {
                    return fn.fileName == node.label;
                  });
                  return f[0].rawSrc;
                }
                if (node.iconName == 'code'){
                  actions.changeSrcFile({
                    fileName: node.label,
                    rawSrc: getSrc(node.label),
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
                  return f[0].rawSrc;
                }
                if (node.iconName == 'code'){
                  actions.changeSrcFile({
                    fileName: node.label,
                    rawSrc: getSrc(node.label),
                    isHome: false
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
          {/*<PairEditor src={editor.rawSrc} actions={actions}
            isEmpty={editor.workState.files.length == 0}
            isSlave={true}
            initialSrc={editor.rawSrc}
          />*/}
          <Editor src={editor.rawSrc} actions={actions}
            isEmpty={editor.workState.files.length == 0}
          />
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
