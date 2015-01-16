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
    export interface IHostMessage {
        type: string;
        options: Labs.Core.IMessage;
        response: Labs.Core.IMessageResponse;
    }

    export class InMemoryLabHost implements Labs.Core.ILabHost {
        private _version: Labs.Core.IVersion;
        private _labState: Labs.InMemoryLabState = new Labs.InMemoryLabState();
        private _messages: IHostMessage[] = [];

        constructor(version: Labs.Core.IVersion) {
            this._version = version;
        }

        //
        // Retrieves the version of the lab host
        //
        getSupportedVersions(): Labs.Core.ILabHostVersionInfo[] {
            return [{ version: this._version }];
        }        

        //
        // Initializes communication with the host
        //
        connect(versions: Labs.Core.ILabHostVersionInfo[], callback: Labs.Core.ILabCallback<Labs.Core.IConnectionResponse>) {
            var connectionResponse: Labs.Core.IConnectionResponse = {
                initializationInfo: {
                    hostVersion: this._version
                },
                hostVersion: {
                    major: 0,
                    minor: 1
                },
                userInfo: {
                    id: "TestUserId",
                    permissions: [
                        Labs.Core.Permissions.Edit,
                        Labs.Core.Permissions.Take
                    ]
                },
                applicationId: "TestAppId",
                mode: Labs.Core.LabMode.Edit
            };
            setTimeout(()=> callback(null, connectionResponse), 0);
        }

        //
        // Stops communication with the host
        // 
        disconnect(callback: Labs.Core.ILabCallback<void>) {
            setTimeout(()=> callback(null, null), 0);
        }

        //
        // Adds an event handler for dealing with messages coming from the host. The resolved promsie
        // will be returned back to the host
        //
        on(handler: (string, any)=> void) {
        }

        //
        // Sends a message to the host. The in memory host simply stores it and replies back.
        //
        sendMessage(type: string, options: Labs.Core.IMessage, callback: Labs.Core.ILabCallback<Labs.Core.IMessageResponse>) {
            this._messages.push({
                type: type,
                options: options,
                response: null
            });
            setTimeout(()=> callback(null, null));
        }

        getMessages(): IHostMessage[] {
            return this._messages;
        }

        create(options: Labs.Core.ILabCreationOptions, callback: Labs.Core.ILabCallback<void>) {
            setTimeout(()=> callback(null, null), 0);
        }

        //
        // Gets the current lab configuration from the host
        //
        getConfiguration(callback: Labs.Core.ILabCallback<Labs.Core.IConfiguration>) {
            var configuration = this._labState.getConfiguration();
            setTimeout(()=> callback(null, configuration), 0);
        }

        //
        // Sets a new lab configuration on the host
        //
        setConfiguration(configuration: Labs.Core.IConfiguration, callback: Labs.Core.ILabCallback<void>) {
            this._labState.setConfiguration(configuration);
            setTimeout(()=> callback(null, null), 0);
        }

        //
        // Gets the current state of the lab for the user
        //
        getState(callback: Labs.Core.ILabCallback<any>) {
            var state = this._labState.getState();
            setTimeout(()=> callback(null, state));
        }

        //
        // Sets the state of the lab for the user
        //
        setState(state: any, callback: Labs.Core.ILabCallback<void>) {
            this._labState.setState(state);
            setTimeout(()=> callback(null, null), 0);
        }

        getConfigurationInstance(callback: Labs.Core.ILabCallback<Labs.Core.IConfigurationInstance>) {
            var configurationInstance = this._labState.getConfigurationInstance();
            setTimeout(()=> callback(null, configurationInstance), 0);
        }

        takeAction(type: string, options: Labs.Core.IActionOptions, callback: Labs.Core.ILabCallback<Labs.Core.IAction>);
        takeAction(type: string, options: Labs.Core.IActionOptions, result: Labs.Core.IActionResult, callback: Labs.Core.ILabCallback<Labs.Core.IAction>);
        takeAction(type: string, options: Labs.Core.IActionOptions, result: any, callback?: Labs.Core.ILabCallback<Labs.Core.IAction>) {
            var translatedCallback = callback !== undefined ? callback : result;
            var translatedResult = callback !== undefined ? result : null;

            var action = this._labState.takeAction(type, options, translatedResult);
            setTimeout(()=> translatedCallback(null, action), 0);
        }

        getActions(type: string, options: Labs.Core.IGetActionOptions, callback: Labs.Core.ILabCallback<Labs.Core.IAction[]>) {
            var actions = this._labState.getActions(type, options);
            setTimeout(()=> callback(null, actions), 0);
        }
    }
}