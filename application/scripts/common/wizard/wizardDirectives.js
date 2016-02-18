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

                    wizard.On('wizardInitiated wizardStepChanged wizardWaitingFinished wizardWaitingReturnedError', UpdateStatus);
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
                    after:'=',
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
                    
                    function ProcessEvent(event, cb) {
                        var currentStatus = wizard.GetStepStatus(scope.step);
                        if (!cb || typeof cb !== 'function' || !currentStatus.current) return;
                        if (event && typeof event === 'function') var result = event();
                        if(result){  //Does not work . fix it later
                            cb.bind(result);
                            }
                        if(wizard.Paused===true || wizard.Waiting===true){
                            wizard.PushToWaitingStack(cb);
                            return ;
                        }
                        cb(result);
                    }
                    
                    scope.Next = function () {
                        ProcessEvent(scope.validator, function (result) {
                            if (result !== false) {
                                ProcessEvent(scope.onnext, function () {
                                    ProcessEvent(scope.after, function () {
                                        if (scope.action === 'finishprocess') {
                                            wizard.FinishProcess();
                                        }
                                        else if (scope.action === 'close') {
                                            wizard.Close();
                                        }
                                        else {
                                            wizard.NextStep();
                                        }
                                    });
                                });
                            }
                        });
                    }
                        
                    function LoadStep() {
                        var currentStatus = wizard.GetStepStatus(scope.step);
                        ProcessEvent(scope.before, function () {
                            if (currentStatus.current) {
                                element.css('display', 'block');
                            }
                            else {
                                element.css('display', 'none');
                            }
                        });
                    }

                    wizard.On('wizardInitiated wizardStepChanged wizardWaitingReturnedError', LoadStep);
                    wizard.On('wizardClosed', function () {
                        scope.$parent.$parent.$parent.onclose();  //TODO: To fix it 
                    });
                    wizard.On('wizardWaiting',function(){
                          element.css('display', 'none');
                    });
                }
            }
        }
     ]);
})(angular.module('wizardModule'));