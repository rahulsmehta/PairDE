import * as React from 'react';
import * as classNames from "classnames";
import MonacoEditor from "react-monaco-editor";
import * as EditorActions from '../../actions/editor';


interface EditorProps {
  src: string,
  actions: typeof EditorActions
}

interface EditorState {}

class Editor extends React.Component<EditorProps,EditorState> {

  constructor(props?: EditorProps, context?: any) {
    super(props, context);
  }
  render() {
    const {src, actions} = this.props;
    return (
    <div style = {{width: '100%', height: '100%', backgroundColor: '#333'}}>
      <MonacoEditor
          value = {src}
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
    );
  }
}

export default Editor;
