const sharedWorker = new SharedWorker('./js/shared-worker.js')

const port = sharedWorker.port;

port.onmessage = function(event) {
    console.log('Mesaje recibido en el Shared Worker', event.data);

} 
port.postMessage('Hola desde el hilo principal')