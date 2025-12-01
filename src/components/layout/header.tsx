import Link from 'next/link';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Icons.logo className="h-6 w-6 text-accent" />
            <span className="hidden font-bold font-headline sm:inline-block text-lg">
              SpeakIQ
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/record"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Analyze
            </Link>
            <Link
              href="/history"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              History
            </Link>
            <Link
              href="/experts"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Experts
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* Can add a search bar here in the future */}
          </div>
          <nav className="flex items-center">
            <Button asChild className="bg-primary hover:bg-primary/90">
              <Link href="/record">Get Started</Link>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}
