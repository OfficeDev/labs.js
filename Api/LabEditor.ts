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
     * The LabEditor allows for the editing of the given lab. This includes getting and setting
     * the entire configuration associated with the lab.
     */
    export class LabEditor {
        private _labsInternal: LabsInternal;
        private _doneCallback: Function;

        /**
         * Constructs a new LabEditor
         *
         * @param { labsInternal } LabsInternal to use with the editor
         * @param { doneCallback } Callback to invoke when the editor is finished
         */
        constructor(labsInternal: LabsInternal, doneCallback: Function) {
            this._labsInternal = labsInternal;
            this._doneCallback = doneCallback;
        }

        /**
         * Creates a new lab editor. This prepares the lab storage and saves the host version if it hasn't already
         * been provisioned.
         *
         * @param { labsInternal } LabsInternal to use with the editor
         * @param { doneCallback } Callback to invoke when the editor is finished
         * @param { callback } Callback fired once the LabEditor has been created
         */
        static Create(labsInternal: LabsInternal, doneCallback: Function, callback: Core.ILabCallback<LabEditor>) {
            // Check to see if storage for the lab has already been created - in which case there is no need to 
            // reserve the space. Otherwise reserve it prior to creating the lab
            if (labsInternal.isCreated()) {                
                // Instantiate the components and then attach them to the lab
                var labEditor = new LabEditor(labsInternal, doneCallback);
                setTimeout(() => callback(null, labEditor), 0);
            }
            else {                
                labsInternal.create((err, data) => {
                    if (err) {
                        setTimeout(() => callback(err, null), 0);
                        return;
                    }

                    // Instantiate the components and then attach them to the lab
                    var labEditor = new LabEditor(labsInternal, doneCallback);
                    setTimeout(() => callback(null, labEditor), 0);
                });
            }            
        }

        /**
         * Gets the current lab configuration
         *
         * @param { callback } Callback fired once the configuration has been retrieved
         */
        getConfiguration(callback: Core.ILabCallback<Core.IConfiguration>) {
            this._labsInternal.getConfiguration(callback);
        }

        /**
         * Sets a new lab configuration
         * 
         * @param { configuration } The configuration to set
         * @param { callback } Callback fired once the configuration has been set
         */
        setConfiguration(configuration: Core.IConfiguration, callback: Core.ILabCallback<void>) {
            this._labsInternal.setConfiguration(configuration, callback);
        }

        /**
         * Indicates that the user is done editing the lab.
         * 
         * @param { callback } Callback fired once the lab editor has finished
         */
        done(callback: Core.ILabCallback<void>) {
            this._doneCallback();
            this._doneCallback = null;
            setTimeout(() => callback(null, null), 0);
        }
    }
}