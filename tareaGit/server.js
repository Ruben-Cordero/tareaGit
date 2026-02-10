const Koa = require('koa');
const Router = require('koa-router');
const app = new Koa();
const router = new Router();

let products = [
  { id: 'manzana', nombre: 'Manzana', cantidad: 12, v: 1 },
  { id: 'arroz', nombre: 'Arroz', cantidad: 5, v: 1 },
  { id: 'pan', nombre: 'Pan', cantidad: 20, v: 1 },
  { id: 'leche', nombre: 'Leche', cantidad: 10, v: 1 }
];

router.get('/help', ctx => {
  ctx.body = `
    Endpoints disponibles:
    1. GET /saludo: Devuelve un saludo con tu nombre.
    2. GET /saludo/:numeroAlumno: Devuelve tu número de alumno.
    3. GET /nombre/:nombre: Saludo personalizado.
    4. GET /productos: Devuelve la lista de productos en formato JSON.
    5. POST /productos: Actualiza el inventario de productos.
    
    cURL de cada Endpoint:
    - curl http://localhost:3000/saludo
    - curl http://localhost:3000/saludo/25413279
    - curl http://localhost:3000/nombre/Ruben
    - curl http://localhost:3000/productos
    - curl -X POST http://localhost:3000/productos -H "Content-Type: application/json" -d "{\"id\": \"arroz\", \"cantidad\": 3}"
  `;
  ctx.set('X-Nombre', 'Ruben Cordero Marinez');  // Agregar nombre y apellidos en el header
});

router.get('/saludo', ctx => {
  ctx.body = '¡Hola Ruben!';
});

router.get('/saludo/:numeroAlumno', ctx => {
  const { numeroAlumno } = ctx.params;
  ctx.body = `Tu número de alumno es: ${numeroAlumno}`;
});

router.get('/nombre/:nombre', ctx => {
  const { nombre } = ctx.params;
  ctx.body = `¡Hola, ${nombre}! Bienvenida/o...`;
});

router.get('/productos', ctx => {
  // Usa la versión del producto como ETag
  const version = products.reduce((acc, product) => acc + product.v, 0); 
  ctx.set('ETag', `v${version}`); 
  ctx.body = products;
});

// Ruta para actualizar inventario - POST /productos
router.post('/productos', ctx => {
  let updatedProduct = ctx.request.body; 
  let product = products.find(p => p.id === updatedProduct.id); 

  if (!product) {
    ctx.status = 400;
    ctx.body = { message: "Producto no encontrado." };
    return;
  }

  if (updatedProduct.cantidad < 0 && product.cantidad + updatedProduct.cantidad <= 0) {
    ctx.status = 400;
    ctx.body = { message: "No se puede eliminar completamente este producto." };
    return;
  }

  product.cantidad += updatedProduct.cantidad;
  product.v += 1;  
  ctx.status = 200;
  ctx.body = products;  
});

// Iniciar el servidor
app.use(require('koa-bodyparser')());  
app.use(router.routes());  
app.listen(process.env.PORT || 3000, () => {
  console.log('Servidor corriendo en puerto 3000');
});
