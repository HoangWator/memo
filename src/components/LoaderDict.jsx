export default function LoaderDict() {
  return (
      <div className="loader-dict-section mt-10 flex justify-center">
        <div class="flex flex-row gap-2">
          <div class="w-4 h-4 rounded-full bg-primary animate-bounce"></div>
          <div class="w-4 h-4 rounded-full bg-primary animate-bounce [animation-delay:-.2s]"></div>
          <div class="w-4 h-4 rounded-full bg-primary animate-bounce [animation-delay:-.4s]"></div>
        </div>
      </div>
  )
} 