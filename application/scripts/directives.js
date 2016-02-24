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
                templateUrl: 'assets/application/templates/_panelHeader.html',
                controller: function($scope){
                    
                }
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
                templateUrl: 'assets/application/templates/_bubbleMessage.html'
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
                templateUrl: 'assets/application/templates/_moveinwizard.html',
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
            templateUrl: 'assets/application/templates/_moveoutwizard.html',
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
                templateUrl: 'assets/application/templates/_createNewTenant.html',
                controller: function ($scope) {

                }
            }
        }
    ]);
    
})(angular.module('multimoveinapp'));