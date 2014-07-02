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
     * Definition of a lab action. An action represents an interaction a user has taken with the lab.
     */
    export interface IAction {
        /**
         * The type of action taken.
         */
        type: string;

        /**
         * The options sent with the action
         */
        options: IActionOptions;

        /**
         * The result of the action
         */
        result: IActionResult;

        /**
         * The time at which the action was completed. In milliseconds elapsed since 1 January 1970 00:00:00 UTC.
         */
        time: number;
    }
}