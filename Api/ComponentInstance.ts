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
     * Class representing a component instance. An instance is an instantiation of a component for a user. It contains
     * a translated view of the component for a particular run of the lab.
     */
    export class ComponentInstance<T> extends ComponentInstanceBase {
        /**
         * Constructs a new ComponentInstance.         
         */
        constructor() {
            super();
        }

        /**
         * Begins a new attempt at the component
         *
         * @param { callback } Callback fired when the attempt has been created
         */
        public createAttempt(callback: Core.ILabCallback<T>) {
            // Retrieve the create attempt options 
            var createAttemptAction = this.getCreateAttemptOptions();

            // And create the attempt
            this._labs.takeAction(Labs.Core.Actions.CreateAttemptAction, createAttemptAction, (err, createResult) => {
                var attempt: T = null;
                if (!err) {
                    try {
                        attempt = this.buildAttempt(createResult);
                    } catch (exception) {
                        err = exception;
                    }
                }

                setTimeout(() => callback(err, attempt), 0);
            });
        }

        /**
         * Retrieves all attempts associated with the given component
         *
         * @param { callback } Callback fired once the attempts have been retrieved
         */
        getAttempts(callback: Core.ILabCallback<T[]>) {
            var componentSearch: Core.GetActions.IGetComponentActionsOptions = {
                componentId: this._id,
                action: Core.Actions.CreateAttemptAction,
            };

            this._labs.getActions(Core.GetActions.GetComponentActions, componentSearch, (err, actions) => {
                // Construct the attempts if there wasn't an error
                var attempts : T[] = null;
                if (!err) {
                    attempts = actions.map((action) => this.buildAttempt(action));
                }

                // And return them
                setTimeout(() => callback(null, attempts), 0);
            });
        }

        /**
         * Retrieves the default create attempt options. Can be overriden by derived classes.
         */
        public getCreateAttemptOptions(): Labs.Core.Actions.ICreateAttemptOptions {
            var createAttemptAction: Labs.Core.Actions.ICreateAttemptOptions = {
                componentId: this._id
            };

            return createAttemptAction;
        }

        /**
         * method to built an attempt from the given action. Should be implemented by derived classes.
         *
         * @param { createAttemptResult } The create attempt action for the attempt
         */
        public buildAttempt(createAttemptResult: Core.IAction): T {
            throw "Not implemented";
        }
    }
}
