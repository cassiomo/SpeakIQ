import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container py-12">
      <header className="mb-8">
        <Skeleton className="h-6 w-48 mb-2" />
        <Skeleton className="h-10 w-72" />
      </header>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
             <CardHeader>
               <Skeleton className="h-8 w-64" />
             </CardHeader>
             <CardContent className="flex items-center justify-center gap-6">
                <Skeleton className="h-20 w-20" />
                <div className="w-full space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5" />
                </div>
             </CardContent>
           </Card>

          <Card>
            <CardHeader><Skeleton className="h-8 w-40" /></CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-11/12" />
                <Skeleton className="h-4 w-full" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><Skeleton className="h-8 w-52" /></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3"><Skeleton className="h-5 w-5 rounded-full" /><Skeleton className="h-4 w-full" /></div>
              <div className="flex gap-3"><Skeleton className="h-5 w-5 rounded-full" /><Skeleton className="h-4 w-full" /></div>
              <div className="flex gap-3"><Skeleton className="h-5 w-5 rounded-full" /><Skeleton className="h-4 w-4/5" /></div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
           <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-32" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                </CardContent>
           </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-40" />
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-48 w-full" />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader><Skeleton className="h-8 w-48" /></CardHeader>
            <CardContent>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6 mt-2" />
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
