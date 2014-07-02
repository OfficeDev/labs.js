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
     * Type string for an ActivityComponent
     */
    export var ActivityComponentType = "Labs.Components.ActivityComponent";

    /**
     * An activity component is simply an activity for the taker to experience. Examples are viewing a web page
     * or watching a video.
     */
    export interface IActivityComponent extends Labs.Core.IComponent {
        /**
         * Whether or not the input component is secure. This is not yet implemented.
         */
        secure: boolean;        
    }
}