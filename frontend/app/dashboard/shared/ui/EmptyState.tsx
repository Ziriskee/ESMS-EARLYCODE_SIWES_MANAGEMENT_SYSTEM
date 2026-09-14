type EmptyStateProps = {
  title: string;
  description?: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-10 px-6">
      <p
        className="text-[14px] font-semibold"
        style={{ color: "var(--text-primary)" }}
      >
        {title}
      </p>
      {description && (
        <p
          className="text-[13px] mt-1 max-w-sm"
          style={{ color: "var(--text-secondary)" }}
        >
          {description}
        </p>
      )}
    </div>
  );
}
