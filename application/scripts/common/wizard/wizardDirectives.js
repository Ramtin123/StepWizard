(function(module){
    module.directive('stepWizard', ['wizardService',
        function (wizardService) {
            return {
                restrict: 'EA',
                replace: true,
                scope: {
                    wizardtitle: '@',
                    wizardname: '@',
                    onclose: '='
                },
                transclude: true,
                templateUrl: '/application/templates/_stepwizard.html',
                link:function(scope,element,attrs){
                    var wizard = wizardService.GetWizard(scope.wizardname); 
                    if (!wizard) return;
                    wizard.Init();
                }
            }
        }
    ]);

    module.directive('stepWizardStatus', [
       function () {
           return {
               restrict: 'EA',
               replace: true,
               transclude: true,
               templateUrl: '/application/templates/_stepwizardStatus.html'
           }
       }
    ]);

    module.directive('stepWizardContent', [
       function () {
           return {
               restrict: 'EA',
               replace: true,
               transclude: true,
               templateUrl: '/application/templates/_stepwizardContent.html'
           }
       }
    ]);
    
     module.directive('stepWizardWait', ['wizardService',
       function (wizardService) {
           return {
               restrict: 'EA',
               replace: true,
               transclude: true,
               templateUrl:'/application/templates/_stepwizardWaiting.html',
               link: function (scope, element, attrs) {
                    var wizard = wizardService.GetWizard(scope.$parent.wizardname); //TODO : fix it
                    if (!wizard) return;
                    wizard.On('wizardInitiated', function(){
                        if(!wizard.Waiting) element.css('display', 'none');
                    });
                    wizard.On('wizardWaitingFinished', function(){
                        element.css('display', 'none');
                    });
                    wizard.On('wizardWaiting',function(){
                        element.css('display', 'block');
                    });
                    wizard.On('wizardWaitingReturnedError',function(){
                        element.css('display', 'none');
                    });
               }
           }
       }
    ]);
    
     module.directive('stepWizardStatusItem', ['wizardService',
        function (wizardService) {
            return {
                restrict: 'EA',
                replace: true,
                transclude: true,
                scope:{
                  title:'@',
                  step:'@'
                },
                templateUrl: '/application/templates/_stepwizardStatusItem.html',
                link: function (scope, element, attrs) {
                    var wizard = wizardService.GetWizard(scope.$parent.$parent.$parent.wizardname); //TODO : fix it
                    if (!wizard) return;
                    scope.movetothis = function () {
                        if (scope.selectable === false || scope.ProcessFinished === true) return;
                        if (scope.step.validator && typeof scope.step.validator === 'function' && scope.step.validator() === false && wizard.currentStep > scope.step) return;
                        wizard.GotoStep(scope.step);
                    };

                    function UpdateStatus() {
                        var currentStatus = wizard.GetStepStatus(scope.step);
                        scope.ProcessFinished = currentStatus.ProcessFinished;
                        scope.selectable = false;
                        scope.disabled = true;
                        if (currentStatus.Passed) {
                            scope.selectable = true;
                            scope.disabled = false;
                        }
                        if (currentStatus.current) {
                            scope.selectable = false;
                            scope.disabled = false;
                        }
                        else if (currentStatus.Met && currentStatus.HasDependency === false) {
                            scope.selectable = true;
                            scope.disabled = false;
                        }else if (currentStatus.HasDependency === true) {
                            scope.selectable = false;
                            scope.disabled = true;
                        }
                    }

                    wizard.On('wizardInitiated', UpdateStatus);
                    wizard.On('wizardStepChanged', UpdateStatus);
                    wizard.On('wizardWaitingFinished', UpdateStatus);
                    wizard.On('wizardWaitingReturnedError',UpdateStatus);
                    wizard.On('wizardCompleted', function () {
                        scope.selectable = false;
                        scope.disabled = false;
                    });
                    wizard.On('wizardWaiting',function(){
                         scope.selectable = false;
                    });
                }
            }
        }
     ]);

     module.directive('stepWizardContentItem', ['wizardService',
        function (wizardService) {
            return {
                restrict: 'EA',
                replace:true,
                transclude: true,
                scope: {
                    step: '@',
                    before:'=',
                    onnext: '=',
                    validator: '=',
                    isdependency: '@',
                    action: '@'  //it can be finishprocess or close
                },
                templateUrl: '/application/templates/_stepwizardContentItem.html',
                link: function (scope, element, attrs) {
                    var wizard = wizardService.GetWizard(scope.$parent.$parent.$parent.wizardname);
                    if (!wizard) return;
                    wizard.RegisterStep({
                        step: scope.step,
                        validator: scope.validator,
                        isDependency: Boolean(scope.isdependency)
                    });
                    scope.Next = function () {
                        function ContinueToNext(){
                            if (scope.action === 'finishprocess') {
                                wizard.FinishProcess();
                            }
                            else if (scope.action === 'close') {
                                wizard.Close();
                            }
                            else {
                                wizard.NextStep();
                            }
                        }
                        if (!scope.validator || typeof scope.validator!=='function' || scope.validator() !== false) { //check validation . it should return false if we are not allowed to go to the next step
                            if (scope.onnext && typeof scope.onnext==='function') scope.onnext();
                            if(wizard.Waiting){
                                wizard.PushToWaitingStack(ContinueToNext);
                                return ;
                            }
                            ContinueToNext();
                        }
                    };

                    function LoadStep() {
                        function UpdateStatus(){
                            if (currentStatus.current) {
                                element.css('display', 'block');
                            }
                            else {
                                element.css('display', 'none');
                            }
                        }
                        var currentStatus = wizard.GetStepStatus(scope.step);
                        if (scope.before && typeof scope.before === 'function' && currentStatus.current && (currentStatus.Loaded === false || (currentStatus.Met === true && currentStatus.HasDependency===true))) {
                            wizard.GetStep(scope.step).Loaded=true;
                            scope.before();
                        } 
                        if(wizard.Waiting){
                            wizard.PushToWaitingStack(UpdateStatus);
                            return ;
                        }
                        UpdateStatus();
                    }

                    wizard.On('wizardInitiated', LoadStep);
                    wizard.On('wizardStepChanged', LoadStep);
                    wizard.On('wizardClosed', function () {
                        scope.$parent.$parent.$parent.onclose();  //TODO: To fix it 
                    });
                    wizard.On('wizardWaitingFinished', function(){
                        wizard.DrainWaitingStack();
                    });
                    wizard.On('wizardWaitingReturnedError',function(){
                        wizard.DrainWaitingStack(false);
                        LoadStep();
                    });
                    wizard.On('wizardWaiting',function(){
                          element.css('display', 'none');
                    });
                }
            }
        }
     ]);
})(angular.module('wizardModule'));