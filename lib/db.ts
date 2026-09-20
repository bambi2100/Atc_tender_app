import postgres from 'postgres'

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL || ''

// إعداد اتصال آمن بقاعدة البيانات مع تجنب انهيار البناء إذا كان الرابط مفقوداً
const sql = connectionString 
  ? postgres(connectionString, { ssl: 'require' })
  : (() => {
      throw-new Error('قاعدة البيانات غير متصلة: يرجى التأكد من إضافة DATABASE_URL في إعدادات Vercel')
    }) as unknown as postgres.Sql

export default sql
