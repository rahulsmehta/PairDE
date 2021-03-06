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
  pairWorkState: WorkState;
}

interface IPairEditorState {
  isSlave: boolean;
  // socket: SocketIOClient.Socket
}

class PairEditor extends React.Component<IPairEditorProps,IPairEditorState> {


  constructor(props?: IPairEditorProps, context?: any) {
    super(props, context);
    this.state = {isSlave: props.isSlave};
  }

  componentWillReceiveProps (props?: IPairEditorProps, context?: any) {
    this.setState({
      isSlave: props.isSlave
    });
  }

  componentDidMount() {
    const {socket, actions} = this.props;
    // console.log(socket);
    // socket.on('connect', () => console.log('connected'));
    socket.on('code-sub', (payload) => {
      const response = JSON.parse(payload);
      if (response.path == this.props.pairWorkState.wd) {
        if (response.sid != socket.id) {
          this.props.actions.updateSrc({
            rawSrc: response.code
          });
        }
      }
    });
    socket.on('lock_success', (payload) => {
      AppToaster.clear();
      const resp = JSON.parse(payload);
      if (resp.path == this.props.pairWorkState.wd) {
        if (resp.sid == socket.id) {
          AppToaster.show({
              intent: Intent.PRIMARY,
              message: "You are now editing " + resp.path
          });
          actions.lockGranted({
            pairWorkState: {
              isSlave: false
            }
          });
        } else {
          AppToaster.show({
            intent: Intent.PRIMARY,
            message: "Your partner is now editing"
          })
        }
      }
    });
    socket.on('lock_fail', (payload) => {
      const response = JSON.parse(payload);
      if (response.path == this.props.pairWorkState.wd) {
        AppToaster.show({
            intent: Intent.DANGER,
            message: response.msg
        });
      }
    });
    socket.on('release_success', (payload) => {
      AppToaster.clear();
      const response = JSON.parse(payload);
      if (response.path == this.props.pairWorkState.wd) {
        if(response.sid == socket.id){
          AppToaster.show({
            intent: Intent.PRIMARY,
            message: "Completed editing!"
          });
          actions.lockGranted({
            pairWorkState: {
              isSlave: true
            }
          });
        } else {
          AppToaster.show({
            intent: Intent.PRIMARY,
            message: "Your partner is no longer editing"
          })
        }
      }
    });
    socket.on('release_fail', (payload) => {
      AppToaster.show({
        intent: Intent.DANGER,
        message: "Unlock failed"
      });
    });
  }

  render() {
    const {src, actions, isEmpty, isSlave, fileName, socket} = this.props;
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
      <div key={0} style = {{width: '100%', height: '100%', backgroundColor: '#333'}}>
        <MonacoEditor
            value = {src}
            language = "java"
            options = {{
              selectOnLineNumbers: false,
              automaticLayout: true
            }}
            theme = "vs-dark"
            onChange = {(newValue, _) => {
              if (!isSlave) {
                const payload = {src: newValue, path: this.props.pairWorkState.wd}
                socket.emit('code', JSON.stringify(payload), '/');
                actions.updateSrc({
                  rawSrc: newValue,
                })
              }
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
    if (!this.state.isSlave && !isEmpty) {
      return defaultEditor;
    } else if (this.state.isSlave && !isEmpty) {
      return slaveEditor;
    } else {
      return emptyEditor;
    }

  }

}

export default PairEditor;
