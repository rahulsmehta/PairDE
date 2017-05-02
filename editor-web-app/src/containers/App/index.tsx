import * as React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as classNames from "classnames";
import { RootState } from '../../reducers';
import * as EditorActions from '../../actions/editor';
import * as codeService from '../../services/codeService';
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

  render() {
    const { editor, actions, children } = this.props;
    const treeNodes: ITreeNode[] = editor.otherFiles.map((c: CodeFile, i) => {
      return {hasCaret: false, iconName: "code",
            label: c.fileName, id: i}
    });

    return (
      <div className = {classNames(style.default, "pt-app")} >
        <Navbar actions={actions}
          codeService={codeService}
          editor={editor}
        />

        <PanelGroup
          id = "split-panel"
          borderColor="darkgray"
          spacing={5}
          panelWidths={[
            {size: 200, minSize:0, resize: "dynamic"},
          ]}
        >
          <div>
            <Tree contents = {treeNodes} />
          </div>
          <PanelGroup
            direction = "column"
            id = "console-panel"
            borderColor = "darkgray"
            spacing = {5}
            panelWidths = {[
              {size: 400, minSize: 0, resize: "dynamic"}
            ]}
          >
          <Editor src={editor.rawSrc} actions={actions}
            isEmpty={editor.workState.files.size == 0}
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
