import * as React from "react";
import { Button, Dialog, Intent } from "@blueprintjs/core";
import {AppToaster} from "../../services/toaster";
import * as EditorActions from "../../actions/editor";
import * as StorageService from '../../services/storageService';

interface IDialogState{
    isOpen: boolean;
    content: string;
}

interface IDialogProps {
    className: string;
    currentFile: string;
    actions: typeof EditorActions
    storageService: typeof StorageService
    wd: string
}

class RenameDialog extends React.Component<IDialogProps, IDialogState> {
    public state = { isOpen: false, content: "" };

    public render() {
        return (
            <div>
                <button className={this.props.className} onClick={this.toggleDialog}>Rename</button>
                <Dialog
                    iconName="edit"
                    isOpen={this.state.isOpen}
                    onClose={this.toggleDialog}
                    title={"Rename " + this.props.currentFile}
                >
                    <div className="pt-dialog-body">
                        <input className={"pt-input"} type={"text"}
                          placeholder={this.props.currentFile}
                          size={60}
                          onChange={(args) => {
                            this.updateContents(args.target.value);
                          }}
                        />
                    </div>
                    <div className="pt-dialog-footer">
                        <div className="pt-dialog-footer-actions">
                            <Button
                                intent={Intent.NONE}
                                onClick={this.toggleDialog}
                                text="Cancel"
                            />
                            <Button
                              text="Rename"
                              intent={Intent.PRIMARY}
                              onClick={this.handleRename}
                            />
                        </div>
                    </div>
                </Dialog>
            </div>
        );
    }

    private isDir = (fn) => {
      const re = new RegExp('^[A-Za-z0-9_]*$');
      let toTest = fn.replace('/','').replace('/','');
      return re.test(toTest) && toTest.length > 0;
    }

    private handleRename = () => {
      const {content} = this.state;
      const {storageService, currentFile, wd, actions} = this.props;
      if (this.validateFileName(currentFile)) {
        if (!this.validateFileName(content)) {
          AppToaster.show({
            message: "Invalid class name!",
            intent: Intent.DANGER
          });
        } else {
          const path = wd + currentFile;
          storageService.renameFile(path, content, actions);
          this.setState({isOpen: !this.state.isOpen})
        }
      } else if (this.validateDirName(currentFile)) {
        if (!this.validateDirName(content)) {
          AppToaster.show({
            message: "Invalid folder name!",
            intent: Intent.DANGER
          });
        } else {
          const path = this.isDir(currentFile) ? wd.substring(0,wd.length-1) : wd + currentFile;
          storageService.renameFile(path, content, actions);
          this.setState({isOpen: !this.state.isOpen})
        }
      }
    }

    private toggleDialog = () => this.setState({ isOpen: !this.state.isOpen });
    private updateContents = (c) => this.setState( {isOpen: this.state.isOpen, content: c} );

    private validateFileName = (fn: string) => {
      const re = new RegExp('^[A-Z][A-Za-z0-9]*\.java$');
      return re.test(fn) && fn.length > 0;
    }

    private validateDirName = (fn: string) => {
      const re = new RegExp('^[A-Za-z0-9_]*$');
      return re.test(fn) && fn.length > 0;
    }
}

export default RenameDialog;
