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

    var pkg = grunt.file.readJSON('package.json');
    grunt.initConfig({
            pkg: pkg,
            qunit: {
                all: [ 'bin/tests/index.html', 'bin/tests/index-min.html' ]
            },
            shell: {
                buildcore: {
                    options: defaultShellOptions, 
                    command: 'msbuild core/LabsCore.csproj'
                },
                buildactions: {
                    options: defaultShellOptions, 
                    command: 'msbuild Actions/LabsActions.csproj'
                },
                buildgetactions: {
                    options: defaultShellOptions,
                    command: 'msbuild GetActions/LabsGetActions.csproj'
                },
                buildapi: {
                    options: defaultShellOptions,
                    command: 'msbuild api/LabsApi.csproj'
                },
                buildcomponents: {
                    options: defaultShellOptions, 
                    command: 'msbuild components/LabsComponents.csproj'
                },
                buildhostscore: {
                    options: defaultShellOptions, 
                    command: 'msbuild hostscore/LabsHostsCore.csproj'
                },
                buildhosts: {
                    options: defaultShellOptions, 
                    command: 'msbuild hosts/LabsHosts.csproj'
                },
                buildserver: {
                    options: defaultShellOptions, 
                    command: 'msbuild server/LabsServer.csproj'
                },
                copytypings: {
                    options: defaultShellOptions,
                    command: 'xcopy /y bin\\*.d.ts ..\\labs\\Scripts\\typings\\labs'
                },
                copyjs: {
                    options: defaultShellOptions,
                    command: 'xcopy /s /i /y bin\\*.js ..\\labs\\Scripts\\labs'
                },
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
                test: {
                    src: ['bin/tests/**/*.ts'],
                    options: {
                        module: 'commonjs',
                        target: 'es5',
                        sourcemap: true
                    }
                },
                simplelab: {
                    src: [
                        'bin/sdk/simplelab.ts', 
                        'bin/sdk/labs-' + pkg.version + '.d.ts', 
                        'bin/sdk/typings/jquery/jquery.d.ts',
                        'bin/sdk/typings/knockout/knockout.d.ts'],
                    dest: [''],
                    options: {
                        module: 'commonjs',
                        target: 'es5',
                        sourcemap: false
                    }
                },
                labshost: {
                    src: ['bin/sdk/labshost.ts'],
                    dest: [''],
                    options: {
                        module: 'commonjs',
                        target: 'es5',
                        sourcemap: true
                    }
                }
            }
    });

    var buildTasks = [
        'shell:buildcore', 
        'shell:buildactions',
        'shell:buildgetactions',
        'shell:buildapi', 
        'shell:buildcomponents', 
        'shell:buildhostscore', 
        'shell:buildhosts', 
        'shell:buildserver'];
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
        'shell:builddocs',
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
    grunt.registerTask('publish', ['shell:copytypings', 'shell:copyjs']);
}
