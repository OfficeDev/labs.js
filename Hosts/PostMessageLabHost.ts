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

module Labs {
    interface DeferredEvent {
        command: Command;
        callback: Labs.Core.ILabCallback<any>;
    }

    enum EventState {
        Reject,
        Collecting,
        Firing
    };

    /**
     * PostMessageLabHost - ILabHost that uses PostMessage for its communication mechanism 
     */
    export class PostMessageLabHost implements Labs.Core.ILabHost {
        private _handlers: { (event: string, data: any): void; }[] = [];
        private _messageProcessor: MessageProcessor;
        private _version: Core.ILabHostVersionInfo = { version: { major: 0, minor: 1 } };
        private _targetWindow: Window;
        private _state = EventState.Reject;
        private _deferredEvents : DeferredEvent[] = [];

        constructor(labId: string, targetWindow: Window, targetOrigin: string) {
            // Start the message processor and listen for messages
            this._targetWindow = targetWindow;
            this._messageProcessor = new MessageProcessor(labId, targetOrigin, (origin, data, callback) => {                
                // Reject any message not coming from our expected target origin
                if (origin == this._targetWindow) {
                    // Use setTimeout to make sure ordering is preserved with 
                    this.handleEvent(data, callback);
                }                
            });
        }

        private handleEvent(command: Command, callback: Labs.Core.ILabCallback<any>) {
            if (this._state == EventState.Reject) {
                callback("Message received prior to connection", null);
            }
            else if (this._state == EventState.Collecting) {
                this._deferredEvents.push({
                    command: command,
                    callback: callback
                });
            }
            else {
                this.invokeEvent(null, command, callback);
            }            
        }

        private invokeDeferredEvents(err: any) {
            this._deferredEvents.forEach((event)=> {
                this.invokeEvent(err, event.command, event.callback);
            });
            this._deferredEvents = [];
        }

        private invokeEvent(err: any, command: Command, callback: Labs.Core.ILabCallback<any>) {
            if (!err) {
                this._handlers.map((handler) => {
                    handler(command.type, command.commandData);
                });               
            }            

            callback(err, null);                
        }

        getSupportedVersions(): Core.ILabHostVersionInfo[] {
            return [this._version];
        }

        connect(versions: Labs.Core.ILabHostVersionInfo[], callback: Labs.Core.ILabCallback<Labs.Core.IConnectionResponse>) {
            this._messageProcessor.start();
            this._state = EventState.Collecting;

            // send the initialize message
            var initializeMessage = new Command(CommandType.Connect, this._version);
            this._messageProcessor.sendMessage(
                this._targetWindow,
                initializeMessage,
                (err, connectionResponse: Labs.Core.IConnectionResponse) => {
                    if (connectionResponse.hostVersion.major !== this._version.version.major) {
                        err = "Unsupported post message host";                        
                    }
                                                            
                    setTimeout(() => {
                        // Fire deferred events after we make the callback. This will give the connection
                        // response time to add any handlers prior to them firing.
                        callback(err, connectionResponse);

                        // And then invoke any deferred work
                        this.invokeDeferredEvents(err);
                        this._state = err ? EventState.Reject : EventState.Firing;                        
                    }, 0);                    
                });
        }

        disconnect(callback: Labs.Core.ILabCallback<void>) {
            this._state = EventState.Reject;
            var doneCommand = new Labs.Command(CommandType.Disconnect, null);
            this._messageProcessor.sendMessage(this._targetWindow, doneCommand, (err, data) => {
                this._messageProcessor.stop();
                callback(err, data);
            });
        }

        on(handler: (string, any) => void) {
            this._handlers.push(handler);
        }

        sendMessage(type: string, options: Labs.Core.IMessage, callback: Labs.Core.ILabCallback<Labs.Core.IMessageResponse>) {
            var commandData: Labs.SendMessageCommandData = {
                type: type,
                options: options                
            };

            var sendMessageCommand = new Command(CommandType.SendMessage, commandData);
            this.sendCommand(sendMessageCommand, callback);
        }

        create(options: Labs.Core.ILabCreationOptions, callback: Labs.Core.ILabCallback<void>) {
            var createCommand = new Command(CommandType.Create, options);
            this.sendCommand(createCommand, callback);
        }

        //
        // Gets the current lab configuration from the host
        //
        getConfiguration(callback: Labs.Core.ILabCallback<Labs.Core.IConfiguration>) {
            var getConfigurationCommand = new Command(CommandType.GetConfiguration);
            this.sendCommand(getConfigurationCommand, callback);
        }

        //
        // Sets a new lab configuration on the host
        //
        setConfiguration(configuration: Labs.Core.IConfiguration, callback: Labs.Core.ILabCallback<void>) {
            var setConfigurationCommand = new Command(CommandType.SetConfiguration, configuration);
            this.sendCommand(setConfigurationCommand, callback);
        }

        getConfigurationInstance(callback: Labs.Core.ILabCallback<Labs.Core.IConfigurationInstance>) {
            var getConfigurationInstanceCommand = new Command(CommandType.GetConfigurationInstance);
            this.sendCommand(getConfigurationInstanceCommand, callback);
        }

        //
        // Gets the current state of the lab for the user
        //
        getState(callback: Labs.Core.ILabCallback<any>) {
            var getStateCommand = new Command(CommandType.GetState);
            this.sendCommand(getStateCommand, callback);
        }

        //
        // Sets the state of the lab for the user
        //
        setState(state: any, callback: Labs.Core.ILabCallback<void>) {
            var setStateCommand = new Command(CommandType.SetState, state);
            this.sendCommand(setStateCommand, callback);
        }


        takeAction(type: string, options: Labs.Core.IActionOptions, callback: Labs.Core.ILabCallback<Labs.Core.IAction>);
        takeAction(type: string, options: Labs.Core.IActionOptions, result: Labs.Core.IActionResult, callback: Labs.Core.ILabCallback<Labs.Core.IAction>);
        takeAction(type: string, options: Labs.Core.IActionOptions, result: any, callback?: Labs.Core.ILabCallback<Labs.Core.IAction>) {
            var commandData: Labs.TakeActionCommandData = {
                type: type,
                options: options,
                result: callback !== undefined ? result : null
            };

            var takeActionCommand = new Command(CommandType.TakeAction, commandData);
            this.sendCommand(takeActionCommand, callback !== undefined ? callback : result);
        }

        getActions(type: string, options: Labs.Core.IGetActionOptions, callback: Labs.Core.ILabCallback<Labs.Core.IAction[]>) {
            var commandData: Labs.GetActionsCommandData = {
                type: type,
                options: options
            };

            var getCompletedActionsCommand = new Command(CommandType.GetCompletedActions, commandData);
            this.sendCommand(getCompletedActionsCommand, callback);
        }

        private sendCommand(command: Labs.Command, callback: Labs.Core.ILabCallback<any>) {
            this._messageProcessor.sendMessage(this._targetWindow, command, callback);
        }
    }
}