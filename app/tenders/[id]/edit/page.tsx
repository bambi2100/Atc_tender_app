import sql from '@/lib/db'
import { updateTender } from '@/app/actions/tender'
import { notFound } from 'next/navigation'
import Link from 'next/link'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditTenderPage({ params }: PageProps) {
  const { id } = await params
  const tenderId = Number(id)

  if (isNaN(tenderId)) {
    notFound()
  }

  const tenders = await sql`SELECT * FROM tenders WHERE id = ${tenderId}`
  const tender = tenders[0]

  if (!tender) {
    notFound()
  }

  // تنسيق التاريخ ليتوافق مع input type="datetime-local"
  const formattedDeadline = tender.deadline
    ? new Date(tender.deadline).toISOString().slice(0, 16)
    : ''

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">تعديل العطاء (Edit Tender)</h1>

      <form action={updateTender} className="space-y-4">
        <input type="hidden" name="id" value={tender.id} />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">عنوان العطاء (Title)</label>
          <input
            type="text"
            name="title"
            defaultValue={tender.title}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">الوصف (Description)</label>
          <textarea
            name="description"
            rows={4}
            defaultValue={tender.description || ''}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">الميزانية (Budget)</label>
          <input
            type="number"
            step="0.01"
            name="budget"
            defaultValue={tender.budget || ''}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">الحالة (Status)</label>
          <select
            name="status"
            defaultValue={tender.status || 'active'}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="active">نشط (Active)</option>
            <option value="closed">مغلق (Closed)</option>
            <option value="pending">قيد الانتظار (Pending)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">الموعد النهائي (Deadline)</label>
          <input
            type="datetime-local"
            name="deadline"
            defaultValue={formattedDeadline}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200 font-semibold"
          >
            حفظ التعديلات (Update Tender)
          </button>
          <Link
            href={`/tenders/${tender.id}`}
            className="py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition duration-200 font-semibold flex items-center justify-center"
          >
            إلغاء
          </Link>
        </div>
      </form>
    </div>
  )
}