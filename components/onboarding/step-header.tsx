export function StepHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="grid gap-1">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
