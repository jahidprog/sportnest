"use client";

import { useEffect, useState } from "react";
import { getCategories } from "@/lib/api";
import { Category } from "@/lib/types";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import ProductForm from "@/components/admin/ProductForm";

export default function NewProductPage() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  return (
    <div className="p-8">
      <AdminPageHeader title="Add product" subtitle="Create a new product in the catalog." />
      <ProductForm categories={categories} />
    </div>
  );
}
