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
     * Resume attempt action. Used to indicate the user is resuming work on a given attempt.
     */
    export var ResumeAttemptAction = "Labs.Core.Actions.ResumeAttemptAction";

    /**
     * Options associated with a resume attempt
     */
    export interface IResumeAttemptOptions extends IActionOptions {
        /**
         * The component the attempt is associated with
         */
        componentId: string;

        /**
         * The attempt that is being resumed
         */
        attemptId: string;
    }
}