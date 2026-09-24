"use client";

import { useEffect, useState } from "react";
import { getCategories } from "@/lib/api";
import { Category } from "@/lib/types";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import BannerForm from "@/components/admin/BannerForm";

export default function NewBannerPage() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  return (
    <div className="p-8">
      <AdminPageHeader title="Add banner" subtitle="Create a new promotional popup." />
      <BannerForm categories={categories} />
    </div>
  );
}
