interface FeaturePlaceholderProps {
  title: string;
  description: string;
  bullets: string[];
}

export function FeaturePlaceholder({
  title,
  description,
  bullets,
}: FeaturePlaceholderProps) {
  return (
    <section className="mx-auto flex min-h-[60vh] w-full max-w-4xl flex-col justify-center gap-6 px-6 py-16">
      <div className="space-y-3">
        <p className="text-sm font-medium uppercase text-muted-foreground">
          DevFlow
        </p>
        <h1 className="text-3xl font-semibold sm:text-4xl">
          {title}
        </h1>
        <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
          {description}
        </p>
      </div>

      <div className="devflow-panel p-6">
        <h2 className="text-sm font-semibold text-foreground">
          Planned in this page
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          1단계에서 라우트 기준선과 도메인 역할을 먼저 고정해 두고, 이후
          단계에서 기능을 순서대로 붙일 예정입니다.
        </p>
        <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
          {bullets.map((bullet) => (
            <li key={bullet} className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
