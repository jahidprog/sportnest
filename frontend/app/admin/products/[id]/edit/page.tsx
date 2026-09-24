"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getProduct, getCategories } from "@/lib/api";
import { Product, Category } from "@/lib/types";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import ProductForm from "@/components/admin/ProductForm";

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getProduct(params.id), getCategories()]).then(([p, c]) => {
      setProduct(p);
      setCategories(c);
      setLoading(false);
    });
  }, [params.id]);

  if (loading) {
    return <div className="p-8 text-sm text-ink-60 font-mono">Loading...</div>;
  }
  if (!product) {
    return <div className="p-8 text-sm text-crest">Product not found.</div>;
  }

  return (
    <div className="p-8">
      <AdminPageHeader title="Edit product" subtitle={product.title} />
      <ProductForm product={product} categories={categories} />
    </div>
  );
}
