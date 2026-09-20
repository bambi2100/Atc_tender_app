'use client'

import { useState } from 'react'
import { extractTenderData, processAndSaveAITender } from '@/app/actions/tender'
import Link from 'next/link'

export default function AITenderUploadPage() {
  const [step, setStep] = useState<'upload' | 'review'>('upload')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  
  const [extractedData, setExtractedData] = useState({
    title: '',
    client: '',
    reference: '',
    budget: '',
    currency: 'USD',
    deadline: '',
    status: 'active',
    description: ''
  })

  // استدعاء الذكاء الاصطناعي الحقيقي لتحليل المستند المرفق
  async function handleFileUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setErrorMessage('')

    const formElement = e.currentTarget
    const fileInput = formElement.elements.namedItem('fileInput') as HTMLInputElement
    const file = fileInput?.files?.[0]

    if (!file) {
      setErrorMessage('يرجى اختيار ملف أولاً.')
      setLoading(false)
      return
    }

    setUploadedFile(file)

    try {
      const formData = new FormData()
      formData.append('tenderFile', file)

      // استدعاء دالة السيرفر لتحليل الملف عبر Gemini API فعلياً
      const data = await extractTenderData(formData)

      setExtractedData({
        title: data.title || '',
        client: data.client || '',
        reference: data.reference || '',
        budget: data.budget ? String(data.budget) : '',
        currency: data.currency || 'USD',
        deadline: data.deadline || '',
        status: 'active',
        description: data.description || ''
      })

      setLoading(false)
      setStep('review')
    } catch (error: any) {
      console.error(error)
      setErrorMessage(error.message || 'حدث خطأ أثناء تحليل المستند بالذكاء الاصطناعي.')
      setLoading(false)
    }
  }

  // حفظ البيانات المستخرجة بعد مراجعتها
  async function handleSaveTender(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    
    const formData = new FormData()
    if (uploadedFile) {
      formData.append('tenderFile', uploadedFile)
    } else {
      formData.append('tenderFile', new Blob(['dummy'], { type: 'text/plain' }), 'tender.txt')
    }

    formData.append('title', extractedData.title)
    formData.append('client', extractedData.client)
    formData.append('reference', extractedData.reference)
    formData.append('budget', extractedData.budget)
    formData.append('currency', extractedData.currency)
    formData.append('deadline', extractedData.deadline)
    formData.append('status', extractedData.status)
    formData.append('description', extractedData.description)

    await processAndSaveAITender(formData)
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md mt-10 space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-800">استخراج بيانات العطاء بالذكاء الاصطناعي (Gemini AI)</h1>
        <Link href="/tenders" className="text-sm text-gray-600 hover:underline">
          &larr; العودة للعطاءات
        </Link>
      </div>

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-md text-sm text-red-800">
          {errorMessage}
        </div>
      )}

      {/* الخطوة الأولى: رفع المستند */}
      {step === 'upload' && (
        <form onSubmit={handleFileUpload} className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-md text-sm text-blue-800">
            قم برفع ملف مستند العطاء (PDF أو Word أو Text). سيقوم نموذج Gemini بقراءة الملف واستخراج الحقول الفعلية آلياً.
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">اختر ملف العطاء</label>
            <input
              type="file"
              name="fileInput"
              required
              accept=".pdf,.doc,.docx,.txt"
              className="w-full border border-gray-300 p-2 rounded-md text-sm bg-white text-gray-950 font-medium"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2.5 rounded-md font-semibold hover:bg-blue-700 transition"
          >
            {loading ? '🤖 جاري قراءة وتحليل المستند عبر الذكاء الاصطناعي...' : 'تحليل المستند بالذكاء الاصطناعي'}
          </button>
        </form>
      )}

      {/* الخطوة الثانية: مراجعة الحقول المستخرجة */}
      {step === 'review' && (
        <form onSubmit={handleSaveTender} className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md text-sm text-yellow-800 font-medium">
            ⚠️ تم استخراج البيانات من ملفك بنجاح! يرجى مراجعتها وتعديلها قبل اعتمادها وحفظها في النظام.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">عنوان العطاء (Title)</label>
              <input
                type="text"
                required
                value={extractedData.title}
                onChange={(e) => setExtractedData({...extractedData, title: e.target.value})}
                className="w-full border border-gray-300 p-2 rounded-md text-sm bg-white text-gray-950 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">العميل (Client)</label>
              <input
                type="text"
                value={extractedData.client}
                onChange={(e) => setExtractedData({...extractedData, client: e.target.value})}
                className="w-full border border-gray-300 p-2 rounded-md text-sm bg-white text-gray-950 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">الرقم المرجعي (Reference)</label>
              <input
                type="text"
                value={extractedData.reference}
                onChange={(e) => setExtractedData({...extractedData, reference: e.target.value})}
                className="w-full border border-gray-300 p-2 rounded-md text-sm bg-white text-gray-950 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">الميزانية / القيمة (Value)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={extractedData.budget}
                onChange={(e) => setExtractedData({...extractedData, budget: e.target.value})}
                className="w-full border border-gray-300 p-2 rounded-md text-sm bg-white text-gray-950 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">العملة (Currency)</label>
              <input
                type="text"
                value={extractedData.currency}
                onChange={(e) => setExtractedData({...extractedData, currency: e.target.value})}
                className="w-full border border-gray-300 p-2 rounded-md text-sm bg-white text-gray-950 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">الموعد النهائي (Deadline)</label>
              <input
                type="datetime-local"
                value={extractedData.deadline}
                onChange={(e) => setExtractedData({...extractedData, deadline: e.target.value})}
                className="w-full border border-gray-300 p-2 rounded-md text-sm bg-white text-gray-950 font-medium"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1">وصف العطاء (Description)</label>
              <textarea
                rows={3}
                value={extractedData.description}
                onChange={(e) => setExtractedData({...extractedData, description: e.target.value})}
                className="w-full border border-gray-300 p-2 rounded-md text-sm bg-white text-gray-950 font-medium"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-green-600 text-white py-2.5 rounded-md font-semibold hover:bg-green-700 transition"
            >
              مراجعة وموافقة وحفظ العطاء
            </button>
            <button
              type="button"
              onClick={() => setStep('upload')}
              className="px-4 py-2.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-semibold transition"
            >
              رفع ملف آخر
            </button>
          </div>
        </form>
      )}
    </div>
  )
}