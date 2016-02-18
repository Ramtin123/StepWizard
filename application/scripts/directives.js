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
                templateUrl: '/application/templates/_panelHeader.html',
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
                templateUrl: '/application/templates/_bubbleMessage.html'
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
                templateUrl: '/application/templates/_moveinwizard.html',
                controller: 'moveinWizardController',
            }
        }
    ]);

    module.directive('createUser', [
        function () {
            return {
                restrict: 'EA',
                replace:true,
                scope: {
                    onclose: '='
                },
                templateUrl: '/application/templates/_createNewTenant.html',
                controller: function ($scope) {

                }
            }
        }
    ]);
    
})(angular.module('multimoveinapp'));