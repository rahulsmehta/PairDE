import * as React from 'react';
import * as classNames from 'classnames';
import * as EditorActions from '../../actions/editor';
import * as CodeService from '../../services/codeService';

import { Breadcrumb, Classes, Button, ITreeNode, Tree, Tooltip,
         Position, Intent, Popover, EditableText} from "@blueprintjs/core";

interface NavbarProps {
  actions: typeof EditorActions;
  codeService: typeof CodeService;
  editor: CodePanelData;
}

class Navbar extends React.Component<NavbarProps, {}> {

  constructor(props?: NavbarProps, context?: any) {
    super(props, context);
  }

  formatCommandName(fileName: string, extraArgs?: string[]) {
    let result = 'java ' + fileName.replace('.java','');
    if (extraArgs.length > 0) {
      result += ' ' + extraArgs.reduce((acc, key) => {return acc + ' ' + key})
    }
    return result;
  }

  render() {
    const {codeService, actions, editor} = this.props;
    const tooltipStyle = {paddingRight: "10px"};
    const isEmpty = editor.workState.files.length == 0;

    let renameClass = "pt-button pt-minimal pt-icon-edit";
    let saveClass = "pt-button pt-minimal pt-icon-floppy-disk";
    let deleteClass = "pt-button pt-minimal pt-icon-trash";
    let compileClass = "pt-button pt-minimal pt-icon-build";
    let runClass = "pt-button pt-minimal pt-icon-play";
    if (isEmpty) {
      renameClass += " pt-disabled";
      saveClass += " pt-disabled";
      deleteClass += " pt-disabled";
      compileClass += " pt-disabled";
      runClass += " pt-disabled";
    }



    const popoverValue = (args: string[]) => {
      if (args.length > 0) {
        return args.reduce((acc, key) => {return acc + ' ' + key});
      } else {
        return "";
      }
    }
    const runPopover = (
      <div>
        <input className={"pt-input"} type={"text"}
           placeholder={"Extra args..."}
           value={popoverValue(editor.extraArgs)}
           onChange={(args) => {
             actions.argChange({
              extraArgs: args.target.value.split(' ')
             });
           }}
        />
        <br />
        <br />
        <button className="pt-button"
          onClick = {() => {
            codeService.run(editor, actions);
          }}
        >{this.formatCommandName(editor.fileName, editor.extraArgs)}</button>
      </div>
    );
    const runButton = isEmpty ? (<button className={runClass}>Run</button>) :
        (
        <Popover
          content = {runPopover}
          popoverClassName="pt-popover-content-sizing"
          position={Position.BOTTOM}
          useSmartArrowPositioning={true}
        >
          <button className={runClass}>Run</button>
        </Popover>
      );

    const newPopover = (
      <div>
        <button className={"pt-button pt-minimal pt-icon pt-icon-folder-close"}>New Folder</button><br/>
        <button className={"pt-button pt-minimal pt-icon pt-icon-document"}>New File</button>
      </div>
    )

   return (
    <nav className={classNames("pt-navbar", "pt-dark")} >
      <div className="pt-navbar-group pt-align-left">
        <div className="pt-navbar-heading">
          {/* editable text used to be here */}
        </div>
        <Popover
          content = {newPopover}
          popoverClassName="pt-popover-content-sizing"
          position={Position.BOTTOM_LEFT}
          useSmartArrowPositioning={true}
        >
          <button className="pt-button pt-minimal pt-icon-add">New</button>
        </Popover>
        <button className={renameClass}>Rename</button>
        <span className="pt-navbar-divider"></span>
        <button className={saveClass}>Save</button>
        <span className="pt-navbar-divider"></span>
        <button className={deleteClass}>Delete</button>
      </div>
      <div className="pt-navbar-group pt-align-right" style={tooltipStyle}>
        <button className={compileClass}
          onClick = {() => {
            codeService.compile(editor, actions);
          }}
        >Compile</button>
        {/*<Popover
          content = {runPopover}
          popoverClassName="pt-popover-content-sizing"
          position={Position.BOTTOM}
          useSmartArrowPositioning={true}
        >
          <button className={runClass}>Run</button>
        </Popover>*/}
        {runButton}
        <span className="pt-navbar-divider"></span>
        <Tooltip
          content = "No partner assigned"
          intent = {Intent.WARNING}
          position = {Position.BOTTOM}
          >
          <button className="pt-button pt-minimal pt-icon-changes pt-disabled">Switch</button>
        </Tooltip>
        <span className="pt-navbar-divider"></span>
        <Tooltip content="My Account" position = {Position.BOTTOM}>
          <button className="pt-button pt-minimal pt-icon-user"></button>
        </Tooltip>
        <Tooltip content="Settings" position = {Position.BOTTOM}>
          <button className="pt-button pt-minimal pt-icon-cog"></button>
        </Tooltip>
      </div>
    </nav>
    );
  }

}

export default Navbar;
