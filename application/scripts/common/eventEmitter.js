(function (module) {
    module.factory('eventEmitter', [function () {
        
        
         function eventEmitter(){
             this.events={};
         }
         eventEmitter.prototype.On=function(eventtypes,cb){
             var eventTypesArray=eventtypes.split(' ');
             var index=0;
             while(index<eventTypesArray.length){
                 eventtype=eventTypesArray[index++];
                 if (!eventtype) continue;
                 if (this.events.hasOwnProperty(eventtype)) {
                     this.events[eventtype].push(cb);
                 }
                 else {
                     this.events[eventtype] = [cb];
                 }
             }
         }
         
         eventEmitter.prototype.Emit=function(eventtype,value){
             if(this.events.hasOwnProperty(eventtype)){
                 this.events[eventtype].forEach(function(cb){
                     cb(value);
                 }); 
             }
         }
         
         return eventEmitter;
    }]);   
})(angular.module('commonModule'));