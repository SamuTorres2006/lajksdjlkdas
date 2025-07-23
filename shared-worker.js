self.onconnect = function(event) {
    const port = event.ports[0];

    port.onmessage = function(event) {
        console.log('Mensaje recibido del Shared Worker');

        port.postMessage('Resultado desde el Shared Worker' +event.data)
    }
}