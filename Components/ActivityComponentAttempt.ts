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
     * A class representing an attempt at an activity component
     */
    export class ActivityComponentAttempt extends ComponentAttempt {
        constructor(labs: LabsInternal, componentId: string, attemptId: string, values: { [type: string]: Labs.Core.IValueInstance[]; }) {
            super(labs, componentId, attemptId, values);
        }
        
        /**
         * Called to indicate that the activity has completed
         *
         * @param { callback } Callback invoked once the activity has completed
         */
        complete(callback: Labs.Core.ILabCallback<void>) {            
            var submitAnswer: Labs.Core.Actions.ISubmitAnswerOptions = {
                componentId: this._componentId,
                attemptId: this._id,
                answer: null                
            };
            
            this._labs.takeAction(Labs.Core.Actions.SubmitAnswerAction, submitAnswer, null, (err, completedAction) => {
                if (err) {
                    setTimeout(() => callback(err, null), 0);
                    return;
                }

                this._state = ProblemState.Completed;

                setTimeout(() => callback(null, null), 0);
            });
        }

        
        /**
         * Runs over the retrieved actions for the attempt and populates the state of the lab
         */
        processAction(action: Core.IAction) {
            if (action.type === Labs.Core.Actions.SubmitAnswerAction) {
                    this._state = ProblemState.Completed;
            }
            else if (action.type === Labs.Core.Actions.GetValueAction) {
                super.processAction(action);
            }
        }              
    }
}