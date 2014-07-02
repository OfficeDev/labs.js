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
     * Type string to use with this type of component
     */
    export var ChoiceComponentType = "Labs.Components.ChoiceComponent";

    /**
     * A choice problem is a problem type where the user is presented with a list of choices and then needs to select
     * an answer from them. 
     */
    export interface IChoiceComponent extends Labs.Core.IComponent {
        /**
         * The list of choices associated with the problem
         */
        choices: IChoice[];        
        
        /**
         * A time limit for the problem
         */
        timeLimit: number;

        /**
         * The maximum number of attempts allowed for the problem
         */
        maxAttempts: number;

        /**
         * The max score for the problem
         */
        maxScore: number;

        /**
         * Whether or not this problem has an answer
         */
        hasAnswer: boolean;

        /**
         * The answer. Either an array if multiple answers are supported or a single ID if only one answer is supported.
         */
        answer: any;
        
        /**
         * Whether or not the quiz is secure - meaning that secure fields are held from the user. 
         * This is not yet implemented.
         */
        secure: boolean;
    }    
}