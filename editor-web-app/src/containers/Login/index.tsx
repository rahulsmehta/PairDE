import * as React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as classNames from "classnames";
import { RootState } from '../../reducers';
import * as EditorActions from '../../actions/editor';

import * as codeService from '../../services/codeService';
import * as storageService from '../../services/storageService';
import * as syncService from '../../services/syncService';
import * as Utils from '../../utils';

import Editor from "../../components/Editor";
import PairEditor from "../../components/PairEditor";
import Console from "../../components/Console";
import Navbar from "../../components/Navbar";



import * as style from './style.css';

import MonacoEditor from "react-monaco-editor";
const PanelGroup = require("react-panelgroup");
import { Breadcrumb, Classes, Button, ITreeNode, Tree, Tooltip,
         Position, Intent, Popover, EditableText} from "@blueprintjs/core";

const io = require('socket.io-client');
const ioPath = Utils.isProd() ? "http://ec2-34-207-206-82.compute-1.amazonaws.com:9000" : "http://localhost:9000";
let socket = io(ioPath, {transports: ['websocket']});

import { encode } from 'base-64';

class Login extends React.Component<{}, {}>{

  render(){
    const casPath = (Utils.isProd()) ? "http%3A%2F%2Fpairde.herokuapp.com%2Feditor%2F" :
      "http%3A%2F%2Flocalhost%3A3000%2Feditor%2F";

    return (
      <div className = {classNames(style.default, "pt-app")} >
        <div className="pt-non-ideal-state">
          <div className="pt-non-ideal-state-visual pt-non-ideal-state-icon">
          <span className="pt-icon pt-icon-large pt-icon-people"></span>
        </div>
          <h3 className="pt-non-ideal-state-title">Welcome to PairDE!</h3>
          <div className="pt-non-ideal-state-description">
            <a className={"pt-button pt-intent-primary"}
              href={"https://fed.princeton.edu/cas/login?service=" + casPath}>
              Login with CAS </a>
          </div>
        </div>
      </div>
    );
  }

}

export default Login;
