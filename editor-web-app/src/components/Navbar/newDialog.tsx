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

    private handleNewFile = () => {alert('Creating ' + this.state.content)};

    private handleNewFolder = () => {alert('New Folder!')};

    // private handleRename = () => {
    //   const {content} = this.state;
    //   const {storageService, currentFile, wd, actions} = this.props;
    //   if (!this.validateName(content)) {
    //       AppToaster.show({
    //         message: "Invalid class name!",
    //         intent: Intent.DANGER
    //       });
    //   } else {
    //     const path = wd + currentFile;
    //     storageService.renameFile(path, content, actions);
    //     this.setState({isOpen: !this.state.isOpen})
    //   }
    // }

    private toggleDialog = () => this.setState({ isOpen: !this.state.isOpen });
    private updateContents = (c) => this.setState( {isOpen: this.state.isOpen, content: c} );
}

export default NewFileDialog;
