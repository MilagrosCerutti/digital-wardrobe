import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/Tabs';
import { CatalogManager, DollItemManager, UsersTable } from '@/features/admin';

type AdminTab = 'users' | 'catalogs' | 'dollItems';

export function AdminPage() {
  const [tab, setTab] = useState<AdminTab>('users');

  return (
    <div className="dw-grain px-5 py-12 sm:px-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <div>
          <span className="dw-micro text-primary">Admin</span>
          <h1 className="mt-1 text-3xl font-bold text-foreground">Manage the wardrobe behind the scenes.</h1>
        </div>

        <Tabs value={tab} onChange={(value) => setTab(value as AdminTab)}>
          <TabsList>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="catalogs">Catalogs</TabsTrigger>
            <TabsTrigger value="dollItems">Doll Items</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="mt-6">
            <UsersTable />
          </TabsContent>
          <TabsContent value="catalogs" className="mt-6">
            <CatalogManager />
          </TabsContent>
          <TabsContent value="dollItems" className="mt-6">
            <DollItemManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
