import * as React from 'react';
import * as classNames from "classnames";
import MonacoEditor from "react-monaco-editor";
import * as EditorActions from '../../actions/editor';
import { AppToaster } from '../../services/toaster';
import { Intent } from '@blueprintjs/core';
// const io = require('socket.io-client');


interface IPairEditorProps {
  src: string;
  actions: typeof EditorActions;
  isEmpty: boolean;
  isSlave: boolean;
  fileName: string;
  socket: SocketIOClient.Socket;
}

interface IPairEditorState {
  // socket: SocketIOClient.Socket
}

class PairEditor extends React.Component<IPairEditorProps,IPairEditorState> {


  constructor(props?: IPairEditorProps, context?: any) {
    super(props, context);
  }

  componentDidMount() {
    const {socket} = this.props;
    socket.on('connect', () => console.log('connected'));
    socket.on('code-sub', (payload) => {
      this.props.actions.updateSrc({
        rawSrc: payload
      });
    });
    socket.on('lock_success', (payload) => {
      AppToaster.show({
          intent: Intent.SUCCESS,
          message: "I am the captain now"
      });
    });
    socket.on('lock_fail', (payload) => {
      AppToaster.show({
          intent: Intent.DANGER,
          message: "Someone else is editing!"
      });
    })
  }

  render() {
    const {src, actions, isEmpty, fileName, socket} = this.props;
    const slaveEditor = (
      <div style = {{width: '100%', height: '100%', backgroundColor: '#333'}}>
        <MonacoEditor
            value = {src}
            language = "java"
            options = {{
              readOnly: true,
              selectOnLineNumbers: false,
              automaticLayout: true
            }}
            theme = "vs-dark"
        />
      </div>
    );
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
              socket.emit('code', newValue, '/');
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
    if (isEmpty) {
      return emptyEditor;
    }
    else if (this.props.isSlave){
      return slaveEditor;
    } else {
      return defaultEditor;
    }
  }

}

export default PairEditor;
