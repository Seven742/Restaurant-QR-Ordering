// Temporary home page - replaced in Phase 2
export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-50 grid place-items-center p-6 text-center">
      <div className="max-w-md w-full bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-neutral-100 animate-in fade-in zoom-in-95 duration-500">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-brand-50 shadow-sm ring-8 ring-brand-50/50 overflow-hidden">
          <img src="/logo.svg" alt="" className="h-full w-full object-cover" />
        </div>
        <h1 className="text-3xl font-black tracking-tight text-neutral-900">Restaurant QR</h1>
        <p className="mt-3 text-[15px] font-medium leading-relaxed text-neutral-500">Phase 1 backend is running. Please scan the QR code on your table to view the menu and order.</p>
      </div>
    </main>
  );
}
