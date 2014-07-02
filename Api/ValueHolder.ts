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
     * A ValueHolder is responsible for holding a value that when requested is tracked by labs.js. 
     * This value may be stored locally or stored on the server.
     */
    export class ValueHolder<T> {
        /**
         * The component the value is associated with
         */
        private _componentId: string;

        /**
         * Attempt the value is associated with
         */
        private _attemptId: string;

        /**
         * Underlying labs device
         */
        private _labs: LabsInternal;

        /**
         * Whether or not the value is a hint
         */
        public isHint: boolean;

        /**
         * Whether or not the value has been requested.
         */
        public hasBeenRequested: boolean;

        /**
         * Whether or not the value holder currently has the value.
         */
        public hasValue: boolean;

        /**
         * The value held by the holder.
         */
        public value: T;

        /**
         * The ID for the value
         */
        public id: string;

        /**
         * Constructs a new ValueHolder
         *
         * @param { componentId } The component the value is associated with
         * @param { attemptId } The attempt the value is associated with
         * @param { id } The id of the value
         * @param { labs } The labs device that can be used to request the value
         * @param { isHint } Whether or not the value is a hint
         * @param { hasBeenRequested } Whether or not the value has already been requested
         * @param { hasValue } Whether or not the value is available
         * @param { value } If hasValue is true this is the value, otherwise is optional
         */
        constructor(componentId: string, attemptId: string, id: string, labs: LabsInternal, isHint: boolean, hasBeenRequested: boolean, hasValue: boolean, value?: T) {
            this._componentId = componentId;
            this._attemptId = attemptId;
            this.id = id;
            this._labs = labs;
            this.isHint = isHint;
            this.hasBeenRequested = hasBeenRequested;
            this.hasValue = hasValue;
            this.value = value;
        }

        /**
         * Retrieves the given value
         * 
         * @param { callback } Callback that returns the given value
         */
        getValue(callback: Core.ILabCallback<T>) {
            // If we already have the value return it back immediately
            if (this.hasValue && this.hasBeenRequested) {
                setTimeout(() => callback(null, this.value), 0);
                return;
            }

            // Otherwise construct the message to retrieve it and send it back
            var options: Labs.Core.Actions.IGetValueOptions = {
                componentId: this._componentId,
                attemptId: this._attemptId,
                valueId: this.id,
                isHint: this.isHint
            };
            this._labs.takeAction(Labs.Core.Actions.GetValueAction, options, (err, completedAction) => {
                if (!err) {
                    var result = <Labs.Core.Actions.IGetValueResult> completedAction.result;
                    this.value = <T> result.value;
                    this.hasValue = true;
                    this.hasBeenRequested = true;
                }

                setTimeout(() => callback(err, this.value), 0);
            });
        }

        /**
         * Internal method used to actually provide a value to the value holder
         *
         * @param { value } The value to set for the holder
         */
        provideValue(value: T) {
            this.value = value;
            this.hasValue = true;
            this.hasBeenRequested = true;
        }
    }
}