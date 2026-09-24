import { getProducts, getCategories } from "@/lib/api";
import ProductsGrid from "./products-grid";

export default async function ProductsPage() {
  let products: Awaited<ReturnType<typeof getProducts>> = [];
  let loadError = false;
  try {
    products = await getProducts();
  } catch {
    loadError = true;
  }
  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-10">
        <p className="font-mono text-xs tracking-widest2 uppercase text-ink-60 mb-2">
          {products.length} item{products.length === 1 ? "" : "s"}
        </p>
        <h1 className="font-display text-5xl md:text-6xl tracking-tightest text-ink">
          ALL PRODUCTS
        </h1>
      </div>

      {loadError ? (
        <div className="py-24 text-center border border-crest/30 bg-crest/5">
          <p className="font-heading font-bold text-lg text-ink">
            Couldn&apos;t reach the backend.
          </p>
          <p className="text-ink-60 mt-2 text-sm">
            Check that the Go server is running on the URL set in{" "}
            <code className="font-mono bg-ink/5 px-1">NEXT_PUBLIC_API_URL</code>.
          </p>
        </div>
      ) : (
        <ProductsGrid products={products} categories={categories} />
      )}
    </div>
  );
}
