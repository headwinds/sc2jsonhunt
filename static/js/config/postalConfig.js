// config
// http://jonathancreamer.com/an-angular-event-bus-with-postal-js/
// not sure If I want to use this or not...may be overkill...but I like the flexibilty/readility
// for now I'll simply use angular's own event system

angular.module('photohunt.config')  
.config(function ($provide) {
    $provide.decorator('$rootScope', ['$delegate', function ($delegate) {
        Object.defineProperty($delegate.constructor.prototype, '$bus', {
            get: function() {
                var self = this;

                return {
                    subscribe: function() {
                        var sub = postal.subscribe.apply(postal, arguments);

                        self.$on('$destroy',
                        function() {
                            sub.unsubscribe();
                        });
                    },
                    channel: postal.channel,
                    publish: postal.publish
                };
            },
            enumerable: false
        });

        return $delegate;
    }]);
});