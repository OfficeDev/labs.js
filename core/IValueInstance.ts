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
     * An intance of an IValue
     */
    export interface IValueInstance {
        /**
         * ID for the value this instance represents
         */
        valueId: string;

        /**
         * Flag indicating whether or not this value is considered a hint
         */
        isHint: boolean;

        /**
         * Flag indicating whether or not the instance information contains the value.
         */
        hasValue: boolean;

        /**
         * The value. May or may not be set depending on if it has been hidden.
         */
        value?: { [type: string]: any; };
    }
}