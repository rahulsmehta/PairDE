import * as React from 'react';
import * as classNames from "classnames";
import MonacoEditor from "react-monaco-editor";
import * as EditorActions from '../../actions/editor';
// const io = require('socket.io-client');
const io = require('socket.io-client');
let socket = io(`http://localhost:9000`, {transports: ['websocket']});


interface IPairEditorProps {
  src: string;
  actions: typeof EditorActions;
  isEmpty: boolean;
  user: string;
}

interface IPairEditorState {
  // socket: SocketIOClient.Socket
  syncSrc: string
}

class PairEditor extends React.Component<IPairEditorProps,IPairEditorState> {


  constructor(props?: IPairEditorProps, context?: any) {
    super(props, context);
    this.state = {syncSrc: ""}
  }

  componentDidMount() {
    socket.on('connect', () => console.log('connected'));
    socket.on('code-sub', (payload) => {
      console.log(payload);
      this.setState({syncSrc: payload})
    });
  }

  render() {
    console.log(this.state.syncSrc);
    console.log(socket);
    const {src, actions, isEmpty} = this.props;
    const slaveEditor = (
      <div style = {{width: '100%', height: '100%', backgroundColor: '#333'}}>
        <MonacoEditor
            value = {this.state.syncSrc}
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
    else if (this.props.user == 'rahulm'){
      return slaveEditor;
    } else {
      return defaultEditor;
    }
  }

}

export default PairEditor;
