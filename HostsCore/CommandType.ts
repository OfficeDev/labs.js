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
     * Strings representing supported command types
     */   
    export module CommandType {
        export var Connect = "connect";

        export var Disconnect = "disconnect";

        export var Create = "create";

        export var GetConfigurationInstance = "getConfigurationInstance";

        export var TakeAction = "takeAction";

        export var GetCompletedActions = "getCompletedActions";
        
        export var ModeChanged = "modeChanged";        

        export var GetConfiguration = "getConfiguration";

        export var SetConfiguration = "setConfiguratoin";

        export var GetState = "getState";

        export var SetState = "setState";

        export var SendMessage = "sendMessage";
    }
}