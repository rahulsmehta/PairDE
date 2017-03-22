import * as React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { RootState } from '../../reducers';
import * as TodoActions from '../../actions/todos';
import Header from '../../components/Header';
import MainSection from '../../components/MainSection';
import * as style from './style.css';

//TODO: Refactor to remove bootstrap-specific code from top level component
import { Grid, Row, Col } from "react-bootstrap";
import * as CodeMirror from "react-codemirror";
import "codemirror/mode/javascript/javascript";
import "codemirror/mode/clike/clike";
import "codemirror/mode/python/python";

interface AppProps {
  todos: TodoItemData[];
  actions: typeof TodoActions;
};

interface AppState {
  /* empty */
}

class App extends React.Component<AppProps, AppState>{
  render() {
    const { todos, actions, children } = this.props;
    let opts = {
      lineNumbers: true,
      mode: 'text/x-java'
    };
    // console.log(CodeMirror);
    console.log(CodeMirror);
    return (
      <div className = {style.default} >
      <CodeMirror options = {opts} value = "public class Rahul {\n}"  />
      </div>
      /*<div className = {style.default} >
        <Grid fluid>
          <Row className="show-grid">
            <Col md={2} className = {style.c2}>File Browser</Col>
            <Col md={8} className = {style.c1}>
              <CodeMirror options = {opts} value = "public class Rahul {\n}"  />
            </Col>
            <Col md={2} className = {style.c2}>Tools</Col>
          </Row>
        </Grid>
      </div>*/
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
