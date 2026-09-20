import sql from '@/lib/db'
import Link from 'next/link'
import { UserButton } from '@clerk/nextjs'
export const dynamic = 'force-dynamic'
export default async function DashboardPage() {
  // جلب كافة العطاءات مرتبة حسب الموعد النهائي
  const tenders = await sql`SELECT * FROM tenders ORDER BY deadline ASC`

  const now = new Date()

  // تصنيف العطاءات بناءً على الحالة والتواريخ
  const openTenders = tenders.filter((t: any) => t.status === 'active' && new Date(t.deadline) > now)
  const submittedTenders = tenders.filter((t: any) => t.status === 'submitted')
  
  const dueSoonTenders = tenders.filter((t: any) => {
    if (t.status !== 'active') return false;
    const deadlineDate = new Date(t.deadline)
    const diffDays = (deadlineDate.getTime() - now.getTime()) / (1000 * 3600 * 24)
    return diffDays >= 0 && diffDays <= 3 // العطاءات التي تنتهي خلال 3 أيام القادمة
  })

  const overdueTenders = tenders.filter((t: any) => {
    if (t.status === 'submitted') return false;
    const deadlineDate = new Date(t.deadline)
    return deadlineDate < now
  })

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-lg shadow-md mt-10 space-y-8">
      
      {/* الترويسة وزر التنقل */}
      <div className="flex justify-between items-center border-b pb-4">
        <div className="flex items-center gap-4">
<UserButton />
          <h1 className="text-2xl font-bold text-gray-800">لوحة تحكم العطاءات (Dashboard)</h1>
        </div>
        <div className="flex gap-3">
          <Link
            href="/tenders"
            className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition font-semibold text-sm"
          >
            إدارة العطاءات
          </Link>
          <Link
            href="/tenders/new"
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition font-semibold text-sm"
          >
            + إضافة عطاء جديد
          </Link>
        </div>
      </div>

      {/* بطاقات الإحصائيات السريعة (Metrics Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg shadow-sm">
          <span className="text-xs font-semibold text-blue-600 block">العطاءات المفتوحة (Open)</span>
          <span className="text-2xl font-bold text-blue-800 mt-1 block">{openTenders.length}</span>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg shadow-sm">
          <span className="text-xs font-semibold text-yellow-600 block">قريبة من الموعد (Due Soon)</span>
          <span className="text-2xl font-bold text-yellow-800 mt-1 block">{dueSoonTenders.length}</span>
        </div>
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg shadow-sm">
          <span className="text-xs font-semibold text-red-600 block">العطاءات المتأخرة (Overdue)</span>
          <span className="text-2xl font-bold text-red-800 mt-1 block">{overdueTenders.length}</span>
        </div>
        <div className="bg-green-50 border border-green-200 p-4 rounded-lg shadow-sm">
          <span className="text-xs font-semibold text-green-600 block">العطاءات المقدمة (Submitted)</span>
          <span className="text-2xl font-bold text-green-800 mt-1 block">{submittedTenders.length}</span>
        </div>
      </div>

      {/* قسم تنبيهات العطاءات العاجلة والمتأخرة */}
      <div className="border-t pt-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">التنبيهات والمواعيد النهائية الحرجة</h2>
        <div className="space-y-3">
          {[...dueSoonTenders, ...overdueTenders].length === 0 ? (
            <p className="text-gray-400 text-sm bg-gray-50 p-4 rounded-md border text-center">ممتاز! لا توجد عطاءات عاجلة أو متأخرة حالياً.</p>
          ) : (
            [...dueSoonTenders, ...overdueTenders].map((tender: any) => {
              const isOverdue = new Date(tender.deadline) < now;
              return (
                <div key={tender.id} className={`p-4 rounded-md border flex justify-between items-center ${isOverdue ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'}`}>
                  <div>
                    <Link href={`/tenders/${tender.id}`} className="font-bold text-blue-600 hover:underline text-base">
                      {tender.title}
                    </Link>
                    <span className={`text-xs px-2.5 py-1 rounded-full mr-3 font-semibold ${isOverdue ? 'bg-red-200 text-red-800' : 'bg-yellow-200 text-yellow-800'}`}>
                      {isOverdue ? 'متأخر (Overdue)' : 'قريب من الموعد (Due Soon)'}
                    </span>
                  </div>
                  <span className="text-xs text-gray-700 font-medium">
                    الموعد النهائي: {new Date(tender.deadline).toLocaleString()}
                  </span>
                </div>
              )
            })
          )}
        </div>
      </div>

    </div>
  )
}
