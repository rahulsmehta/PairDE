import * as React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as classNames from "classnames";
import { RootState } from '../../reducers';
import * as HeaderActions from '../../actions/header';
import Header from "../../components/Header";

import * as style from './style.css';

import MonacoEditor from "react-monaco-editor";
const PanelGroup = require("react-panelgroup");
import { Breadcrumb, CollapsibleList, MenuItem, Classes,
         IMenuItemProps, Button, ITreeNode, Tree, Tooltip,
         Position, Intent, Popover} from "@blueprintjs/core";

interface AppProps {
  // todos: TodoItemData[];
  actions: typeof HeaderActions;
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
    // const { todos, actions, children } = this.props;
    const { actions, children } = this.props;
    const options = {
      selectOnLineNumbers: false,
      automaticLayout: true
    };
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
        <Header
          saveFile = {actions.saveFile}
          runFile = {actions.runFile}
          compileFile = {actions.compileFile}
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
          <div style = {{width: '100%', height: '100%'}}>
            <MonacoEditor
                value = "// your code here"
                language = "java"
                options = {options}
                theme = "vs-dark"
            />
          </div>
        </PanelGroup>
      </div>
    );
  }
}

function mapStateToProps(state: RootState) {
  return {
    // todos: state.todos
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(HeaderActions as any, dispatch)
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
