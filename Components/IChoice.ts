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
     * A choice for a problem
     */
    export interface IChoice {
        /**
         * Unique id to represent the choice
         */
        id: string;

        /**
         * Display string to use to represent the value
         * I think I should put this into the value type - have default ones show up - and then have custom values within
         */
        name: string;

        /**
         * The value of the choice
         */
        value: any;
    }
}