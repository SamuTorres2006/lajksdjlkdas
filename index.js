import readline from 'readline';
import { MongoClient, ObjectId } from 'mongodb';

const uri = 'mongodb+srv://torressanchezsamuelfelipe:Y38qcF1n0hnTGqhW@campulandssamuel.sw4zfdc.mongodb.net/';
const client = new MongoClient(uri);
const dbName = 'ClassNode';
const collectionName = 'Usuarios';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function ShowMenu(db) {
    console.log('\n === CRUD AVANZADO CON MONGODB ===');
    console.log('1. Crear usuario');
    console.log('2. Buscar usuaros por cuidad');
    console.log('3. Actualizar barrio y edad (transacción)');
    console.log('4. Eliminar por rol');
    console.log('5. Listar todos');
    console.log('6. Salir \n');

    rl.question('Opción: ', (op) => {
        switch (op) {
            case '1': crearUsuario(db); break;
            case '2': buscarPorCiudad(db); break;
            case '3': actualizarConTransacción(db); break;
            case '4': EliminarPorRol(db); break;
            case '5': ListarUsuarios(db); break
            case '6': rl.close(db); break;
            default:
                console.log("Opción invalidad")
                ShowMenu(db);
        }
    })
}

async function crearUsuario(db) {
    rl.question('Nombre: ', (nombre) => {
        rl.question('Email: ', (email) => {
            rl.question('Edad: ', (edadStr) => {
                rl.question('Cuidad: ', (cuidad) => {
                    rl.question('Barrio: ', (barrio) => {
                        rl.question('Roles (separados por coma): ', async (rolesStr) => {
                            const edad = parseInt(edadStr);
                            const roles = rolesStr.split(',').map(r => r.trim());
                            const usuario = {
                                nombre,
                                email,
                                edad,
                                direccion: { cuidad, barrio },
                                roles
                            };
                            await db.collection(collectionName).insertOne(usuario);
                            console.log('usuario creado');
                            ShowMenu(db);
                        });
                    });
                });
            });
        });
    });
};

async function buscarPorCiudad(db) {
    rl.question('Cuidad a bascar: ', async (cuidad) => {
        const usuarios = await db.collection(collectionName).find({ 'direccion.cuidad': cuidad })
    }).toArray();
    if (usuarios.length === 0) {
        console.log('No se encontraron usuarios');
    } else {
        usuarios.forEach(u => {
            console.log(`${u.nombre} - ${u.email} (${u.direccion.barrio})`)
        });
    }
    ShowMenu(db)
}

async function actualizarConTransacción(db) {
    rl.question('ID de usuario: ', async (id) => {
        rl.question('Nuevo barrio: ', async (barrio) => {
            rl.question('Nueva edad: ', async (edadStr) => {
                const edad = parseInt(edadStr);
                const session = client.startSession();

                try {
                    const result = await session.withTransaction(async () => {
                        const collection = db.collection(collectionName);
                        const res = await collection.updateOne(
                            { _id: new ObjectId(id) },
                            {
                                $set: {
                                    'direccion.barrio': barrio,
                                    edad
                                },
                            },
                            { session }
                        )
                        if (res.matchedCount == 0) throw new Error('Usuario no encontardo')
                    })

                    console.log('Usuario actualizado correctamente')
                } catch (err) {
                    console.log('Error en transacción: ', err.message)
                } finally {
                    await session.endSession();
                    ShowMenu(db)
                }
            })
        })
    })
}

async function EliminarPorRol(db) {
    rl.question('Rol a eliminar; ', async (rol) => {
        const result = await db.collection(collectionName).deleteMany({ roles: rol });
        console.log(`${result.deletedCount} usuarios eliminados con rol '${rol}'.`);
        ShowMenu(db)
    })
}

async function ListarUsuarios(db) {
    const usuarios = await db.collection(collectionName).find().toArray();
    console.log('\n === Usuarios === ');
    usuarios.forEach(u => {
        console.log(`ID: ${u.id} ! ${u.nombre} (${u.email}) - ${u.direccion.cuidad}, ${u.direccion.barrio} ! Roles: ${u.roles.join(',')}`)
    })
    ShowMenu(db)
}


async function main() {
    try {
        await client.connect();
        const db = client.db(dbName);
        ShowMenu(db)
    }   catch (err) {
        console.log('Error al ingresar: ', err);
        rl.close()
    }
}

main();

rl.on('close', async () => {
    await client.close();
    console.log('Aplicación no cerrada');
    process.exit(0)
})