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
     * The name of the component instance. A choice component is a component that has multiple choice options and supports zero
     * or more responses. Optionally there is a correct list of choices. 
     */
    export var ChoiceComponentInstanceType = "Labs.Components.ChoiceComponentInstance";    

    /**
     * Class representing a choice component instance
     */
    export class ChoiceComponentInstance extends ComponentInstance<ChoiceComponentAttempt> {
        /**
         * The underlying IChoiceComponentInstance this class represents
         */
        public component: IChoiceComponentInstance;

        /**
         * Constructs a new ChoiceComponentInstance
         *
         * @param { component } The IChoiceComponentInstance to create this class from
         */
        constructor(component: IChoiceComponentInstance) {
            super();
            this.component = component;
        }
        
        /**
         * Builds a new ChoiceComponentAttempt. Implements abstract method defined on the base class.
         *
         * @param { createAttemptResult } The result from a create attempt action
         */
        buildAttempt(createAttemptAction: Core.IAction): ChoiceComponentAttempt {
            var id = (<Labs.Core.Actions.ICreateAttemptResult> createAttemptAction.result).attemptId;
            return new ChoiceComponentAttempt(this._labs, this.component.componentId, id, this.component.values);
        }
    }

    // Register the deserializer for this type. This will cause all components to make use of this class.
    Labs.registerDeserializer(
        ChoiceComponentInstanceType,        
        (json: Labs.Core.ILabObject) => {
            return new ChoiceComponentInstance(<IChoiceComponentInstance> json);
        });
}