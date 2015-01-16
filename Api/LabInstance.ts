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

module Labs {
    /**
     * A LabInstance is an instance of the configured lab for the current user. It is used to
     * record and retrieve per user lab data.
     */
    export class LabInstance {
        private _labsInternal: LabsInternal;
        private _doneCallback: Function;

        public data: any;

        /**
         * The components that make up the lab instance
         */
        public components: ComponentInstanceBase[];

        /**
         * Constructs a new LabInstance
         *
         * @param { labsInternal } The LabsInternal to use with the instance
         * @param { components } The components of the lab instance
         * @param { doneCallback } Callback to invoke once the user is done taking the instance
         * @param { data } Custom data attached to the lab
         */
        constructor(labsInternal: LabsInternal, components: ComponentInstanceBase[], doneCallback: Function, data: any) {
            this._labsInternal = labsInternal;
            this.components = components;
            this._doneCallback = doneCallback;
            this.data = data;
        }

        /**
         * Creates a new LabInstance 
         *
         * @param { labsInternal } The LabsInternal to use with the instance
         * @param { doneCallback } Callback to invoke once the user is done taking the instance
         * @param { callback } Callback that fires once the LabInstance has been created
         */
        static Create(labsInternal: LabsInternal, doneCallback: Function, callback: Core.ILabCallback<LabInstance>) {
            labsInternal.getConfigurationInstance((err, configuration) => {
                if (err) {
                    setTimeout(() => callback(err, null), 0);
                    return;
                }

                if (!configuration) {
                    setTimeout(() => callback("No configuration set", null), 0);
                    return;
                }

                // Instantiate the components and then attach them to the lab
                var components = configuration.components.map((component: Core.IComponentInstance) => {
                    var componentInstance = <ComponentInstanceBase> Labs.deserialize(component);
                    componentInstance.attach(component.componentId, labsInternal);
                    return componentInstance;
                });
                var labInstance = new LabInstance(labsInternal, components, doneCallback, configuration.data);

                // And return it to the user
                setTimeout(() => callback(null, labInstance), 0);
            });
        }

        /**
         * Gets the current state of the lab for the user
         *
         * @param { callback } Callback that fires with the lab state
         */
        getState(callback: Core.ILabCallback<any>) {
            this._labsInternal.getState(callback);
        }

        /**
         * Sets the state of the lab for the user
         *
         * @param { state } The state to set
         * @param { callback } Callback that fires once the state is set
         */
        setState(state: any, callback: Core.ILabCallback<void>) {
            this._labsInternal.setState(state, callback);
        }

        /**
         * Indicates that the user is done taking the lab.
         * 
         * @param { callback } Callback fired once the lab instance has finished
         */
        done(callback: Core.ILabCallback<void>) {
            this._doneCallback();
            this._doneCallback = null;
            setTimeout(() => callback(null, null), 0);
        }
    }
}