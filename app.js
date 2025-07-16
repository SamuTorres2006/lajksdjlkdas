import fs from 'fs';
import readline from 'readline';

const path = './db.json';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function showMenu() {
    console.log(`\n=== CRUD en consola con Node.js === `);
    console.log(` 1. Crear elemento `);
    console.log(` 2. Listar elementos `);
    console.log(` 3. Actualizar elementos `);
    console.log(` 4.  Eliminar elementos `);
    console.log(` 5.  Salir `);

    rl.question('Selecciona una opcion: ', handleMenu);
}

function handleMenu(option) {
    switch (option) {
        case '1':
            createItems();
            break;
        case '2':
            listItems();
            break;
        case '3':
            updateItems();
            break;
        case '4':
            deleteItems();
            break;
        case '5':
            rl.close();
            break;
        default:
            console.log("Opcion invalida")
            showMenu();
    }
}

export function loadData() {
    if (!fs.existsSync(path)) {
        fs.writeFileSync(path, "[]");
        return [];
    }
    else {
        const data = fs.readFileSync(path);
        return JSON.parse(data);
    }
}

export function saveData(data) {
    fs.writeFileSync(path, JSON.stringify(data, undefined, 2));
}

function createItems() {
    rl.question("Ingrese un nombre: ", (name) => {
        const data = loadData();
        const id = Date.now();
        data.push({ id, name });
        saveData(data);
        console.log("Elemento creado.");
        showMenu();
    })
};

function listItems() {
    const data = loadData();
    console.log("\n=== Lista de elementos ===");
    data.forEach((item) => {
        console.log(`ID: ${item.id} - Nombre: ${item.name}`)
    })
}

function updateItems() {
    rl.question("ID del elemento a actualizar: ", (idStr) => {
        const id = parseInt(idStr);
        const data = loadData();
        const index = data.findIndex((item) => item.id === id);
        if (index === -1) {
            console.log("Elemento no encontrado.");
            showMenu();
            return;
        }

        rl.question("Nuevo nombre: ", (newName) => {
            data[index].name = newName;
            saveData(data);
            console.log("Elemento actualizado.");
            showMenu();
        })
    })
}

function deleteItems() {
    rl.question("ID del elemento a actualizar: ", (idStr) => {
        const id = parseInt(idStr);
        let data = loadData();
        const newData = data.filter((item) => item.id === id);
        if (data.length === newData.length) {
            console.log("Elemento no encontrado.");
        } else {
            saveData(newData);
            console.log("Elemento eliminado");
        }
        showMenu();
    })
};

showMenu();

rl.on("Close", () => {
    console.log("Aplicación finalizada.");
    process.exit(0)
})