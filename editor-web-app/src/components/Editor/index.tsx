import * as React from 'react';
import * as classNames from "classnames";
import MonacoEditor from "react-monaco-editor";
import * as EditorActions from '../../actions/editor';


interface EditorProps {
  src: string;
  actions: typeof EditorActions;
  isEmpty: boolean;
  isDir: boolean;
}

class Editor extends React.Component<EditorProps,{}> {

  constructor(props?: EditorProps, context?: any) {
    super(props, context);
  }
  render() {
    const {src, actions, isEmpty, isDir} = this.props;
    const defaultEditor = (
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
    const emptyEditor = (
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
    );
    const dirEditor = (
      <div style = {{width: '100%', height: '100%'}}>
        <div className={"pt-non-ideal-state"}>
          <div className={"pt-non-ideal-state-visual pt-non-ideal-state-icon"}>
            <span className={"pt-icon pt-icon-folder-open"}></span>
          </div>
          <h4 className={"pt-non-ideal-state-title"}>Select a file to edit</h4>
          <div className={"pt-non-ideal-state-description"}>
            Select or create a new file.
          </div>
        </div>
      </div>
    );
    if (isEmpty) {
      return emptyEditor;
    } else if (isDir) {
      return dirEditor;
    }
    else {
      return defaultEditor;
    }
  }

}

export default Editor;
