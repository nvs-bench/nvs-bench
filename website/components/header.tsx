export function Header() {
  return (
    <div className="text-center mb-12">
      <div className="flex items-center justify-center gap-6 mb-8">
        <div className="text-left">
          <h1 className="text-6xl font-bold text-foreground leading-tight">
            nvs-bench
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto text-lg text-foreground leading-relaxed">
        Some text explaining what this is
      </div>
    </div>
  );
}
