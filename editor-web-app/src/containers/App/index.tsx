import * as React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { RootState } from '../../reducers';
import * as TodoActions from '../../actions/todos';
// import Header from '../../components/Header';
// import MainSection from '../../components/MainSection';
import * as style from './style.css';

//TODO: Refactor to remove bootstrap-specific code from top level component
import { Grid, Row, Col } from "react-bootstrap";
import MonacoEditor from "react-monaco-editor";

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

  render() {
    const { todos, actions, children } = this.props;
    const options = {
      selectOnLineNumbers: false
    };
    return (
      <div className = {style.default} >
        <Grid fluid>
          <Row className="show-grid">
            <Col md={2} className = {style.c2}>File Browser</Col>
            <Col md={8}>
              <MonacoEditor
                width="800"
                height="600"
                value = "// your code here"
                language = "java"
                options = {options}
                editorDidMount = {this.editorDidMount}
              />
            </Col>
            <Col md={2} className = {style.c2}>Tools</Col>
          </Row>
        </Grid>
      </div>
      /*<div className={style.normal}>
        <Header addTodo={actions.addTodo} />
        <MainSection todos={todos} actions={actions} />
        {children}
      </div>*/
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
