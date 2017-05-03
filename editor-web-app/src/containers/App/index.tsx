import * as React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as classNames from "classnames";
import { RootState } from '../../reducers';
import * as EditorActions from '../../actions/editor';

import * as codeService from '../../services/codeService';
import * as storageService from '../../services/storageService';

import Editor from "../../components/Editor";
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
    storageService.listPath(workState.wd, actions, editor);
  }

  render() {
    const { editor, actions, children } = this.props;
    const workState = editor.workState;
    const fileNodes: ITreeNode[] = workState.files.map((c: CodeFile, i) => {
      const isDir = (c.fileName.indexOf('.java') != -1);
      const icon = isDir ? 'code' : 'folder-close';
      let result = {
        hasCaret: !isDir,
        iconName: icon,
        label: c.fileName,
        id: i
      }
      if (editor.fileName == c.fileName) {
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

    return (
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
                    rawSrc: getSrc(node.label)
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
          <Editor src={editor.rawSrc} actions={actions}
            isEmpty={editor.workState.files.length == 0}
          />
          <Console src={editor.consoleSrc} />
          </PanelGroup>

        </PanelGroup>
      </div>
    );
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
