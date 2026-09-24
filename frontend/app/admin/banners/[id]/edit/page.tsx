"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getBanner, getCategories } from "@/lib/api";
import { useAuth } from "@/lib/store/auth-store";
import { Banner, Category } from "@/lib/types";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import BannerForm from "@/components/admin/BannerForm";

export default function EditBannerPage() {
  const params = useParams<{ id: string }>();
  const accessToken = useAuth((s) => s.accessToken);
  const [banner, setBanner] = useState<Banner | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) return;
    Promise.all([getBanner(parseInt(params.id, 10), accessToken), getCategories()])
      .then(([b, c]) => {
        setBanner(b);
        setCategories(c);
      })
      .finally(() => setLoading(false));
  }, [params.id, accessToken]);

  if (loading) {
    return <div className="p-8 text-sm text-ink-60 font-mono">Loading...</div>;
  }
  if (!banner) {
    return <div className="p-8 text-sm text-crest">Banner not found.</div>;
  }

  return (
    <div className="p-8">
      <AdminPageHeader title="Edit banner" subtitle={banner.title} />
      <BannerForm banner={banner} categories={categories} />
    </div>
  );
}
