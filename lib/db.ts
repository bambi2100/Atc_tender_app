import postgres from 'postgres'

let sqlInstance: postgres.Sql | null = null

function getSql() {
  if (!sqlInstance) {
    const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL || ''
    
    // إذا لم يكن الرابط موجوداً أثناء البناء، نضع قيمة افتراضية لتجنب الانهيار الفوري
    const validUrl = connectionString.startsWith('postgres') 
      ? connectionString 
      : 'postgres://postgres:postgres@localhost:5432/postgres'

    sqlInstance = postgres(validUrl, { 
      ssl: validUrl.includes('localhost') ? false : 'require',
      max: 5 
    })
  }
  return sqlInstance
}

// استخدام Proxy لتأجيل الاتصال حتى يتم تنفيذ أي استعلام فعلياً
const sql = new Proxy((() => {}) as unknown as postgres.Sql, {
  get(target, prop, receiver) {
    const instance = getSql()
    const value = Reflect.get(instance, prop, receiver)
    return typeof value === 'function' ? value.bind(instance) : value
  },
  apply(target, thisArg, argArray) {
    const instance = getSql()
    return (instance as any)(...argArray)
  },
})

export default sql
