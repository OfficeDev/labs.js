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
    export var ActivityComponentInstanceType = "Labs.Components.ActivityComponentInstance";

    export class ActivityComponentInstance extends ComponentInstance<ActivityComponentAttempt> {
        /**
         * The underlying IActivityComponentInstance this class represents
         */
        public component: IActivityComponentInstance;

        /**
         * Constructs a new ActivityComponentInstnace
         *
         * @param { component } The IActivityComponentInstance to create this class from
         */
        constructor(component: IActivityComponentInstance) {
            super();
            this.component = component;
        }

        /**
         * Builds a new ActivityComponentAttempt. Implements abstract method defined on the base class.
         *
         * @param { createAttemptResult } The result from a create attempt action
         */
        buildAttempt(createAttemptAction: Core.IAction): ActivityComponentAttempt {
            var id = (<Labs.Core.Actions.ICreateAttemptResult> createAttemptAction.result).attemptId;
            return new ActivityComponentAttempt(this._labs, this.component.componentId, id, this.component.values);
        }
    }

    // Register the deserializer for this type. This will cause all components to make use of this class.
    Labs.registerDeserializer(
        ActivityComponentInstanceType,
        (json: Labs.Core.ILabObject) => {
            return new ActivityComponentInstance(<IActivityComponentInstance> json);
        });
}