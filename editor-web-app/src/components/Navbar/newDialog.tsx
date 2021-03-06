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
    actions: typeof EditorActions
    storageService: typeof StorageService
    wd: string
    rawSrc: string
}

class NewFileDialog extends React.Component<IDialogProps, IDialogState> {
    public state = { isOpen: false, content: "" };

    public render() {
        return (
            <div>
                <button className={this.props.className} onClick={this.toggleDialog}>New</button>
                <Dialog
                    iconName="add"
                    isOpen={this.state.isOpen}
                    onClose={this.toggleDialog}
                    title={"New"}
                >
                    <div className="pt-dialog-body">
                        <input className={"pt-input"} type={"text"}
                          placeholder={"Untitled.java"}
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
                              text="New File"
                              intent={Intent.PRIMARY}
                              onClick={this.handleNewFile}
                              iconName="document"
                            />
                            <Button
                                intent={Intent.PRIMARY}
                                iconName="folder-close"
                                text="New Folder"
                                onClick={this.handleNewFolder}
                            />
                        </div>
                    </div>
                </Dialog>
            </div>
        );
    }

    private handleNewFile = () => {
      const {actions, storageService, wd, rawSrc} = this.props;
      const { content } = this.state;
      if (!this.validateFileName(content)) {
        AppToaster.show({
          message: "Invalid class name!",
          intent: Intent.DANGER
        });
      } else {
        const path = wd + this.state.content;
        storageService.create(path, false, rawSrc, actions);
        this.setState({isOpen: !this.state.isOpen})
      }
    }

    private handleNewFolder = () => {
      const {actions, storageService, wd, rawSrc} = this.props;
      const { content } = this.state;
      if (!this.validateDirName(content)) {
        AppToaster.show({
          message: "Invalid folder name!",
          intent: Intent.DANGER
        });
      } else {
        const path = wd + this.state.content;
        storageService.create(path, true, null, actions);
        this.setState({isOpen: !this.state.isOpen})
      }
    }

    private toggleDialog = () => this.setState({ isOpen: !this.state.isOpen, content: this.state.content });
    private updateContents = (c) => this.setState( {isOpen: this.state.isOpen, content: c} );

    private validateFileName = (fn:string) => {
      const re = new RegExp('^[A-Z][A-Za-z0-9]*\.java$');
      return re.test(fn) && fn.length > 0;
    }

    private validateDirName = (fn: string) => {
      const re = new RegExp('^[A-Za-z0-9_]*$');
      return re.test(fn) && fn.length > 0;
    }
}

export default NewFileDialog;
