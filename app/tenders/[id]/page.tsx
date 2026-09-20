import sql from '@/lib/db'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { 
  addTask, 
  deleteTask, 
  addQuote, 
  deleteQuote, 
  updateCostSummary, 
  deleteTender 
} from '@/app/actions/tender'

export default async function TenderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // انتظار الـ params لتجنب أخطاء NaN في الإصدارات الحديثة من Next.js
  const resolvedParams = await params
  const tenderId = Number(resolvedParams.id)

  if (isNaN(tenderId)) {
    notFound()
  }

  const tenders = await sql`SELECT * FROM tenders WHERE id = ${tenderId}`
  if (tenders.length === 0) {
    notFound()
  }
  const tender = tenders[0]

  const tasks = await sql`SELECT * FROM tasks WHERE tender_id = ${tenderId} ORDER BY id DESC`
  const quotes = await sql`SELECT * FROM quotes WHERE tender_id = ${tenderId} ORDER BY id DESC`

  // الحسابات المالية
  const supplierCost = Number(tender.supplier_cost) || 0
  const otherCosts = Number(tender.other_costs) || 0
  const exchangeRate = Number(tender.exchange_rate) || 1
  const marginPercentage = Number(tender.margin_percentage) || 0

  const totalCostInBaseCurrency = (supplierCost + otherCosts) * exchangeRate
  const finalBidPrice = totalCostInBaseCurrency * (1 + marginPercentage / 100)

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 bg-gray-50 min-h-screen">
      {/* رأس الصفحة وأزرار التنقل */}
      <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
              {tender.status || 'Active'}
            </span>
            <span className="text-sm text-gray-500 font-mono">{tender.reference}</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">{tender.title}</h1>
          <p className="text-sm text-gray-600 mt-1"><strong className="text-gray-700">العميل:</strong> {tender.client}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/tenders" className="px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition font-medium">
            &larr; العودة للعطاءات
          </Link>
          <form action={async () => {
            'use server'
            await deleteTender(tenderId)
          }}>
            <button type="submit" className="px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-700 rounded-md transition font-medium">
              حذف العطاء
            </button>
          </form>
        </div>
      </div>

      {/* تفاصيل العطاء الأساسية */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 space-y-4">
        <h2 className="text-lg font-bold text-gray-800 border-b pb-2">تفاصيل العطاء الأساسية</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-500 block text-xs">الميزانية / القيمة الإجمالية</span>
            <span className="font-bold text-gray-900 text-base">{tender.budget ? `${tender.budget} ${tender.currency || 'USD'}` : 'غير محدد'}</span>
          </div>
          <div>
            <span className="text-gray-500 block text-xs">الموعد النهائي (Deadline)</span>
            <span className="font-bold text-gray-900 text-base">{tender.deadline ? new Date(tender.deadline).toLocaleString() : 'غير محدد'}</span>
          </div>
          <div>
            <span className="text-gray-500 block text-xs">العملة المعتمدة</span>
            <span className="font-bold text-gray-900 text-base">{tender.currency || 'USD'}</span>
          </div>
        </div>
        {tender.description && (
          <div className="mt-2 pt-2 border-t border-gray-100">
            <span className="text-gray-500 block text-xs mb-1">وصف العطاء ونطاق العمل</span>
            <p className="text-sm text-gray-800 leading-relaxed">{tender.description}</p>
          </div>
        )}
      </div>

      {/* قائمة المهام والمتطلبات */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 space-y-4">
        <h2 className="text-lg font-bold text-gray-800 border-b pb-2">قائمة المهام والمتطلبات (Tasks Checklist)</h2>
        <form action={async (formData) => {
          'use server'
          await addTask(tenderId, formData)
        }} className="flex gap-2">
          <input
            type="text"
            name="title"
            placeholder="أضف مهمة جديدة أو متطلب..."
            required
            className="flex-1 border border-gray-300 p-2 rounded-md text-sm bg-white text-gray-950 font-medium"
          />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-blue-700 transition">
            إضافة مهمة
          </button>
        </form>

        <div className="space-y-2 mt-4">
          {tasks.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">لا توجد مهام مضافة لهذا العطاء بعد.</p>
          ) : (
            tasks.map((task: any) => (
              <div key={task.id} className="flex justify-between items-center p-3 bg-gray-50 border border-gray-200 rounded-md">
                <span className="text-sm text-gray-900 font-medium">{task.title}</span>
                <form action={async () => {
                  'use server'
                  await deleteTask(task.id, tenderId)
                }}>
                  <button type="submit" className="text-xs text-red-600 hover:underline font-semibold">حذف</button>
                </form>
              </div>
            ))
          )}
        </div>
      </div>

      {/* سجل الموردين وعروض الأسعار */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 space-y-4">
        <h2 className="text-lg font-bold text-gray-800 border-b pb-2">سجل الموردين وعروض الأسعار (RFQ Comparison)</h2>
        <form action={async (formData) => {
          'use server'
          await addQuote(tenderId, formData)
        }} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">اسم المورد</label>
            <input
              type="text"
              name="supplier"
              placeholder="اسم المورد"
              required
              className="w-full border border-gray-300 p-2 rounded-md text-sm bg-white text-gray-950 font-medium"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">قيمة العرض</label>
            <input
              type="number"
              step="0.01"
              name="amount"
              placeholder="0.00"
              required
              className="w-full border border-gray-300 p-2 rounded-md text-sm bg-white text-gray-950 font-medium"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">ملاحظات العرض</label>
            <input
              type="text"
              name="notes"
              placeholder="ملاحظات العرض"
              className="w-full border border-gray-300 p-2 rounded-md text-sm bg-white text-gray-950 font-medium"
            />
          </div>
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-green-700 transition h-[38px]">
            إضافة عرض سعر
          </button>
        </form>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-right border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100 text-gray-700 border-b">
                <th className="p-3">اسم المورد</th>
                <th className="p-3">قيمة العرض</th>
                <th className="p-3">الملاحظات</th>
                <th className="p-3 text-center">إجراء</th>
              </tr>
            </thead>
            <tbody>
              {quotes.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-4 text-gray-500">لا توجد عروض أسعار مسجلة حتى الآن.</td>
                </tr>
              ) : (
                quotes.map((quote: any) => (
                  <tr key={quote.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-semibold text-gray-900">{quote.supplier}</td>
                    <td className="p-3 font-mono font-bold text-blue-600">{quote.amount} {tender.currency || 'USD'}</td>
                    <td className="p-3 text-gray-700">{quote.notes || '-'}</td>
                    <td className="p-3 text-center">
                      <form action={async () => {
                        'use server'
                        await deleteQuote(quote.id, tenderId)
                      }}>
                        <button type="submit" className="text-xs text-red-600 hover:underline font-semibold">حذف</button>
                      </form>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* الملخص المالي وتكاليف العرض */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 space-y-6">
        <h2 className="text-lg font-bold text-gray-800 border-b pb-2">الملخص المالي وتكاليف العرض (Cost Summary & Margin)</h2>
        
        <form action={async (formData) => {
          'use server'
          await updateCostSummary(tenderId, formData)
        }} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">تكلفة المورد (Supplier Cost)</label>
              <input
                type="number"
                step="0.01"
                name="supplierCost"
                defaultValue={supplierCost}
                className="w-full border border-gray-300 p-2 rounded-md text-sm bg-white text-gray-950 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">التكاليف الأخرى (Other Costs)</label>
              <input
                type="number"
                step="0.01"
                name="otherCosts"
                defaultValue={otherCosts}
                className="w-full border border-gray-300 p-2 rounded-md text-sm bg-white text-gray-950 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">سعر الصرف (Exchange Rate)</label>
              <input
                type="number"
                step="0.0001"
                name="exchangeRate"
                defaultValue={exchangeRate}
                className="w-full border border-gray-300 p-2 rounded-md text-sm bg-white text-gray-950 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">هامش الربح % (Margin)</label>
              <input
                type="number"
                step="0.01"
                name="marginPercentage"
                defaultValue={marginPercentage}
                className="w-full border border-gray-300 p-2 rounded-md text-sm bg-white text-gray-950 font-medium"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-md text-sm font-semibold hover:bg-blue-700 transition">
              حفظ وتحديث حسابات التكلفة
            </button>
          </div>
        </form>

        {/* عرض النتائج المالية النهائية */}
        <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-4 items-center mt-4">
          <div>
            <span className="text-xs text-blue-800 font-semibold block">إجمالي التكلفة بعد الصرف:</span>
            <span className="text-2xl font-bold font-mono text-gray-900">
              {totalCostInBaseCurrency.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {tender.currency || 'USD'}
            </span>
          </div>
          <div className="md:border-r md:border-blue-200 md:pr-4">
            <span className="text-xs text-blue-800 font-semibold block">سعر العرض النهائي (Final Bid Price):</span>
            <span className="text-3xl font-extrabold font-mono text-blue-700">
              {finalBidPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {tender.currency || 'USD'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}