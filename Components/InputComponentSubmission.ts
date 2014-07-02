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
     * Class that represents an input component submission
     */
    export class InputComponentSubmission {
        /**
         * The answer associated with the submission
         */
        answer: InputComponentAnswer;

        /**
         * The result of the submission
         */
        result: InputComponentResult;

        /**
         * The time at which the submission was received
         */
        time: number;

        /**
         * Constructs a new InputComponentSubmission
         *
         * @param { answer } The answer associated with the submission
         * @param { result } The result of the submission
         * @param { time } The time at which the submission was received
         */
        constructor(answer: InputComponentAnswer, result: InputComponentResult, time: number) {
            this.answer = answer;
            this.result = result;
            this.time = time;
        }
    }
}