import * as React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as classNames from "classnames";
import { RootState } from '../../reducers';
import * as TodoActions from '../../actions/todos';
// import Header from '../../components/Header';
// import MainSection from '../../components/MainSection';
import * as style from './style.css';

//TODO: Refactor to remove bootstrap-specific code from top level component
import { Grid, Row, Col } from "react-bootstrap";
import MonacoEditor from "react-monaco-editor";
import { Breadcrumb,
         CollapsibleList,
         MenuItem,
         Classes,
         IMenuItemProps,
         Button,
         ITreeNode,
         Tree
        } from "@blueprintjs/core";

interface AppProps {
  todos: TodoItemData[];
  actions: typeof TodoActions;
};

interface AppState {
  /* empty */
}

class App extends React.Component<AppProps, AppState>{

  editorDidMount(editor, monaco) {
    console.log('editorDidMount', editor);
    editor.focus();
  }

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
        hasCaret: true,
        iconName: "folder-close",
        label: "Assignment 2",
        id: 0,
        isExpanded: true,
        childNodes: [
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
        ]
      },
    ]
    return (
      <div className = {classNames(style.default, "pt-app", "pt-dark")} >
        <Grid fluid>
          <Row className = {classNames(style.default, style.header)}>
            <Col md={4}>
              <CollapsibleList
                className = {Classes.BREADCRUMBS}
                dropdownTarget={<span className={Classes.BREADCRUMBS_COLLAPSED} />}
                renderVisibleItem={this.renderBreadcrumb}
              >
                <MenuItem iconName="folder-close" text="Assignment 2" />
                <MenuItem iconName="code" text="AuthDecryptor.java" />
              </CollapsibleList>
            </Col>
            <Col md={4}>
                <Button iconName="floppy-disk" text="Save" className = {Classes.MINIMAL} />
                <Button iconName="build" text="Compile" className = {Classes.MINIMAL} />
                <Button iconName="play" text="Run" className = {Classes.MINIMAL} />
                <Button iconName="changes" text="Switch" className = {Classes.MINIMAL} />
            </Col>
          </Row>
          <Row className = {classNames(style.default, style.topSpace)}>

            <Col md={2}>
              <Tree contents = {treeNodes} />
            </Col>

            <Col md={10}>
              <MonacoEditor
                width="800"
                height="600"
                value = "// your code here"
                language = "java"
                options = {options}
                editorDidMount = {this.editorDidMount}
                theme = "vs-dark"
              />
            </Col>
          </Row>
        </Grid>
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
