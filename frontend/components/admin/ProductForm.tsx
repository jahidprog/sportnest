"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Package,
  DollarSign,
  Tags,
  Ruler,
  AlertCircle,
} from "lucide-react";
import { Product, Category } from "@/lib/types";
import {
  createProduct,
  updateProduct,
  ProductInput,
} from "@/lib/api";
import { useAuth } from "@/lib/store/auth-store";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ImageUploadField } from "@/components/admin/ImageUploadField";

export default function ProductForm({
  product,
  categories,
}: {
  product?: Product;
  categories: Category[];
}) {
  const router = useRouter();
  const accessToken = useAuth((s) => s.accessToken);
  const isEdit = !!product;

  const [title, setTitle] = useState(product?.title ?? "");
  const [description, setDescription] = useState(
    product?.description ?? ""
  );
  const [price, setPrice] = useState(
    product?.price?.toString() ?? ""
  );
  const [discountPrice, setDiscountPrice] = useState(
    product?.discount_price?.toString() ?? ""
  );
  const [stock, setStock] = useState(
    product?.stock?.toString() ?? "0"
  );
  const [sizes, setSizes] = useState(
    product?.sizes?.join(", ") ?? ""
  );
  const [categoryId, setCategoryId] = useState<string>(
    product?.category_id?.toString() ?? ""
  );
  const [imageUrl, setImageUrl] = useState(
    product?.imageUrl ?? ""
  );
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!accessToken) return;

    const priceNum = parseFloat(price);

    if (isNaN(priceNum) || priceNum < 0) {
      setError("Enter a valid price.");
      return;
    }

    const discountNum = discountPrice.trim()
      ? parseFloat(discountPrice)
      : null;

    if (
      discountNum !== null &&
      (isNaN(discountNum) || discountNum >= priceNum)
    ) {
      setError(
        "Discount price must be a number lower than the regular price."
      );
      return;
    }

    const stockNum = parseInt(stock, 10);

    if (isNaN(stockNum) || stockNum < 0) {
      setError("Enter a valid stock quantity.");
      return;
    }

    const input: ProductInput = {
      title,
      description,
      price: priceNum,
      discount_price: discountNum,
      stock: stockNum,
      sizes: sizes
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      category_id: categoryId
        ? parseInt(categoryId, 10)
        : null,
      imageUrl,
    };

    setError(null);
    setSubmitting(true);

    try {
      if (isEdit) {
        await updateProduct(
          product.id,
          input,
          accessToken
        );
      } else {
        await createProduct(input, accessToken);
      }

      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      {/* Error */}
      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-700">
          <AlertCircle
            size={17}
            className="mt-0.5 shrink-0"
          />
          <span>{error}</span>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        {/* Main editor */}
        <div className="space-y-6">
          {/* Basic information */}
          <section className="rounded-2xl border border-black/[0.07] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
            <div className="border-b border-black/[0.06] px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#f5a623]/10 text-[#b97800]">
                  <Package size={17} />
                </div>

                <div>
                  <h2 className="text-sm font-bold text-ink">
                    Basic information
                  </h2>
                  <p className="mt-0.5 text-xs text-ink/40">
                    Product name and customer-facing description.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-5 p-6">
              <Input
                id="title"
                label="Product title"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Home Kit Jersey 24/25"
              />

              <Textarea
                id="description"
                label="Description"
                rows={5}
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                placeholder="Lightweight match-fit jersey with mesh side panels..."
              />
            </div>
          </section>

          {/* Pricing & inventory */}
          <section className="rounded-2xl border border-black/[0.07] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
            <div className="border-b border-black/[0.06] px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-50 text-emerald-600">
                  <DollarSign size={17} />
                </div>

                <div>
                  <h2 className="text-sm font-bold text-ink">
                    Pricing & inventory
                  </h2>
                  <p className="mt-0.5 text-xs text-ink/40">
                    Set your retail price, discount and stock.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <Input
                  id="price"
                  label="Price (BDT)"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={price}
                  onChange={(e) =>
                    setPrice(e.target.value)
                  }
                  placeholder="0.00"
                />

                <Input
                  id="discountPrice"
                  label="Sale price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={discountPrice}
                  onChange={(e) =>
                    setDiscountPrice(e.target.value)
                  }
                  placeholder="Optional"
                />

                <Input
                  id="stock"
                  label="Stock"
                  type="number"
                  min="0"
                  required
                  value={stock}
                  onChange={(e) =>
                    setStock(e.target.value)
                  }
                />
              </div>

              <div className="mt-4 rounded-lg bg-[#fafafa] px-4 py-3 text-[11px] text-ink/40">
                Sale price must be lower than the regular
                price.
              </div>
            </div>
          </section>

          {/* Classification */}
          <section className="rounded-2xl border border-black/[0.07] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
            <div className="border-b border-black/[0.06] px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-blue-50 text-blue-600">
                  <Tags size={17} />
                </div>

                <div>
                  <h2 className="text-sm font-bold text-ink">
                    Classification
                  </h2>
                  <p className="mt-0.5 text-xs text-ink/40">
                    Organize the product for your storefront.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-5 p-6 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="category"
                  className="mb-1.5 block font-mono text-[10px] font-semibold uppercase tracking-widest2 text-ink-60"
                >
                  Category
                </label>

                <select
                  id="category"
                  value={categoryId}
                  onChange={(e) =>
                    setCategoryId(e.target.value)
                  }
                  className="h-[42px] w-full rounded-lg border border-black/[0.08] bg-[#fafafa] px-3 text-sm text-ink outline-none transition-all focus:border-ink/30 focus:bg-white focus:ring-2 focus:ring-black/[0.03]"
                >
                  <option value="">No category</option>

                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Input
                  id="sizes"
                  label="Available sizes"
                  value={sizes}
                  onChange={(e) =>
                    setSizes(e.target.value)
                  }
                  placeholder="S, M, L, XL, XXL"
                />

                <div className="mt-2 flex items-center gap-1.5 text-[10px] text-ink/35">
                  <Ruler size={12} />
                  Separate sizes with commas.
                </div>
              </div>
            </div>
          </section>

          {/* Media */}
          <section className="rounded-2xl border border-black/[0.07] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
            <div className="border-b border-black/[0.06] px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-purple-50 text-purple-600">
                  <Package size={17} />
                </div>

                <div>
                  <h2 className="text-sm font-bold text-ink">
                    Product media
                  </h2>
                  <p className="mt-0.5 text-xs text-ink/40">
                    Add the primary product image.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <ImageUploadField
                label="Product image"
                value={imageUrl}
                onChange={setImageUrl}
              />
            </div>
          </section>
        </div>

        {/* Right summary */}
        <div className="space-y-6">
          {/* Product summary */}
          <div className="sticky top-6 rounded-2xl border border-black/[0.07] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
            <div className="border-b border-black/[0.06] px-5 py-4">
              <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.2em] text-ink/35">
                Product summary
              </p>
            </div>

            <div className="p-5">
              <div className="aspect-square overflow-hidden rounded-xl bg-[#f5f5f3]">
                {imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imageUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-ink/25">
                    Product image
                  </div>
                )}
              </div>

              <div className="mt-5">
                <p className="text-base font-bold text-ink">
                  {title || "Untitled product"}
                </p>

                <p className="mt-1 text-xs text-ink/40">
                  {categoryId
                    ? categories.find(
                        (c) =>
                          c.id.toString() === categoryId
                      )?.name ?? "No category"
                    : "No category"}
                </p>
              </div>

              <div className="mt-5 border-t border-black/[0.06] pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-ink/40">
                    Price
                  </span>

                  <span className="text-sm font-bold text-ink">
                    {price ? `৳${price}` : "—"}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-ink/40">
                    Stock
                  </span>

                  <span
                    className={`text-sm font-bold ${
                      Number(stock) <= 5
                        ? "text-red-600"
                        : "text-emerald-600"
                    }`}
                  >
                    {stock || "0"} units
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex flex-col-reverse gap-3 border-t border-black/[0.07] pt-6 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.back()}
        >
          Cancel
        </Button>

        <Button type="submit" disabled={submitting}>
          {submitting
            ? "Saving..."
            : isEdit
              ? "Save changes"
              : "Create product"}
        </Button>
      </div>
    </form>
  );
}