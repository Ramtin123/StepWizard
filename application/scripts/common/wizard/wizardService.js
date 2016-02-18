(function (module) {
    module.factory('wizardManager', ['eventEmitter', function (eventEmitter) {
        function wizardManager(name) {
            eventEmitter.call(this);
            var self = this;
            this.eventTypes = {
                wizardRegistered: 'wizardRegistered',
                wizardInitiated: 'wizardInitiated',
                wizardStepChanged: 'wizardStepChanged',
                wizardCompleted: 'wizardCompleted',
                wizardWaiting:'wizardWaiting',
                wizardWaitingReturnedError:'wizardWaitingReturnedError',
                wizardWaitingFinished:'wizardWaitingFinished',
                wizardPaused:'wizardPaused',
                wizardUnPaused:'wizardUnPaused',
                wizardClosed: 'wizardClosed',
                wizardTearedDown: 'wizardTearedDown'
            };
            this.name = name;
            this.Steps = [];
            this.WaitingStack = [];
            this.FinalStep = 1;
            this.On('wizardPaused',function(){
                this.Paused=true;
            });
            this.On('wizardUnPaused',function(){
                this.Paused=false;
            });
            this.On('wizardWaiting',function(){
                this.Waiting=true;
            });
            this.On('wizardWaitingFinished wizardWaitingReturnedError',function(){
                this.Waiting=false;
            });
            this.On('wizardWaitingFinished wizardUnPaused', function(){
                _drainWaitingStack();
            });
            this.On('wizardWaitingReturnedError',function(){
                _drainWaitingStack(false);
            });
            
            this.Emit(this.eventTypes.wizardRegistered, name);

            function _drainWaitingStack(execute) {
                while (self.WaitingStack.length > 0) {
                    var cb = self.WaitingStack.pop();
                    if (execute !== false) cb();
                }
            }
        }

        

        wizardManager.prototype = Object.create(eventEmitter.prototype);
        
        wizardManager.prototype.Init = function () {
            this.currentStep = 1;
            this.LastStep = 1;
            this.ProcessFinished = false;
            this.Waiting=false;
            this.Paused=false;
            this.WaitingStack=[];
            this.Emit(this.eventTypes.wizardInitiated, this.name);
        }

        wizardManager.prototype.RegisterStep = function (stepinfo) {
            this.FinalStep = this.FinalStep || 1;
            this.Steps = this.Steps || [];
            if (stepinfo.step > this.FinalStep) this.FinalStep = Number(stepinfo.step);
            this.Steps.push(stepinfo);
        }

        wizardManager.prototype.GetStep = function (stepnumber) {
            return _.find(this.Steps, function (stepItem) {
                return stepItem == stepnumber;
            });
        }

        wizardManager.prototype.GetStepStatus = function (step) {
            var self = this;
            return {
                Passed:(step<this.currentStep?true:false),
                current: (step == this.currentStep ? true : false),
                ProcessFinished: this.ProcessFinished,
                Met: (step <= this.LastStep ? true : false),
                HasDependency: _.filter(this.Steps, function (stepitem) {
                    return stepitem.step < step && stepitem.step > self.currentStep ;
                }).some(function (sItem) {
                    return sItem.isDependency === true
                })
            };
        }
        
        wizardManager.prototype.GotoStep = function (step) {
            if (step == this.currentStep) return;
            this.currentStep = step;
            this.Emit(this.eventTypes.wizardStepChanged);
        }

        wizardManager.prototype.NextStep = function () {
            this.currentStep++;
            if (this.currentStep > this.LastStep) this.LastStep = this.currentStep;
            this.Emit(this.eventTypes.wizardStepChanged);
        }

        wizardManager.prototype.FinishProcess = function () {
            this.ProcessFinished = true;
            this.Emit(this.eventTypes.wizardCompleted);
            if (this.FinalStep == this.currentStep) {
                this.Close();
            }
            else {
                this.NextStep();
            }
        }
        
         wizardManager.prototype.ShowWaiting = function () {
             this.Emit(this.eventTypes.wizardWaiting);
         }
         
          wizardManager.prototype.HideWaiting = function () {
             this.Emit(this.eventTypes.wizardWaitingFinished);
         }
         
         wizardManager.prototype.WaitingEndsWithError = function (cb) {
             if(cb && typeof cb==='function') cb();
             this.Emit(this.eventTypes.wizardWaitingReturnedError);
         }
         
         wizardManager.prototype.Pause = function () {
             if(this.Paused===true) return;
             this.Emit(this.eventTypes.wizardPaused);
         }
         
         wizardManager.prototype.UnPause = function () {
             if(this.Paused===false) return;
             this.Emit(this.eventTypes.wizardUnPaused);
         }
         
         wizardManager.prototype.PushToWaitingStack=function(cb){
             this.WaitingStack.push(cb);
         }
         
        //wizardManager.prototype.DrainWaitingStack = _drainWaitingStack;

        wizardManager.prototype.Close = function () {
            this.TearDown();
            this.Emit(this.eventTypes.wizardClosed);
        }

        wizardManager.prototype.TearDown = function () {
            delete this.Steps;
            delete this.FinalStep;
            this.Emit(this.eventTypes.wizardTearedDown);
        }

        return wizardManager;
    }]);

    module.factory('wizardService', ['wizardManager', function (wizardManager) {
        var registerWizards = {};
        function _registerWizard(name,stepsNumber) {
            registerWizards[name] = new wizardManager(name, stepsNumber);
            return registerWizards[name];
        }
        function _getWizard(name) {
            if (!registerWizards.hasOwnProperty(name)) return null;
            return registerWizards[name];
        }
        return {
            RegisterWizard: _registerWizard,
            GetWizard: _getWizard
        };
    }]);

})(angular.module('wizardModule'));