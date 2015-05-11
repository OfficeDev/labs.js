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
    export class RichClientOfficeJSLabsHost implements Labs.Core.ILabHost {
        private _handlers: { (event: string, data: any): void; }[] = [];
        private _activeMode: Labs.Core.LabMode;
        private _version: Core.ILabHostVersionInfo = { version: { major: 0, minor: 1 } };
        private _labState: Labs.InMemoryLabState = null;
        private _createdHostVersion: Labs.Core.IVersion;
        private _activeViewP: IPromise;
        private _configurationInfo: Labs.Core.IConfigurationInfo = null;

        constructor(configuration: Labs.Core.IConfiguration, createdHostVersion: Labs.Core.IVersion) {
            // Construct the configuration info and lab state if the lab was previously created            
            if (createdHostVersion) {
                this._createdHostVersion = createdHostVersion;
                this._configurationInfo = { hostVersion: this._createdHostVersion };
                this._labState = new Labs.InMemoryLabState();
                this._labState.setConfiguration(configuration);
                this._createdHostVersion = createdHostVersion;  
            } else {
                this._configurationInfo = null;
                this._createdHostVersion = null;				
            }            
                        
            // Get the current active view and pass it to the initialization method
            var activeViewResolver = new Resolver();
            Office.context.document.getActiveViewAsync((result: any) => {
                this._activeMode = this.getLabModeFromActiveView(result.value);
                activeViewResolver.resolve(result.value);
            });
            this._activeViewP = activeViewResolver.promise;

            // And also listen for updates
            Office.context.document.addHandlerAsync("activeViewChanged", (args) => {
                this._activeMode = this.getLabModeFromActiveView(args.activeView);

                this._handlers.forEach((handler) => {
                    handler(Labs.CommandType.ModeChanged, { mode: Labs.Core.LabMode[this._activeMode] });
                });
            });
        }

        private getLabModeFromActiveView(view: string): Labs.Core.LabMode {
            return view === 'edit' ? Labs.Core.LabMode.Edit : Labs.Core.LabMode.View;
        }

        getSupportedVersions(): Core.ILabHostVersionInfo[] {
            return [this._version];
        }

        connect(versions: Labs.Core.ILabHostVersionInfo[], callback: Labs.Core.ILabCallback<Labs.Core.IConnectionResponse>) {
            // verify versions are supported
            this._activeViewP.then(() => {
                var connectionResponse: Labs.Core.IConnectionResponse = {
                    initializationInfo: this._configurationInfo,
                    hostVersion: {
                        major: 0,
                        minor: 1
                    },
                    userInfo: {
                        id: "TestUserId",
                        permissions: [
                            Labs.Core.Permissions.Edit,
                            Labs.Core.Permissions.Take]
                    },
                    applicationId: "TestAppId",
                    mode: this._activeMode
                };

                setTimeout(() => callback(null, connectionResponse), 0);
            });            
        }

        disconnect(callback: Labs.Core.ILabCallback<void>) {            
            setTimeout(() => callback(null, null), 0);
        }

        on(handler: (string, any) => void) {
            this._handlers.push(handler);
        }

        sendMessage(type: string, options: Labs.Core.IMessage, callback: Labs.Core.ILabCallback<Labs.Core.IMessageResponse>) {
            if (type === Labs.TimelineNextMessageType) {
                var nextSlide = Office.Index.Next;
                Office.context.document.goToByIdAsync(nextSlide, Office.GoToType.Index, (asyncResult) => {
                    var error = null;
                    if (asyncResult.status == Office.AsyncResultStatus.Failed) {
                        error = asyncResult.error;
                    }

                    setTimeout(() => callback(error, null), 0);
                });
            } else {
                setTimeout(() => callback("unknown message", null), 0);               
            }            
        }

        //
        // Verifies that the lab has been created and throws if it has not been
        //
        private verifyLabCreated(callback: Labs.Core.ILabCallback<any>): boolean {
            if (!this._configurationInfo) {
                setTimeout(() => callback("Lab has not been created", null));
                return false;
            } else {
                return true;
            }
        }

        create(options: Labs.Core.ILabCreationOptions, callback: Labs.Core.ILabCallback<void>) {
            // Store the options in the config settings. replace anything that is already there                                    
            this._createdHostVersion = this._version.version;
            this._configurationInfo = { hostVersion: this._createdHostVersion };
            this._labState = new Labs.InMemoryLabState();
            this._labState.setConfiguration(null);

            this.updateStoredLabsState(callback);
        }

        getConfiguration(callback: Labs.Core.ILabCallback<Labs.Core.IConfiguration>) {
            if (!this.verifyLabCreated(callback)) {
                return;
            }

            setTimeout(() => callback(null, this._labState.getConfiguration()), 0);
        }

        setConfiguration(configuration: Labs.Core.IConfiguration, callback: Labs.Core.ILabCallback<void>) {
            if (!this.verifyLabCreated(callback)) {
                return;
            }

            this._labState.setConfiguration(configuration);
            this.updateStoredLabsState(callback);
        }

        private updateStoredLabsState(callback: Labs.Core.ILabCallback<void>) {
            var settings = {
                configuration: this._labState.getConfiguration(),
                hostVersion: this._createdHostVersion
            };

            Office.context.document.settings.set(OfficeJSLabHost.SettingsKeyName, settings);
            Office.context.document.settings.saveAsync((asyncResult) => {
                setTimeout(() => callback(asyncResult.status === Office.AsyncResultStatus.Failed ? asyncResult.status : null, null), 0);
            });
        }

        getConfigurationInstance(callback: Labs.Core.ILabCallback<Labs.Core.IConfigurationInstance>) {
            if (!this.verifyLabCreated(callback)) {
                return;
            }

            setTimeout(() => callback(null, this._labState.getConfigurationInstance()));
        }

        getState(callback: Labs.Core.ILabCallback<any>) {
            if (!this.verifyLabCreated(callback)) {
                return;
            }

            setTimeout(() => callback(null, this._labState.getState()));
        }

        setState(state: any, callback: Labs.Core.ILabCallback<void>) {
            if (!this.verifyLabCreated(callback)) {
                return;
            }

            this._labState.setState(state);
            setTimeout(() => callback(null, null));
        }

        takeAction(type: string, options: Labs.Core.IActionOptions, callback: Labs.Core.ILabCallback<Labs.Core.IAction>);
        takeAction(type: string, options: Labs.Core.IActionOptions, result: Labs.Core.IActionResult, callback: Labs.Core.ILabCallback<Labs.Core.IAction>);
        takeAction(type: string, options: Labs.Core.IActionOptions, result: any, callback?: Labs.Core.ILabCallback<Labs.Core.IAction>) {
            if (!this.verifyLabCreated(callback)) {
                return;
            }

            var translatedCallback = callback !== undefined ? callback : result;
            var translatedResult = callback !== undefined ? result : null;

            var action = this._labState.takeAction(type, options, translatedResult);
            setTimeout(() => translatedCallback(null, action));
        }

        getActions(type: string, options: Labs.Core.IGetActionOptions, callback: Labs.Core.ILabCallback<Labs.Core.IAction[]>) {
            if (!this.verifyLabCreated(callback)) {
                return;
            }

            setTimeout(() => callback(null, this._labState.getActions(type, options)));
        }        
    }
}