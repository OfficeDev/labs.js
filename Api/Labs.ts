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
    // Current initialization state
    var _connectionState = ConnectionState.Disconnected;

    // Internal device we use to communicate with the host
    var _labsInternal: LabsInternal;

    // Cached information received during a connection
    var _connectionResponse: Core.IConnectionResponse;

    // Timeline control class
    var _timeline: Timeline;

    // Map of deserialization functions
    var _labDeserializers: { [type: string]: (json: Core.ILabObject) => any; } = {};

    // Instance of lab being taken
    var _labInstance: LabInstance = null;

    // Instance of lab being edited
    var _labEditor: LabEditor = null;

    /**
     * Method to use to construct a default ILabHost
     */
    export var DefaultHostBuilder: () => Core.ILabHost;

    /**
     * Initializes a connection with the host.
     *
     * @param { labHost } The (optional) ILabHost to use. If not specified will be constructed with the DefaultHostBuilder
     * @param { callback } Callback to fire once the connection has been established
     */
    export function connect(callback: Core.ILabCallback<Core.IConnectionResponse>);
    export function connect(labHost: Core.ILabHost, callback: Core.ILabCallback<Core.IConnectionResponse>);
    export function connect(labHost: any, callback?: Core.ILabCallback<Core.IConnectionResponse>) {
        if (_connectionState !== ConnectionState.Disconnected) {
            throw "connect has previously been called";
        }

        // Set the correct parameters after the method overloading
        var translatedCallback = callback === undefined ? labHost : callback;
        var translatedLabHost = callback === undefined ? DefaultHostBuilder() : labHost;

        // Instantiate the internal labs class
        var labsInternal;
        try {
            labsInternal = new LabsInternal(translatedLabHost);
        } catch (exception) {
            setTimeout(() => translatedCallback(exception, null), 0);
            return;
        }

        // Now that we've been able to create the objects, set the state to connecting
        _connectionState = ConnectionState.Connecting;

        // And go and initialize communication with the host
        labsInternal.connect((err, connectionResponse) => {
            if (err) {
                _connectionState = ConnectionState.Disconnected;
                _labsInternal = null;
                _connectionResponse = null;
            } else {
                _connectionState = ConnectionState.Connected;
                _labsInternal = labsInternal;
                _connectionResponse = connectionResponse;
                _timeline = new Timeline(_labsInternal);
            }
            
            setTimeout(() => {
                // Invoke the callback to allow events to be registered
                translatedCallback(err, connectionResponse);

                // And notify the labs internal to send any pending events
                labsInternal.firePendingMessages();
            }, 0);
        });
    }

    /**
     * Returns whether or not the labs are connected to the host.
     */
    export function isConnected(): boolean {
        return _connectionState === ConnectionState.Connected;
    }

    /**
     * Retrieves the information associated with a connection
     */
    export function getConnectionInfo(): Core.IConnectionResponse {
        checkIsConnected();

        return _connectionResponse;
    }

    /**
     * Disconnects from the host.
     *
     * @param { completionStatus } The final result of the lab interaction
     */
    export function disconnect() {
        checkIsConnected();

        // Update our state to be disconnected
        _labsInternal.dispose();
        _labsInternal = null;
        _timeline = null;
        _labInstance = null;
        _labEditor = null;
        _connectionState = ConnectionState.Disconnected;
    }

    /**
     * Opens the lab for editing. When in edit mode the configuration can be specified. A lab cannot be edited while it
     * is being taken.
     *
     * @param { callback } Callback fired once the LabEditor is created
     */
    export function editLab(callback: Core.ILabCallback<LabEditor>) {
        checkIsConnected();

        if (_labInstance !== null) {            
            setTimeout(() => callback("Lab is being taken", null));
            return;
        }
        if (_labEditor !== null) {
            setTimeout(() => callback("Lab edit already in progress", null));
            return;
        }

        LabEditor.Create(
            _labsInternal,
            () => {
                _labEditor = null;
            },
            (err, labEditor) => {
                _labEditor = !err ? labEditor : null;
                setTimeout(() => callback(err, labEditor), 0);
            });
    }

    /**
     * Takes the given lab. This allows results to be sent for the lab. A lab cannot be taken while it is being edited.
     *
     * @param { callback } Callback fired once the LabInstance is created
     */
    export function takeLab(callback: Core.ILabCallback<LabInstance>) {
        checkIsConnected();

        if (_labEditor !== null) {
            setTimeout(()=> callback("Lab is being edited", null));
            return;
        }
        if (_labInstance !== null) {
            setTimeout(() => callback("Lab already in progress", null));
            return;
        }

        LabInstance.Create(
            _labsInternal,
            () => {
                _labInstance = null;
            },
            (err, labInstance) => {
                _labInstance = !err ? labInstance : null;
                setTimeout(() => callback(err, labInstance), 0);
            });
    }

    /**
     * Adds a new event handler for the given event
     * 
     * @param { event } The event to add a handler for
     * @param { handler } The event handler to add
     */
    export function on(event: string, handler: Core.IEventCallback) {
        checkIsConnected();

        _labsInternal.on(event, handler);
    }

    /**
     * Removes an event handler for the given event
     *
     * @param { event } The event to remove a handler for
     * @param { handler } The event handler to remove
     */
    export function off(event: string, handler: Core.IEventCallback) {
        checkIsConnected();

        _labsInternal.off(event, handler);
    }

    /**
     * Retrieves the Timeline object that can be used to control the host's player control.
     */
    export function getTimeline(): Timeline {
        checkIsConnected();

        return _timeline;
    }

    /**
     * Registers a function to deserialize the given type. Should be used by component authors only.
     * 
     * @param { type } The type to deserialize
     * @param { deserialize } The deserialization function
     */
    export function registerDeserializer(
        type: string,
        deserialize: (json: Core.ILabObject) => any) {

        // It is an error to register an already existing name
        if (type in _labDeserializers) {
            throw "Type already has a create function registered";
        }

        // Save the serialization functions
        _labDeserializers[type] = deserialize;
    }

    /**
     * Deserializes the given json object into an object. Should be used by component authors only.
     *
     * @param { json } The ILabObject to deserialize
     */
    export function deserialize(json: Core.ILabObject): any {
        if (!(json.type in _labDeserializers)) {
            throw "Unknown type";
        }

        return _labDeserializers[json.type](json);
    }

    /**
     * Helper method to catch and throw if not connected
     */
    function checkIsConnected() {
        if (_connectionState != ConnectionState.Connected) {
            throw "API not initialized";
        }
    }
}
