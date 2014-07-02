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
     * The name of the component instance. An input component is a component that allows free form
     * input from a user.
     */
    export var InputComponentInstanceType = "Labs.Components.InputComponentInstance";

    /**
     * Class representing an input component instance
     */
    export class InputComponentInstance extends ComponentInstance<InputComponentAttempt> {
        /**
         * The underlying IInputComponentInstance this class represents
         */
        public component: IInputComponentInstance;

        /**
         * Constructs a new InputComponentInstance
         *
         * @param { component } The IInputComponentInstance to create this class from
         */
        constructor(component: IInputComponentInstance) {
            super();
            this.component = component;
        }

        /**
         * Builds a new InputComponentAttempt. Implements abstract method defined on the base class.
         *
         * @param { createAttemptResult } The result from a create attempt action
         */
        buildAttempt(createAttemptAction: Core.IAction): InputComponentAttempt {
            var id = (<Labs.Core.Actions.ICreateAttemptResult> createAttemptAction.result).attemptId;
            return new InputComponentAttempt(this._labs, this.component.componentId, id, this.component.values);
        }
    }

    // Register the deserializer for this type. This will cause all components to make use of this class.
    Labs.registerDeserializer(
        InputComponentInstanceType,
        (json: Labs.Core.ILabObject) => {
            return new InputComponentInstance(<IInputComponentInstance> json);
        });
}