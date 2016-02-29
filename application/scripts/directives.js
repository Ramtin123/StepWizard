(function (module) {
     module.directive('panelHeader', [
        function () {
            return {
                restrict: 'EA',
                scope:{
                  title:'@',
                  onclose:'=',
                  buttontype:'@'  
                },
                templateUrl: 'public/application/templates/_panelHeader.html'
            }
        }
    ]);
    
     module.directive('bubbleMessage', [
        function () {
            return {
                restrict: 'EA',
                scope:{
                  messagetype:'@',
                  popseconds:'@'  
                },
                link:function(scope, element, attrs) {
                    
                },
                transclude:true,
                replace: true,
                templateUrl: 'public/application/templates/_bubbleMessage.html'
            }
        }
    ]);
    
    module.directive('moveinWizard', [function () {
            return {
                restrict: 'EA',
                scope:{
                  tenant:'=',  
                  onclose:'='
                },
                templateUrl: 'public/application/templates/_moveinwizard.html',
                controller: 'moveinWizardController',
            }
        }
    ]);

    module.directive('moveoutWizard', [function () {
        return {
            restrict: 'EA',
            scope: {
                tenant: '=',
                onclose: '='
            },
            templateUrl: 'public/application/templates/_moveoutwizard.html',
            controller: 'moveoutWizardController',
        }
    }
    ]);

    module.directive('createUser', [
        function () {
            return {
                restrict: 'EA',
                scope: {
                    onclose: '='
                },
                templateUrl: 'public/application/templates/_createNewTenant.html',
                controller: function ($scope) {

                }
            }
        }
    ]);
    
})(angular.module('multimoveinapp'));