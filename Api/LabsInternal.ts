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
    /**
     * Enum representing the internal state of the lab
     */
    enum LabsInternalState {
        /**
         * Initial state
         */
        None,

        /**
         * Initialized state
         */
        Initialized,

        /**
         * LabsInternal has been disposed
         */
        Disposed
    }

    /**
     * Helper interface to track pending messages
     */
    interface PendingMessage {
        message: any;

        messageData: any;
    }

    /**
     * Class used to interface with the underlying ILabsHost interface.
     */
    export class LabsInternal {
        /**
         * Current state of the LabsInternal
         */
        private _state = LabsInternalState.None;

        /**
         * The driver to send our commands to
         */
        private _labHost: Core.ILabHost;

        /**
         * Helper class to manage events in the system
         */
        private _eventManager = new Labs.EventManager();
        
        /**
         * The version of the host this LabsInternal is making use of
         */
        private _hostVersion: Labs.Core.IVersion = null;

        /**
         * Start out queueing pending messages until we are notified to invoke them
         */
        private _queuePendingMessages = true;

        /**
         * Pending messages to invoke from the EventManager
         */ 
        private _pendingMessages: PendingMessage[] = [];

        /**
         * Whether or not the lab has been created
         */
        private _created: boolean = false;

        /**
         * Information stored with a create attempt
         */ 
        private _createInfo: Labs.Core.IConfigurationInfo;

        /**
         * Constructs a new LabsInternal
         *
         * @param { labHost } The ILabHost to make use of
         */
        constructor(labHost: Core.ILabHost) {
            // Get the version info from the lab host - only support 0.1 hosts for now
            var versions = labHost.getSupportedVersions();

            var hasSupportedVersion = false;
            for (var i = 0; i < versions.length; i++) {
                if (versions[i].version.major === 0 && versions[i].version.minor <= 1) {
                    hasSupportedVersion = true;
                }
            }

            if (!hasSupportedVersion) {
                throw "Unsupported host version";
            }

            this._labHost = labHost;
        }

        /**
         * Connect to the host
         *
         * @param { callback } Callback that will return the IConnectionResponse when connected
         */
        connect(callback: Core.ILabCallback<Core.IConnectionResponse>) {
            if (this._state !== LabsInternalState.None) {
                throw "Already initialized";
            }

            // initialize the host
            this._labHost.connect(this._labHost.getSupportedVersions().splice(0), (err, initialState) => {
                if (!err) {
                    // Set the initialization state
                    this._state = LabsInternalState.Initialized;
                    
                    // Save the host version used
                    this._hostVersion = initialState.hostVersion;

                    // Store the created state for the lab
                    this._createInfo = initialState.initializationInfo;

                    // Register for messages coming from the host
                    this._labHost.on((message, messageData) => {
                        if (this._queuePendingMessages) {
                            this._pendingMessages.push({ message: message, messageData: messageData });
                        } else {
                            this._eventManager.fire(message, messageData);                            
                        }                        
                    });
                }

                setTimeout(() => callback(err, initialState), 0);
            });
        }

        /**
         * Fires all pending messages
         */
        firePendingMessages() {
            this._queuePendingMessages = false;
            this._pendingMessages.forEach((pendingMessage)=> {
                this._eventManager.fire(pendingMessage.message, pendingMessage.messageData);                            
            });
            this._pendingMessages = [];
        }

        /**
         * Creates a new lab
         *
         * @param { callback } Callback fired once the create operation completes
         */
        create(callback: Core.ILabCallback<void>) {
            this.checkIsInitialized();

            this._labHost.create({}, (err, editData) => {
                this._createInfo = {
                    hostVersion: this._hostVersion
                };  

                setTimeout(() => callback(err, editData));
            });
        }

        /**
         * Returns whether or not the lab has been created
         */
        isCreated() {
            this.checkIsInitialized();

            return this._createInfo !== null;
        }

        /**
         * Terminates the LabsInternal class and halts the connection.                  
         */
        dispose() {
            this.checkIsInitialized();

            this._state = LabsInternalState.Disposed;
            this._labHost.disconnect((err, data) => {
                if (err) {
                    console.error("Labs.js: Error disconnecting from host.");
                }
            });
        }

        /**
         * Adds an event handler for the given event
         * 
         * @param { event } The event to listen for
         * @param { handler } Handler fired for the given event
         */
        on(event: string, handler: Core.IEventCallback) {
            this.checkIsInitialized();

            this._eventManager.add(event, handler);
        }

        /**         
         * Sends a message to the host
         *
         * @param { type } The type of message being sent
         * @param { options } The options for that message
         * @param { callback } Callback invoked once the message has been received
         */
        sendMessage(type: string, options: Labs.Core.IMessage, callback: Labs.Core.ILabCallback<Labs.Core.IMessageResponse>) {
            this.checkIsInitialized();

            this._labHost.sendMessage(type, options, callback);
        }

        /**
         * Removes an event handler for the given event
         *
         * @param { event } The event whose handler should be removed
         * @param { handler } Handler to remove
         */
        off(event: string, handler: Core.IEventCallback) {
            this.checkIsInitialized();

            this._eventManager.remove(event, handler);
        }

        /**
         * Gets the current state of the lab for the user
         *
         * @param { callback } Callback that fires when the state is retrieved
         */
        getState(callback: Core.ILabCallback<any>) {
            this.checkIsInitialized();

            this._labHost.getState(callback);
        }

        /**
         * Sets the state of the lab for the user
         *
         * @param { state } The state to set
         * @param { callback } Callback fired once the state has been set
         */
        setState(state: any, callback: Core.ILabCallback<void>) {
            this.checkIsInitialized();

            this._labHost.setState(state, callback);
        }

        /**
         * Gets the current lab configuration
         *
         * @param { callback } Callback that fires when the configuration is retrieved
         */
        getConfiguration(callback: Core.ILabCallback<Core.IConfiguration>) {
            this.checkIsInitialized();

            this._labHost.getConfiguration(callback);
        }

        /**
         * Sets a new lab configuration
         *
         * @param { configuration } The lab configuration to set
         * @param { callback } Callback that fires once the configuration has been set
         */
        setConfiguration(configuration: Core.IConfiguration, callback: Core.ILabCallback<void>) {
            this.checkIsInitialized();

            this._labHost.setConfiguration(configuration, callback);
        }

        /**
         * Retrieves the configuration instance for the lab.
         *
         * @param { callback } Callback that fires when the configuration instance has been retrieved
         */
        getConfigurationInstance(callback: Core.ILabCallback<Core.IConfigurationInstance>) {
            this.checkIsInitialized();
            this._labHost.getConfigurationInstance(callback);
        }

        /**
         * Takes an action
         *
         * @param { type } The type of action to take
         * @param { options } The options associated with the action
         * @param { result } The result of the action
         * @param { callback } Callback that fires once the action has completed
         */
        takeAction(type: string, options: Core.IActionOptions, callback: Core.ILabCallback<Core.IAction>);
        takeAction(type: string, options: Core.IActionOptions, result: Core.IActionResult, callback: Core.ILabCallback<Core.IAction>);
        takeAction(type: string, options: Core.IActionOptions, result: any, callback?: Core.ILabCallback<Core.IAction>) {
            this.checkIsInitialized();

            if (callback !== undefined) {
                this._labHost.takeAction(type, options, result, callback);
            } else {
                this._labHost.takeAction(type, options, result);
            }
        }

        /**
         * Retrieves actions
         *
         * @param { type } The type of get to perform
         * @param { options } The options associated with the get
         * @param { callback } Callback that fires with the completed actions
         */
        getActions(type: string, options: Core.IGetActionOptions, callback: Core.ILabCallback<Core.IAction[]>) {
            this.checkIsInitialized();
            this._labHost.getActions(type, options, callback);
        }

        /**
         * Checks whether or not the LabsInternal is initialized
         */
        private checkIsInitialized() {
            if (this._state !== LabsInternalState.Initialized) {
                throw "Not initialized";
            }
        }
    }
}
