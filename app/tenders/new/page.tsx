import { createTender } from '@/app/actions/tender'
import Link from 'next/link'

export default function NewTenderPage() {
  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md mt-10 space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-800">إنشاء عطاء جديد (New Tender)</h1>
        <Link href="/tenders" className="text-sm text-gray-600 hover:underline">
          &larr; العودة للعطاءات
        </Link>
      </div>

      <form action={createTender} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">عنوان العطاء (Title)</label>
          <input
            type="text"
            name="title"
            required
            placeholder="أدخل عنوان العطاء..."
            className="w-full border border-gray-300 p-2 rounded-md text-sm bg-white text-gray-950 font-medium"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">العميل (Client)</label>
          <input
            type="text"
            name="client"
            placeholder="اسم الجهة أو العميل..."
            className="w-full border border-gray-300 p-2 rounded-md text-sm bg-white text-gray-950 font-medium"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">الرقم المرجعي (Reference)</label>
            <input
              type="text"
              name="reference"
              placeholder="مثال: REF-001"
              className="w-full border border-gray-300 p-2 rounded-md text-sm bg-white text-gray-950 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">الميزانية / القيمة (Budget)</label>
            <input
              type="number"
              step="0.01"
              name="budget"
              placeholder="0.00"
              className="w-full border border-gray-300 p-2 rounded-md text-sm bg-white text-gray-950 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">العملة (Currency)</label>
            <input
              type="text"
              name="currency"
              defaultValue="USD"
              className="w-full border border-gray-300 p-2 rounded-md text-sm bg-white text-gray-950 font-medium"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">الموعد النهائي (Deadline)</label>
          <input
            type="datetime-local"
            name="deadline"
            className="w-full border border-gray-300 p-2 rounded-md text-sm bg-white text-gray-950 font-medium"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">وصف العطاء (Description)</label>
          <textarea
            name="description"
            rows={4}
            placeholder="تفاصيل ووصف العطاء..."
            className="w-full border border-gray-300 p-2 rounded-md text-sm bg-white text-gray-950 font-medium"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white py-2.5 rounded-md font-semibold hover:bg-blue-700 transition"
          >
            حفظ العطاء (Save Tender)
          </button>
        </div>
      </form>
    </div>
  )
}