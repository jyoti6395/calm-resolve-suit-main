import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, Link, createRootRouteWithContext, useRouter } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { initializeAuthListener } from "@/store/authSlice";
import { startTicketSyncListener } from "@/store/ticketSlice";
import { startTechnicianSyncListener } from "@/store/technicianSlice";
import { useIsMobile } from "@/hooks/use-mobile";
import { HeaderProvider, useHeader } from "@/components/layout/HeaderContext";
import { AppHeader } from "@/components/layout/AppHeader";
import { MobileShell } from "@/components/layout/MobileShell";
import { SidebarProvider } from "@/components/ui/sidebar";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

function GlobalHeaderRenderer() {
  const { config } = useHeader();
  if (!config.show) return null;
  return (
    <AppHeader
      title={config.title}
      subtitle={config.subtitle}
      right={config.right}
      back={config.back}
      transparent={config.transparent}
    />
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const dispatch = useAppDispatch();
  const isMobile = useIsMobile();
  const { loading, isAuthenticated, user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Run the real-time background listener stream immediately on mount
    const unsubscribe = dispatch(initializeAuthListener());
    return () => {
      // Clean up the listener stream on unmount to prevent memory leaks
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, [dispatch]);

  useEffect(() => {
    // Start ticket and technician sync once authenticated
    if (isAuthenticated && user) {
      const unsubscribeTickets = dispatch(startTicketSyncListener());
      const unsubscribeTechs = dispatch(startTechnicianSyncListener());

      return () => {
        if (typeof unsubscribeTickets === "function") unsubscribeTickets();
        if (typeof unsubscribeTechs === "function") unsubscribeTechs();
      };
    }
  }, [dispatch, isAuthenticated, user]);

  const router = useRouter();

  // Global Auth Guard
  useEffect(() => {
    if (!loading) {
      const publicRoutes = ["/login", "/signup", "/forgot-password", "/reset-password", "/onboarding", "/", "/otp"];
      const currentPath = router.state.location.pathname;
      const isPublicPath = publicRoutes.some((p) => currentPath === p);

      if (!isAuthenticated && !isPublicPath) {
        router.navigate({ to: "/login", replace: true });
      } else if (isAuthenticated && (currentPath === "/login" || currentPath === "/signup" || currentPath === "/")) {
        router.navigate({ to: "/dashboard", replace: true });
      }
    }
  }, [loading, isAuthenticated, router.state.location.pathname, router]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background text-foreground">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <HeaderProvider>
        {isMobile ? (
          <div className="h-screen w-full bg-background flex justify-center overflow-hidden">
            <div className="relative w-full max-w-[440px] h-full flex flex-col">
              <GlobalHeaderRenderer />
              <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                <Outlet />
              </div>
            </div>
          </div>
        ) : (
          <SidebarProvider>
            <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
              {/* Desktop sidebar/layouts go here */}
              <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
                <GlobalHeaderRenderer />
                <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                  <Outlet />
                </div>
              </main>
            </div>
          </SidebarProvider>
        )}
        <Toaster />
      </HeaderProvider>
    </QueryClientProvider>
  );
}
