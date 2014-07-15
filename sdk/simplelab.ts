module WebPageApp {
    /**
     * Helper method to create a ILabCallback for the given jQuery deferred object
     */
    function createCallback<T>(deferred: JQueryDeferred<T>): Labs.Core.ILabCallback<T> {
        return (err, data) => {
            if (err) {
                deferred.reject(err);
            }
            else {
                deferred.resolve(data);
            }
        };
    }

    /**
     * Enum to track which mode the user has selected when in edit mode.
     */
    export enum UserEditMode {
        Preview,
        Edit
    }

    class AppViewModel {
        appTemplate: KnockoutComputed<string>;
        uri: KnockoutObservable<string>;
        absoluteUri: KnockoutComputed<string>;
        userEditMode: KnockoutObservable<UserEditMode>;
        switchEditModeText: KnockoutComputed<string>;
        labMode: KnockoutObservable<Labs.Core.LabMode>;
        error: KnockoutObservable<boolean>;
        showWebPage: KnockoutComputed<boolean>;

        private _labEditor: Labs.LabEditor;
        private _labInstance: Labs.LabInstance;
        private _modeSwitchP: JQueryPromise<void> = $.when<void>();

        constructor(mode: Labs.Core.LabMode) {
            // Create observable properties
            this.error = ko.observable(false);
            this.uri = ko.observable("");            
            this.userEditMode = ko.observable(UserEditMode.Edit);            
            this.labMode = ko.observable(null);

            // Add the https to the Uri
            this.absoluteUri = ko.computed(() => 'https://' + this.uri());

            // Output edit mode text based on enum value
            this.switchEditModeText = ko.computed(() => {
                return this.userEditMode() === UserEditMode.Preview ?
                    UserEditMode[UserEditMode.Edit] :
                    UserEditMode[UserEditMode.Preview];
            });

            // Compute which view to show based on current properties
            this.appTemplate = ko.computed(() => {
                var error = this.error();
                var labMode = this.labMode();
                
                if (error) {
                    return "errorTemplate";                    
                }
                else if (labMode === null) {
                    return "loadingTemplate";                    
                }
                else {
                    return "appTemplate";
                }
            });

            // Also compute whether or not we should show the web page
            this.showWebPage = ko.computed(()=> {
                return this.labMode() === Labs.Core.LabMode.View || this.userEditMode() === UserEditMode.Preview;
            });

            // Listen for mode switches
            Labs.on(Labs.Core.EventTypes.ModeChanged, (data) => {
                var modeChangedEvent = <Labs.Core.ModeChangedEventData> data;
                this.switchToMode(Labs.Core.LabMode[modeChangedEvent.mode]);
            });

            // Subscribe to URI updates and propagate configuration changes back.
            this.uri.subscribe((newValue) => {
                if (this._labEditor) {
                    var configuration = this.getConfigurationFromUri(newValue);
                    this._labEditor.setConfiguration(configuration, (setConfigurationErr, unused)=> {
                        if (setConfigurationErr) {
                            this.error(true);
                        }
                    });
                }
            });

            // And switch to the necessary mode
            this.switchToMode(mode);
        }

        /**
         * Callback to change the user edit mode
         */
        switchUserMode() {
            this.userEditMode(this.userEditMode() === UserEditMode.Preview ? UserEditMode.Edit : UserEditMode.Preview);
        }

        /**
         * Switches the current lab mode to the passed in value.
         */
        private switchToMode(mode: Labs.Core.LabMode) {
            // wait for any previous mode switch to complete before performing the new one
            this._modeSwitchP = this._modeSwitchP.then<void>(() => {
                var switchedStateDeferred = $.Deferred<void>();

                // End any existing operations
                if (this._labInstance) {
                    this._labInstance.done(createCallback(switchedStateDeferred));
                }
                else if (this._labEditor) {
                    this._labEditor.done(createCallback(switchedStateDeferred));
                } else {
                    switchedStateDeferred.resolve();
                }

                // and now switch the state
                return switchedStateDeferred.promise().then(() => {
                    this._labEditor = null;
                    this._labInstance = null;

                    if (mode === Labs.Core.LabMode.Edit) {
                        return this.switchToEditMode();
                    } else {
                        return this.switchToShowMode();
                    }
                });
            });

            this._modeSwitchP.fail(()=> this.error(true));
        }

        private switchToEditMode(): JQueryPromise<void> {
            var editLabDeferred = $.Deferred<Labs.LabEditor>();
            Labs.editLab(createCallback(editLabDeferred));

            return editLabDeferred.promise().then<void>((labEditor) => {
                this._labEditor = labEditor;

                var configurationDeferred = $.Deferred<Labs.Core.IConfiguration>();
                labEditor.getConfiguration(createCallback(configurationDeferred));

                return configurationDeferred.promise().then((configuration) => {
                    // Construct the quiz from the saved configuration                    
                    if (configuration) {
                        this.uri((<Labs.Components.IActivityComponent> configuration.components[0]).data.uri);
                    } else {
                        this.uri("www.wikipedia.org");
                    }

                    this.labMode(Labs.Core.LabMode.Edit);
                });
            });
        }

        private switchToShowMode(): JQueryPromise<void> {
            var takeLabDeferred = $.Deferred<Labs.LabInstance>();
            Labs.takeLab(createCallback(takeLabDeferred));

            return takeLabDeferred.promise().then<void>((labInstance) => {
                this._labInstance = labInstance;

                var activityComponentInstance = <Labs.Components.ActivityComponentInstance> this._labInstance.components[0];
                this.uri(activityComponentInstance.component.data.uri);

                var attemptsDeferred = $.Deferred<Labs.Components.ActivityComponentAttempt[]>();
                activityComponentInstance.getAttempts(createCallback(attemptsDeferred));
                var attemptP = attemptsDeferred.promise().then((attempts) => {
                    var currentAttemptDeferred = $.Deferred();
                    if (attempts.length > 0) {
                        currentAttemptDeferred.resolve(attempts[attempts.length - 1]);
                    } else {
                        activityComponentInstance.createAttempt(createCallback(currentAttemptDeferred));
                    }

                    return currentAttemptDeferred.then((currentAttempt: Labs.Components.ActivityComponentAttempt) => {
                        var resumeDeferred = $.Deferred<void>();
                        currentAttempt.resume(createCallback(resumeDeferred));
                        return resumeDeferred.promise().then(() => {
                            return currentAttempt;
                        });
                    });
                });

                return attemptP.then((attempt: Labs.Components.ActivityComponentAttempt) => {
                    var completeDeferred = $.Deferred<void>();
                    if (attempt.getState() !== Labs.ProblemState.Completed) {
                        attempt.complete(createCallback(completeDeferred));
                    } else {
                        completeDeferred.resolve();
                    }
                    this.labMode(Labs.Core.LabMode.View);
                    return completeDeferred.promise();
                });
            });
        }

        //
        // Helper method to return the lab configuration from the provided URI
        //
        private getConfigurationFromUri(uri: string): Labs.Core.IConfiguration {
            var appVersion = { major: 1, minor: 0 };
            var configurationName = uri;
            var activityComponent: Labs.Components.IActivityComponent = {
                type: Labs.Components.ActivityComponentType,
                name: uri,
                values: {},
                data: {
                    uri: uri
                },
                secure: false
            };
            var configuration = {
                appVersion: appVersion,
                components: [activityComponent],
                name: configurationName,
                timeline: null,
                analytics: null
            };

            return configuration;
        }
    }

    $(document).ready(() => {
        // Initialize Labs.JS
        Labs.connect((err, connectionResponse) => {
            var viewModel = new AppViewModel(connectionResponse.mode);
            ko.applyBindings(viewModel);
        });
    });
}
