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
     * Base class for components instances 
     */
    export class ComponentInstanceBase {
        /**
         * The ID of the component
         */
        _id: string;

        /**
         * The LabsInternal object for use by the component instance
         */
        _labs: LabsInternal;

        constructor() {
        }

        /**
         * Attaches a LabsInternal to this component instance
         *
         * @param { id } The ID of the component
         * @param { labs } The LabsInternal object for use by the instance
         */
        attach(id: string, labs: LabsInternal) {
            this._id = id;
            this._labs = labs;
        }
    }
}
