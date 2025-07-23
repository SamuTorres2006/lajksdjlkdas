const sharedWorker = new SharedWorker('./js/shared-worker.js');

const port = sharedWorker.port;

port.onmessage = function(event) {
    console.log('Mensaje recibido desde el Shared Worker', event.data)
}

port.postMessage('Hola desde el hilo de un documento secundario')