import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// تحديد المسارات المحمية (كل ما يخص العطاءات سيكون محمياً)
const isProtectedRoute = createRouteMatcher([
  '/tenders(.*)',
]);

// أضفنا كلمة async هنا
export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    // أضفنا كلمة await وقمنا بتغيير الصيغة لتناسب الإصدار السادس
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // تخطي ملفات النظام والصور ليتم تحميلها بشكل طبيعي
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};