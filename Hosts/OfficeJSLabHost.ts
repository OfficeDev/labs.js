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

interface OfficeInterface {
    initialize: any;
    context: any;
    AsyncResultStatus: any;
    Index: any;
    GoToType: any;
};

var Office: OfficeInterface;

module Labs {
    export interface IPromise {
        then(callback: Function);
    };

    export class Resolver {
        private _callbacks: Function[] = [];
        private _isResolved = false;
        private _resolvedValue;
        promise: IPromise;

        constructor() {
            this.promise = {
                then: (callback: Function) => {
                    this._callbacks.push(callback);
                    if (this._isResolved) {
                        this.fireCallbacks();
                    }
                }
            };
        }

        resolve(value?: any) {
            this._isResolved = true;
            this._resolvedValue = value;
            this.fireCallbacks();
        }

        private fireCallbacks() {
            this._callbacks.forEach((callback) => {
                callback(this._resolvedValue);
            });

            this._callbacks = [];
        }
    };

    export interface ILabsSettings {
        /**
         * The lab configuration
         */
        configuration?: Labs.Core.IConfiguration;

        /**
         * The version of the host used to create the lab
         */
        hostVersion?: Labs.Core.IVersion;

        /**
         * Boolean that is set to true when the lab is published
         */
        published?: boolean;

        /**
         * The published ID of the lab
         */
        publishedAppId?: string;
    }

    export class OfficeJSLabHost implements Labs.Core.ILabHost {
        private _officeInitialized: IPromise;
        private _labHost: Labs.Core.ILabHost;
        private _version: Core.ILabHostVersionInfo = { version: { major: 0, minor: 1 } };

        public static SettingsKeyName = "__labs__";

        constructor() {
            var resolver = new Resolver();
            this._officeInitialized = resolver.promise;

            Office.initialize = () => {
                // retrieve the configuration - this will tell us if we have been published or not - and then 
                // use this to determine which host to make use of
                var labsSettings = <ILabsSettings> Office.context.document.settings.get(OfficeJSLabHost.SettingsKeyName);                

                if (labsSettings && labsSettings.published) {
                    this._labHost = new PostMessageLabHost(labsSettings.publishedAppId, parent.parent, "*");
                } else {
                    this._labHost = new RichClientOfficeJSLabsHost(
                        labsSettings ? labsSettings.configuration : null,
                        labsSettings ? labsSettings.hostVersion : null);
                }

                // based on what happens here I think I want to split on which internal host I create
                resolver.resolve();
            };
        }

        getSupportedVersions(): Core.ILabHostVersionInfo[] {
            return [this._version];
        }

        connect(versions: Labs.Core.ILabHostVersionInfo[], callback: Labs.Core.ILabCallback<Labs.Core.IConnectionResponse>) {
            this._officeInitialized.then(() => {
                this._labHost.connect(versions, callback);
            });
        }

        disconnect(callback: Labs.Core.ILabCallback<void>) {
            this._labHost.disconnect(callback);
        }

        on(handler: (string, any) => void) {
            this._labHost.on(handler);
        }

        sendMessage(type: string, options: Labs.Core.IMessage, callback: Labs.Core.ILabCallback<Labs.Core.IMessageResponse>) {
            this._labHost.sendMessage(type, options, callback);
        }

        create(options: Labs.Core.ILabCreationOptions, callback: Labs.Core.ILabCallback<void>) {
            this._labHost.create(options, callback);
        }

        getConfiguration(callback: Labs.Core.ILabCallback<Labs.Core.IConfiguration>) {
            this._labHost.getConfiguration(callback);
        }

        setConfiguration(configuration: Labs.Core.IConfiguration, callback: Labs.Core.ILabCallback<void>) {
            this._labHost.setConfiguration(configuration, callback);
        }

        getConfigurationInstance(callback: Labs.Core.ILabCallback<Labs.Core.IConfigurationInstance>) {
            this._labHost.getConfigurationInstance(callback);
        }

        getState(callback: Labs.Core.ILabCallback<any>) {
            this._labHost.getState(callback);
        }

        setState(state: any, callback: Labs.Core.ILabCallback<void>) {
            this._labHost.setState(state, callback);
        }

        takeAction(type: string, options: Labs.Core.IActionOptions, callback: Labs.Core.ILabCallback<Labs.Core.IAction>);
        takeAction(type: string, options: Labs.Core.IActionOptions, result: Labs.Core.IActionResult, callback: Labs.Core.ILabCallback<Labs.Core.IAction>);
        takeAction(type: string, options: Labs.Core.IActionOptions, result: any, callback?: Labs.Core.ILabCallback<Labs.Core.IAction>) {
            this._labHost.takeAction(type, options, result, callback);
        }

        getActions(type: string, options: Labs.Core.IGetActionOptions, callback: Labs.Core.ILabCallback<Labs.Core.IAction[]>) {
            this._labHost.getActions(type, options, callback);
        }
    }
}

// Also set the default builder
Labs.DefaultHostBuilder = ()=> new Labs.OfficeJSLabHost();