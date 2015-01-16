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

module Labs.Components {
    /**
     * The result of an input component submission
     */
    export class InputComponentResult {
        /**
         * The score associated with the submission
         */
        score: any;

        /** 
         * Whether or not the result resulted in the completion of the attempt
         */
        complete: boolean;

        /**
         * Constructs a new InputComponentResult
         *
         * @param { score } The score of the result
         * @param { complete } Whether or not the result completed the attempt
         */
        constructor(score: any, complete: boolean) {
            this.score = score;
            this.complete = complete;
        }
    }
}