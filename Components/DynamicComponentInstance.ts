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
     * The name of the component instance. A dynamic component is a component that allows for new components to be inserted within it.
     */
    export var DynamicComponentInstanceType = "Labs.Components.DynamicComponentInstance";

    /**
     * Class representing a dynamic component. A dynamic component is used to create, at runtime, new components.
     */
    export class DynamicComponentInstance extends Labs.ComponentInstanceBase {
        public component: IDynamicComponentInstance;

        /**
         * Constructs a new dynamic component instance from the provided definition
         */
        constructor(component: IDynamicComponentInstance) {
            super();
            this.component = component;
        }

        /**
         * Retrieves all the components created by this dynamic component.
         */
        getComponents(callback: Labs.Core.ILabCallback<Labs.ComponentInstanceBase[]>) {
            var componentSearch: Core.GetActions.IGetComponentActionsOptions = {
                componentId: this._id,
                action: Core.Actions.CreateComponentAction,
            };

            this._labs.getActions(Core.GetActions.GetComponentActions, componentSearch, (err, actions) => {
                var components: Labs.ComponentInstanceBase[] = actions.map((action)=> this.createComponentInstance(action));
                setTimeout(() => callback(null, components), 0);
            });
        }

        /**
         * Creates a new component.
         */
        createComponent(component: Labs.Core.IComponent, callback: Labs.Core.ILabCallback<Labs.ComponentInstanceBase>) {
            var options: Labs.Core.Actions.ICreateComponentOptions = {
                componentId: this._id,
                component: component
            };

            this._labs.takeAction(Labs.Core.Actions.CreateComponentAction, options, (err, result) => {
                var instance: Labs.ComponentInstanceBase = null;
                if (!err) {
                    instance = this.createComponentInstance(result);
                }

                setTimeout(() => callback(err, instance), 0);
            });
        }

        private createComponentInstance(action: Labs.Core.IAction): Labs.ComponentInstanceBase {
            var componentInstanceDefinition = (<Labs.Core.Actions.ICreateComponentResult> action.result).componentInstance;
            var componentInstance = <Labs.ComponentInstanceBase> Labs.deserialize(componentInstanceDefinition);
            componentInstance.attach(componentInstanceDefinition.componentId, this._labs);
            return componentInstance;
        }

        /**
         * Used to indicate that there will be no more submissions associated with this component
         */
        close(callback: Labs.Core.ILabCallback<void>) {
            this.isClosed((err, closed) => {
                if (err) {
                    setTimeout(() => callback(err, null));
                    return;
                }

                var options: Labs.Core.Actions.ICloseComponentOptions = {
                    componentId: this._id
                };
                this._labs.takeAction(
                    Labs.Core.Actions.CloseComponentAction,
                    options,
                    null,
                    (err, action) => {
                        setTimeout(() => callback(err, null));
                    });
            });
        }

        /**
         * Returns whether or not the dynamic component is closed
         */
        isClosed(callback: Labs.Core.ILabCallback<boolean>) {
            var componentSearch: Core.GetActions.IGetComponentActionsOptions = {
                componentId: this._id,
                action: Core.Actions.CloseComponentAction,
            };

            this._labs.getActions(Core.GetActions.GetComponentActions, componentSearch, (err, actions) => {
                if (err) {
                    setTimeout(() => callback(err, null), 0);
                } else {
                    var closed = actions.length > 0;
                    setTimeout(() => callback(null, closed), 0);
                }
            });
        }
    }

    // Register the deserializer for this type. This will cause all components to make use of this class.
    Labs.registerDeserializer(
        DynamicComponentInstanceType,
        (json: Labs.Core.ILabObject) => {
            return new DynamicComponentInstance(<IDynamicComponentInstance> json);
        });
}