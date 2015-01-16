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

module Labs.Core {
    /**
     * The current mode of the lab. Whether in edit mode or view mode. Edit is when configuring the lab and view
     * is when taking the lab.
     */
    export enum LabMode {
        /**
         * The lab is in edit mode. Meaning the user is configuring it
         */
        Edit,

        /**
         * The lab is in view mode. Meaning the user is taking it
         */
        View
    }    
}