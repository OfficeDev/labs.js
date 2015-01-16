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
     * A class representing an attempt at a choice component
     */
    export class ChoiceComponentAttempt extends ComponentAttempt {       
        // Submissions associated with the attempt
        private _submissions: ChoiceComponentSubmission[] = [];   
        
        /**
         * Constructs a new ChoiceComponentAttempt.
         *
         * @param { labs } The LabsInternal to use with the attempt
         * @param { attemptId } The ID associated with the attempt
         * @param { values } The values associated with the attempt
         */
        constructor(labs: LabsInternal, componentId: string, attemptId: string, values: { [type: string]: Labs.Core.IValueInstance[]; }) {
            super(labs, componentId, attemptId, values);
        }        
        
        /**
         * Used to mark that the lab has timed out
         * 
         * @param { callback } Callback fired once the server has received the timeout message
         */
        timeout(callback: Labs.Core.ILabCallback<void>) {
            this._labs.takeAction(
                Labs.Core.Actions.AttemptTimeoutAction,
                <Labs.Core.Actions.IAttemptTimeoutOptions> { attemptId: this._id },
                (err, result)=> {
                    if (!err) {
                        this._state = Labs.ProblemState.Timeout;
                    }

                    setTimeout(()=> callback(err, null), 0);
                });
        }
        
        /**
         * Retrieves all of the submissions that have previously been submitted for the given attempt         
         */
        getSubmissions(): ChoiceComponentSubmission[] {
            this.verifyResumed();

            return this._submissions;            
        }                
        
        /**
         * Submits a new answer that was graded by the lab and will not use the host to compute a grade.
         * 
         * @param { answer } The answer for the attempt
         * @param { result } The result of the submission
         * @param { callback } Callback fired once the submission has been received
         */
        submit(answer: ChoiceComponentAnswer, result: ChoiceComponentResult, callback: Labs.Core.ILabCallback<ChoiceComponentSubmission>) {
            this.verifyResumed();

            var submitAnswer: Labs.Core.Actions.ISubmitAnswerOptions = {
                componentId: this._componentId,
                attemptId: this._id,
                answer: answer.answer
            };

            var submitResult: Labs.Core.Actions.ISubmitAnswerResult = {
                submissionId: null,
                complete: result.complete,
                score: result.score
            };
            
            this._labs.takeAction(Labs.Core.Actions.SubmitAnswerAction, submitAnswer, submitResult, (err, completedAction) => {
                if (err) {
                    setTimeout(()=> callback(err, null), 0);
                    return;
                }

                var submission = this.storeSubmission(completedAction);

                setTimeout(()=> callback(null, submission), 0);
            });
        }
        
        processAction(action: Labs.Core.IAction) {
            if (action.type === Labs.Core.Actions.SubmitAnswerAction) {
                this.storeSubmission(action);
            } else {
                super.processAction(action);
            }            
        }

        /**
         * Helper method used to handle a returned submission from labs core
         */
        private storeSubmission(completedSubmission: Labs.Core.IAction): ChoiceComponentSubmission {
            var options = <Labs.Core.Actions.ISubmitAnswerOptions> completedSubmission.options;
            var result = <Labs.Core.Actions.ISubmitAnswerResult> completedSubmission.result;

            if (result.complete) {
                this._state = Labs.ProblemState.Completed;
            }

            var submission = new ChoiceComponentSubmission(
                new ChoiceComponentAnswer(options.answer),
                new ChoiceComponentResult(result.score, result.complete),
                completedSubmission.time);

            this._submissions.push(submission);

            return submission;
        }        
    }
}