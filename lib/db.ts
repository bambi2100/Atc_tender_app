import postgres from 'postgres'

const connectionString = process.env.DATABASE_URL!

// التأكد من تفعيل الاتصال الآمن SSL للتعامل مع قواعد البيانات السحابية مثل Neon
const sql = postgres(connectionString, { ssl: 'require' })

export default sql