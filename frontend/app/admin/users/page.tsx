"use client";

import { useEffect, useState } from "react";
import {
  ShieldCheck,
  ShieldOff,
  Users as UsersIcon,
  UserCheck,
  UserRound,
} from "lucide-react";
import { getAllUsers, updateUserRole } from "@/lib/api";
import { useAuth } from "@/lib/store/auth-store";
import { User } from "@/lib/types";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export default function AdminUsersPage() {
  const currentUser = useAuth((s) => s.user);
  const accessToken = useAuth((s) => s.accessToken);

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const load = () => {
    if (!accessToken) return;

    setLoading(true);

    getAllUsers(accessToken)
      .then(setUsers)
      .finally(() => setLoading(false));
  };

  useEffect(load, [accessToken]);

  const handleToggleRole = async (user: User) => {
    if (!accessToken) return;

    const action = user.is_shop_owner
      ? "remove admin access from"
      : "grant admin access to";

    if (
      !confirm(
        `Are you sure you want to ${action} ${user.first_name} ${user.last_name}?`
      )
    ) {
      return;
    }

    setUpdatingId(user.id);

    try {
      await updateUserRole(
        user.id,
        !user.is_shop_owner,
        accessToken
      );

      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id
            ? {
                ...u,
                is_shop_owner: !u.is_shop_owner,
              }
            : u
        )
      );
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Failed to update user role."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const adminCount = users.filter((u) => u.is_shop_owner).length;
  const customerCount = users.length - adminCount;

  return (
    <div className="min-h-screen bg-[#f6f6f4] p-5 sm:p-8 lg:p-10">
      <AdminPageHeader
        title="Users"
        subtitle="Manage customers, administrators, and access permissions."
      />

      {/* Summary */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="group border border-black/8 bg-white p-5 transition-shadow hover:shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-mono font-semibold uppercase tracking-[0.18em] text-ink-60">
                Total users
              </p>

              <p className="mt-3 font-display text-3xl tracking-tightest text-ink">
                {users.length}
              </p>

              <p className="mt-1 text-xs text-ink-60">
                Registered accounts
              </p>
            </div>

            <div className="grid h-10 w-10 place-items-center rounded-xl bg-ink/5 text-ink">
              <UsersIcon size={19} strokeWidth={1.8} />
            </div>
          </div>
        </div>

        <div className="group border border-black/8 bg-white p-5 transition-shadow hover:shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-mono font-semibold uppercase tracking-[0.18em] text-ink-60">
                Administrators
              </p>

              <p className="mt-3 font-display text-3xl tracking-tightest text-ink">
                {adminCount}
              </p>

              <p className="mt-1 text-xs text-ink-60">
                Users with admin access
              </p>
            </div>

            <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber/15 text-amber-dim">
              <UserCheck size={19} strokeWidth={1.8} />
            </div>
          </div>
        </div>

        <div className="group border border-black/8 bg-white p-5 transition-shadow hover:shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-mono font-semibold uppercase tracking-[0.18em] text-ink-60">
                Customers
              </p>

              <p className="mt-3 font-display text-3xl tracking-tightest text-ink">
                {customerCount}
              </p>

              <p className="mt-1 text-xs text-ink-60">
                Standard accounts
              </p>
            </div>

            <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600">
              <UserRound size={19} strokeWidth={1.8} />
            </div>
          </div>
        </div>
      </div>

      {/* Users panel */}
      <div className="overflow-hidden border border-black/8 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        {/* Panel header */}
        <div className="flex flex-col gap-3 border-b border-black/8 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="font-heading text-base font-bold tracking-wide text-ink">
              All users
            </h2>

            <p className="mt-0.5 text-xs text-ink-60">
              Review account details and manage permissions.
            </p>
          </div>

          <div className="text-[10px] font-mono font-semibold uppercase tracking-[0.16em] text-ink-40">
            {users.length} accounts
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-[240px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-3 h-7 w-7 animate-spin rounded-full border-2 border-ink/10 border-t-ink" />
              <p className="text-xs font-mono uppercase tracking-wider text-ink-60">
                Loading users...
              </p>
            </div>
          </div>
        ) : users.length === 0 ? (
          <div className="flex min-h-[240px] flex-col items-center justify-center px-5 text-center">
            <div className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-ink/5 text-ink-60">
              <UsersIcon size={20} />
            </div>

            <p className="font-heading font-bold text-ink">
              No users yet
            </p>

            <p className="mt-1 text-sm text-ink-60">
              Registered customers will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-black/8 bg-[#fafafa] text-left">
                  <th className="px-6 py-3.5 text-[10px] font-mono font-semibold uppercase tracking-[0.16em] text-ink-60">
                    User
                  </th>

                  <th className="px-6 py-3.5 text-[10px] font-mono font-semibold uppercase tracking-[0.16em] text-ink-60">
                    Email
                  </th>

                  <th className="px-6 py-3.5 text-[10px] font-mono font-semibold uppercase tracking-[0.16em] text-ink-60">
                    Joined
                  </th>

                  <th className="px-6 py-3.5 text-[10px] font-mono font-semibold uppercase tracking-[0.16em] text-ink-60">
                    Role
                  </th>

                  <th className="px-6 py-3.5 text-right text-[10px] font-mono font-semibold uppercase tracking-[0.16em] text-ink-60">
                    Access
                  </th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => {
                  const isSelf = currentUser?.id === user.id;
                  const initials =
                    `${user.first_name?.[0] ?? ""}${user.last_name?.[0] ?? ""}`.toUpperCase();

                  return (
                    <tr
                      key={user.id}
                      className="group border-b border-black/6 last:border-0 transition-colors hover:bg-[#fafaf8]"
                    >
                      {/* User */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`grid h-10 w-10 flex-shrink-0 place-items-center rounded-full text-xs font-bold ${
                              user.is_shop_owner
                                ? "bg-amber/15 text-amber-dim"
                                : "bg-ink/5 text-ink-60"
                            }`}
                          >
                            {initials}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="truncate font-heading font-bold text-ink">
                                {user.first_name} {user.last_name}
                              </p>

                              {isSelf && (
                                <span className="rounded-full bg-ink/5 px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider text-ink-60">
                                  You
                                </span>
                              )}
                            </div>

                            <p className="mt-0.5 text-[11px] font-mono text-ink-40">
                              USER #{user.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-6 py-4">
                        <span className="text-sm text-ink-60">
                          {user.email}
                        </span>
                      </td>

                      {/* Joined */}
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-ink">
                            {new Date(
                              user.created_at
                            ).toLocaleDateString()}
                          </p>

                          <p className="mt-0.5 text-[10px] font-mono uppercase tracking-wider text-ink-40">
                            Joined
                          </p>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-6 py-4">
                        {user.is_shop_owner ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber/25 bg-amber/10 px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-[0.12em] text-amber-dim">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber" />
                            Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-black/8 bg-black/[0.025] px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-[0.12em] text-ink-60">
                            <span className="h-1.5 w-1.5 rounded-full bg-ink-30" />
                            Customer
                          </span>
                        )}
                      </td>

                      {/* Access */}
                      <td className="px-6 py-4 text-right">
                        {isSelf ? (
                          <span className="text-[11px] italic text-ink-40">
                            Your account
                          </span>
                        ) : (
                          <button
                            onClick={() => handleToggleRole(user)}
                            disabled={updatingId === user.id}
                            className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-[10px] font-heading font-bold uppercase tracking-wider transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
                              user.is_shop_owner
                                ? "border-crest/20 text-crest hover:border-crest/40 hover:bg-crest/5"
                                : "border-amber/25 text-amber-dim hover:border-amber/40 hover:bg-amber/5"
                            }`}
                          >
                            {updatingId === user.id ? (
                              <>
                                <span className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
                                Updating
                              </>
                            ) : user.is_shop_owner ? (
                              <>
                                <ShieldOff size={14} />
                                Remove admin
                              </>
                            ) : (
                              <>
                                <ShieldCheck size={14} />
                                Make admin
                              </>
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Permission note */}
      <div className="mt-5 flex items-start gap-3 border border-black/6 bg-white px-5 py-4">
        <ShieldCheck
          size={16}
          className="mt-0.5 flex-shrink-0 text-amber-dim"
        />

        <div>
          <p className="text-xs font-bold text-ink">
            Administrator access
          </p>

          <p className="mt-0.5 text-xs leading-relaxed text-ink-60">
            Administrators can access the SportNest dashboard and manage
            products, orders, categories, banners, users, and reports.
          </p>
        </div>
      </div>
    </div>
  );
}