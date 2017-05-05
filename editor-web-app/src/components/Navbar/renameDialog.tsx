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

    private handleRename = () => {
      const {content} = this.state;
      const {storageService, currentFile, wd, actions} = this.props;
      if (!this.validateName(content)) {
          AppToaster.show({
            message: "Invalid class name!",
            intent: Intent.DANGER
          });
      } else {
        const path = wd + currentFile;
        storageService.renameFile(path, content, actions);
        this.setState({isOpen: !this.state.isOpen})
      }
    }

    private toggleDialog = () => this.setState({ isOpen: !this.state.isOpen });
    private updateContents = (c) => this.setState( {isOpen: this.state.isOpen, content: c} );

    private validateName = (fn) => {
      const re = new RegExp('[A-Z].*\.java$')
      return re.test(fn);
    }
}

export default RenameDialog;