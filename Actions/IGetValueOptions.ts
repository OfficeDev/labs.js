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

module Labs.Core.Actions {
    /**
     * Action to retrieve a value associated with an attempt.
     */
    export var GetValueAction = "Labs.Core.Actions.GetValueAction";

    export interface IGetValueOptions extends IActionOptions {
        /**
         * The component the get value is associated with
         */
        componentId: string;

        /**
         * The attempt to get the value for
         */
        attemptId: string;

        /**
         * The ID of the value to receive
         */
        valueId: string;
    }
}