import mysql from 'mysql2/promise';

// TODO: adjust these connection details to match your SingleStore deployment:
const HOST = 'localhost';
const PORT = 3306;
const USER = 'root';
const PASSWORD = 'password_here';
const DATABASE = 'acme';

// main is run at the end
async function main() {
  let conn;
  try {
    conn = await mysql.createConnection({
      host: HOST,
      port: PORT,
      user: USER,
      password: PASSWORD,
      database: DATABASE
    });
    
    const id = await create({conn, content: 'Inserted row'});
    console.log(`Inserted row id ${id}`);

    const msg = await readOne({conn, id});
    console.log('Read one row:');
    if (msg == null) {
      console.log('not found');
    } else {
      console.log(`${msg.id}, ${msg.content}, ${msg.createdate}`);
    }

    await update({conn, id, content: 'Updated row'});
    console.log(`Updated row id ${id}`);

    const messages = await readAll({conn});
    console.log('Read all rows:');
    messages.forEach(m => {
      console.log(`${m.id}, ${m.content}, ${m.createdate}`);
    });

    await delete_({conn, id});    
  } catch (err) {
    console.error('ERROR', err);
    process.exit(1);
  } finally {
    if (conn) {
      await conn.end();
    }
  }
}

async function create({conn, content}) {
  const [results, fields] = await conn.query('CALL messages_create(?)', [content]);
  return results[0][0].id; // id of first row in first result set
}

async function readOne({conn, id}) {
  const [results, fields] = await conn.query('CALL messages_read_by_id(?)', [id]);
  return results[0][0]; // first row in first result set
}

async function readAll({conn}) {
  const [results, fields] = await conn.query('CALL messages_read_all()');
  return results[0]; // first result set
}

async function update({conn, id, content}) {
  await conn.query('CALL messages_update(?,?)', [id, content]);
}

async function delete_({conn, id}) {
  await conn.query('CALL messages_delete(?)', [id]);
}

main();