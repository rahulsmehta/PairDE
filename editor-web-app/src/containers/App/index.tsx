import * as React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as classNames from "classnames";
import { RootState } from '../../reducers';
import * as EditorActions from '../../actions/editor';
import Header from "../../components/Header";

import * as style from './style.css';

import MonacoEditor from "react-monaco-editor";
const PanelGroup = require("react-panelgroup");
import { Breadcrumb, CollapsibleList, MenuItem, Classes,
         IMenuItemProps, Button, ITreeNode, Tree, Tooltip,
         Position, Intent, Popover} from "@blueprintjs/core";

interface AppProps {
  editor: CodePanelData;
  actions: typeof EditorActions;
};

interface AppState {
  /* empty */
}

class App extends React.Component<AppProps, AppState>{
  currentSrc: string;

  private renderBreadcrumb(props: IMenuItemProps) {
        if (props.href != null) {
            return <a className={Classes.BREADCRUMB}>{props.text}</a>;
        } else if (props.iconName == "code") {
          return <span className={classNames(Classes.BREADCRUMB, Classes.BREADCRUMB_CURRENT)}>{props.text}</span>;
        }
        else {
            return <span className={Classes.BREADCRUMB}>{props.text}</span>;
        }
    }

  render() {
    const { editor, actions, children } = this.props;
    const treeNodes: ITreeNode[] = [
          {hasCaret: false, iconName: "code",
            label: "AuthDecryptor.java", id: 1},
          {hasCaret: false, iconName: "code",
            label: "AuthEncryptor.java", id: 2},
          {hasCaret: false, iconName: "code",
            label: "StreamCipher.java", id: 3}
        ];
    const monacoStyle = {overflow: "hidden"};
    const tooltipStyle = {paddingRight: "10px"};
    return (
      <div className = {classNames(style.default, "pt-app")} >
        <nav className={classNames("pt-navbar", "pt-dark")} >
          <div className="pt-navbar-group pt-align-left">
            <div className="pt-navbar-heading">
              <CollapsibleList
                className = {Classes.BREADCRUMBS}
                dropdownTarget={<span className={Classes.BREADCRUMBS_COLLAPSED} />}
                renderVisibleItem={this.renderBreadcrumb}
              >
                <MenuItem iconName="folder-close" text="Assignment 2" />
                <MenuItem iconName="code" text="AuthDecryptor.java" />
              </CollapsibleList>
            </div>
          </div>
          <div className="pt-navbar-group pt-align-right" style={tooltipStyle}>
            <button className="pt-button pt-minimal pt-icon-floppy-disk">Save</button>
            <button className="pt-button pt-minimal pt-icon-build"
              onClick = {() => {
                actions.compileFile(this.props.editor);
              }}
            >Compile</button>
            <Popover
              content = {
                <a><pre>java StreamCipher</pre></a> }
              position = {Position.BOTTOM}
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
          <div style = {{width: '100%', height: '100%', backgroundColor: '#333'}}>
            <MonacoEditor
                value = {this.props.editor.rawSrc}
                language = "java"
                options = {{
                  selectOnLineNumbers: false,
                  automaticLayout: true
                }}
                theme = "vs-dark"
                onChange = {(newValue, _) => {
                  actions.updateSrc({
                    rawSrc: newValue,
                  })
                }}
            />
          </div>
          <div style = {{width: '100%', height: '100%', backgroundColor: '#333'}} >
             <MonacoEditor
                value = ''
                language = "java"
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
