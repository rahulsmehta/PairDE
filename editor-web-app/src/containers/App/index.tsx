import * as React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as classNames from "classnames";
import { RootState } from '../../reducers';
import * as TodoActions from '../../actions/todos';

import * as style from './style.css';

//TODO: Refactor to remove bootstrap-specific code from top level component
import { Grid, Row, Col } from "react-bootstrap";
import MonacoEditor from "react-monaco-editor";
const PanelGroup = require("react-panelgroup");
import { Breadcrumb, CollapsibleList, MenuItem, Classes,
         IMenuItemProps, Button, ITreeNode, Tree, Tooltip,
         Position, Intent} from "@blueprintjs/core";

interface AppProps {
  todos: TodoItemData[];
  actions: typeof TodoActions;
};

interface AppState {
  /* empty */
}

class App extends React.Component<AppProps, AppState>{

  // editorDidMount(editor, monaco) {
  //   console.log('editorDidMount', editor);
  //   editor.focus();
  // }

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
    const { todos, actions, children } = this.props;
    const options = {
      selectOnLineNumbers: false
    };
    const treeNodes: ITreeNode[] = [
          {
            hasCaret: false,
            iconName: "code",
            label: "AuthDecryptor.java",
            id: 1
          },
          {
            hasCaret: false,
            iconName: "code",
            label: "AuthEncryptor.java",
            id: 2
          },
          {
            hasCaret: false,
            iconName: "code",
            label: "StreamCipher.java",
            id: 3
          }
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
            <button className="pt-button pt-minimal pt-icon-build">Compile</button>
            <button className="pt-button pt-minimal pt-icon-play">Run</button>
            <span className="pt-navbar-divider"></span>
            <Tooltip
              content = "You are not the current editor"
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
            {size: 0, minSize:0, resize: "dynamic"},
          ]}
        >
          <div>
            <Tree contents = {treeNodes} />
          </div>
          <MonacoEditor
              height = "600"
              value = "// your code here"
              language = "java"
              options = {options}
              theme = "vs-dark"
          />
        </PanelGroup>
      </div>
    );
  }
}

function mapStateToProps(state: RootState) {
  return {
    todos: state.todos
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(TodoActions as any, dispatch)
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
