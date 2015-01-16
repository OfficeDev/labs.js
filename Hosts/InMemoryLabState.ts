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
    interface IStoredComponent {
        component: Labs.Core.IComponent;
        instance: Labs.Core.IComponentInstance;
    };

    export class InMemoryLabState {
        private _configuration: Labs.Core.IConfiguration = null;
        private _configurationInstance: Labs.Core.IConfigurationInstance = null;
        private _state: any = null;
        private _actions: Labs.Core.IAction[] = [];        
        private _nextId: number = 0;      
        private _componentInstances: { [id: string]: IStoredComponent } = {};

        constructor() {            
        }        
        
        getConfiguration(): Labs.Core.IConfiguration {
            return this._configuration;
        }

        setConfiguration(configuration: Labs.Core.IConfiguration) {
            this._configuration = configuration;
            this._configurationInstance = null;
            this._state = null;
            this._actions = [];
            this._componentInstances = {};
        }

        getState(): any {
            return this._state;            
        }

        setState(state: any) {
            this._state = state;
        }

        getConfigurationInstance(): Labs.Core.IConfigurationInstance {
            if (!this._configurationInstance) {
                this._configurationInstance = this.getConfigurationInstanceFromConfiguration(this._configuration);
            }

            return this._configurationInstance;
        }

        private getConfigurationInstanceFromConfiguration(configuration: Labs.Core.IConfiguration): Labs.Core.IConfigurationInstance {
            if (!configuration) {
                return null;
            }

            var components = configuration.components.map((component) => this.getAndStoreComponentInstanceFromComponent(component));
            return {
                appVersion: configuration.appVersion,
                components: components,
                name: configuration.name,
                timeline: configuration.timeline
            };
        }

        private getAndStoreComponentInstanceFromComponent(component: Labs.Core.IComponent): Labs.Core.IComponentInstance {
            var instance = <Labs.Core.IComponentInstance> JSON.parse(JSON.stringify(component));
            var componentId = this._nextId++;
            instance.componentId = componentId.toString();
            
            // Convert between the different instance types
            if (component.type === Labs.Components.ChoiceComponentType) {
                instance.type = Labs.Components.ChoiceComponentInstanceType;
            }
            else if (component.type === Labs.Components.InputComponentType) {
                instance.type = Labs.Components.InputComponentInstanceType;
            }
            else if (component.type === Labs.Components.ActivityComponentType) {
                instance.type = Labs.Components.ActivityComponentInstanceType;
            }
            else if (component.type === Labs.Components.DynamicComponentType) {
                instance.type = Labs.Components.DynamicComponentInstanceType;
            }
            else {
                throw "unknown type";
            }

            // Tweak the values as well
            for (var key in instance.values) {
                var values = instance.values[key];
                for (var i = 0; i < values.length; i++) {
                    var valueId = this._nextId++;
                    values[i].valueId = valueId.toString();
                }
            }

            this._componentInstances[instance.componentId] = {
                component: component,
                instance: instance
            };
            return instance;
        }                

        takeAction(type: string, options: Labs.Core.IActionOptions, result: any) : Labs.Core.IAction {            
            return this.takeActionCore(type, options, result);
        }

        private takeActionCore(type: string, options: Labs.Core.IActionOptions, result: Labs.Core.IActionResult): Labs.Core.IAction {
            if (result === null) {
                if (type === Labs.Core.Actions.CreateAttemptAction) {
                    var attemptId = this._nextId++;
                    var createResult: Labs.Core.Actions.ICreateAttemptResult = {
                        attemptId: attemptId.toString()
                    };

                    result = createResult;
                } else if (type === Labs.Core.Actions.GetValueAction) {
                    var optionsAsGetValueOptions = <Labs.Core.Actions.IGetValueOptions> options;
                    var getValueResult: Labs.Core.Actions.IGetValueResult = {
                        value: this.findConfigurationValue(optionsAsGetValueOptions.componentId, optionsAsGetValueOptions.attemptId, optionsAsGetValueOptions.valueId)
                    };

                    result = getValueResult;
                } else if (type === Labs.Core.Actions.CreateComponentAction) {
                    var createComponentOptions = <Labs.Core.Actions.ICreateComponentOptions> options;
                    var createdInstance = this.getAndStoreComponentInstanceFromComponent(createComponentOptions.component);
                    var createComponentResult: Labs.Core.Actions.ICreateComponentResult = {
                        componentInstance: createdInstance
                    };

                    result = createComponentResult;
                }
                else if (type === Labs.Core.Actions.SubmitAnswerAction) {
                    // Currently assuming activity components only
                    var submissionId = this._nextId++;
                    var submitAnswerResult : Labs.Core.Actions.ISubmitAnswerResult = {
                        submissionId: submissionId.toString(),
                        complete: true,
                        score: null
                    };
                    result = submitAnswerResult;
                }
            } else {
                if (type === Labs.Core.Actions.SubmitAnswerAction) {
                    var submissionId = this._nextId++;
                    var resultsAsSubmitResults = <Labs.Core.Actions.ISubmitAnswerResult> result;
                    resultsAsSubmitResults.submissionId = submissionId.toString();
                }
            }

            // Store and return the completed action
            var completedAction: Labs.Core.IAction = {
                type: type,
                options: options,
                result: result,
                time: Date.now()
            };
            this._actions.push(completedAction);

            return completedAction;
        }

        private findConfigurationValue(componentId: string, attemptId: string, valueId: string): any {
            var storedComponent = this._componentInstances[componentId];
            
            if (storedComponent) {                
                for (var key in storedComponent.instance.values) {
                    var values = storedComponent.instance.values[key];
                    for (var i = 0; i < values.length; i++) {
                        if (values[i].valueId === valueId) {
                            return storedComponent.component.values[key][i].value;
                        }
                    }
                }
            }

            throw "not found";
        }        

        getAllActions() : Labs.Core.IAction[] {
            return this._actions;
        }

        setActions(actions: Labs.Core.IAction[]) {
            this._actions = actions;
        }

        getActions(type: string, options: Labs.Core.IGetActionOptions): Labs.Core.IAction[] {
            var completedActions: Labs.Core.IAction[] = [];
            var i: number;
            var completedAction: Labs.Core.IAction;

            if (type === Labs.Core.GetActions.GetAttempt) {
                var actionAsGetAttempt = <Labs.Core.GetActions.IGetAttemptOptions> options;

                for (i = 0; i < this._actions.length; i++) {
                    completedAction = this._actions[i];
                    if ((<any> completedAction.options).attemptId === actionAsGetAttempt.attemptId) {
                        completedActions.push(completedAction);
                    }
                }
            }
            else if (type === Labs.Core.GetActions.GetComponentActions) {
                var actionAsGetComponentActions = <Labs.Core.GetActions.IGetComponentActionsOptions> options;

                for (i = 0; i < this._actions.length; i++) {
                    completedAction = this._actions[i];
                    if (completedAction.type === actionAsGetComponentActions.action && (<any> completedAction.options).componentId === actionAsGetComponentActions.componentId) {
                        completedActions.push(completedAction);
                    }
                }
            }
            else {
                throw "Unknown get results action";
            }

            // Return the final results
            return completedActions;
        }
    }           
}