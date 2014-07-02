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
     * Static class containing the different event types.
     */
    export class EventTypes {
        /**
         * Mode changed event type. Fired whenever the lab mode is changed.
         */
        public static ModeChanged = "modeChanged";

        /**
         * Event invoked when the app becomes active.
         */
        public static Activate = "activate";

        /**
         * Event invoked when the app is deactivated
         */
        public static Deactivate = "deactivate";
    }
}