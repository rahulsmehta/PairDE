import * as React from 'react';
import * as classNames from 'classnames';
import * as EditorActions from '../../actions/editor';
import * as CodeService from '../../services/codeService';
import * as StorageService from '../../services/storageService';
import { AppToaster } from "../../services/toaster";

import { Breadcrumb, Classes, Button, ITreeNode, Tree, Tooltip,
         Position, Intent, Popover, EditableText} from "@blueprintjs/core";

import RenameDialog from './renameDialog';
import NewFileDialog from './newDialog';

interface NavbarProps {
  actions: typeof EditorActions;
  codeService: typeof CodeService;
  storageService: typeof StorageService;
  editor: CodePanelData;
  isSlave: boolean;
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
    const {storageService, codeService, actions, editor, isSlave} = this.props;
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
    if (!editor.isHome) {
      renameClass += " pt-disabled";
      deleteClass += " pt-disabled";
    }

    if (isSlave && !editor.isHome) {
      saveClass += ' pt-disabled';
      compileClass += ' pt-disabled';
      runClass += ' pt-disabled';
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
  const runButton = (isEmpty || (isSlave && !editor.isHome)) ? (<button className={runClass}>Run</button>) :
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

  let partnerClass = "pt-button pt-minimal pt-icon-people ";
  let startClassName = "pt-button pt-icon pt-minimal pt-icon-edit ";
  let stopClassName = "pt-button pt-icon pt-minimal pt-icon-stop ";
  if (isSlave)
    stopClassName += 'pt-disabled';
  else
    startClassName += 'pt-disabled';
  const partnerPopover = (
    <div>
      <button className={startClassName}>Start Editing</button> <br/>
      <button className={stopClassName}>Stop Editing</button>
    </div>
  );
  const partnerButton = (isEmpty || editor.isHome) ?
      (<button className={partnerClass + 'pt-disabled'}>Partner</button>) :
      (
      <Popover
        content = {partnerPopover}
        popoverClassName="pt-popover-content-sizing"
        position={Position.BOTTOM}
        useSmartArrowPositioning={true}
      >
        <button className={partnerClass}>Partner</button>
      </Popover>
    );

    const renameButton = (isEmpty || !editor.isHome) ? (<button className={renameClass}>Rename</button>) :
      (
      <RenameDialog className={renameClass} currentFile={editor.fileName} actions={actions}
          storageService={storageService}
          wd={editor.workState.wd}
        />
      )

    const saveButton = isEmpty ? (<button className={saveClass}>Save</button>) :
      (
      <button className={saveClass} onClick = {() => {
          let path = (editor.isHome) ? editor.workState.wd : editor.pairWorkState.wd;
          path += editor.fileName;
          storageService.saveFile(path, editor.rawSrc, actions, editor);
        }}>Save</button>
      )
    const deleteButton = (isEmpty || !editor.isHome) ? (<button className={deleteClass}>Delete</button>) :
      (
        <button className={deleteClass}
          onClick={() => {
            AppToaster.show({
              action: {
                onClick: () => {
                  const path = editor.workState.wd + editor.fileName;
                  storageService.deleteFile(path, actions)
                },
                text: 'Delete',
              },
              message: "Are you sure you want to delete " + editor.fileName + '?',
              intent: Intent.WARNING,
              iconName: "trash"
            })
          }}
        >Delete</button>
      )

    const newButton = (!editor.isHome) ? (<button
        className={"pt-button pt-minimal pt-icon pt-icon-add pt-disabled"}>New
        </button>) : (
      <NewFileDialog className={"pt-button pt-minimal pt-icon pt-icon-add"}
        storageService={storageService}
        wd={editor.workState.wd}
        rawSrc={editor.rawSrc}
        actions={actions}
      />
    )

   return (
    <nav className={classNames("pt-navbar", "pt-dark")} >
      <div className="pt-navbar-group pt-align-left">
        {newButton}
        {renameButton}
        <span className="pt-navbar-divider"></span>
        {saveButton}
        <span className="pt-navbar-divider"></span>
        {deleteButton}
      </div>
      <div className="pt-navbar-group pt-align-right" style={tooltipStyle}>
        <button className={compileClass}
          onClick = {() => {
            codeService.compile(editor, actions);
          }}
        >Compile</button>
        {runButton}
        <span className="pt-navbar-divider"></span>
          {partnerButton}
        <span className="pt-navbar-divider"></span>
        <Tooltip content={"Logged in as " + editor.authState.user} position = {Position.BOTTOM_RIGHT}>
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
