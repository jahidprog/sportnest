"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Pencil,
  Trash2,
  Package,
  Search,
  MoreHorizontal,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from "lucide-react";

import { getProducts, deleteProduct } from "@/lib/api";
import { useAuth } from "@/lib/store/auth-store";
import { Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils/format";
import { resolveImageUrl } from "@/lib/utils/image";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/Button";

export default function AdminProductsPage() {
  const accessToken = useAuth((s) => s.accessToken);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const load = () => {
    setLoading(true);

    getProducts()
      .then(setProducts)
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async (product: Product) => {
    if (!accessToken) return;

    if (
      !confirm(
        `Delete "${product.title}"? This can't be undone.`
      )
    ) {
      return;
    }

    setDeletingId(product.id);

    try {
      await deleteProduct(product.id, accessToken);

      setProducts((prev) =>
        prev.filter((p) => p.id !== product.id)
      );
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Failed to delete product."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const filteredProducts = products.filter((product) =>
    product.title
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const totalStock = products.reduce(
    (sum, product) => sum + product.stock,
    0
  );

  const lowStock = products.filter(
    (product) => product.stock > 0 && product.stock <= 5
  ).length;

  const outOfStock = products.filter(
    (product) => product.stock <= 0
  ).length;

  return (
    <div className="min-h-screen bg-[#f7f7f5] p-5 sm:p-6 lg:p-8">
      {/* Header */}
      <AdminPageHeader
        title="Products"
        subtitle="Manage your catalog, inventory and product pricing."
        action={
          <Link href="/admin/products/new">
            <Button size="md">
              <Plus size={16} />
              Add product
            </Button>
          </Link>
        }
      />

      {/* Overview cards */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {/* Total products */}
        <div className="rounded-2xl border border-black/[0.07] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-black/[0.04] text-ink">
              <Package size={17} />
            </div>

            <span className="font-mono text-[9px] uppercase tracking-widest2 text-ink/30">
              Catalog
            </span>
          </div>

          <p className="mt-5 font-display text-3xl tracking-tight text-ink">
            {products.length}
          </p>

          <p className="mt-1 text-xs text-ink/40">
            Total products
          </p>
        </div>

        {/* Inventory */}
        <div className="rounded-2xl border border-black/[0.07] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#f5a623]/10 text-[#b97800]">
              <Package size={17} />
            </div>

            <span className="font-mono text-[9px] uppercase tracking-widest2 text-ink/30">
              Inventory
            </span>
          </div>

          <p className="mt-5 font-display text-3xl tracking-tight text-ink">
            {totalStock}
          </p>

          <p className="mt-1 text-xs text-ink/40">
            Units available
          </p>
        </div>

        {/* Low stock */}
        <div className="rounded-2xl border border-black/[0.07] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-amber-50 text-amber-600">
              <AlertTriangle size={17} />
            </div>

            <span className="font-mono text-[9px] uppercase tracking-widest2 text-ink/30">
              Attention
            </span>
          </div>

          <p className="mt-5 font-display text-3xl tracking-tight text-ink">
            {lowStock}
          </p>

          <p className="mt-1 text-xs text-ink/40">
            Low stock products
          </p>
        </div>

        {/* Out of stock */}
        <div className="rounded-2xl border border-black/[0.07] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-red-50 text-red-600">
              <XCircle size={17} />
            </div>

            <span className="font-mono text-[9px] uppercase tracking-widest2 text-ink/30">
              Attention
            </span>
          </div>

          <p className="mt-5 font-display text-3xl tracking-tight text-ink">
            {outOfStock}
          </p>

          <p className="mt-1 text-xs text-ink/40">
            Out of stock
          </p>
        </div>
      </div>

      {/* Main catalog */}
      <div className="overflow-hidden rounded-2xl border border-black/[0.07] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        {/* Toolbar */}
        <div className="flex flex-col gap-4 border-b border-black/[0.06] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            <p className="text-sm font-bold text-ink">
              Product catalog
            </p>

            <p className="mt-0.5 text-xs text-ink/40">
              {filteredProducts.length}{" "}
              {filteredProducts.length === 1
                ? "product"
                : "products"}{" "}
              shown
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/30"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="h-10 w-full rounded-lg border border-black/[0.08] bg-[#fafafa] pl-9 pr-3 text-xs text-ink outline-none transition-all placeholder:text-ink/30 focus:border-ink/25 focus:bg-white focus:ring-2 focus:ring-black/[0.03]"
            />
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-black/10 border-t-ink" />

            <p className="mt-4 font-mono text-[10px] uppercase tracking-widest2 text-ink/35">
              Loading catalog
            </p>
          </div>
        ) : filteredProducts.length === 0 ? (
          /* Empty */
          <div className="flex min-h-[360px] flex-col items-center justify-center px-5 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-black/[0.04] text-ink/30">
              {search ? (
                <Search size={22} />
              ) : (
                <Package size={22} />
              )}
            </div>

            <p className="mt-5 text-sm font-bold text-ink">
              {search
                ? "No products found"
                : "Your catalog is empty"}
            </p>

            <p className="mt-1 max-w-sm text-xs leading-5 text-ink/40">
              {search
                ? `No products match "${search}". Try a different search term.`
                : "Add your first product to start building your SportNest catalog."}
            </p>

            {!search && (
              <Link
                href="/admin/products/new"
                className="mt-5"
              >
                <Button size="md">
                  <Plus size={16} />
                  Add your first product
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-black/[0.06] bg-[#fafafa]">
                    <th className="px-5 py-3.5 text-left font-mono text-[9px] font-semibold uppercase tracking-widest2 text-ink/35">
                      Product
                    </th>

                    <th className="px-5 py-3.5 text-left font-mono text-[9px] font-semibold uppercase tracking-widest2 text-ink/35">
                      Price
                    </th>

                    <th className="px-5 py-3.5 text-left font-mono text-[9px] font-semibold uppercase tracking-widest2 text-ink/35">
                      Inventory
                    </th>

                    <th className="px-5 py-3.5 text-right font-mono text-[9px] font-semibold uppercase tracking-widest2 text-ink/35">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredProducts.map((product) => {
                    const isOutOfStock = product.stock <= 0;
                    const isLowStock =
                      product.stock > 0 &&
                      product.stock <= 5;

                    return (
                      <tr
                        key={product.id}
                        className="group border-b border-black/[0.05] last:border-0 transition-colors hover:bg-[#fafafa]"
                      >
                        {/* Product */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-4">
                            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-black/[0.06] bg-[#f5f5f3]">
                              {product.imageUrl ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img
                                  src={resolveImageUrl(
                                    product.imageUrl
                                  )}
                                  alt={product.title}
                                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center text-ink/20">
                                  <Package size={18} />
                                </div>
                              )}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate font-semibold text-ink">
                                {product.title}
                              </p>

                              <div className="mt-1 flex items-center gap-2">
                                <span className="font-mono text-[9px] uppercase tracking-wider text-ink/30">
                                  ID #{product.id}
                                </span>

                                <span className="h-1 w-1 rounded-full bg-ink/15" />

                                <span className="text-[10px] text-ink/35">
                                  {product.sizes?.length
                                    ? `${product.sizes.length} sizes`
                                    : "One size"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Price */}
                        <td className="px-5 py-4">
                          {product.discount_price != null ? (
                            <div>
                              <p className="font-semibold text-red-600">
                                {formatPrice(
                                  product.discount_price
                                )}
                              </p>

                              <p className="mt-0.5 text-[10px] text-ink/30 line-through">
                                {formatPrice(product.price)}
                              </p>
                            </div>
                          ) : (
                            <p className="font-semibold text-ink">
                              {formatPrice(product.price)}
                            </p>
                          )}
                        </td>

                        {/* Inventory */}
                        <td className="px-5 py-4">
                          {isOutOfStock ? (
                            <div className="flex items-center gap-2">
                              <span className="grid h-7 w-7 place-items-center rounded-lg bg-red-50 text-red-600">
                                <XCircle size={14} />
                              </span>

                              <div>
                                <p className="text-xs font-semibold text-red-600">
                                  Out of stock
                                </p>
                                <p className="text-[10px] text-ink/30">
                                  0 units
                                </p>
                              </div>
                            </div>
                          ) : isLowStock ? (
                            <div className="flex items-center gap-2">
                              <span className="grid h-7 w-7 place-items-center rounded-lg bg-amber-50 text-amber-600">
                                <AlertTriangle size={14} />
                              </span>

                              <div>
                                <p className="text-xs font-semibold text-amber-600">
                                  Low stock
                                </p>
                                <p className="text-[10px] text-ink/30">
                                  {product.stock} units
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-50 text-emerald-600">
                                <CheckCircle2 size={14} />
                              </span>

                              <div>
                                <p className="text-xs font-semibold text-emerald-600">
                                  In stock
                                </p>
                                <p className="text-[10px] text-ink/30">
                                  {product.stock} units
                                </p>
                              </div>
                            </div>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <Link
                              href={`/admin/products/${product.id}/edit`}
                              aria-label={`Edit ${product.title}`}
                              className="grid h-9 w-9 place-items-center rounded-lg text-ink/35 transition-all hover:bg-black/[0.04] hover:text-ink"
                            >
                              <Pencil size={15} />
                            </Link>

                            <button
                              onClick={() =>
                                handleDelete(product)
                              }
                              disabled={
                                deletingId === product.id
                              }
                              aria-label={`Delete ${product.title}`}
                              className="grid h-9 w-9 place-items-center rounded-lg text-ink/35 transition-all hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
                            >
                              {deletingId === product.id ? (
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-black/10 border-t-red-500" />
                              ) : (
                                <Trash2 size={15} />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="divide-y divide-black/[0.05] md:hidden">
              {filteredProducts.map((product) => {
                const isOutOfStock = product.stock <= 0;
                const isLowStock =
                  product.stock > 0 &&
                  product.stock <= 5;

                return (
                  <div
                    key={product.id}
                    className="p-4"
                  >
                    <div className="flex gap-3">
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[#f5f5f3]">
                        {product.imageUrl ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={resolveImageUrl(
                              product.imageUrl
                            )}
                            alt={product.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-ink/20">
                            <Package size={18} />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-ink">
                              {product.title}
                            </p>

                            <p className="mt-1 font-mono text-[9px] uppercase tracking-wider text-ink/30">
                              ID #{product.id}
                            </p>
                          </div>

                          <button
                            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-ink/30 hover:bg-black/[0.04]"
                            aria-label="More options"
                          >
                            <MoreHorizontal size={17} />
                          </button>
                        </div>

                        <div className="mt-3 flex items-end justify-between">
                          <div>
                            {product.discount_price != null ? (
                              <>
                                <p className="text-sm font-bold text-red-600">
                                  {formatPrice(
                                    product.discount_price
                                  )}
                                </p>

                                <p className="text-[10px] text-ink/30 line-through">
                                  {formatPrice(product.price)}
                                </p>
                              </>
                            ) : (
                              <p className="text-sm font-bold text-ink">
                                {formatPrice(product.price)}
                              </p>
                            )}
                          </div>

                          <span
                            className={`rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider ${
                              isOutOfStock
                                ? "bg-red-50 text-red-600"
                                : isLowStock
                                  ? "bg-amber-50 text-amber-600"
                                  : "bg-emerald-50 text-emerald-600"
                            }`}
                          >
                            {isOutOfStock
                              ? "Out of stock"
                              : isLowStock
                                ? `${product.stock} left`
                                : `${product.stock} in stock`}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="flex h-9 flex-1 items-center justify-center gap-2 rounded-lg border border-black/[0.08] text-xs font-semibold text-ink transition-colors hover:bg-black/[0.03]"
                      >
                        <Pencil size={14} />
                        Edit
                      </Link>

                      <button
                        onClick={() =>
                          handleDelete(product)
                        }
                        disabled={
                          deletingId === product.id
                        }
                        className="flex h-9 items-center justify-center gap-2 rounded-lg border border-red-100 px-4 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-30"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}