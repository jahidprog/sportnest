"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Tag,
  Hash,
  Search,
  CheckCircle2,
  ArrowUpRight,
  Pencil,
  Trash2,
} from "lucide-react";

import { getCategories, createCategory, updateCategory, deleteCategory } from "@/lib/api";
import { useAuth } from "@/lib/store/auth-store";
import { Category } from "@/lib/types";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function AdminCategoriesPage() {
  const accessToken = useAuth((s) => s.accessToken);

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [savingId, setSavingId] = useState<number | null>(null);

  const load = () => {
    setLoading(true);

    getCategories()
      .then(setCategories)
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!accessToken || !name.trim()) return;

    setError(null);
    setSubmitting(true);

    try {
      await createCategory(name.trim(), accessToken);
      setName("");
      load();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create category."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCategories = categories.filter((category) =>
    `${category.name} ${category.slug}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const handleEdit = async (category: Category) => {
    const name = prompt("Category name", category.name)?.trim();
    if (!name || name === category.name || !accessToken) return;
    setSavingId(category.id);
    try { const updated = await updateCategory(category.id, name, accessToken); setCategories((items) => items.map((item) => item.id === category.id ? updated : item)); }
    catch (err) { setError(err instanceof Error ? err.message : "Failed to update category."); }
    finally { setSavingId(null); }
  };

  const handleDelete = async (category: Category) => {
    if (!accessToken) return;
    const alternatives = categories.filter((item) => item.id !== category.id);
    const choice = prompt(`Delete “${category.name}”. Enter another category ID to move its products, or leave blank to uncategorize them.\n${alternatives.map((item) => `${item.id}: ${item.name}`).join("\n")}`);
    if (choice === null) return;
    const replacementId = choice.trim() ? Number(choice) : null;
    if (choice.trim() && (!Number.isInteger(replacementId) || replacementId === category.id || !alternatives.some((item) => item.id === replacementId))) { setError("Choose a valid replacement category ID, or leave it blank."); return; }
    if (!confirm(`Delete “${category.name}”? Products will ${replacementId ? "move to the selected category" : "be left uncategorized"}.`)) return;
    setSavingId(category.id);
    try { await deleteCategory(category.id, replacementId, accessToken); setCategories((items) => items.filter((item) => item.id !== category.id)); }
    catch (err) { setError(err instanceof Error ? err.message : "Failed to delete category."); }
    finally { setSavingId(null); }
  };

  return (
    <div className="min-h-screen bg-[#f7f7f5] p-5 sm:p-6 lg:p-8">
      {/* Header */}
      <AdminPageHeader
        title="Categories"
        subtitle="Organize your products into clear collections."
      />

      {/* Overview */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {/* Total */}
        <div className="rounded-2xl border border-black/[0.07] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-black/[0.04] text-ink">
              <Tag size={17} />
            </div>

            <span className="font-mono text-[9px] uppercase tracking-widest2 text-ink/30">
              Catalog
            </span>
          </div>

          <p className="mt-5 font-display text-3xl tracking-tight text-ink">
            {categories.length}
          </p>

          <p className="mt-1 text-xs text-ink/40">
            Total categories
          </p>
        </div>

        {/* Search result */}
        <div className="rounded-2xl border border-black/[0.07] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#f5a623]/10 text-[#b97800]">
              <Search size={17} />
            </div>

            <span className="font-mono text-[9px] uppercase tracking-widest2 text-ink/30">
              Results
            </span>
          </div>

          <p className="mt-5 font-display text-3xl tracking-tight text-ink">
            {filteredCategories.length}
          </p>

          <p className="mt-1 text-xs text-ink/40">
            Categories matching search
          </p>
        </div>

        {/* Status */}
        <div className="rounded-2xl border border-black/[0.07] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={17} />
            </div>

            <span className="font-mono text-[9px] uppercase tracking-widest2 text-ink/30">
              Status
            </span>
          </div>

          <p className="mt-5 text-2xl font-bold tracking-tight text-ink">
            Organized
          </p>

          <p className="mt-1 text-xs text-ink/40">
            Your catalog structure
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* Category list */}
        <div className="overflow-hidden rounded-2xl border border-black/[0.07] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          {/* Toolbar */}
          <div className="flex flex-col gap-4 border-b border-black/[0.06] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div>
              <p className="text-sm font-bold text-ink">
                Category directory
              </p>

              <p className="mt-0.5 text-xs text-ink/40">
                Manage your product collections
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/30"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search categories..."
                className="h-10 w-full rounded-lg border border-black/[0.08] bg-[#fafafa] pl-9 pr-3 text-xs text-ink outline-none transition-all placeholder:text-ink/30 focus:border-ink/25 focus:bg-white focus:ring-2 focus:ring-black/[0.03]"
              />
            </div>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-black/10 border-t-ink" />

              <p className="mt-4 font-mono text-[10px] uppercase tracking-widest2 text-ink/35">
                Loading categories
              </p>
            </div>
          ) : filteredCategories.length === 0 ? (
            /* Empty */
            <div className="flex min-h-[320px] flex-col items-center justify-center px-5 text-center">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-black/[0.04] text-ink/30">
                {search ? (
                  <Search size={22} />
                ) : (
                  <Tag size={22} />
                )}
              </div>

              <p className="mt-5 text-sm font-bold text-ink">
                {search
                  ? "No categories found"
                  : "No categories yet"}
              </p>

              <p className="mt-1 max-w-sm text-xs leading-5 text-ink/40">
                {search
                  ? `Nothing matches "${search}". Try another search term.`
                  : "Create your first category to start organizing the SportNest catalog."}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop */}
              <div className="hidden md:block">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-black/[0.06] bg-[#fafafa]">
                      <th className="px-5 py-3.5 text-left font-mono text-[9px] font-semibold uppercase tracking-widest2 text-ink/35">
                        Category
                      </th>

                      <th className="px-5 py-3.5 text-left font-mono text-[9px] font-semibold uppercase tracking-widest2 text-ink/35">
                        Slug
                      </th>

                      <th className="px-5 py-3.5 text-right font-mono text-[9px] font-semibold uppercase tracking-widest2 text-ink/35">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredCategories.map((category, index) => (
                      <tr
                        key={category.id}
                        className="group border-b border-black/[0.05] last:border-0 transition-colors hover:bg-[#fafafa]"
                      >
                        {/* Category */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-4">
                            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#f5f5f3] text-ink/50 transition-colors group-hover:bg-[#f5a623]/10 group-hover:text-[#b97800]">
                              <Tag size={17} />
                            </div>

                            <div className="min-w-0">
                              <p className="font-semibold text-ink">
                                {category.name}
                              </p>

                              <div className="mt-1 flex items-center gap-2">
                                <span className="font-mono text-[9px] uppercase tracking-wider text-ink/30">
                                  #{String(index + 1).padStart(2, "0")}
                                </span>

                                <span className="h-1 w-1 rounded-full bg-ink/15" />

                                <span className="font-mono text-[9px] text-ink/30">
                                  ID {category.id}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Slug */}
                        <td className="px-5 py-4">
                          <div className="inline-flex items-center gap-2 rounded-lg bg-black/[0.035] px-2.5 py-1.5">
                            <Hash
                              size={12}
                              className="text-ink/25"
                            />

                            <span className="font-mono text-[10px] text-ink/50">
                              {category.slug}
                            </span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-1">
                            <button onClick={() => handleEdit(category)} disabled={savingId === category.id} aria-label={`Edit ${category.name}`} className="grid h-9 w-9 place-items-center rounded-lg text-ink/45 hover:bg-ink/5 hover:text-ink disabled:opacity-40"><Pencil size={15} /></button>
                            <button onClick={() => handleDelete(category)} disabled={savingId === category.id} aria-label={`Delete ${category.name}`} className="grid h-9 w-9 place-items-center rounded-lg text-ink/45 hover:bg-red-50 hover:text-red-600 disabled:opacity-40"><Trash2 size={15} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile */}
              <div className="divide-y divide-black/[0.05] md:hidden">
                {filteredCategories.map((category, index) => (
                  <div
                    key={category.id}
                    className="flex items-center gap-3 p-4"
                  >
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#f5f5f3] text-ink/40">
                      <Tag size={17} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ink">
                        {category.name}
                      </p>

                      <div className="mt-1 flex items-center gap-2">
                        <span className="font-mono text-[9px] text-ink/30">
                          #{String(index + 1).padStart(2, "0")}
                        </span>

                        <span className="h-1 w-1 rounded-full bg-ink/15" />

                        <span className="truncate font-mono text-[9px] text-ink/35">
                          {category.slug}
                        </span>
                      </div>
                    </div>

                    <div className="flex shrink-0 gap-1"><button onClick={() => handleEdit(category)} aria-label={`Edit ${category.name}`} className="p-2 text-ink/45"><Pencil size={15} /></button><button onClick={() => handleDelete(category)} aria-label={`Delete ${category.name}`} className="p-2 text-red-500"><Trash2 size={15} /></button></div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Add category */}
        <div className="h-fit rounded-2xl border border-black/[0.07] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] lg:sticky lg:top-6">
          <div className="mb-5 flex items-start justify-between">
            <div>
              <div className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-[#f5a623]/10 text-[#b97800]">
                <Plus size={18} />
              </div>

              <h2 className="font-heading text-lg font-bold text-ink">
                Add category
              </h2>

              <p className="mt-1 text-xs leading-5 text-ink/40">
                Create a new collection for your storefront.
              </p>
            </div>

            <ArrowUpRight
              size={16}
              className="text-ink/20"
            />
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-red-100 bg-red-50 px-3 py-2.5 text-xs leading-5 text-red-600">
              {error}
            </div>
          )}

          <form
            onSubmit={handleCreate}
            className="space-y-4"
          >
            <Input
              id="categoryName"
              label="Category name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Training Shorts"
            />

            <div className="rounded-lg bg-[#f7f7f5] px-3 py-2.5">
              <p className="font-mono text-[8px] uppercase tracking-widest2 text-ink/30">
                Example
              </p>

              <p className="mt-1 text-xs text-ink/50">
                Training Shorts → training-shorts
              </p>
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full"
            >
              <Plus size={16} />

              {submitting
                ? "Adding category..."
                : "Add category"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
