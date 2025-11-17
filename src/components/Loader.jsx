
export default function Loader() {
  return (
      <div className="loader-section fixed top-0 bottom-0 right-0 left-0 bg-black/50 flex items-center justify-center z-50">
        <div className="flex-col gap-4 w-full flex items-center justify-center">
          <div
          className="w-20 h-20 border-4 border-transparent text-primary text-4xl animate-spin flex items-center justify-center border-t-primary rounded-full"
          >
          <div
            className="w-16 h-16 border-4 border-transparent text-primary text-2xl animate-spin flex items-center justify-center border-t-primary rounded-full"
          ></div>
          </div>
        </div>
      </div>
  )
} 