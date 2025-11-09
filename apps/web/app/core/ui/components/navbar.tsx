export default function Navbar() {
  return (
    <header className="sticky md:top-9 top-0 z-50 bg-background shadow-lg">
      <div className="p-4">
        <div className="flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <img src="/images/umima-logo.png" className="h-7 w-7" />
            <h1 className="text-2xl font-bold text-foreground">UmimaClean</h1>
          </div>
        </div>
      </div>
    </header>
  )
}
