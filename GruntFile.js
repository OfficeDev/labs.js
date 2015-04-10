module.exports = function(grunt) {
    var defaultShellOptions = {
        stdout: true,
        failOnError: true
    };

    function stripReferences(src, filepath) {
        return src.replace(/\/\/\/ <reference.*/g, '');
    }

    var defaultConcatOptions = {
        banner: 
          '/*!\n' + 
          ' * <%= pkg.name %>.js JavaScript API for Office Mix\n' +
          ' * Version: <%= pkg.version %>' +
          ' * Copyright (c) Microsoft Corporation.  All rights reserved.\n' +
          ' * Your use of this file is governed by the Microsoft Services Agreement http://go.microsoft.com/fwlink/?LinkId=266419.\n' +
          ' */\n',
        process: stripReferences
    }; 

    var defaultTypeScriptOptions = {
        module: 'commonjs',
        target: 'es5',
        declaration: true,
        sourceMap: true,
        removeComments: true
    };

    // Source files for labs.js code. Note that due to how TypeScript builds the outputted files the order does matter.
    // Base classes need to be defined before children, etc...
    var labsCoreSrc = [
        'core/IAction.ts', 
        'core/IActionResult.ts', 
        'core/IAction.ts', 
        'core/IActionResult.ts', 
        'core/IComponentInstance.ts', 
        'core/IConfigurationInfo.ts', 
        'core/IConnectionResponse.ts',
        'core/IGetActionOptions.ts',
        'core/ILabCreationOptions.ts',
        'core/ILabHostVersionInfo.ts',
        'core/IActionOptions.ts',
        'core/IMessage.ts',
        'core/IMessageResponse.ts',
        'core/IUserInfo.ts',
        'core/IValueInstance.ts',
        'core/IVersion.ts',
        'core/IAnalyticsConfiguration.ts',
        'core/ICompletionStatus.ts',
        'core/ILabCallback.ts',
        'core/ILabObject.ts',
        'core/ITimelineConfiguration.ts',
        'core/IUserData.ts',
        'core/IValue.ts',
        'core/IConfiguration.ts',
        'core/IConfigurationInstance.ts',
        'core/IComponent.ts',
        'core/LabMode.ts',
        'core/ILabHost.ts',
        'core/Permissions.ts'];

    var labsActionsSrc = [
        'actions/ICloseComponent.ts',
        'actions/ICreateAttemptOptions.ts',
        'actions/ICreateAttemptResult.ts',
        'actions/ICreateComponentOptions.ts',
        'actions/ICreateComponentResult.ts',
        'actions/IGetValueResult.ts',
        'actions/ISubmitAnswerResult.ts',
        'actions/IAttemptTimeoutOptions.ts',
        'actions/IGetValueOptions.ts',
        'actions/IResumeAttemptOptions.ts',
        'actions/ISubmitAnswerOptions.ts',
        'actions/References.ts'];

    var labsGetActionsSrc = [
        'GetActions/IGetComponentActionsOptions.ts',
        'GetActions/IGetAttemptOptions.ts',
        'GetActions/References.ts'];

    var labsApiSrc = [
        'api/IEventCallback.ts',
        'api/ITimelineNextMessage.ts',
        'api/References.ts',
        'api/ComponentInstanceBase.ts',
        'api/ComponentInstance.ts',
        'api/ConnectionState.ts',
        'api/EventManager.ts',
        'api/LabEditor.ts',
        'api/LabInstance.ts',
        'api/Labs.ts',
        'api/LabsInternal.ts',
        'api/Timeline.ts',
        'api/ValueHolder.ts'];

    var labsComponentsSrc = [
        'components/ComponentAttempt.ts',
        'components/ActivityComponentAttempt.ts',
        'components/ActivityComponentInstance.ts',
        'components/ChoiceComponentAnswer.ts',
        'components/ChoiceComponentAttempt.ts',
        'components/ChoiceComponentInstance.ts',
        'components/DynamicComponentInstance.ts',
        'components/IActivityComponent.ts',
        'components/IActivityComponentInstance.ts',
        'components/IChoice.ts',
        'components/IChoiceComponent.ts',
        'components/IChoiceComponentInstance.ts',
        'components/IDynamicComponent.ts',
        'components/IDynamicComponentInstance.ts',
        'components/IHint.ts',
        'components/IInputComponent.ts',
        'components/IInputComponentInstance.ts',
        'components/InputComponentAnswer.ts',
        'components/InputComponentAttempt.ts',
        'components/InputComponentInstance.ts',
        'components/InputComponentResult.ts',
        'components/InputComponentSubmission.ts',
        'components/ProblemState.ts',
        'components/References.ts',
        'components/ChoiceComponentResult.ts',
        'components/ChoiceComponentSubmission.ts'];

    var labsHostsCoreSrc = [
        'HostsCore/Command.ts',
        'HostsCore/CommandType.ts',
        'HostsCore/EventTypes.ts',
        'HostsCore/GetActionsCommandData.ts',
        'HostsCore/MessageProcessor.ts',
        'HostsCore/ModeChangedEvent.ts',
        'HostsCore/References.ts',
        'HostsCore/SendMessageCommandData.ts',
        'HostsCore/TakeActionCommandData.ts'];

    var labsHostsSrc = [        
        'hosts/InMemoryLabHost.ts',
        'hosts/InMemoryLabState.ts',
        'hosts/OfficeJSLabHost.ts',
        'hosts/PostMessageLabHost.ts',
        'hosts/References.ts',
        'hosts/RichClientOfficeJSLabsHost.ts'];

    var labsServerSrc = [
        'server/ILabEventProcessor.ts',
        'server/LabHost.ts',
        'server/References.ts'];

    var labsTestSrc = [
        'bin/tests/jquery.d.ts',
        'bin/tests/qunit.d.ts',
        'bin/tests/underscore.d.ts',
        'bin/tests/tests.ts'];
                
    var pkg = grunt.file.readJSON('package.json');
    grunt.initConfig({
            pkg: pkg,
            qunit: {
                all: [ 'bin/tests/index.html', 'bin/tests/index-min.html' ]
            },
            shell: { 
                builddocs: {
                    options: defaultShellOptions,
                    command: 'typescript-docs bin\\LabsCore.d.ts -o bin\\sdk\\LabsCore.html & typescript-docs bin\\LabsActions.d.ts -o bin\\sdk\\LabsActions.html & typescript-docs bin\\LabsGetActions.d.ts -o bin\\sdk\\LabsGetActions.html & typescript-docs bin\\LabsApi.d.ts -o bin\\sdk\\LabsApi.html  & typescript-docs bin\\LabsComponents.d.ts -o bin\\sdk\\LabsComponents.html & typescript-docs bin\\LabsHostsCore.d.ts -o bin\\sdk\\LabsHostsCore.html & typescript-docs bin\\LabsHosts.d.ts -o bin\\sdk\\LabsHosts.html & typescript-docs bin\\LabsServer.d.ts -o bin\\sdk\\LabsServer.html'
                }
            },
            concat: {
                labsjs: {
                    options: defaultConcatOptions,
                    src: ['bin/LabsCore.js', 'bin/LabsActions.js', 'bin/LabsGetActions.js', 'bin/LabsApi.js', 'bin/LabsComponents.js', 'bin/LabsHostsCore.js', 'bin/LabsHosts.js'],
                    dest: 'bin/sdk/<%= pkg.name.toLowerCase() %>-<%= pkg.version %>.js'
                },
                labsjsdef: {
                    options: defaultConcatOptions,
                    src: ['bin/LabsCore.d.ts', 'bin/LabsActions.d.ts', 'bin/LabsGetActions.d.ts', 'bin/LabsApi.d.ts', 'bin/LabsComponents.d.ts', 'bin/LabsHostsCore.d.ts', 'bin/LabsHosts.d.ts'],
                    dest: 'bin/sdk/<%= pkg.name.toLowerCase() %>-<%= pkg.version %>.d.ts'
                },
                labsserverjs: {
                    options: {
                        banner: '/*! <%= pkg.name %>JsServer.js - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %> */\n',
                        process: stripReferences
                    },
                    src: ['bin/LabsCore.js', 'bin/LabsActions.js', 'bin/LabsGetActions.js', 'bin/LabsApi.js', 'bin/LabsComponents.js', 'bin/LabsHostsCore.js', 'bin/LabsHosts.js', 'bin/LabsServer.js'],
                    dest: 'bin/sdk/<%= pkg.name %>JsServer-<%= pkg.version %>.js'
                },
                labsserverjsdef: {
                    options: {
                        banner: '/*! <%= pkg.name %>JsServer.js - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %> */\n/// <reference path=\"typings/jquery/jquery.d.ts\" />\n',
                        process: stripReferences
                    },
                    src: ['bin/LabsCore.d.ts', 'bin/LabsActions.d.ts', 'bin/LabsGetActions.d.ts', 'bin/LabsApi.d.ts', 'bin/LabsComponents.d.ts', 'bin/LabsHostsCore.d.ts', 'bin/LabsHosts.d.ts', 'bin/LabsServer.d.ts'],
                    dest: 'bin/sdk/<%= pkg.name %>JsServer-<%= pkg.version %>.d.ts'
                }
            },
            copy: {
                sdk: {
                    src: 'sdk/**',
                    dest: 'bin/',
                    options: {
                        process: function (content, srcpath) {
                            return content.replace(/\[labs-version\]/g, pkg.version);
                        }
                    }
                },
                tests: {
                    src: 'tests/**',
                    dest: 'bin/',
                    options: {
                        process: function(content, srcpath) {
                            return content.replace(/\[labs-version\]/g, pkg.version);
                        }
                    }
                }
            },
            uglify: {
                options: {
                    preserveComments: 'some'
                },
                labs: {
                    files: {
                        'bin/sdk/labs-<%= pkg.version %>.min.js': ['bin/sdk/labs-<%= pkg.version %>.js']
                    }
                }
            },
            typescript: {
                core: {
                    src: labsCoreSrc,
                    dest: 'bin/LabsCore.js',
                    options: defaultTypeScriptOptions
                },
                actions: {
                    src: labsActionsSrc, 
                    dest: 'bin/LabsActions.js',
                    options: defaultTypeScriptOptions
                },
                getactions: {
                    src: labsGetActionsSrc,
                    dest: 'bin/LabsGetActions.js',
                    options: defaultTypeScriptOptions
                },
                api: {
                    src: labsApiSrc,
                    dest: 'bin/LabsApi.js',
                    options: defaultTypeScriptOptions
                },
                components: {
                    src: labsComponentsSrc,
                    dest: 'bin/LabsComponents.js',
                    options: defaultTypeScriptOptions
                },
                hostscore: {
                    src: labsHostsCoreSrc,
                    dest: 'bin/LabsHostsCore.js',
                    options: defaultTypeScriptOptions
                },
                hosts: {
                    src: labsHostsSrc,
                    dest: 'bin/LabsHosts.js',
                    options: defaultTypeScriptOptions
                },
                server: {
                    src: labsServerSrc,
                    dest: 'bin/LabsServer.js',
                    options: defaultTypeScriptOptions
                },
                test: {
                    src: labsTestSrc,
                    options: {
                        module: 'commonjs',
                        target: 'es5'
                    }
                },
                simplelab: {
                    src: [
                        'bin/sdk/simplelab.ts', 
                        'bin/sdk/labs-' + pkg.version + '.d.ts', 
                        'bin/sdk/typings/jquery/jquery.d.ts',
                        'bin/sdk/typings/knockout/knockout.d.ts'],
                    options: {
                        module: 'commonjs',
                        target: 'es5'
                    }
                },
                labshost: {
                    src: ['bin/sdk/labshost.ts'],
                    options: {
                        module: 'commonjs',
                        target: 'es5'
                    }
                }
            }
    });

    var buildTasks = [
        'typescript:core', 
        'typescript:actions',
        'typescript:getactions',
        'typescript:api', 
        'typescript:components', 
        'typescript:hostscore', 
        'typescript:hosts', 
        'typescript:server'];
    var testTasks = [
        'copy:tests',
        'typescript:test',
        'qunit'];
    var sdkTasks = [
        'copy:sdk',
        'concat:labsjs',
        'concat:labsjsdef',
        'concat:labsserverjs',
        'concat:labsserverjsdef',
        'typescript:labshost',
        'typescript:simplelab',
        'uglify'];

    grunt.loadNpmTasks('grunt-typescript');
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('build', buildTasks);
    grunt.registerTask('default', buildTasks.concat(sdkTasks).concat(testTasks));
    grunt.registerTask('tests', testTasks);
    grunt.registerTask('sdk', sdkTasks);
    grunt.registerTask('docs', ['shell:builddocs']);
}
module.exports = function(grunt) {
    var defaultShellOptions = {
        stdout: true,
        failOnError: true
    };

    function stripReferences(src, filepath) {
        return src.replace(/\/\/\/ <reference.*/g, '');
    }

    var defaultConcatOptions = {
        banner: 
          '/*!\n' + 
          ' * <%= pkg.name %>.js JavaScript API for Office Mix\n' +
          ' * Version: <%= pkg.version %>' +
          ' * Copyright (c) Microsoft Corporation.  All rights reserved.\n' +
          ' * Your use of this file is governed by the Microsoft Services Agreement http://go.microsoft.com/fwlink/?LinkId=266419.\n' +
          ' */\n',
        process: stripReferences
    }; 

    var defaultTypeScriptOptions = {
        module: 'commonjs',
        target: 'es5',
        declaration: true,
        sourceMap: true,
        removeComments: true
    };

    // Source files for labs.js code. Note that due to how TypeScript builds the outputted files the order does matter.
    // Base classes need to be defined before children, etc...
    var labsCoreSrc = [
        'core/IAction.ts', 
        'core/IActionResult.ts', 
        'core/IAction.ts', 
        'core/IActionResult.ts', 
        'core/IComponentInstance.ts', 
        'core/IConfigurationInfo.ts', 
        'core/IConnectionResponse.ts',
		'core/IContent.ts',	
        'core/IGetActionOptions.ts',
        'core/ILabCreationOptions.ts',
        'core/ILabHostVersionInfo.ts',
        'core/IActionOptions.ts',
        'core/IMessage.ts',
        'core/IMessageResponse.ts',
        'core/IUserInfo.ts',
        'core/IValueInstance.ts',
        'core/IVersion.ts',
        'core/IAnalyticsConfiguration.ts',
        'core/ICompletionStatus.ts',
        'core/ILabCallback.ts',
        'core/ILabObject.ts',
        'core/ITimelineConfiguration.ts',
        'core/IUserData.ts',
        'core/IValue.ts',
        'core/IConfiguration.ts',
        'core/IConfigurationInstance.ts',
        'core/IComponent.ts',
        'core/LabMode.ts',
        'core/ILabHost.ts',
        'core/Permissions.ts'];

    var labsActionsSrc = [
        'actions/ICloseComponent.ts',
        'actions/ICreateAttemptOptions.ts',
        'actions/ICreateAttemptResult.ts',
        'actions/ICreateComponentOptions.ts',
        'actions/ICreateComponentResult.ts',
        'actions/IGetValueResult.ts',
        'actions/ISubmitAnswerResult.ts',
        'actions/IAttemptTimeoutOptions.ts',
        'actions/IGetValueOptions.ts',
        'actions/IResumeAttemptOptions.ts',
        'actions/ISubmitAnswerOptions.ts',
        'actions/References.ts'];

    var labsGetActionsSrc = [
        'GetActions/IGetComponentActionsOptions.ts',
        'GetActions/IGetAttemptOptions.ts',
        'GetActions/References.ts'];

    var labsApiSrc = [
        'api/IEventCallback.ts',
        'api/ITimelineNextMessage.ts',
        'api/References.ts',
        'api/ComponentInstanceBase.ts',
        'api/ComponentInstance.ts',
        'api/ConnectionState.ts',
        'api/EventManager.ts',
        'api/LabEditor.ts',
        'api/LabInstance.ts',
        'api/Labs.ts',
        'api/LabsInternal.ts',
        'api/Timeline.ts',
        'api/ValueHolder.ts'];

    var labsComponentsSrc = [
        'components/ComponentAttempt.ts',
        'components/ActivityComponentAttempt.ts',
        'components/ActivityComponentInstance.ts',
        'components/ChoiceComponentAnswer.ts',
        'components/ChoiceComponentAttempt.ts',
        'components/ChoiceComponentInstance.ts',
        'components/DynamicComponentInstance.ts',
        'components/IActivityComponent.ts',
        'components/IActivityComponentInstance.ts',
        'components/IChoice.ts',
        'components/IChoiceComponent.ts',
        'components/IChoiceComponentInstance.ts',
        'components/IDynamicComponent.ts',
        'components/IDynamicComponentInstance.ts',
        'components/IHint.ts',
        'components/IInputComponent.ts',
        'components/IInputComponentInstance.ts',
        'components/InputComponentAnswer.ts',
        'components/InputComponentAttempt.ts',
        'components/InputComponentInstance.ts',
        'components/InputComponentResult.ts',
        'components/InputComponentSubmission.ts',
        'components/ProblemState.ts',
        'components/References.ts',
        'components/ChoiceComponentResult.ts',
        'components/ChoiceComponentSubmission.ts'];

    var labsHostsCoreSrc = [
        'HostsCore/Command.ts',
        'HostsCore/CommandType.ts',
        'HostsCore/EventTypes.ts',
        'HostsCore/GetActionsCommandData.ts',
        'HostsCore/MessageProcessor.ts',
        'HostsCore/ModeChangedEvent.ts',
        'HostsCore/References.ts',
        'HostsCore/SendMessageCommandData.ts',
        'HostsCore/TakeActionCommandData.ts'];

    var labsHostsSrc = [        
        'hosts/InMemoryLabHost.ts',
        'hosts/InMemoryLabState.ts',
        'hosts/OfficeJSLabHost.ts',
        'hosts/PostMessageLabHost.ts',
        'hosts/References.ts',
        'hosts/RichClientOfficeJSLabsHost.ts'];

    var labsServerSrc = [
        'server/ILabEventProcessor.ts',
        'server/LabHost.ts',
        'server/References.ts'];

    var labsTestSrc = [
        'bin/tests/jquery.d.ts',
        'bin/tests/qunit.d.ts',
        'bin/tests/underscore.d.ts',
        'bin/tests/tests.ts'];
                
    var pkg = grunt.file.readJSON('package.json');
    grunt.initConfig({
            pkg: pkg,
            qunit: {
                all: [ 'bin/tests/index.html', 'bin/tests/index-min.html' ]
            },
            shell: { 
                builddocs: {
                    options: defaultShellOptions,
                    command: 'typescript-docs bin\\LabsCore.d.ts -o bin\\sdk\\LabsCore.html & typescript-docs bin\\LabsActions.d.ts -o bin\\sdk\\LabsActions.html & typescript-docs bin\\LabsGetActions.d.ts -o bin\\sdk\\LabsGetActions.html & typescript-docs bin\\LabsApi.d.ts -o bin\\sdk\\LabsApi.html  & typescript-docs bin\\LabsComponents.d.ts -o bin\\sdk\\LabsComponents.html & typescript-docs bin\\LabsHostsCore.d.ts -o bin\\sdk\\LabsHostsCore.html & typescript-docs bin\\LabsHosts.d.ts -o bin\\sdk\\LabsHosts.html & typescript-docs bin\\LabsServer.d.ts -o bin\\sdk\\LabsServer.html'
                }
            },
            concat: {
                labsjs: {
                    options: defaultConcatOptions,
                    src: ['bin/LabsCore.js', 'bin/LabsActions.js', 'bin/LabsGetActions.js', 'bin/LabsApi.js', 'bin/LabsComponents.js', 'bin/LabsHostsCore.js', 'bin/LabsHosts.js'],
                    dest: 'bin/sdk/<%= pkg.name.toLowerCase() %>-<%= pkg.version %>.js'
                },
                labsjsdef: {
                    options: defaultConcatOptions,
                    src: ['bin/LabsCore.d.ts', 'bin/LabsActions.d.ts', 'bin/LabsGetActions.d.ts', 'bin/LabsApi.d.ts', 'bin/LabsComponents.d.ts', 'bin/LabsHostsCore.d.ts', 'bin/LabsHosts.d.ts'],
                    dest: 'bin/sdk/<%= pkg.name.toLowerCase() %>-<%= pkg.version %>.d.ts'
                },
                labsserverjs: {
                    options: {
                        banner: '/*! <%= pkg.name %>JsServer.js - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %> */\n',
                        process: stripReferences
                    },
                    src: ['bin/LabsCore.js', 'bin/LabsActions.js', 'bin/LabsGetActions.js', 'bin/LabsApi.js', 'bin/LabsComponents.js', 'bin/LabsHostsCore.js', 'bin/LabsHosts.js', 'bin/LabsServer.js'],
                    dest: 'bin/sdk/<%= pkg.name %>JsServer-<%= pkg.version %>.js'
                },
                labsserverjsdef: {
                    options: {
                        banner: '/*! <%= pkg.name %>JsServer.js - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %> */\n/// <reference path=\"typings/jquery/jquery.d.ts\" />\n',
                        process: stripReferences
                    },
                    src: ['bin/LabsCore.d.ts', 'bin/LabsActions.d.ts', 'bin/LabsGetActions.d.ts', 'bin/LabsApi.d.ts', 'bin/LabsComponents.d.ts', 'bin/LabsHostsCore.d.ts', 'bin/LabsHosts.d.ts', 'bin/LabsServer.d.ts'],
                    dest: 'bin/sdk/<%= pkg.name %>JsServer-<%= pkg.version %>.d.ts'
                }
            },
            copy: {
                sdk: {
                    src: 'sdk/**',
                    dest: 'bin/',
                    options: {
                        process: function (content, srcpath) {
                            return content.replace(/\[labs-version\]/g, pkg.version);
                        }
                    }
                },
                tests: {
                    src: 'tests/**',
                    dest: 'bin/',
                    options: {
                        process: function(content, srcpath) {
                            return content.replace(/\[labs-version\]/g, pkg.version);
                        }
                    }
                }
            },
            uglify: {
                options: {
                    preserveComments: 'some'
                },
                labs: {
                    files: {
                        'bin/sdk/labs-<%= pkg.version %>.min.js': ['bin/sdk/labs-<%= pkg.version %>.js']
                    }
                }
            },
            typescript: {
                core: {
                    src: labsCoreSrc,
                    dest: 'bin/LabsCore.js',
                    options: defaultTypeScriptOptions
                },
                actions: {
                    src: labsActionsSrc, 
                    dest: 'bin/LabsActions.js',
                    options: defaultTypeScriptOptions
                },
                getactions: {
                    src: labsGetActionsSrc,
                    dest: 'bin/LabsGetActions.js',
                    options: defaultTypeScriptOptions
                },
                api: {
                    src: labsApiSrc,
                    dest: 'bin/LabsApi.js',
                    options: defaultTypeScriptOptions
                },
                components: {
                    src: labsComponentsSrc,
                    dest: 'bin/LabsComponents.js',
                    options: defaultTypeScriptOptions
                },
                hostscore: {
                    src: labsHostsCoreSrc,
                    dest: 'bin/LabsHostsCore.js',
                    options: defaultTypeScriptOptions
                },
                hosts: {
                    src: labsHostsSrc,
                    dest: 'bin/LabsHosts.js',
                    options: defaultTypeScriptOptions
                },
                server: {
                    src: labsServerSrc,
                    dest: 'bin/LabsServer.js',
                    options: defaultTypeScriptOptions
                },
                test: {
                    src: labsTestSrc,
                    options: {
                        module: 'commonjs',
                        target: 'es5'
                    }
                },
                simplelab: {
                    src: [
                        'bin/sdk/simplelab.ts', 
                        'bin/sdk/labs-' + pkg.version + '.d.ts', 
                        'bin/sdk/typings/jquery/jquery.d.ts',
                        'bin/sdk/typings/knockout/knockout.d.ts'],
                    options: {
                        module: 'commonjs',
                        target: 'es5'
                    }
                },
                labshost: {
                    src: ['bin/sdk/labshost.ts'],
                    options: {
                        module: 'commonjs',
                        target: 'es5'
                    }
                }
            }
    });

    var buildTasks = [
        'typescript:core', 
        'typescript:actions',
        'typescript:getactions',
        'typescript:api', 
        'typescript:components', 
        'typescript:hostscore', 
        'typescript:hosts', 
        'typescript:server'];
    var testTasks = [
        'copy:tests',
        'typescript:test',
        'qunit'];
    var sdkTasks = [
        'copy:sdk',
        'concat:labsjs',
        'concat:labsjsdef',
        'concat:labsserverjs',
        'concat:labsserverjsdef',
        'typescript:labshost',
        'typescript:simplelab',
        'uglify'];

    grunt.loadNpmTasks('grunt-typescript');
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('build', buildTasks);
    grunt.registerTask('default', buildTasks.concat(sdkTasks).concat(testTasks));
    grunt.registerTask('tests', testTasks);
    grunt.registerTask('sdk', sdkTasks);
    grunt.registerTask('docs', ['shell:builddocs']);
}
module.exports = function(grunt) {
    var defaultShellOptions = {
        stdout: true,
        failOnError: true
    };

    function stripReferences(src, filepath) {
        return src.replace(/\/\/\/ <reference.*/g, '');
    }

    var defaultConcatOptions = {
        banner: 
          '/*!\n' + 
          ' * <%= pkg.name %>.js JavaScript API for Office Mix\n' +
          ' * Version: <%= pkg.version %>' +
          ' * Copyright (c) Microsoft Corporation.  All rights reserved.\n' +
          ' * Your use of this file is governed by the Microsoft Services Agreement http://go.microsoft.com/fwlink/?LinkId=266419.\n' +
          ' */\n',
        process: stripReferences
    }; 

    var defaultTypeScriptOptions = {
        module: 'commonjs',
        target: 'es5',
        declaration: true,
        sourceMap: true,
        removeComments: true
    };

    // Source files for labs.js code. Note that due to how TypeScript builds the outputted files the order does matter.
    // Base classes need to be defined before children, etc...
    var labsCoreSrc = [
        'core/IAction.ts', 
        'core/IActionResult.ts', 
        'core/IAction.ts', 
        'core/IActionResult.ts', 
        'core/IComponentInstance.ts', 
        'core/IConfigurationInfo.ts', 
        'core/IConnectionResponse.ts',
		'core/IContent.ts',	
        'core/IGetActionOptions.ts',
        'core/ILabCreationOptions.ts',
        'core/ILabHostVersionInfo.ts',
        'core/IActionOptions.ts',
        'core/IMessage.ts',
        'core/IMessageResponse.ts',
        'core/IUserInfo.ts',
        'core/IValueInstance.ts',
        'core/IVersion.ts',
        'core/IAnalyticsConfiguration.ts',
        'core/ICompletionStatus.ts',
        'core/ILabCallback.ts',
        'core/ILabObject.ts',
        'core/ITimelineConfiguration.ts',
        'core/IUserData.ts',
        'core/IValue.ts',
        'core/IConfiguration.ts',
        'core/IConfigurationInstance.ts',
        'core/IComponent.ts',
        'core/LabMode.ts',
        'core/ILabHost.ts',
        'core/Permissions.ts'];

    var labsActionsSrc = [
        'actions/ICloseComponent.ts',
        'actions/ICreateAttemptOptions.ts',
        'actions/ICreateAttemptResult.ts',
        'actions/ICreateComponentOptions.ts',
        'actions/ICreateComponentResult.ts',
        'actions/IGetValueResult.ts',
        'actions/ISubmitAnswerResult.ts',
        'actions/IAttemptTimeoutOptions.ts',
        'actions/IGetValueOptions.ts',
        'actions/IResumeAttemptOptions.ts',
        'actions/ISubmitAnswerOptions.ts',
        'actions/References.ts'];

    var labsGetActionsSrc = [
        'GetActions/IGetComponentActionsOptions.ts',
        'GetActions/IGetAttemptOptions.ts',
        'GetActions/References.ts'];

    var labsApiSrc = [
        'api/IEventCallback.ts',
        'api/ITimelineNextMessage.ts',
        'api/References.ts',
        'api/ComponentInstanceBase.ts',
        'api/ComponentInstance.ts',
        'api/ConnectionState.ts',
        'api/EventManager.ts',
        'api/LabEditor.ts',
        'api/LabInstance.ts',
        'api/Labs.ts',
        'api/LabsInternal.ts',
        'api/Timeline.ts',
        'api/ValueHolder.ts'];

    var labsComponentsSrc = [
        'components/ComponentAttempt.ts',
        'components/ActivityComponentAttempt.ts',
        'components/ActivityComponentInstance.ts',
        'components/ChoiceComponentAnswer.ts',
        'components/ChoiceComponentAttempt.ts',
        'components/ChoiceComponentInstance.ts',
        'components/DynamicComponentInstance.ts',
        'components/IActivityComponent.ts',
        'components/IActivityComponentInstance.ts',
        'components/IChoice.ts',
        'components/IChoiceComponent.ts',
        'components/IChoiceComponentInstance.ts',
        'components/IDynamicComponent.ts',
        'components/IDynamicComponentInstance.ts',
        'components/IHint.ts',
        'components/IInputComponent.ts',
        'components/IInputComponentInstance.ts',
        'components/InputComponentAnswer.ts',
        'components/InputComponentAttempt.ts',
        'components/InputComponentInstance.ts',
        'components/InputComponentResult.ts',
        'components/InputComponentSubmission.ts',
        'components/ProblemState.ts',
        'components/References.ts',
        'components/ChoiceComponentResult.ts',
        'components/ChoiceComponentSubmission.ts'];

    var labsHostsCoreSrc = [
        'HostsCore/Command.ts',
        'HostsCore/CommandType.ts',
        'HostsCore/EventTypes.ts',
        'HostsCore/GetActionsCommandData.ts',
        'HostsCore/MessageProcessor.ts',
        'HostsCore/ModeChangedEvent.ts',
        'HostsCore/References.ts',
        'HostsCore/SendMessageCommandData.ts',
        'HostsCore/TakeActionCommandData.ts'];

    var labsHostsSrc = [        
        'hosts/InMemoryLabHost.ts',
        'hosts/InMemoryLabState.ts',
        'hosts/OfficeJSLabHost.ts',
        'hosts/PostMessageLabHost.ts',
        'hosts/References.ts',
        'hosts/RichClientOfficeJSLabsHost.ts'];

    var labsServerSrc = [
        'server/ILabEventProcessor.ts',
        'server/LabHost.ts',
        'server/References.ts'];

    var labsTestSrc = [
        'bin/tests/jquery.d.ts',
        'bin/tests/qunit.d.ts',
        'bin/tests/underscore.d.ts',
        'bin/tests/tests.ts'];
                
    var pkg = grunt.file.readJSON('package.json');
    grunt.initConfig({
            pkg: pkg,
            qunit: {
                all: [ 'bin/tests/index.html', 'bin/tests/index-min.html' ]
            },
            shell: { 
                builddocs: {
                    options: defaultShellOptions,
                    command: 'typescript-docs bin\\LabsCore.d.ts -o bin\\sdk\\LabsCore.html & typescript-docs bin\\LabsActions.d.ts -o bin\\sdk\\LabsActions.html & typescript-docs bin\\LabsGetActions.d.ts -o bin\\sdk\\LabsGetActions.html & typescript-docs bin\\LabsApi.d.ts -o bin\\sdk\\LabsApi.html  & typescript-docs bin\\LabsComponents.d.ts -o bin\\sdk\\LabsComponents.html & typescript-docs bin\\LabsHostsCore.d.ts -o bin\\sdk\\LabsHostsCore.html & typescript-docs bin\\LabsHosts.d.ts -o bin\\sdk\\LabsHosts.html & typescript-docs bin\\LabsServer.d.ts -o bin\\sdk\\LabsServer.html'
                }
            },
            concat: {
                labsjs: {
                    options: defaultConcatOptions,
                    src: ['bin/LabsCore.js', 'bin/LabsActions.js', 'bin/LabsGetActions.js', 'bin/LabsApi.js', 'bin/LabsComponents.js', 'bin/LabsHostsCore.js', 'bin/LabsHosts.js'],
                    dest: 'bin/sdk/<%= pkg.name.toLowerCase() %>-<%= pkg.version %>.js'
                },
                labsjsdef: {
                    options: defaultConcatOptions,
                    src: ['bin/LabsCore.d.ts', 'bin/LabsActions.d.ts', 'bin/LabsGetActions.d.ts', 'bin/LabsApi.d.ts', 'bin/LabsComponents.d.ts', 'bin/LabsHostsCore.d.ts', 'bin/LabsHosts.d.ts'],
                    dest: 'bin/sdk/<%= pkg.name.toLowerCase() %>-<%= pkg.version %>.d.ts'
                },
                labsserverjs: {
                    options: {
                        banner: '/*! <%= pkg.name %>JsServer.js - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %> */\n',
                        process: stripReferences
                    },
                    src: ['bin/LabsCore.js', 'bin/LabsActions.js', 'bin/LabsGetActions.js', 'bin/LabsApi.js', 'bin/LabsComponents.js', 'bin/LabsHostsCore.js', 'bin/LabsHosts.js', 'bin/LabsServer.js'],
                    dest: 'bin/sdk/<%= pkg.name %>JsServer-<%= pkg.version %>.js'
                },
                labsserverjsdef: {
                    options: {
                        banner: '/*! <%= pkg.name %>JsServer.js - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %> */\n/// <reference path=\"typings/jquery/jquery.d.ts\" />\n',
                        process: stripReferences
                    },
                    src: ['bin/LabsCore.d.ts', 'bin/LabsActions.d.ts', 'bin/LabsGetActions.d.ts', 'bin/LabsApi.d.ts', 'bin/LabsComponents.d.ts', 'bin/LabsHostsCore.d.ts', 'bin/LabsHosts.d.ts', 'bin/LabsServer.d.ts'],
                    dest: 'bin/sdk/<%= pkg.name %>JsServer-<%= pkg.version %>.d.ts'
                }
            },
            copy: {
                sdk: {
                    src: 'sdk/**',
                    dest: 'bin/',
                    options: {
                        process: function (content, srcpath) {
                            return content.replace(/\[labs-version\]/g, pkg.version);
                        }
                    }
                },
                tests: {
                    src: 'tests/**',
                    dest: 'bin/',
                    options: {
                        process: function(content, srcpath) {
                            return content.replace(/\[labs-version\]/g, pkg.version);
                        }
                    }
                }
            },
            uglify: {
                options: {
                    preserveComments: 'some'
                },
                labs: {
                    files: {
                        'bin/sdk/labs-<%= pkg.version %>.min.js': ['bin/sdk/labs-<%= pkg.version %>.js']
                    }
                }
            },
            typescript: {
                core: {
                    src: labsCoreSrc,
                    dest: 'bin/LabsCore.js',
                    options: defaultTypeScriptOptions
                },
                actions: {
                    src: labsActionsSrc, 
                    dest: 'bin/LabsActions.js',
                    options: defaultTypeScriptOptions
                },
                getactions: {
                    src: labsGetActionsSrc,
                    dest: 'bin/LabsGetActions.js',
                    options: defaultTypeScriptOptions
                },
                api: {
                    src: labsApiSrc,
                    dest: 'bin/LabsApi.js',
                    options: defaultTypeScriptOptions
                },
                components: {
                    src: labsComponentsSrc,
                    dest: 'bin/LabsComponents.js',
                    options: defaultTypeScriptOptions
                },
                hostscore: {
                    src: labsHostsCoreSrc,
                    dest: 'bin/LabsHostsCore.js',
                    options: defaultTypeScriptOptions
                },
                hosts: {
                    src: labsHostsSrc,
                    dest: 'bin/LabsHosts.js',
                    options: defaultTypeScriptOptions
                },
                server: {
                    src: labsServerSrc,
                    dest: 'bin/LabsServer.js',
                    options: defaultTypeScriptOptions
                },
                test: {
                    src: labsTestSrc,
                    options: {
                        module: 'commonjs',
                        target: 'es5'
                    }
                },
                simplelab: {
                    src: [
                        'bin/sdk/simplelab.ts', 
                        'bin/sdk/labs-' + pkg.version + '.d.ts', 
                        'bin/sdk/typings/jquery/jquery.d.ts',
                        'bin/sdk/typings/knockout/knockout.d.ts'],
                    options: {
                        module: 'commonjs',
                        target: 'es5'
                    }
                },
                labshost: {
                    src: ['bin/sdk/labshost.ts'],
                    options: {
                        module: 'commonjs',
                        target: 'es5'
                    }
                }
            }
    });

    var buildTasks = [
        'typescript:core', 
        'typescript:actions',
        'typescript:getactions',
        'typescript:api', 
        'typescript:components', 
        'typescript:hostscore', 
        'typescript:hosts', 
        'typescript:server'];
    var testTasks = [
        'copy:tests',
        'typescript:test',
        'qunit'];
    var sdkTasks = [
        'copy:sdk',
        'concat:labsjs',
        'concat:labsjsdef',
        'concat:labsserverjs',
        'concat:labsserverjsdef',
        'typescript:labshost',
        'typescript:simplelab',
        'uglify'];

    grunt.loadNpmTasks('grunt-typescript');
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('build', buildTasks);
    grunt.registerTask('default', buildTasks.concat(sdkTasks).concat(testTasks));
    grunt.registerTask('tests', testTasks);
    grunt.registerTask('sdk', sdkTasks);
    grunt.registerTask('docs', ['shell:builddocs']);
}
module.exports = function(grunt) {
    var defaultShellOptions = {
        stdout: true,
        failOnError: true
    };

    function stripReferences(src, filepath) {
        return src.replace(/\/\/\/ <reference.*/g, '');
    }

    var defaultConcatOptions = {
        banner: 
          '/*!\n' + 
          ' * <%= pkg.name %>.js JavaScript API for Office Mix\n' +
          ' * Version: <%= pkg.version %>' +
          ' * Copyright (c) Microsoft Corporation.  All rights reserved.\n' +
          ' * Your use of this file is governed by the Microsoft Services Agreement http://go.microsoft.com/fwlink/?LinkId=266419.\n' +
          ' */\n',
        process: stripReferences
    }; 

    var defaultTypeScriptOptions = {
        module: 'commonjs',
        target: 'es5',
        declaration: true,
        sourceMap: true,
        removeComments: true
    };

    // Source files for labs.js code. Note that due to how TypeScript builds the outputted files the order does matter.
    // Base classes need to be defined before children, etc...
    var labsCoreSrc = [
        'core/IAction.ts', 
        'core/IActionResult.ts', 
        'core/IAction.ts', 
        'core/IActionResult.ts', 
        'core/IComponentInstance.ts', 
        'core/IConfigurationInfo.ts', 
        'core/IConnectionResponse.ts',
		'core/IContent.ts',	
        'core/IGetActionOptions.ts',
        'core/ILabCreationOptions.ts',
        'core/ILabHostVersionInfo.ts',
        'core/IActionOptions.ts',
        'core/IMessage.ts',
        'core/IMessageResponse.ts',
        'core/IUserInfo.ts',
        'core/IValueInstance.ts',
        'core/IVersion.ts',
        'core/IAnalyticsConfiguration.ts',
        'core/ICompletionStatus.ts',
        'core/ILabCallback.ts',
        'core/ILabObject.ts',
        'core/ITimelineConfiguration.ts',
        'core/IUserData.ts',
        'core/IValue.ts',
        'core/IConfiguration.ts',
        'core/IConfigurationInstance.ts',
        'core/IComponent.ts',
        'core/LabMode.ts',
        'core/ILabHost.ts',
        'core/Permissions.ts'];

    var labsActionsSrc = [
        'actions/ICloseComponent.ts',
        'actions/ICreateAttemptOptions.ts',
        'actions/ICreateAttemptResult.ts',
        'actions/ICreateComponentOptions.ts',
        'actions/ICreateComponentResult.ts',
        'actions/IGetValueResult.ts',
        'actions/ISubmitAnswerResult.ts',
        'actions/IAttemptTimeoutOptions.ts',
        'actions/IGetValueOptions.ts',
        'actions/IResumeAttemptOptions.ts',
        'actions/ISubmitAnswerOptions.ts',
        'actions/References.ts'];

    var labsGetActionsSrc = [
        'GetActions/IGetComponentActionsOptions.ts',
        'GetActions/IGetAttemptOptions.ts',
        'GetActions/References.ts'];

    var labsApiSrc = [
        'api/IEventCallback.ts',
        'api/ITimelineNextMessage.ts',
        'api/References.ts',
        'api/ComponentInstanceBase.ts',
        'api/ComponentInstance.ts',
        'api/ConnectionState.ts',
        'api/EventManager.ts',
        'api/LabEditor.ts',
        'api/LabInstance.ts',
        'api/Labs.ts',
        'api/LabsInternal.ts',
        'api/Timeline.ts',
        'api/ValueHolder.ts'];

    var labsComponentsSrc = [
        'components/ComponentAttempt.ts',
        'components/ActivityComponentAttempt.ts',
        'components/ActivityComponentInstance.ts',
        'components/ChoiceComponentAnswer.ts',
        'components/ChoiceComponentAttempt.ts',
        'components/ChoiceComponentInstance.ts',
        'components/DynamicComponentInstance.ts',
        'components/IActivityComponent.ts',
        'components/IActivityComponentInstance.ts',
        'components/IChoice.ts',
        'components/IChoiceComponent.ts',
        'components/IChoiceComponentInstance.ts',
        'components/IDynamicComponent.ts',
        'components/IDynamicComponentInstance.ts',
        'components/IHint.ts',
        'components/IInputComponent.ts',
        'components/IInputComponentInstance.ts',
        'components/InputComponentAnswer.ts',
        'components/InputComponentAttempt.ts',
        'components/InputComponentInstance.ts',
        'components/InputComponentResult.ts',
        'components/InputComponentSubmission.ts',
        'components/ProblemState.ts',
        'components/References.ts',
        'components/ChoiceComponentResult.ts',
        'components/ChoiceComponentSubmission.ts'];

    var labsHostsCoreSrc = [
        'HostsCore/Command.ts',
        'HostsCore/CommandType.ts',
        'HostsCore/EventTypes.ts',
        'HostsCore/GetActionsCommandData.ts',
        'HostsCore/MessageProcessor.ts',
        'HostsCore/ModeChangedEvent.ts',
        'HostsCore/References.ts',
        'HostsCore/SendMessageCommandData.ts',
        'HostsCore/TakeActionCommandData.ts'];

    var labsHostsSrc = [        
        'hosts/InMemoryLabHost.ts',
        'hosts/InMemoryLabState.ts',
        'hosts/OfficeJSLabHost.ts',
        'hosts/PostMessageLabHost.ts',
        'hosts/References.ts',
        'hosts/RichClientOfficeJSLabsHost.ts'];

    var labsServerSrc = [
        'server/ILabEventProcessor.ts',
        'server/LabHost.ts',
        'server/References.ts'];

    var labsTestSrc = [
        'bin/tests/jquery.d.ts',
        'bin/tests/qunit.d.ts',
        'bin/tests/underscore.d.ts',
        'bin/tests/tests.ts'];
                
    var pkg = grunt.file.readJSON('package.json');
    grunt.initConfig({
            pkg: pkg,
            qunit: {
                all: [ 'bin/tests/index.html', 'bin/tests/index-min.html' ]
            },
            shell: { 
                builddocs: {
                    options: defaultShellOptions,
                    command: 'typescript-docs bin\\LabsCore.d.ts -o bin\\sdk\\LabsCore.html & typescript-docs bin\\LabsActions.d.ts -o bin\\sdk\\LabsActions.html & typescript-docs bin\\LabsGetActions.d.ts -o bin\\sdk\\LabsGetActions.html & typescript-docs bin\\LabsApi.d.ts -o bin\\sdk\\LabsApi.html  & typescript-docs bin\\LabsComponents.d.ts -o bin\\sdk\\LabsComponents.html & typescript-docs bin\\LabsHostsCore.d.ts -o bin\\sdk\\LabsHostsCore.html & typescript-docs bin\\LabsHosts.d.ts -o bin\\sdk\\LabsHosts.html & typescript-docs bin\\LabsServer.d.ts -o bin\\sdk\\LabsServer.html'
                }
            },
            concat: {
                labsjs: {
                    options: defaultConcatOptions,
                    src: ['bin/LabsCore.js', 'bin/LabsActions.js', 'bin/LabsGetActions.js', 'bin/LabsApi.js', 'bin/LabsComponents.js', 'bin/LabsHostsCore.js', 'bin/LabsHosts.js'],
                    dest: 'bin/sdk/<%= pkg.name.toLowerCase() %>-<%= pkg.version %>.js'
                },
                labsjsdef: {
                    options: defaultConcatOptions,
                    src: ['bin/LabsCore.d.ts', 'bin/LabsActions.d.ts', 'bin/LabsGetActions.d.ts', 'bin/LabsApi.d.ts', 'bin/LabsComponents.d.ts', 'bin/LabsHostsCore.d.ts', 'bin/LabsHosts.d.ts'],
                    dest: 'bin/sdk/<%= pkg.name.toLowerCase() %>-<%= pkg.version %>.d.ts'
                },
                labsserverjs: {
                    options: {
                        banner: '/*! <%= pkg.name %>JsServer.js - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %> */\n',
                        process: stripReferences
                    },
                    src: ['bin/LabsCore.js', 'bin/LabsActions.js', 'bin/LabsGetActions.js', 'bin/LabsApi.js', 'bin/LabsComponents.js', 'bin/LabsHostsCore.js', 'bin/LabsHosts.js', 'bin/LabsServer.js'],
                    dest: 'bin/sdk/<%= pkg.name %>JsServer-<%= pkg.version %>.js'
                },
                labsserverjsdef: {
                    options: {
                        banner: '/*! <%= pkg.name %>JsServer.js - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %> */\n/// <reference path=\"typings/jquery/jquery.d.ts\" />\n',
                        process: stripReferences
                    },
                    src: ['bin/LabsCore.d.ts', 'bin/LabsActions.d.ts', 'bin/LabsGetActions.d.ts', 'bin/LabsApi.d.ts', 'bin/LabsComponents.d.ts', 'bin/LabsHostsCore.d.ts', 'bin/LabsHosts.d.ts', 'bin/LabsServer.d.ts'],
                    dest: 'bin/sdk/<%= pkg.name %>JsServer-<%= pkg.version %>.d.ts'
                }
            },
            copy: {
                sdk: {
                    src: 'sdk/**',
                    dest: 'bin/',
                    options: {
                        process: function (content, srcpath) {
                            return content.replace(/\[labs-version\]/g, pkg.version);
                        }
                    }
                },
                tests: {
                    src: 'tests/**',
                    dest: 'bin/',
                    options: {
                        process: function(content, srcpath) {
                            return content.replace(/\[labs-version\]/g, pkg.version);
                        }
                    }
                }
            },
            uglify: {
                options: {
                    preserveComments: 'some'
                },
                labs: {
                    files: {
                        'bin/sdk/labs-<%= pkg.version %>.min.js': ['bin/sdk/labs-<%= pkg.version %>.js']
                    }
                }
            },
            typescript: {
                core: {
                    src: labsCoreSrc,
                    dest: 'bin/LabsCore.js',
                    options: defaultTypeScriptOptions
                },
                actions: {
                    src: labsActionsSrc, 
                    dest: 'bin/LabsActions.js',
                    options: defaultTypeScriptOptions
                },
                getactions: {
                    src: labsGetActionsSrc,
                    dest: 'bin/LabsGetActions.js',
                    options: defaultTypeScriptOptions
                },
                api: {
                    src: labsApiSrc,
                    dest: 'bin/LabsApi.js',
                    options: defaultTypeScriptOptions
                },
                components: {
                    src: labsComponentsSrc,
                    dest: 'bin/LabsComponents.js',
                    options: defaultTypeScriptOptions
                },
                hostscore: {
                    src: labsHostsCoreSrc,
                    dest: 'bin/LabsHostsCore.js',
                    options: defaultTypeScriptOptions
                },
                hosts: {
                    src: labsHostsSrc,
                    dest: 'bin/LabsHosts.js',
                    options: defaultTypeScriptOptions
                },
                server: {
                    src: labsServerSrc,
                    dest: 'bin/LabsServer.js',
                    options: defaultTypeScriptOptions
                },
                test: {
                    src: labsTestSrc,
                    options: {
                        module: 'commonjs',
                        target: 'es5'
                    }
                },
                simplelab: {
                    src: [
                        'bin/sdk/simplelab.ts', 
                        'bin/sdk/labs-' + pkg.version + '.d.ts', 
                        'bin/sdk/typings/jquery/jquery.d.ts',
                        'bin/sdk/typings/knockout/knockout.d.ts'],
                    options: {
                        module: 'commonjs',
                        target: 'es5'
                    }
                },
                labshost: {
                    src: ['bin/sdk/labshost.ts'],
                    options: {
                        module: 'commonjs',
                        target: 'es5'
                    }
                }
            }
    });

    var buildTasks = [
        'typescript:core', 
        'typescript:actions',
        'typescript:getactions',
        'typescript:api', 
        'typescript:components', 
        'typescript:hostscore', 
        'typescript:hosts', 
        'typescript:server'];
    var testTasks = [
        'copy:tests',
        'typescript:test',
        'qunit'];
    var sdkTasks = [
        'copy:sdk',
        'concat:labsjs',
        'concat:labsjsdef',
        'concat:labsserverjs',
        'concat:labsserverjsdef',
        'typescript:labshost',
        'typescript:simplelab',
        'uglify'];

    grunt.loadNpmTasks('grunt-typescript');
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('build', buildTasks);
    grunt.registerTask('default', buildTasks.concat(sdkTasks).concat(testTasks));
    grunt.registerTask('tests', testTasks);
    grunt.registerTask('sdk', sdkTasks);
    grunt.registerTask('docs', ['shell:builddocs']);
}