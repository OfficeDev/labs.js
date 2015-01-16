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
    //
    // Interface used for handling lab events
    //
    export interface ILabEventProcessor {
        handleConnect(versionInfo: Labs.Core.ILabHostVersionInfo): JQueryPromise<Labs.Core.IConnectionResponse>;

        handleDisconnect(completionStatus: Labs.Core.ICompletionStatus): JQueryPromise<void>;

        handleGetConfiguration(): JQueryPromise<Labs.Core.IConfiguration>;

        handleSetConfiguration(configuration: Labs.Core.IConfiguration): JQueryPromise<void>;

        handleGetState(): JQueryPromise<any>;

        handleSetState(state: any): JQueryPromise<void>;

        handleCreate(options: Labs.Core.ILabCreationOptions): JQueryPromise<void>;

        handleGetConfigurationInstance(): JQueryPromise<Labs.Core.IConfigurationInstance>;

        handleTakeAction(commandData: Labs.TakeActionCommandData): JQueryPromise<Labs.Core.IAction>;
        
        handleGetActions(commandData: Labs.GetActionsCommandData): JQueryPromise<Labs.Core.IAction[]>;   

        handleSendMessage(messageData: Labs.SendMessageCommandData): JQueryPromise<Labs.Core.IMessageResponse>;
    }    
}