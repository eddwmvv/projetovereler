interface HeaderProps {
  title: string;
  subtitle?: string;
}

export const Header = ({ 
  title, 
  subtitle
}: HeaderProps) => {
  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center">
        <div>
          <h1 className="text-2xl font-bold text-card-foreground">{title}</h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>
    </header>
  );
};
