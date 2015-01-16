//
// Copyright (c) Microsoft Corporation.  All rights reserved.
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

module LabsServer {
    export class LabHost {
        private _messageProcessor: Labs.MessageProcessor;
        private _isStarted: boolean;
        private _processor: ILabEventProcessor;
        private _appId: string;
        private _active: boolean = false;
        private _connected: boolean = false;
        private _targetWindow: Window = null;

        constructor(appId: string, processor: ILabEventProcessor) {
            this._isStarted = false;
            this._appId = appId;
            this._processor = processor;
        }

        private handleEvent(origin: Window, data: any, callback: Labs.Core.ILabCallback<any>) {
            var command = <Labs.Command> data;
            var handledP: JQueryPromise<any> = null;

            // Special case for connections. We may have a connection from a new frame.
            if (command.type === Labs.CommandType.Connect) {
                handledP = this._processor.handleConnect(<Labs.Core.ILabHostVersionInfo> command.commandData);
            }
            else if (!this._connected || (this._targetWindow !== origin)) {
                var deferred = $.Deferred();
                deferred.reject({ message: "Connection has not been established" });
                handledP = deferred.promise();
            }
            else {                
                switch (command.type) {                    
                    case Labs.CommandType.Disconnect:
                        handledP = this._processor.handleDisconnect(<Labs.Core.ICompletionStatus> command.commandData);
                        break;

                    case Labs.CommandType.Create:
                        handledP = this._processor.handleCreate(<Labs.Core.ILabCreationOptions> command.commandData);
                        break;

                    case Labs.CommandType.GetConfigurationInstance:
                        handledP = this._processor.handleGetConfigurationInstance();
                        break;

                    case Labs.CommandType.TakeAction:
                        handledP = this._processor.handleTakeAction(<Labs.TakeActionCommandData> command.commandData);
                        break;

                    case Labs.CommandType.GetCompletedActions:
                        handledP = this._processor.handleGetActions(<Labs.GetActionsCommandData> command.commandData);
                        break;

                    case Labs.CommandType.GetState:
                        handledP = this._processor.handleGetState();
                        break;

                    case Labs.CommandType.SetState:
                        handledP = this._processor.handleSetState(command.commandData);
                        break;

                    case Labs.CommandType.GetConfiguration:
                        handledP = this._processor.handleGetConfiguration();
                        break;

                    case Labs.CommandType.SetConfiguration:
                        handledP = this._processor.handleSetConfiguration(<Labs.Core.IConfiguration> command.commandData);
                        break;

                    case Labs.CommandType.SendMessage:
                        handledP = this._processor.handleSendMessage(<Labs.SendMessageCommandData> command.commandData);
                        break;

                    default:
                        var deferred = $.Deferred();
                        deferred.reject({ message: "Unknown Command" });
                        handledP = deferred.promise();
                        break;
                }                
            }            

            // Also perform follow on actions once the action completes
            handledP.then(
                (result)=> {
                    callback(null, result);

                    switch (command.type) {
                        case Labs.CommandType.Connect:
                            // Mark that we are connected - and also send the initial messages to it
                            this._targetWindow = origin;
                            this._connected = true;
                            this.sendActivateMessage(this._active);
                            break;

                        case Labs.CommandType.Disconnect:
                            this._targetWindow = null;
                            this._connected = false;
                            break;
                    }
                },
                (err)=> {
                    callback(err, null);
                });
        }

        public sendMessage(data: any): JQueryPromise<any> {
            if (!this._targetWindow) {
                throw "No target connected";
            }

            var deferred = $.Deferred<any>();
            this._messageProcessor.sendMessage(this._targetWindow, data, (err, sendMessageData) => {
                if (err) {
                    deferred.fail(err);
                }
                else {
                    deferred.resolve(sendMessageData);
                }
            });

            return deferred.promise();
        }

        public start() {
            if (this._isStarted) {
                throw "LabHost already started";
            }
            this._isStarted = true;

            // Start the message processor and listen for messages
            this._messageProcessor = new Labs.MessageProcessor(
                this._appId,
                "*",
                (origin: Window, data: any, callback: Labs.Core.ILabCallback<any>) => {
                    this.handleEvent(origin, data, callback);
                });
            this._messageProcessor.start();
        }

        public stop() {
            if (!this._isStarted) {
                throw "LabHost is not running";
            }
            this._isStarted = false;

            this._messageProcessor.stop();
        }

        public setActive(active: boolean) {
            this._active = active;
            if (this._connected) {
                this.sendActivateMessage(active);
            }
        }

        private sendActivateMessage(active: boolean) {
            this.sendMessage(
                new Labs.Command(active ? Labs.Core.EventTypes.Activate : Labs.Core.EventTypes.Deactivate, null));
        }
    }
}