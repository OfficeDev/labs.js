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
     * Type of message being sent over the wire
     */
    export enum MessageType {
        Message,
        Completion,
        Failure
    }

    /**
     * The message being sent
     */
    export class Message {
        constructor(public id: number, public labId: string, public type: MessageType, public payload: any) {
        }
    }

    /**
     * Interface for defining event handlers
     */
    export interface IMessageHandler {
        (origin: Window, data: any, callback: Labs.Core.ILabCallback<any>): void;   
    }

    interface IMessageResponse {
        origin: Window;
        callback: Labs.Core.ILabCallback<any>;
    }

    export class MessageProcessor {
        isStarted: boolean;
        eventListener: EventListener;        
        nextMessageId: number;
        private messageMap: { [key: number]: IMessageResponse; };
        targetOrigin: string;
        messageHandler: IMessageHandler;
        private _labId: string;

        constructor(labId: string, targetOrigin: string, messageHandler: IMessageHandler) {
            this._labId = labId;
            this.isStarted = false;            
            this.nextMessageId = 0;
            this.targetOrigin = targetOrigin;
            this.messageHandler = messageHandler;
            this.messageMap = {};
        }

        private throwIfNotStarted() {
            if (!this.isStarted) {
                throw "Processor has not been started";
            }
        }

        private getNextMessageId() {
            return this.nextMessageId++;
        }

        ///
        /// Given a URI parses it and returns the origin to use in postMessage security checks
        ///
        private parseOrigin(href: string): string {
            var parser = <HTMLAnchorElement>document.createElement('a');
            parser.href = href;
            return parser.protocol + "//" + parser.host;
        }

        private listener(event: Event) {            
            var response: IMessageResponse;
                        
            // Get the message - we only listen to events going to our lab ID and that are valid JSON
            var messageEvent = <MessageEvent> event;
            var message: Message;
            try {
                message = <Message> JSON.parse(messageEvent.data);
            } catch (exception) {
                return;
            }

            if (message.labId !== this._labId) {
                return;
            }
                        
            // And process
            if (message.type === MessageType.Completion) {
                response = this.messageMap[message.id];                
                delete this.messageMap[message.id];

                // Verify the response is from the same original source
                if (response.origin === messageEvent.source) {
                    response.callback(null, message.payload);                    
                }                
            }
            else if (message.type === MessageType.Failure) {
                response = this.messageMap[message.id];                
                delete this.messageMap[message.id];

                // Verify the response is from the same original source
                if (response.origin === messageEvent.source) {
                    response.callback({ error: message.payload }, null);
                }
            }
            else if (message.type == MessageType.Message) {
                this.messageHandler(messageEvent.source, message.payload, (err, data) => {
                    var responseMessage = new Message(message.id, this._labId, err ? MessageType.Failure : MessageType.Completion, data);                        
                    
                    try {
                        this.postMessage(messageEvent.source, responseMessage);
                    } catch (exceptoin) {
                        // We simply drop any messages should there be an error during the postMessage - at this point 
                        // we have lost the ability to communicate with that source
                    }
                });
            }
            else {
                throw "Unknown message type";
            }
        }

        private postMessage(targetWindow: Window, message: any) {
            if (!targetWindow) {
                throw "Unknown target window";
            }

            targetWindow.postMessage(JSON.stringify(message), this.targetOrigin);            
        }

        public start() {
            if (this.isStarted) {
                throw "Processor already running";
            }            

            this.eventListener = (event) => { this.listener(event); };
            window.addEventListener("message", this.eventListener);
            this.isStarted = true;
        }

        public stop() {
            this.throwIfNotStarted();

            window.removeEventListener("message", this.eventListener);
            this.isStarted = false;
        }

        public sendMessage(targetWindow: Window, data: any, callback: Labs.Core.ILabCallback<any>) {
            this.throwIfNotStarted();
            
            var nextId = this.getNextMessageId();
            var message = new Message(nextId, this._labId, MessageType.Message, data);
           
            try {
                this.postMessage(targetWindow, message);
            } catch (exception) {
                setTimeout(()=> callback(exception ? exception : "post message exception", null), 0);
                return;
            }
            
            this.messageMap[nextId] = {
                origin: targetWindow,
                callback: callback
            };
        }
    }
}