export function Footer() {
  return (
    <footer className="mt-auto py-4">
      <div className="max-w-6xl mx-auto px-6">
        <p className="text-sm text-muted-foreground text-center">
          Reach out! On{" "}
          <a
            href="https://github.com/nvs-bench/nvs-bench"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Github
          </a>{" "}
          or to{" "}
          <a
            href="mailto:nikita@cs.stanford.edu"
            className="text-primary hover:underline"
          >
            nikita@cs.stanford.edu
          </a>
        </p>
      </div>
    </footer>
  );
}
