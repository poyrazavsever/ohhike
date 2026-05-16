type SettingsNoticeProps = {
  title: string;
  body: string;
  children?: React.ReactNode;
};

export function SettingsNotice({ title, body, children }: SettingsNoticeProps) {
  return (
    <div className="mt-4 rounded-2xl border border-border bg-card p-4">
      <p className="text-sm font-black text-foreground">{title}</p>
      <p className="mt-2 text-sm font-semibold leading-6 text-muted-foreground">
        {body}
      </p>
      {children ? <div className="mt-4">{children}</div> : null}
    </div>
  );
}
