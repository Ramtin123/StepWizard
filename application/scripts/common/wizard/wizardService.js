(function (module) {
    module.factory('wizardManager', ['eventEmitter', function (eventEmitter) {
        function wizardManager(name) {
            eventEmitter.call(this);
            this.eventTypes = {
                wizardRegistered: 'wizardRegistered',
                wizardInitiated: 'wizardInitiated',
                wizardStepChanged: 'wizardStepChanged',
                wizardCompleted: 'wizardCompleted',
                wizardWaiting:'wizardWaiting',
                wizardWaitingReturnedError:'wizardWaitingReturnedError',
                wizardWaitingFinished:'wizardWaitingFinished',
                wizardClosed: 'wizardClosed',
                wizardTearedDown: 'wizardTearedDown'
            };
            this.name = name;
            this.Steps = [];
            this.FinalStep = 1;
            this.Emit(this.eventTypes.wizardRegistered,name);
        }
        wizardManager.prototype = Object.create(eventEmitter.prototype);
        
        wizardManager.prototype.Init = function () {
            this.currentStep = 1;
            this.LastStep = 1;
            this.ProcessFinished = false;
            this.Waiting=false;
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
           return  _.find(this.Steps, { 'step': stepnumber });
        }

        wizardManager.prototype.GetStepStatus = function (step) {
            var self = this;
            return {
                Passed:(step<this.currentStep?true:false),
                current: (step == this.currentStep ? true : false),
                ProcessFinished: this.ProcessFinished,
                Met: (step < this.LastStep ? true : false),
                Loaded: !!(this.GetStep(step).Loaded),
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
             this.Waiting=true;
             this.Emit(this.eventTypes.wizardWaiting);
         }
         
          wizardManager.prototype.HideWaiting = function () {
             this.Waiting=false;
             this.Emit(this.eventTypes.wizardWaitingFinished);
         }
         
         wizardManager.prototype.WaitingEndsWithError = function (cb) {
             this.Waiting=false;
             if(cb && typeof cb==='function') cb();
             this.Emit(this.eventTypes.wizardWaitingReturnedError);
         }
         
         wizardManager.prototype.PushToWaitingStack=function(cb){
             this.WaitingStack.push(cb);
         }
         
         wizardManager.prototype.DrainWaitingStack=function(execute){
             while(this.WaitingStack.length>0){
                 var cb=this.WaitingStack.pop();
                 if(execute!==false) cb();
             }
         }

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