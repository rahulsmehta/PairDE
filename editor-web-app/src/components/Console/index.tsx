import * as React from 'react';
import * as classNames from "classnames";
import MonacoEditor from "react-monaco-editor";
import * as EditorActions from '../../actions/editor';


interface ConsoleProps {
  src: string;
}

class Console extends React.Component<ConsoleProps,{}> {

  constructor(props?: ConsoleProps, context?: any) {
    super(props, context);
  }
  render() {
    const {src} = this.props;
    const defaultEditor = (
      <div style = {{width: '100%', height: '100%', backgroundColor: '#333'}}>
        <MonacoEditor
          value = {src}
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
      );
      return defaultEditor;
    }
}

export default Console;
