/// <reference path="LabsJsServer-[labs-version].d.ts" />
/// <reference path="./typings/knockout/knockout.d.ts" />
/// <reference path="./typings/underscore/underscore.d.ts" />

class LabsHostViewModel implements LabsServer.ILabEventProcessor {
    mode: KnockoutObservable<string>;
    labUriEntry: KnockoutObservable<string>;
    labUri: KnockoutObservable<string>;
    consoleEntries: KnockoutObservableArray<string>;
    configuration: KnockoutObservable<string>;
    configurationInstance: KnockoutObservable<string>;
    state: KnockoutObservable<string>;
    actions: KnockoutObservable<string>;
    results: KnockoutComputed<Labs.Core.IAction[]>;
    createHostVersion: KnockoutObservable<string>;
    active: KnockoutObservable<boolean>;
    private _version = { major: 0, minor: 1 };
    private _labState: Labs.InMemoryLabState = new Labs.InMemoryLabState();

    private attemptMap: any = {};
    private _server: LabsServer.LabHost;
    private _nextId = 0;

    constructor(mode: string, initialLab: string) {
        this.active = ko.observable(false);
        this.mode = ko.observable(mode);
        this.consoleEntries = ko.observableArray<string>();
        this.createHostVersion = ko.observable<string>();

        this.labUriEntry = ko.observable(initialLab);
        this.labUri = initialLab ? ko.observable(initialLab) : ko.observable<string>();
        this.actions = ko.observable(JSON.stringify([]));
        this.results = ko.computed(() => {
            var actions = this.actions();
            return JSON.parse(actions);
        });

        this.configuration = ko.observable(null);
        this.configurationInstance = ko.observable(null);
        this.state = ko.observable(null);

        this.actions.subscribe((newActions) => {
            this._labState.setActions(JSON.parse(newActions));
        });

        this.state.subscribe((newState) => {
            this._labState.setState(JSON.parse(newState));
        });

        this.configuration.subscribe((newConfiguration) => {
            this._labState.setConfiguration(<Labs.Core.IConfiguration> JSON.parse(newConfiguration));
            this.configurationInstance(JSON.stringify(this._labState.getConfigurationInstance()));
        });

        this._server = new LabsServer.LabHost("test", this);
        this._server.start();
    }

    loadLab() {
        this.log("Loading: " + this.labUriEntry());
        this.labUri(this.labUriEntry());
    }

    setEditMode() {
        var editModeString = Labs.Core.LabMode[Labs.Core.LabMode.Edit];

        if (this.mode() !== editModeString) {
            this.mode(Labs.Core.LabMode[Labs.Core.LabMode.Edit]);
            this.log("Setting Edit Mode");
            var promise = this._server.sendMessage(new Labs.Command(Labs.CommandType.ModeChanged, { mode: editModeString }));
            promise.done(() => {
                this.log("Mode Set");
            });
        }
    }

    setActive() {
        if (!this.active()) {
            this.active(true);
            this._server.setActive(true);
        }
    }

    setDeactive() {
        if (this.active()) {
            this.active(false);
            this._server.setActive(false);
        }
    }

    setViewMode() {
        var viewModeString = Labs.Core.LabMode[Labs.Core.LabMode.View];

        if (this.mode() !== viewModeString) {
            this.mode(viewModeString);
            this.log("Setting View Mode");
            var promise = this._server.sendMessage(new Labs.Command(Labs.CommandType.ModeChanged, { mode: viewModeString }));
            promise.done(() => {
                this.log("Mode Set");
            });
        }
    }

    log(entry: string) {
        this.consoleEntries.push(entry);
    }

    handleConnect(versionInfo: Labs.Core.ILabHostVersionInfo): JQueryPromise<Labs.Core.IConnectionResponse> {
        var hostVersion = this.createHostVersion() ? JSON.parse(this.createHostVersion()) : null;

        // Create the host version
        var initializationInfo = hostVersion !== null ? { hostVersion: hostVersion } : null;

        // I need to include the ID of the lab here to aid in the communication - use this to load the response
        var connectionResponse: Labs.Core.IConnectionResponse = {
            initializationInfo: initializationInfo,
            hostVersion: this._version,
            userInfo: {
                id: "TestUserId",
                permissions: [
                    Labs.Core.Permissions.Edit,
                    Labs.Core.Permissions.Take]
            },
            applicationId: "TestAppId",
            mode: Labs.Core.LabMode[this.mode()]
        };

        return $.when(connectionResponse);
    }

    handleDisconnect(completionStatus: Labs.Core.ICompletionStatus): JQueryPromise<void> {
        return $.when<void>();
    }

    // 
    // Helper method to verify whether or not a create call has occurred. We determine this by the host version
    // not being null
    //
    private verifyCreated(): boolean {
        var hostVersion = this.createHostVersion() ? JSON.parse(this.createHostVersion()) : null;
        return hostVersion !== null;
    }

    //
    // Helper method to create a rejected promise with the given error message
    //
    private createRejectedPromise(error: any): JQueryPromise<any> {
        var deferred = $.Deferred();
        deferred.reject(error);
        return deferred.promise();
    }

    handleGetConfiguration(): JQueryPromise<Labs.Core.IConfiguration> {
        if (!this.verifyCreated()) {
            return this.createRejectedPromise("Lab not created");
        }

        return $.when(this._labState.getConfiguration());
    }

    handleSetConfiguration(configuration: Labs.Core.IConfiguration): JQueryPromise<void> {
        if (!this.verifyCreated()) {
            return this.createRejectedPromise("Lab not created");
        }

        this._labState.setConfiguration(configuration);
        this.configuration(JSON.stringify(configuration));

        // A configuration change also changes all user data
        this.state(this._labState.getState());
        this.actions(JSON.stringify(this._labState.getAllActions()));
        this.configurationInstance(JSON.stringify(this._labState.getConfigurationInstance()));

        return $.when<void>();
    }

    handleGetState(): JQueryPromise<any> {
        if (!this.verifyCreated()) {
            return this.createRejectedPromise("Lab not created");
        }

        return $.when(this._labState.getState());
    }

    handleSetState(state: any): JQueryPromise<void> {
        if (!this.verifyCreated()) {
            return this.createRejectedPromise("Lab not created");
        }

        this._labState.setState(state);
        this.state(JSON.stringify(state));
        return $.when<void>();
    }

    handleCreate(options: Labs.Core.ILabCreationOptions): JQueryPromise<void> {
        this.createHostVersion(JSON.stringify(this._version));

        // A create call also clears all the stored lab data since it is indicating we want a new lab
        this.configuration(null);
        this.state = ko.observable(null);
        this.actions(JSON.stringify([]));

        return $.when<void>();
    }

    handleGetConfigurationInstance(): JQueryPromise<Labs.Core.IConfigurationInstance> {
        if (!this.verifyCreated()) {
            return this.createRejectedPromise("Lab not created");
        }

        return $.when(this._labState.getConfigurationInstance());
    }

    handleTakeAction(commandData: Labs.TakeActionCommandData): JQueryPromise<Labs.Core.IAction> {
        if (!this.verifyCreated()) {
            return this.createRejectedPromise("Lab not created");
        }

        var completedAction = this._labState.takeAction(commandData.type, commandData.options, commandData.result);
        this.actions(JSON.stringify(this._labState.getAllActions()));
        return $.when(completedAction);
    }

    handleGetActions(commandData: Labs.GetActionsCommandData): JQueryPromise<Labs.Core.IAction[]> {
        if (!this.verifyCreated()) {
            return this.createRejectedPromise("Lab not created");
        }

        var completedActions = this._labState.getActions(commandData.type, commandData.options);
        return $.when(completedActions);
    }

    handleSendMessage(messageData: Labs.SendMessageCommandData): JQueryPromise<Labs.Core.IMessageResponse> {
        if (!this.verifyCreated()) {
            return this.createRejectedPromise("Lab not created");
        }

        this.log(JSON.stringify(messageData));
        return $.when();
    }
}