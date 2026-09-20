import sql from '@/lib/db'
import Link from 'next/link'
export const dynamic = 'force-dynamic'
export default async function TendersPage() {
  // جلب كافة العطاءات من قاعدة البيانات مرتبة من الأحدث للأقدم
  const tenders = await sql`SELECT * FROM tenders ORDER BY id DESC`

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-md mt-10 space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">إدارة العطاءات (Tender Management Dashboard)</h1>
          <p className="text-sm text-gray-500 mt-1">لوحة التحكم الرئيسية لإدارة ومتابعة العطاءات وعروض الأسعار.</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/tenders/ai_uploads"
            className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-purple-700 transition flex items-center gap-2"
          >
            ✨ استخراج بالذكاء الاصطناعي
          </Link>
          <Link
            href="/tenders/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-blue-700 transition"
          >
            + عطاء يدوي جديد
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-right border-collapse border border-gray-200 text-sm">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="border p-3">عنوان العطاء</th>
              <th className="border p-3">العميل</th>
              <th className="border p-3">الرقم المرجعي</th>
              <th className="border p-3">الميزانية</th>
              <th className="border p-3">الحالة</th>
              <th className="border p-3 text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {tenders.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center p-6 text-gray-400">
                  لا توجد عطاءات مسجلة حالياً. ابدأ بإنشاء عطاء جديد أو استخدم الذكاء الاصطناعي لاستخراج البيانات!
                </td>
              </tr>
            ) : (
              tenders.map((tender: any) => (
                <tr key={tender.id} className="hover:bg-gray-50 transition">
                  <td className="border p-3 font-semibold text-gray-800">{tender.title}</td>
                  <td className="border p-3 text-gray-600">{tender.client || '-'}</td>
                  <td className="border p-3 text-gray-600">{tender.reference || '-'}</td>
                  <td className="border p-3 text-blue-600 font-bold">
                    {tender.budget ? `${tender.budget}` : 'غير محددة'}
                  </td>
                  <td className="border p-3">
                    <span className="bg-green-100 text-green-800 px-2.5 py-1 rounded-full text-xs font-medium">
                      {tender.status || 'active'}
                    </span>
                  </td>
                  <td className="border p-3 text-center">
                    <Link
                      href={`/tenders/${tender.id}`}
                      className="bg-gray-800 text-white px-3 py-1.5 rounded text-xs font-semibold hover:bg-gray-900 transition"
                    >
                      عرض التفاصيل والماليات
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
