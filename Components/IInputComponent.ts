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
    export var InputComponentType = "Labs.Components.InputComponent";

    /**
     * An input problem is one in which the user enters an input which is checked against a correct value.
     */
    export interface IInputComponent extends Labs.Core.IComponent {
        /**
         * The question associated with the problem
         */
        question: { [type: string]: any; };
        
        /** 
         * The max score for the input component
         */
        maxScore: number;

        /**
         * Time limit associated with the input problem
         */
        timeLimit: number;

        /**
         * Whether or not the component has an answer
         */
        hasAnswer: boolean;

        /**
         * The answer to the component (if it exists)
         */
        answer: any;

        /**
         * Whether or not the input component is secure. This is not yet implemented.
         */
        secure: boolean;
    }
}