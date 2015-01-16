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
     * Base class for attempts
     */
    export class ComponentAttempt {
        // The ID of the component
        _componentId: string;

        // ID of the attempt        
        _id: string;

        // LabsInternal to communicate using
        _labs: LabsInternal;

        // Whether or not the component has been resumed
        _resumed: boolean = false;

        // Current state of the attempt
        _state: ProblemState = Labs.ProblemState.InProgress;

        // Values associated with the attempt
        _values: { [type: string]: ValueHolder<any>[]; } = {};

        /**
         * Constructs a new ComponentAttempt.
         *
         * @param { labs } The LabsInternal to use with the attempt
         * @param { attemptId } The ID associated with the attempt
         * @param { values } The values associated with the attempt
         */
        constructor(labs: LabsInternal, componentId: string, attemptId: string, values: { [type: string]: Labs.Core.IValueInstance[]; }) {
            this._labs = labs;
            this._id = attemptId;
            this._componentId = componentId;

            // Construct the values from the passed in code
            for (var key in values) {
                var valueHolderValues: ValueHolder<any>[] = [];
                var valueArray = values[key];
                for (var i = 0; i < valueArray.length; i++) {
                    var value = valueArray[i];
                    valueHolderValues.push(new ValueHolder(this._componentId, this._id, value.valueId, this._labs, value.isHint, false, value.hasValue, value.value));
                }

                this._values[key] = valueHolderValues;
            }
        }

        /**
         * Verifies that the attempt has been resumed
         */
        verifyResumed() {
            if (!this._resumed) {
                throw "Attempt has not yet been resumed";
            }
        }

        /**
         * Returns whether or not the app has been resumed
         */
        isResumed(): boolean {
            return this._resumed;
        }

        /**
         * Used to indicate that the lab has resumed progress on the given attempt. Loads in existing data as part of this process. An attempt
         * must be resumed before it can be used.
         * 
         * @param { callback } Callback fired once the attempt is resumed
         */
        resume(callback: Labs.Core.ILabCallback<void>) {
            if (this._resumed) {
                throw "Already resumed";
            }

            var attemptSearch: Core.GetActions.IGetAttemptOptions = {
                attemptId: this._id
            };
            this._labs.getActions(Core.GetActions.GetAttempt, attemptSearch, (err, actions) => {
                if (err) {
                    setTimeout(() => callback(err, null), 0);
                    return;
                }

                this.resumeCore(actions);
                this.sendResumeAction((resumeErr, data) => {
                    if (!resumeErr) {
                        this._resumed = true;
                    }

                    setTimeout(() => callback(err, data));
                });
            });
        }

        /**
         * Helper method to send the resume action to the host
         */
        private sendResumeAction(callback: Labs.Core.ILabCallback<void>) {
            var resumeAttemptActon: Labs.Core.Actions.IResumeAttemptOptions = {
                componentId: this._componentId,
                attemptId: this._id
            };

            this._labs.takeAction(Labs.Core.Actions.ResumeAttemptAction, resumeAttemptActon, (err, data) => {
                if (!err) {
                }

                setTimeout(() => callback(err, null), 0);
            });
        }

        /**
         * Runs over the retrieved actions for the attempt and populates the state of the lab
         */
        private resumeCore(actions: Core.IAction[]) {
            for (var i = 0; i < actions.length; i++) {
                var action = actions[i];
                this.processAction(action);
            }
        }

        /**
         * Retrieves the state of the lab
         */
        getState(): ProblemState {
            return this._state;
        }

        processAction(action: Labs.Core.IAction) {
            if (action.type === Labs.Core.Actions.GetValueAction) {
                this.useValue(action);
            }
            else if (action.type == Labs.Core.Actions.AttemptTimeoutAction) {
                this._state = Labs.ProblemState.Timeout;
            }
        }

        /**
         * Retrieves the cached values associated with the attempt
         *
         * @param { key } The key to lookup in the value map
         */
        getValues(key: string): ValueHolder<any>[] {
            this.verifyResumed();

            return this._values[key];
        }

        /**
         * Makes use of a value in the value array
         */
        private useValue(completedSubmission: Labs.Core.IAction) {
            var useValueAction = <Labs.Core.Actions.IGetValueOptions> completedSubmission.options;
            var useValueResult = <Labs.Core.Actions.IGetValueResult> completedSubmission.result;

            var valueId = useValueAction.valueId;

            // Go find the key for the given value
            for (var key in this._values) {
                var valueArray = this._values[key];
                for (var i = 0; i < valueArray.length; i++) {
                    if (valueArray[i].id === valueId) {
                        valueArray[i].provideValue(useValueResult.value);
                    }
                }
            }
        }
    }
}