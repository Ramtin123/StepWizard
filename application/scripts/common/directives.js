(function (module) {
    module.directive('creditCard', [
       function () {
           return {
               restrict: 'EA',
               scope: {
                   info: '=',
                   onchange: '='
               },
               templateUrl: 'public/application/templates/_creditCard.html',
               link: function (scope, element, attrs) {
                   scope.$watch('info', function (newVal, oldVal) {
                       if (scope.onchange && typeof scope.onchange === 'function') scope.onchange(scope.creditcard);
                   }, true);

               }
           }
       }
    ]);


})(angular.module('commonModule'));