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

/// <reference path="./qunit.d.ts" />
/// <reference path="./jquery.d.ts" />
/// <reference path="./underscore.d.ts" />
/// <reference path="../sdk/labs-[labs-version].d.ts" />

QUnit.module("Labs Module", {
    setup: () => {        
    },
    teardown: () => {        
    }
});

function createDefaultChoiceConfiguration() {
    var appVersion = { major: 1, minor: 1 };
    var configurationName = "QUnit Test Lab";

    var choiceComponent: Labs.Components.IChoiceComponent = {
        name: "Test Lab",
        type: Labs.Components.ChoiceComponentType,
        timeLimit: 0,
        maxAttempts: 0,
        choices: [{ id: "0", name: "True", value: "True" }, { id: "1", name: "False", value: "False" }],
        maxScore: 1,
        hasAnswer: true,
        answer: "0",
        values: {hints: [{ id: null, isHint: true, value: "The answer is true" }, { id: null, isHint: true, value: "The answer is really true" }]},
        secure: false
    };

    // Go and create a basic configuration and store it
    var configuration: Labs.Core.IConfiguration = {
        appVersion: appVersion,
        components: [choiceComponent],
        name: configurationName,
        timeline: null,
        analytics: null
    };

    return configuration;
}

function makeJQueryPromise<T>(deferred: JQueryDeferred<T>): Labs.Core.ILabCallback<T> {
    return (err, data) => {
        if (err) {
            deferred.reject(err);
        }
        else {
            deferred.resolve(data);
        }
    };
}

var defaultVersion = { major: 0, minor: 1};

function connect() : JQueryPromise<Labs.Core.IConnectionResponse> {
    var deferred = $.Deferred();
    Labs.connect(makeJQueryPromise(deferred));
    return deferred.promise();
}

function defaultConnect(): JQueryPromise<Labs.Core.IConnectionResponse> {
    var host = new Labs.InMemoryLabHost(defaultVersion);
    Labs.DefaultHostBuilder = () => host;
    return connect();    
}

// Test connecting with an unsupported host version
asyncTest("test bad version low", () => {
    var host = new Labs.InMemoryLabHost({ major: 3, minor: 0 });
    Labs.DefaultHostBuilder = () => host;
    Labs.connect((err, initialData) => {
        notEqual(err, null);
        start();
    });
});

// Test connecting with too high of a host version
asyncTest("test bad version high", () => {
    var host = new Labs.InMemoryLabHost({ major: 3, minor: 0 });
    Labs.DefaultHostBuilder = () => host;
    Labs.connect((err, initialData) => {
        notEqual(err, null);
        start();
    });
});

function defaultEndTest<T>(promise: JQueryPromise<T>) {
    promise
        .done(() => ok(true))
        .fail(() => ok(false))
        .always(() => {
            Labs.disconnect();
        start();
    });
}

// Test connecting 
asyncTest("test connect", () => {
    var connectionP = defaultConnect();
    var disconnectP = connectionP.then((connectionState) => Labs.disconnect());

    disconnectP
        .done(() => ok(true))
        .fail(() => ok(false))
        .always(() => start());
});

function connectAndSetEmptyConfiguration() {
    // Connect to the host
    var connectionP = defaultConnect();
    var labEditorP = connectionP.then(() => {
        var editorDeferred = $.Deferred();
        Labs.editLab(makeJQueryPromise(editorDeferred));
        return editorDeferred.promise();
    });

    // Go and create the empty lab
    return labEditorP.then((editor: Labs.LabEditor) => {
        var appVersion = { major: 1, minor: 1};
        var configurationName = "QUnit Test Lab";

        // Go and create a basic configuration and store it
        var configuration: Labs.Core.IConfiguration = {
            appVersion: appVersion, 
            components: [],
            name: configurationName,
            timeline: null,
            analytics: null
        };

        var setConfigurationDeferred = $.Deferred<void>();
        editor.setConfiguration(configuration, makeJQueryPromise(setConfigurationDeferred));
    
        // And now set that we are done editing the lab
        return setConfigurationDeferred.promise().then(() => {
            var doneDeferred = $.Deferred<void>();
            editor.done(makeJQueryPromise(doneDeferred));
            return doneDeferred.promise();
        });
    });
}

function connectAndSetConfiguration(configuration: Labs.Core.IConfiguration) {
    // Connect to the host
    var connectionP = defaultConnect();
    var labEditorP = connectionP.then(() => {
        var editorDeferred = $.Deferred();
        Labs.editLab(makeJQueryPromise(editorDeferred));
        return editorDeferred.promise();
    });

    // Go and create the empty lab
    return labEditorP.then((editor: Labs.LabEditor) => {        
        var setConfigurationDeferred = $.Deferred<void>();
        editor.setConfiguration(configuration, makeJQueryPromise(setConfigurationDeferred));

        // And now set that we are done editing the lab
        return setConfigurationDeferred.promise().then(() => {
            var doneDeferred = $.Deferred<void>();
            editor.done(makeJQueryPromise(doneDeferred));
            return doneDeferred.promise();
        });
    });
}

asyncTest("test edit configuration", () => {
    // Connect and create the default lab
    var connectionP = defaultConnect();
    var labEditorP = connectionP.then(() => {
        var editorDeferred = $.Deferred();
        Labs.editLab(makeJQueryPromise(editorDeferred));
        return editorDeferred.promise();
    });
    var doneEditing = labEditorP.then((editor: Labs.LabEditor) => {
        // Get the configuration and verify it is null
        var nullConfigurationDeferred = $.Deferred();
        editor.getConfiguration(makeJQueryPromise(nullConfigurationDeferred));
        var nullEditorP = nullConfigurationDeferred.then((configuration: Labs.Core.IConfiguration) => {
            equal(null, configuration);
        });

        var appVersion = { major: 1, minor: 1};
        var configurationName = "QUnit Test Lab";

        // Go and create a basic configuration and store it
        var setConfigurationP = nullEditorP.then(() => {
            var configuration: Labs.Core.IConfiguration = {
                appVersion: appVersion, 
                components: [],
                name: configurationName,
                timeline: null,
                analytics: null
            };

            var setConfigurationDeferred = $.Deferred<void>();
            editor.setConfiguration(configuration, makeJQueryPromise(setConfigurationDeferred));
            return setConfigurationDeferred.promise();
        });
        
        // Do a get and make sure we have something and that it matches
        var getConfigurationP = setConfigurationP.then(() => {
            var getConfigurationDeferred = $.Deferred();
            editor.getConfiguration(makeJQueryPromise(getConfigurationDeferred));
            return getConfigurationDeferred.promise().then((savedConfiguration: Labs.Core.IConfiguration) => {
                equal(savedConfiguration.name, configurationName);
                equal(appVersion.major, savedConfiguration.appVersion.major);
                equal(appVersion.minor, savedConfiguration.appVersion.minor);
                equal(0, savedConfiguration.components.length);
            });
        });

        // And now set that we are done editing the lab
        return getConfigurationP.then(() => {
            var doneDeferred = $.Deferred<void>();
            editor.done(makeJQueryPromise(doneDeferred));
            return doneDeferred.promise().then(() => {
                Labs.disconnect();
            });
        });
    });

    // Connect a second time and verify that we get the correct version information
    var finishedP = doneEditing.then(() => {
        var secondConnectionP = connect();
        return secondConnectionP.then((connectionInfo) => {            
            equal(defaultVersion.major, connectionInfo.initializationInfo.hostVersion.major);
            equal(defaultVersion.minor, connectionInfo.initializationInfo.hostVersion.minor);

            // Also verify the saved configuration
        });
    });

    defaultEndTest(finishedP);
});

asyncTest("Test Take Lab State", () => {
    var createdConfigurationP = connectAndSetEmptyConfiguration();
    var takeLabP = createdConfigurationP.then(() => {
        var takeLabDeferred = $.Deferred();
        Labs.takeLab(makeJQueryPromise(takeLabDeferred));
        return takeLabDeferred.promise();
    });

    var stateP = takeLabP.then((labInstance: Labs.LabInstance) => {
        var getStateDeferred = $.Deferred();
        labInstance.getState(makeJQueryPromise(getStateDeferred))
        var getStateP = getStateDeferred.promise().then((state: any) => {
            equal(null, state);            
        });

        var setStateP = getStateP.then(() => {
            var setStateDeferred = $.Deferred<void>();
            labInstance.setState({ foo: 'bar'}, makeJQueryPromise(setStateDeferred));
            return setStateDeferred.promise();
        });

        var checkStateP = setStateP.then(() => {
            var checkStateDeferred = $.Deferred<any>();
            labInstance.getState(makeJQueryPromise(checkStateDeferred));
            return checkStateDeferred.then((state) => {
                equal(state.foo, 'bar');
            });
        });

        var doneP = checkStateP.then(() => {
            var doneDeferred = $.Deferred<void>();
            labInstance.done(makeJQueryPromise(doneDeferred));
            return doneDeferred.promise();
        });

        return doneP;
    });

    defaultEndTest(stateP);
});

function createAndTakeDefaultLab(): JQueryPromise<Labs.LabInstance> {
    return createAndTakeLab(createDefaultChoiceConfiguration());
}

function createAndTakeLab(configuration: Labs.Core.IConfiguration): JQueryPromise<Labs.LabInstance> {
    var createdConfigurationP = connectAndSetConfiguration(configuration);
    return createdConfigurationP.then<Labs.LabInstance>(() => {
        var takeLabDeferred = $.Deferred();
        Labs.takeLab(makeJQueryPromise(takeLabDeferred));
        return takeLabDeferred.promise();
    });
}

asyncTest("Test Get Instance Configuration", () => {
    var takeLabP = createAndTakeDefaultLab();

    var getConfigurationInstanceP = takeLabP.then((labInstance: Labs.LabInstance) => {
        equal(1, labInstance.components.length);
        equal(Labs.Components.ChoiceComponentInstanceType, (<Labs.Components.ChoiceComponentInstance> labInstance.components[0]).component.type);
        var choiceComponentInstance = <Labs.Components.ChoiceComponentInstance> labInstance.components[0];
        equal(choiceComponentInstance._id, "0");

        // Create a new attempt
        var getZeroAttemptsDeferred = $.Deferred<Labs.Components.ChoiceComponentAttempt[]>();
        choiceComponentInstance.getAttempts(makeJQueryPromise(getZeroAttemptsDeferred));
        var getZeroAttemptsP = getZeroAttemptsDeferred.promise().then((attempts)=> {
            equal(0, attempts.length);
        });

        var createAttemptP = getZeroAttemptsP.then(() => {
            var createAttemptDeferred = $.Deferred();
            choiceComponentInstance.createAttempt(makeJQueryPromise(createAttemptDeferred));
            return createAttemptDeferred.promise();
        });

        var attemptActionsP = createAttemptP.then((attempt: Labs.Components.ChoiceComponentAttempt) => {
            var singleAttemptDeferred = $.Deferred<Labs.Components.ChoiceComponentAttempt[]>();
            choiceComponentInstance.getAttempts(makeJQueryPromise(singleAttemptDeferred));
            return singleAttemptDeferred.promise().then((attempts)=> {
                equal(1, attempts.length);
            });
        });

        var doneP = attemptActionsP.then(()=> {
            var doneDeferred = $.Deferred<void>();
            labInstance.done(makeJQueryPromise(doneDeferred));
            return doneDeferred.promise();
        });

        return doneP;
    });

    defaultEndTest(getConfigurationInstanceP);
});

function connectAndTake(): JQueryPromise<Labs.LabInstance> {
    // Connect to the host
    var connectionDeferred = $.Deferred();
    Labs.connect(makeJQueryPromise(connectionDeferred));

    // and then take the lab
    return connectionDeferred.promise().then<Labs.LabInstance>(() => {
        var takeLabDeferred = $.Deferred();
        Labs.takeLab(makeJQueryPromise(takeLabDeferred));
        return takeLabDeferred.promise();
    });
}

asyncTest("Test Attempt Actions", () => {
    var takeLabP = createAndTakeDefaultLab();

    var firstAttemptP = takeLabP.then((labInstance: Labs.LabInstance) => {
        var choiceComponentInstance = <Labs.Components.ChoiceComponentInstance> labInstance.components[0];

        var attemptDeferred = $.Deferred();
        choiceComponentInstance.createAttempt(makeJQueryPromise(attemptDeferred));
        var attemptP = attemptDeferred.promise().then((attempt: Labs.Components.ChoiceComponentAttempt) => {
            var resumeDeferred = $.Deferred<void>();
            attempt.resume(makeJQueryPromise(resumeDeferred));
            return resumeDeferred.promise().then(()=> attempt);
        });

        var attemptFinishedP = attemptP.then((attempt: Labs.Components.ChoiceComponentAttempt) => {
            // No submissions and make no hints have been used
            var submissions = attempt.getSubmissions();
            equal(0, submissions.length);
            var hints = attempt.getValues("hints");
            equal(2, hints.length);
            hints.forEach((hint) => equal(hint.hasBeenRequested, false));

            // Take a hint
            var takeHintDeferred = $.Deferred();
            hints[0].getValue(makeJQueryPromise(takeHintDeferred));

            // Make the first submission (which is wrong)
            var firstSubmissionDeferred = $.Deferred();
            attempt.submit(new Labs.Components.ChoiceComponentAnswer("1"), new Labs.Components.ChoiceComponentResult(0, false), makeJQueryPromise(firstSubmissionDeferred));

            // Take the second hint
            var takeSecondHintDeferred = $.Deferred();
            hints[1].getValue(makeJQueryPromise(takeSecondHintDeferred));

            // and submit the correct response
            var secondSubmissionDeferred = $.Deferred();
            attempt.submit(new Labs.Components.ChoiceComponentAnswer("0"), new Labs.Components.ChoiceComponentResult(1, true), makeJQueryPromise(secondSubmissionDeferred));

            // And go and wait on all the promises
            return $.when(takeHintDeferred.promise(), firstSubmissionDeferred.promise(), takeSecondHintDeferred.promise(), secondSubmissionDeferred.promise());
        });
        
        var doneP = attemptFinishedP.then(() => {
            var doneDeferred = $.Deferred<void>();
            labInstance.done(makeJQueryPromise(doneDeferred));
            return doneDeferred.promise();
        });

        return doneP.then(()=> Labs.disconnect());
    });

    var verifiedP = firstAttemptP.then(()=> {
        var labInstanceP = connectAndTake();
        return labInstanceP.then((labInstance: Labs.LabInstance)=> {
            equal(1, labInstance.components.length);
            var choiceComponentInstance = <Labs.Components.ChoiceComponentInstance> labInstance.components[0];

            var attemptsDeferred = $.Deferred();
            choiceComponentInstance.getAttempts(makeJQueryPromise(attemptsDeferred));
            var resumedAttempt = attemptsDeferred.promise().then((attempts: Labs.Components.ChoiceComponentAttempt[])=> {
                equal(1, attempts.length);

                var resumeDeferred = $.Deferred<void>();
                attempts[0].resume(makeJQueryPromise(resumeDeferred));
                return resumeDeferred.then(()=> attempts[0]);
            });

            return resumedAttempt.then((attempt: Labs.Components.ChoiceComponentAttempt) => {
                // Verify everything matches
                equal(attempt.getSubmissions().length, 2);
                equal(attempt.getSubmissions()[0].result.score, 0);
                equal(attempt.getSubmissions()[1].result.score, 1);
                equal(attempt.getValues("hints")[0].hasBeenRequested, true);
                equal(attempt.getValues("hints")[1].hasBeenRequested, true);

                var doneDeferred = $.Deferred<void>();
                labInstance.done(makeJQueryPromise(doneDeferred));
                return doneDeferred.promise();
            });
        });
    });

    defaultEndTest(verifiedP);
});

asyncTest("Test Activity Attempt Actions", () => {
    // Create the activity problem
    var appVersion = { major: 1, minor: 1 };
    var configurationName = "QUnit Test Lab";
    var activityComponent: Labs.Components.IActivityComponent = {
        type: Labs.Components.ActivityComponentType,
        name: "Test Component",
        values: {},
        secure: false
    };
    var configuration: Labs.Core.IConfiguration = {
        appVersion: appVersion,
        components: [activityComponent],
        name: configurationName,
        timeline: null,
        analytics: null
    };
    
    var takeLabP = createAndTakeLab(configuration);
    var firstAttemptP = takeLabP.then((labInstance: Labs.LabInstance) => {
        var activityComponentInstance = <Labs.Components.ActivityComponentInstance> labInstance.components[0];

        var attemptDeferred = $.Deferred();
        activityComponentInstance.createAttempt(makeJQueryPromise(attemptDeferred));
        var attemptP = attemptDeferred.promise().then((attempt: Labs.Components.ActivityComponentAttempt) => {
            var resumeDeferred = $.Deferred<void>();
            attempt.resume(makeJQueryPromise(resumeDeferred));
            return resumeDeferred.promise().then(() => attempt);
        });

        var attemptFinishedP = attemptP.then((attempt: Labs.Components.ActivityComponentAttempt) => {
            equal(attempt.getState(), Labs.ProblemState.InProgress);

            var attemptCompleteDeferred = $.Deferred<void>();
            attempt.complete(makeJQueryPromise(attemptCompleteDeferred));

            var attemptCheckedP = attemptCompleteDeferred.promise().then(()=> {
                equal(attempt.getState(), Labs.ProblemState.Completed);
            });

            return attemptCheckedP;
        });

        var doneP = attemptFinishedP.then(() => {
            var doneDeferred = $.Deferred<void>();
            labInstance.done(makeJQueryPromise(doneDeferred));
            return doneDeferred.promise();
        });

        return doneP.then(() => Labs.disconnect());
    });

    var verifiedP = firstAttemptP.then(() => {
        var labInstanceP = connectAndTake();
        return labInstanceP.then((labInstance: Labs.LabInstance) => {
            equal(1, labInstance.components.length);
            var activityComponentInstance = <Labs.Components.ActivityComponentInstance> labInstance.components[0];

            var attemptsDeferred = $.Deferred();
            activityComponentInstance.getAttempts(makeJQueryPromise(attemptsDeferred));
            var resumedAttempt = attemptsDeferred.promise().then((attempts: Labs.Components.ActivityComponentAttempt[]) => {
                equal(1, attempts.length);

                var resumeDeferred = $.Deferred<void>();
                attempts[0].resume(makeJQueryPromise(resumeDeferred));
                return resumeDeferred.then(() => attempts[0]);
            });

            return resumedAttempt.then((attempt: Labs.Components.ActivityComponentAttempt) => {
                // Verify everything matches
                equal(attempt.getState(), Labs.ProblemState.Completed);

                var doneDeferred = $.Deferred<void>();
                labInstance.done(makeJQueryPromise(doneDeferred));
                return doneDeferred.promise();
            });
        });
    });

    defaultEndTest(verifiedP);
});

asyncTest("Test Input Attempt Actions", () => {
    // Create the activity problem
    var appVersion = { major: 1, minor: 1 };
    var configurationName = "QUnit Test Lab";
    var inputComponent: Labs.Components.IInputComponent = {
        maxScore: 0,
        timeLimit: 0,
        hasAnswer: false,
        answer: null,
        type: Labs.Components.InputComponentType,
        name: "Test Component",
        values: { hints: [{ id: null, isHint: true, value: "The answer is true" }, { id: null, isHint: true, value: "The answer is really true" }] },
        secure: false
    };
    var configuration: Labs.Core.IConfiguration = {
        appVersion: appVersion,
        components: [inputComponent],
        name: configurationName,
        timeline: null,
        analytics: null
    };

    var takeLabP = createAndTakeLab(configuration);

    var firstAttemptP = takeLabP.then((labInstance: Labs.LabInstance) => {
        var inputComponentInstance = <Labs.Components.InputComponentInstance> labInstance.components[0];

        var attemptDeferred = $.Deferred();
        inputComponentInstance.createAttempt(makeJQueryPromise(attemptDeferred));
        var attemptP = attemptDeferred.promise().then((attempt: Labs.Components.InputComponentAttempt) => {
            var resumeDeferred = $.Deferred<void>();
            attempt.resume(makeJQueryPromise(resumeDeferred));
            return resumeDeferred.promise().then(() => attempt);
        });

        var attemptFinishedP = attemptP.then((attempt: Labs.Components.InputComponentAttempt) => {
            // No submissions and make no hints have been used
            var submissions = attempt.getSubmissions();
            equal(0, submissions.length);
            var hints = attempt.getValues("hints");
            equal(2, hints.length);
            hints.forEach((hint) => equal(hint.hasBeenRequested, false));

            // Take a hint
            var takeHintDeferred = $.Deferred();
            hints[0].getValue(makeJQueryPromise(takeHintDeferred));

            // Make the first submission (which is wrong)
            var firstSubmissionDeferred = $.Deferred();
            attempt.submit(new Labs.Components.InputComponentAnswer("1"), new Labs.Components.InputComponentResult(0, false), makeJQueryPromise(firstSubmissionDeferred));

            // Take the second hint
            var takeSecondHintDeferred = $.Deferred();
            hints[1].getValue(makeJQueryPromise(takeSecondHintDeferred));

            // and submit the correct response
            var secondSubmissionDeferred = $.Deferred();
            attempt.submit(new Labs.Components.InputComponentAnswer("0"), new Labs.Components.InputComponentResult(1, true), makeJQueryPromise(secondSubmissionDeferred));

            // And go and wait on all the promises
            return $.when(takeHintDeferred.promise(), firstSubmissionDeferred.promise(), takeSecondHintDeferred.promise(), secondSubmissionDeferred.promise());
        });

        var doneP = attemptFinishedP.then(() => {
            var doneDeferred = $.Deferred<void>();
            labInstance.done(makeJQueryPromise(doneDeferred));
            return doneDeferred.promise();
        });

        return doneP.then(() => Labs.disconnect());
    });

    var verifiedP = firstAttemptP.then(() => {
        var labInstanceP = connectAndTake();
        return labInstanceP.then((labInstance: Labs.LabInstance) => {
            equal(1, labInstance.components.length);
            var inputComponentInstance = <Labs.Components.InputComponentInstance> labInstance.components[0];

            var attemptsDeferred = $.Deferred();
            inputComponentInstance.getAttempts(makeJQueryPromise(attemptsDeferred));
            var resumedAttempt = attemptsDeferred.promise().then((attempts: Labs.Components.InputComponentAttempt[]) => {
                equal(1, attempts.length);

                var resumeDeferred = $.Deferred<void>();
                attempts[0].resume(makeJQueryPromise(resumeDeferred));
                return resumeDeferred.then(() => attempts[0]);
            });

            return resumedAttempt.then((attempt: Labs.Components.InputComponentAttempt) => {
                // Verify everything matches
                equal(attempt.getSubmissions().length, 2);
                equal(attempt.getSubmissions()[0].result.score, 0);
                equal(attempt.getSubmissions()[1].result.score, 1);
                equal(attempt.getValues("hints")[0].hasBeenRequested, true);
                equal(attempt.getValues("hints")[1].hasBeenRequested, true);

                var doneDeferred = $.Deferred<void>();
                labInstance.done(makeJQueryPromise(doneDeferred));
                return doneDeferred.promise();
            });
        });
    });

    defaultEndTest(verifiedP);
});

asyncTest("Test Input Attempt Actions", () => {
    var host = new Labs.InMemoryLabHost(defaultVersion);
    Labs.DefaultHostBuilder = () => host;
    var connectP = connect();

    var checkInitialMessagesP = connectP.then(()=> {
        equal(0, host.getMessages().length);
    });

    var testDoneP = checkInitialMessagesP.then(()=> {
        var timeline = Labs.getTimeline();
        timeline.next({}, (err, response) => {       
            equal(1, host.getMessages().length);
            equal(Labs.TimelineNextMessageType, host.getMessages()[0].type);
        });
    });


    var disconnectP = testDoneP.then((connectionState) => Labs.disconnect());
    disconnectP
        .done(() => ok(true))
        .fail(() => ok(false))
        .always(() => start());
});

asyncTest("Test take with no configuration", ()=> {
    // Connect to the host
    var connectionP = defaultConnect();
    var labInstanceP = connectionP.then(() => {
        var takeDeferred = $.Deferred();
        Labs.takeLab(makeJQueryPromise(takeDeferred));
        return takeDeferred.promise();
    });

    var testDoneP = labInstanceP
        .then(()=> {
            ok(false, "Should have failed");
            return $.when();
        },
        (message) => {
            equal(message, "Lab has not been created");
            ok(true, "Failed");
            return $.when();
        });

    testDoneP.always(()=> {
        Labs.disconnect();
    });
    
    testDoneP
        .done(() => ok(true))
        .fail(() => ok(false))
        .always(() => start());    
});

function testInputComponent(inputComponentInstance: Labs.Components.InputComponentInstance) {    
    var attemptDeferred = $.Deferred();
    inputComponentInstance.createAttempt(makeJQueryPromise(attemptDeferred));
    var attemptP = attemptDeferred.promise().then((attempt: Labs.Components.InputComponentAttempt) => {
        var resumeDeferred = $.Deferred<void>();
        attempt.resume(makeJQueryPromise(resumeDeferred));
        return resumeDeferred.promise().then(() => attempt);
    });

    return attemptP.then((attempt: Labs.Components.InputComponentAttempt) => {
        // No submissions and make no hints have been used
        var submissions = attempt.getSubmissions();
        equal(0, submissions.length);
        var hints = attempt.getValues("hints");
        equal(2, hints.length);
        hints.forEach((hint) => equal(hint.hasBeenRequested, false));

        // Take a hint
        var takeHintDeferred = $.Deferred();
        hints[0].getValue(makeJQueryPromise(takeHintDeferred));

        // Make the first submission (which is wrong)
        var firstSubmissionDeferred = $.Deferred();
        attempt.submit(new Labs.Components.InputComponentAnswer("1"), new Labs.Components.InputComponentResult(0, false), makeJQueryPromise(firstSubmissionDeferred));

        // Take the second hint
        var takeSecondHintDeferred = $.Deferred();
        hints[1].getValue(makeJQueryPromise(takeSecondHintDeferred));

        // and submit the correct response
        var secondSubmissionDeferred = $.Deferred();
        attempt.submit(new Labs.Components.InputComponentAnswer("0"), new Labs.Components.InputComponentResult(1, true), makeJQueryPromise(secondSubmissionDeferred));

        // And go and wait on all the promises
        return $.when(takeHintDeferred.promise(), firstSubmissionDeferred.promise(), takeSecondHintDeferred.promise(), secondSubmissionDeferred.promise());
    });
}

function verifyInputComponent(inputComponentInstance: Labs.Components.InputComponentInstance) {
    var attemptsDeferred = $.Deferred();
    inputComponentInstance.getAttempts(makeJQueryPromise(attemptsDeferred));
    var resumedAttempt = attemptsDeferred.promise().then<Labs.Components.InputComponentAttempt>((attempts: Labs.Components.InputComponentAttempt[]) => {
        equal(1, attempts.length);

        var resumeDeferred = $.Deferred<void>();
        attempts[0].resume(makeJQueryPromise(resumeDeferred));
        return resumeDeferred.then(() => attempts[0]);
    });

    return resumedAttempt.then((attempt: Labs.Components.InputComponentAttempt) => {
        // Verify everything matches
        equal(attempt.getSubmissions().length, 2);
        equal(attempt.getSubmissions()[0].result.score, 0);
        equal(attempt.getSubmissions()[1].result.score, 1);
        equal(attempt.getValues("hints")[0].hasBeenRequested, true);
        equal(attempt.getValues("hints")[1].hasBeenRequested, true);
    });
}

asyncTest("Test Dynamic Component Actions", () => {
    // Create the activity problem
    var appVersion = { major: 1, minor: 1 };
    var configurationName = "QUnit Test Lab";

    var dynamicComponent: Labs.Components.IDynamicComponent = {
        type: Labs.Components.DynamicComponentType,
        name: "Test Dynamic Component",
        values: null,
        generatedComponentTypes: [Labs.Components.InputComponentType],
        maxComponents: Labs.Components.Infinite
    };

    var inputComponent: Labs.Components.IInputComponent = {
        maxScore: 0,
        timeLimit: 0,
        hasAnswer: false,
        answer: null,
        type: Labs.Components.InputComponentType,
        name: "Test Component",
        values: { hints: [{ id: null, isHint: true, value: "The answer is true" }, { id: null, isHint: true,  value: "The answer is really true" }] },
        secure: false
    };

    var configuration: Labs.Core.IConfiguration = {
        appVersion: appVersion,
        components: [dynamicComponent],
        name: configurationName,
        timeline: null,
        analytics: null
    };

    var takeLabP = createAndTakeLab(configuration);
    
    var firstAttemptP = takeLabP.then((labInstance: Labs.LabInstance) => {
        var dynamicComponentInstance = <Labs.Components.DynamicComponentInstance> labInstance.components[0];

        var isClosedDeferred = $.Deferred();
        dynamicComponentInstance.isClosed(makeJQueryPromise(isClosedDeferred));
        var isClosedCheckP = isClosedDeferred.promise().then((closed)=> equal(closed, false));

        var noComponentsDeferred = $.Deferred();
        dynamicComponentInstance.getComponents(makeJQueryPromise(noComponentsDeferred));
        var noComponentsCheckP = noComponentsDeferred.promise().then((components)=> equal(components.length, 0));

        var createdComponentsP = $.when(isClosedCheckP, noComponentsCheckP).then(() => {
            var createInputComponentDeferred = $.Deferred();
            dynamicComponentInstance.createComponent(inputComponent, makeJQueryPromise(createInputComponentDeferred));
            return createInputComponentDeferred.promise().then((inputComponentInstance: Labs.Components.InputComponentInstance) => {
                return testInputComponent(inputComponentInstance);
            });
        });

        var closeDynamicProblemP = createdComponentsP.then(() => {
            var closeDeferred = $.Deferred<void>();
            dynamicComponentInstance.close(makeJQueryPromise(closeDeferred));
            return closeDeferred.promise();
        });
                
        var doneP = closeDynamicProblemP.then(() => {
            var doneDeferred = $.Deferred<void>();
            labInstance.done(makeJQueryPromise(doneDeferred));
            return doneDeferred.promise();
        });

        return doneP.then(() => {
            Labs.disconnect()
        });
    });

    var verifiedP = firstAttemptP.then(() => {
        var labInstanceP = connectAndTake();
        return labInstanceP.then((labInstance: Labs.LabInstance) => {
            equal(1, labInstance.components.length);

            var dynamicComponentInstance = <Labs.Components.DynamicComponentInstance> labInstance.components[0];

            var isClosedDeferred = $.Deferred();
            dynamicComponentInstance.isClosed(makeJQueryPromise(isClosedDeferred));
            var isClosedCheckP = isClosedDeferred.promise().then((closed) => {
                equal(closed, true)
            });

            var checkComponentsDeferred = $.Deferred<Labs.ComponentInstanceBase[]>();
            dynamicComponentInstance.getComponents(makeJQueryPromise(checkComponentsDeferred));
            var componentsCheckP = checkComponentsDeferred.promise().then((components) => {
                equal(components.length, 1)
            });

            var verifiedComponentsP = $.when(isClosedCheckP, componentsCheckP).then(() => {
                var getComponentsDeferred = $.Deferred();
                dynamicComponentInstance.getComponents(makeJQueryPromise(getComponentsDeferred));
                return getComponentsDeferred.promise().then((components) => {
                    var inputComponentInstance = <Labs.Components.InputComponentInstance> components[0];
                    return verifyInputComponent(inputComponentInstance);
                });
            });

            return verifiedComponentsP.then(() => {
                var doneDeferred = $.Deferred<void>();
                labInstance.done(makeJQueryPromise(doneDeferred));
                return doneDeferred.promise();
            });
        });
    });

    defaultEndTest(verifiedP);
});
