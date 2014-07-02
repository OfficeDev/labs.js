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

module Labs.Core.GetActions {
    /**
     * Gets actions associated with a given component. 
     */
    export var GetComponentActions = "Labs.Core.GetActions.GetComponentActions";

    /**
     * Options associated with a get component actions
     */
    export interface IGetComponentActionsOptions extends IGetActionOptions {
        /**
         * The component being searched for
         */
        componentId: string;

        /** 
         * The type of action being searched for
         */
        action: string;
    }
}