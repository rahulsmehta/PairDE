import * as React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as classNames from "classnames";
import { RootState } from '../../reducers';
import * as EditorActions from '../../actions/editor';
import * as codeService from '../../services/codeService';
import Editor from "../../components/Editor";

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

  formatCommandName(fileName: string, extraArgs?: string[]) {
    let result = 'java ' + fileName.replace('.java','');
    if (extraArgs.length > 0) {
      result += ' ' + extraArgs.reduce((acc, key) => {return acc + ' ' + key})
    }
    return result;
  }

  render() {
    const { editor, actions, children } = this.props;
    const treeNodes: ITreeNode[] = editor.otherFiles.map((c: CodeFile, i) => {
      return {hasCaret: false, iconName: "code",
            label: c.fileName, id: i}
    });
    const popoverValue = (args: string[]) => {
      if (args.length > 0) {
        return args.reduce((acc, key) => {return acc + ' ' + key});
      } else {
        return "";
      }
    }
    const runPopover = (
      <div>
        <input className={"pt-input"} type={"text"}
           placeholder={"Extra args..."}
           value={popoverValue(editor.extraArgs)}
           onChange={(args) => {
             actions.argChange({
              extraArgs: args.target.value.split(' ')
             });
           }}
        />
        <br />
        <br />
        <button className="pt-button"
          onClick = {() => {
            codeService.run(editor, actions);
          }}
        >{this.formatCommandName(editor.fileName, editor.extraArgs)}</button>
      </div>
    );

    let codeEditor = null;
    if (editor.otherFiles.length > 0) {
      codeEditor =
        <Editor
          src={editor.rawSrc}
          actions={actions}
        />
    } else {
      codeEditor =
      <div style = {{width: '100%', height: '100%'}}>
        <div className={"pt-non-ideal-state"}>
          <div className={"pt-non-ideal-state-visual pt-non-ideal-state-icon"}>
            <span className={"pt-icon pt-icon-folder-open"}></span>
          </div>
          <h4 className={"pt-non-ideal-state-title"}>This folder is empty</h4>
          <div className={"pt-non-ideal-state-description"}>
            Create a new file to populate the folder.
          </div>
        </div>
      </div>
    }

    const tooltipStyle = {paddingRight: "10px"};
    return (
      <div className = {classNames(style.default, "pt-app")} >
        <nav className={classNames("pt-navbar", "pt-dark")} >
          <div className="pt-navbar-group pt-align-left">
            <div className="pt-navbar-heading">
              {/* editable text used to be here */}
            </div>
          </div>
          <div className="pt-navbar-group pt-align-right" style={tooltipStyle}>
            <button className="pt-button pt-minimal pt-icon-floppy-disk">Save</button>
            <button className="pt-button pt-minimal pt-icon-build"
              onClick = {() => {
               codeService.compile(editor, actions);
              }}
            >Compile</button>
            {/*<button className="pt-button pt-minimal pt-icon-play"
              onClick = {() => {
                codeService.run(editor, actions);
              }}
            >Run</button>*/}
            <Popover
              content = {runPopover}
              popoverClassName="pt-popover-content-sizing"
              position={Position.BOTTOM}
              useSmartArrowPositioning={true}
            >
              <button className="pt-button pt-minimal pt-icon-play">Run</button>
            </Popover>
            <span className="pt-navbar-divider"></span>
            <Tooltip
              content = "No partner assigned"
              intent = {Intent.WARNING}
              position = {Position.BOTTOM}
             >
              <button className="pt-button pt-minimal pt-icon-changes pt-disabled">Switch</button>
            </Tooltip>
            <span className="pt-navbar-divider"></span>
            <Tooltip content="My Account" position = {Position.BOTTOM}>
              <button className="pt-button pt-minimal pt-icon-user"></button>
            </Tooltip>
            <Tooltip content="Settings" position = {Position.BOTTOM}>
              <button className="pt-button pt-minimal pt-icon-cog"></button>
            </Tooltip>
          </div>
        </nav>
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
          {codeEditor}
          <div style = {{width: '100%', height: '100%', backgroundColor: '#333'}} >
             <MonacoEditor
                value = {editor.consoleSrc}
                language = "markdown"
                options = {{
                  readOnly: true,
                  automaticLayout: true,
                  lineNumbers: false,
                  cursorStyle: 3
                }}
                theme = "vs-dark"
            />
          </div>
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
