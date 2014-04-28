angular.module('services').factory 'socket', (socketFactory,Host) ->
  socketFactory
    ioSocket: io.connect("#{Host.getAPIHost()}:#{Host.getAPIPort()}/")
