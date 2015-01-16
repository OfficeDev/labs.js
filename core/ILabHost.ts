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

module Labs.Core {
    /**
     * The ILabHost interfaces provides an abstraction for connecting Labs.js to the host
     */
    export interface ILabHost {
        /**
         * Retrieves the versions supported by this lab host.                 
         */
        getSupportedVersions(): ILabHostVersionInfo[];
        
        /**
         * Initializes communication with the host
         *
         * @param { versions } The list of versions that the client of the host can make use of
         * @param { callback } Callback for when the connection is complete
         */
        connect(versions: ILabHostVersionInfo[], callback: ILabCallback<IConnectionResponse>);
        
        /**
         * Stops communication with the host
         *
         * @param { completionStatus } The final status of the lab at the time of the disconnect
         * @param { callback } Callback fired when the disconnect completes
         */
        disconnect(callback: ILabCallback<void>);

        /**
         * Adds an event handler for dealing with messages coming from the host. The resolved promsie
         * will be returned back to the host
         *
         * @param { handler } The event handler
         */
        on(handler: (string, any) => void);

        /**         
         * Sends a message to the host
         *
         * @param { type } The type of message being sent
         * @param { options } The options for that message
         * @param { callback } Callback invoked once the message has been received
         */
        sendMessage(type: string, options: Labs.Core.IMessage, callback: ILabCallback<Labs.Core.IMessageResponse>);
        
        /**
         * Creates the lab. Stores the host information and sets aside space for storing the configuration and other elements.         
         *
         * @param { options } Options passed as part of creation
         */
        create(options: Labs.Core.ILabCreationOptions, callback: ILabCallback<void>);
        
        /**
         * Gets the current lab configuration from the host
         *
         * @param { callback } Callback method for retrieving configuration information
         */
        getConfiguration(callback: ILabCallback<IConfiguration>);
        
        /**
         * Sets a new lab configuration on the host
         *
         * @param { configuration } The lab configuration to set
         * @param { callback } Callback fired when the configuration is set
         */
        setConfiguration(configuration: IConfiguration, callback: ILabCallback<void>);        
        
        /**
         * Retrieves the instance configuration for the lab
         *
         * @param { callback } Callback that will be called when the configuration instance is retrieved
         */
        getConfigurationInstance(callback: ILabCallback<IConfigurationInstance>);
        
        /**
         * Gets the current state of the lab for the user
         *
         * @param { completionStatus } Callback that will return the current lab state
         */
        getState(callback: ILabCallback<any>);
        
        /**
         * Sets the state of the lab for the user
         * 
         * @param { state } The lab state
         * @param { callback } Callback that will be invoked when the state has been set
         */
        setState(state: any, callback: ILabCallback<void>);
                        
        /**
         * Takes an attempt action
         * 
         * @param { type } The type of action
         * @param { options } The options provided with the action
         * @param { callback } Callback which returns the final executed action
         */
        takeAction(type: string, options: IActionOptions, callback: ILabCallback<IAction>);
        
        /**
         * Takes an action that has already been completed
         *
         * @param { type } The type of action
         * @param { options } The options provided with the action
         * @param { result } The result of the action
         * @param { callback } Callback which returns the final executed action
         */
        takeAction(type: string, options: IActionOptions, result: IActionResult, callback: ILabCallback<IAction>);
        
        /**
         * Retrieves the actions for a given attempt
         * 
         * @param { type } The type of get action
         * @param { options } The options provided with the get action         
         * @param { callback } Callback which returns the list of completed actions
         */
        getActions(type: string, options: IGetActionOptions, callback: ILabCallback<IAction[]>);        
    };
}