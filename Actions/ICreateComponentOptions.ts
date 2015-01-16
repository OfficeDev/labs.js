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
     * Action to create a new component
     */
    export var CreateComponentAction = "Labs.Core.Actions.CreateComponentAction";

    /**
     * Creates a new component
     */
    export interface ICreateComponentOptions extends IActionOptions {
        /**
         * The component invoking the create component action.
         */
        componentId: string;

        /**
         * The component to create
         */
        component: Labs.Core.IComponent;

        /**
         * An (optional) field used to correlate this component across all instances of a lab.
         * Allows the hosting system to identify different attempts at the same component.
         */
        correlationId?: string;
    }
}