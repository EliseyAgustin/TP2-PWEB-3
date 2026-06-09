const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, '../../data/db.json');

// Estructura inicial de la base de datos
const DEFAULT_DB = {
  users: [],
  categories: [],
  products: [],
  movements: [],
  counters: { users: 0, categories: 0, products: 0, movements: 0 }
};

// Asegurar que existe la carpeta data/
const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Leer base de datos desde el archivo JSON
function readDB() {
  if (!fs.existsSync(DB_PATH)) {
    return { ...DEFAULT_DB, users: [], categories: [], products: [], movements: [], counters: { users: 0, categories: 0, products: 0, movements: 0 } };
  }
  const content = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(content);
}

// Guardar base de datos en el archivo JSON
function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

// Obtener siguiente ID autoincremental
function nextId(db, table) {
  db.counters[table]++;
  return db.counters[table];
}

// ===== USUARIOS =====
const users = {
  findByUsername(username) {
    const db = readDB();
    return db.users.find(u => u.username === username) || null;
  },
  findById(id) {
    const db = readDB();
    return db.users.find(u => u.id === id) || null;
  },
  findByUsernameOrEmail(username, email) {
    const db = readDB();
    return db.users.find(u => u.username === username || u.email === email) || null;
  },
  create(data) {
    const db = readDB();
    const id = nextId(db, 'users');
    const user = { id, ...data, created_at: new Date().toISOString() };
    db.users.push(user);
    writeDB(db);
    return user;
  }
};

// ===== CATEGORÍAS =====
const categories = {
  findAll() {
    const db = readDB();
    return db.categories.sort((a, b) => a.name.localeCompare(b.name));
  },
  findById(id) {
    const db = readDB();
    return db.categories.find(c => c.id === id) || null;
  },
  findByName(name) {
    const db = readDB();
    return db.categories.find(c => c.name.toLowerCase() === name.toLowerCase()) || null;
  },
  create(data) {
    const db = readDB();
    const id = nextId(db, 'categories');
    const category = { id, ...data, created_at: new Date().toISOString() };
    db.categories.push(category);
    writeDB(db);
    return category;
  },
  delete(id) {
    const db = readDB();
    db.categories = db.categories.filter(c => c.id !== id);
    writeDB(db);
  },
  hasProducts(id) {
    const db = readDB();
    return db.products.some(p => p.category_id === id);
  }
};

// ===== PRODUCTOS =====
const products = {
  findAll() {
    const db = readDB();
    return db.products
      .map(p => ({
        ...p,
        category_name: p.category_id ? (db.categories.find(c => c.id === p.category_id)?.name || null) : null
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  },
  findLowStock() {
    const db = readDB();
    return db.products
      .filter(p => p.quantity <= p.min_stock)
      .map(p => ({
        ...p,
        category_name: p.category_id ? (db.categories.find(c => c.id === p.category_id)?.name || null) : null
      }))
      .sort((a, b) => a.quantity - b.quantity);
  },
  findById(id) {
    const db = readDB();
    const product = db.products.find(p => p.id === id) || null;
    if (!product) return null;
    return {
      ...product,
      category_name: product.category_id ? (db.categories.find(c => c.id === product.category_id)?.name || null) : null
    };
  },
  create(data) {
    const db = readDB();
    const id = nextId(db, 'products');
    const product = { id, ...data, created_at: new Date().toISOString() };
    db.products.push(product);
    writeDB(db);
    return product;
  },
  update(id, data) {
    const db = readDB();
    const index = db.products.findIndex(p => p.id === id);
    if (index === -1) return null;
    db.products[index] = { ...db.products[index], ...data };
    writeDB(db);
    return db.products[index];
  },
  delete(id) {
    const db = readDB();
    db.products = db.products.filter(p => p.id !== id);
    writeDB(db);
  }
};

// ===== MOVIMIENTOS =====
const movements = {
  findAll() {
    const db = readDB();
    return db.movements
      .map(m => ({
        ...m,
        product_name: db.products.find(p => p.id === m.product_id)?.name || 'Desconocido',
        username: db.users.find(u => u.id === m.user_id)?.username || 'Desconocido'
      }))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 100);
  },
  findByProductId(productId) {
    const db = readDB();
    return db.movements
      .filter(m => m.product_id === productId)
      .map(m => ({
        ...m,
        username: db.users.find(u => u.id === m.user_id)?.username || 'Desconocido'
      }))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },
  create(movementData, newQuantity) {
    // Registrar movimiento y actualizar stock de forma "atómica" (en una sola escritura)
    const db = readDB();
    const id = nextId(db, 'movements');
    const movement = { id, ...movementData, created_at: new Date().toISOString() };
    db.movements.push(movement);

    const productIndex = db.products.findIndex(p => p.id === movementData.product_id);
    if (productIndex !== -1) {
      db.products[productIndex].quantity = newQuantity;
    }

    writeDB(db);
    return movement;
  }
};

// ===== SEED DATA =====
function seedDatabase() {
  const db = readDB();
  if (db.users.length > 0) return; // Ya tiene datos

  const adminPassword = bcrypt.hashSync('admin123', 10);
  const userPassword = bcrypt.hashSync('user123', 10);

  db.counters = { users: 0, categories: 0, products: 0, movements: 0 };

  // Usuarios
  db.users.push({ id: ++db.counters.users, username: 'admin', email: 'admin@almacen.com', password: adminPassword, role: 'admin', created_at: new Date().toISOString() });
  db.users.push({ id: ++db.counters.users, username: 'encargado', email: 'encargado@almacen.com', password: userPassword, role: 'user', created_at: new Date().toISOString() });

  // Categorías
  db.categories.push({ id: ++db.counters.categories, name: 'Limpieza', description: 'Productos de limpieza e higiene', created_at: new Date().toISOString() });
  db.categories.push({ id: ++db.counters.categories, name: 'Alimentos', description: 'Productos alimenticios no perecederos', created_at: new Date().toISOString() });
  db.categories.push({ id: ++db.counters.categories, name: 'Ferretería', description: 'Herramientas y materiales de construcción', created_at: new Date().toISOString() });

  // Productos
  db.products.push({ id: ++db.counters.products, name: 'Detergente 1L', description: 'Detergente líquido para vajilla', category_id: 1, quantity: 50, min_stock: 10, price: 250.00, created_at: new Date().toISOString() });
  db.products.push({ id: ++db.counters.products, name: 'Harina 1kg', description: 'Harina 000 para repostería', category_id: 2, quantity: 100, min_stock: 20, price: 180.00, created_at: new Date().toISOString() });
  db.products.push({ id: ++db.counters.products, name: 'Martillo', description: 'Martillo de carpintero 500g', category_id: 3, quantity: 15, min_stock: 5, price: 1500.00, created_at: new Date().toISOString() });
  db.products.push({ id: ++db.counters.products, name: 'Lavandina 1L', description: 'Lavandina concentrada', category_id: 1, quantity: 8, min_stock: 15, price: 320.00, created_at: new Date().toISOString() });
  db.products.push({ id: ++db.counters.products, name: 'Aceite 900ml', description: 'Aceite de girasol', category_id: 2, quantity: 60, min_stock: 20, price: 890.00, created_at: new Date().toISOString() });

  writeDB(db);
  console.log('Base de datos inicializada con datos de ejemplo');
}

seedDatabase();

module.exports = { users, categories, products, movements };
