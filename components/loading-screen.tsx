"use client"

export function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1E2A78] to-[#2480EA]">
      <div className="text-center text-white">
        <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4">
          <span className="text-[#1E2A78] font-bold text-xl">SL</span>
        </div>
        <h2 className="text-2xl font-bold mb-2">StudentLink Portal</h2>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
      </div>
    </div>
  )
}
