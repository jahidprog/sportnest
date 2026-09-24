import { notFound } from "next/navigation";
import { getProduct, getProducts } from "@/lib/api";
import ProductDetail from "./product-detail";

export default async function ProductPage({
  params,
}: {
  params: { id: string };
}) {
  const product = await getProduct(params.id);
  if (!product) notFound();

  let allProducts: Awaited<ReturnType<typeof getProducts>> = [];
  try {
    allProducts = await getProducts();
  } catch {
    // Related products are a nice-to-have — if this fails, the detail
    // page still works fine without that section.
  }

  return <ProductDetail product={product} allProducts={allProducts} />;
}
