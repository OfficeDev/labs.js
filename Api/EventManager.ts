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
     * Helper class to manage a set of event handlers
     */
    export class EventManager {
        private _handlers: any = {};

        private getHandler(event: string): Core.IEventCallback[] {
            var handler = this._handlers[event];
            if (handler === undefined) {
                this._handlers[event] = [];
            }

            return <Core.IEventCallback[]> this._handlers[event];
        }

        /**
         * Adds a new event handler for the given event
         * 
         * @param { event } The event to add a handler for
         * @param { handler } The event handler to add
         */
        add(event: string, handler: Core.IEventCallback) {
            var eventHandlers = this.getHandler(event);
            eventHandlers.push(handler);
        }

        /**
         * Removes an event handler for the given event
         *
         * @param { event } The event to remove a handler for
         * @param { handler } The event handler to remove
         */
        remove(event: string, handler: Core.IEventCallback) {
            var eventHandlers = this.getHandler(event);
            for (var i = eventHandlers.length - 1; i >= 0; i--) {
                if (eventHandlers[i] === handler) {
                    eventHandlers.splice(i, 1);
                }
            }
        }

        /**
         * Fires the given event
         * 
         * @param { event } The event to fire
         * @param { data } Data associated with the event
         */
        fire(event: string, data: any) {
            var eventHandlers = this.getHandler(event);
            eventHandlers.forEach((handler) => {
                handler(data);
            });
        }
    }
}