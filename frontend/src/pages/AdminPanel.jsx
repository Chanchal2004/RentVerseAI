import { useEffect, useState } from "react";
import { api, fileUrl } from "../lib/api";
import { toast } from "sonner";
import {
  ShieldCheck,
  Users,
  IndianRupee,
  Home,
  X,
  Trash2,
} from "lucide-react";

export default function AdminPanel() {
  const [tab, setTab] = useState("properties");
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [properties, setProperties] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);

    try {
      const [statsRes, usersRes, propertiesRes, paymentsRes] =
        await Promise.all([
          api.get("/admin/stats"),
          api.get("/admin/users"),
          api.get("/admin/properties"),
          api.get("/admin/payments"),
        ]);

      setStats(statsRes.data || {});
      setUsers(usersRes.data || []);
      setProperties(propertiesRes.data || []);
      setPayments(paymentsRes.data || []);
    } catch (error) {
      toast.error(
        error?.response?.data?.detail ||
          "Failed to load admin dashboard"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateProperty = async (id, action) => {
    try {
      await api.patch(`/admin/properties/${id}`, { action });
      toast.success("Property updated");
      load();
    } catch (error) {
      toast.error(
        error?.response?.data?.detail ||
          "Could not update property"
      );
    }
  };

  const deleteProperty = async (property) => {
    const confirmed = window.confirm(
      `Permanently delete "${property.title}"?`
    );

    if (!confirmed) return;

    try {
      await api.delete(`/admin/properties/${property.id}`);

      setProperties((current) =>
        current.filter((item) => item.id !== property.id)
      );

      toast.success("Property deleted");
      load();
    } catch (error) {
      toast.error(
        error?.response?.data?.detail ||
          "Could not delete property"
      );
    }
  };

  const updateUser = async (id, action) => {
    try {
      await api.patch(`/admin/users/${id}`, { action });
      toast.success("User updated");
      load();
    } catch (error) {
      toast.error(
        error?.response?.data?.detail ||
          "Could not update user"
      );
    }
  };

  const money = (amount) =>
    `₹${Number(amount || 0).toLocaleString("en-IN")}`;

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
        <div>
          <div className="label-overline mb-2">Administration</div>
          <h1 className="text-4xl font-black text-forest">
            Admin Dashboard
          </h1>
          <p className="text-forest-2 mt-1">
            Manage users, listings and platform activity.
          </p>
        </div>

        <div className="flex items-center gap-2 text-forest-2 text-sm">
          <ShieldCheck size={18} />
          Administrator access
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<Users size={20} />}
          title="Total Users"
          value={stats.total_users ?? users.length}
        />

        <StatCard
          icon={<Home size={20} />}
          title="Properties"
          value={stats.total_properties ?? properties.length}
        />

        <StatCard
          icon={<ShieldCheck size={20} />}
          title="Pending Listings"
          value={stats.pending_properties ?? properties.filter(
            (p) => p.status === "pending"
          ).length}
        />

        <StatCard
          icon={<IndianRupee size={20} />}
          title="Revenue"
          value={money(stats.total_revenue)}
        />
      </div>

      <div className="flex flex-wrap gap-2 border-b border-warm mb-6">
        <TabButton
          active={tab === "properties"}
          onClick={() => setTab("properties")}
        >
          <Home size={16} />
          Properties
        </TabButton>

        <TabButton
          active={tab === "users"}
          onClick={() => setTab("users")}
        >
          <Users size={16} />
          Users
        </TabButton>

        <TabButton
          active={tab === "payments"}
          onClick={() => setTab("payments")}
        >
          <IndianRupee size={16} />
          Payments
        </TabButton>
      </div>

      {loading ? (
        <div className="py-12 text-center text-forest-2">
          Loading admin data…
        </div>
      ) : (
        <>
          {tab === "properties" && (
            <div className="space-y-3">
              {properties.length === 0 ? (
                <EmptyState message="No properties found." />
              ) : (
                properties.map((property) => (
                  <div
                    key={property.id}
                    className="bg-white border border-warm rounded-xl p-4 flex flex-col md:flex-row gap-4"
                    data-testid={`admin-property-${property.id}`}
                  >
                    <img
                      src={fileUrl(property.photos?.[0])}
                      alt=""
                      className="w-full md:w-32 h-28 object-cover rounded-lg bg-gray-100"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <StatusPill status={property.status} />

                        <span className="text-xs text-forest-2">
                          {property.city}
                        </span>
                      </div>

                      <div className="font-semibold text-forest">
                        {property.title}
                      </div>

                      <div className="text-sm text-forest-2 mt-1">
                        {money(property.monthly_rent)}/month ·{" "}
                        {property.rooms} BHK
                      </div>

                      {property.owner_name && (
                        <div className="text-sm text-forest-2 mt-1">
                          Owner: {property.owner_name}
                        </div>
                      )}

                      {property.admin_note && (
                        <div className="text-sm text-danger mt-1">
                          Note: {property.admin_note}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {property.status !== "approved" && (
                        <button
                          className="btn-primary text-sm py-2"
                          onClick={() =>
                            updateProperty(property.id, "approve")
                          }
                          data-testid={`admin-approve-${property.id}`}
                        >
                          Approve
                        </button>
                      )}

                      {property.status !== "rejected" && (
                        <button
                          className="btn-secondary text-sm py-2"
                          onClick={() =>
                            updateProperty(property.id, "reject")
                          }
                          data-testid={`admin-reject-${property.id}`}
                        >
                          Reject
                        </button>
                      )}

                      <button
                        className="btn-secondary text-sm py-2 !text-danger !border-danger/40 inline-flex items-center gap-1"
                        onClick={() => deleteProperty(property)}
                        data-testid={`admin-delete-${property.id}`}
                        aria-label={`Delete ${property.title}`}
                      >
                        <Trash2 size={15} />
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === "users" && (
            <div className="bg-white border border-warm rounded-xl overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-bone text-forest-2">
                  <tr>
                    <th className="text-left p-4">User</th>
                    <th className="text-left p-4">Role</th>
                    <th className="text-left p-4">KYC Status</th>
                    <th className="text-left p-4">Account</th>
                    <th className="text-left p-4">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((u) => (
                    <tr
                      key={u.id}
                      className="border-t border-warm"
                      data-testid={`admin-user-${u.id}`}
                    >
                      <td className="p-4">
                        <div className="font-semibold text-forest">
                          {u.name}
                        </div>
                        <div className="text-forest-2">
                          {u.email}
                        </div>
                      </td>

                      <td className="p-4">{u.role}</td>

                      <td className="p-4">
                        <StatusPill status={u.kyc_status || "pending"} />
                      </td>

                      <td className="p-4">
                        <StatusPill
                          status={
                            u.disabled ? "suspended" : "active"
                          }
                        />
                      </td>

                      <td className="p-4">
                        <button
                          className="btn-secondary text-xs py-2"
                          onClick={() =>
                            updateUser(
                              u.id,
                              u.disabled ? "enable" : "disable"
                            )
                          }
                          data-testid={`admin-user-toggle-${u.id}`}
                        >
                          {u.disabled ? "Enable" : "Disable"}
                        </button>
                      </td>
                    </tr>
                  ))}

                  {users.length === 0 && (
                    <tr>
                      <td
                        colSpan="5"
                        className="p-8 text-center text-forest-2"
                      >
                        No users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {tab === "payments" && (
            <div className="bg-white border border-warm rounded-xl overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-bone text-forest-2">
                  <tr>
                    <th className="text-left p-4">Payment ID</th>
                    <th className="text-left p-4">User</th>
                    <th className="text-left p-4">Purpose</th>
                    <th className="text-left p-4">Amount</th>
                    <th className="text-left p-4">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {payments.map((payment) => (
                    <tr
                      key={payment.id || payment.payment_id}
                      className="border-t border-warm"
                    >
                      <td className="p-4 break-all">
                        {payment.payment_id ||
                          payment.razorpay_payment_id ||
                          payment.id ||
                          "—"}
                      </td>

                      <td className="p-4">
                        {payment.user_email || payment.email || "—"}
                      </td>

                      <td className="p-4">
                        {payment.purpose || "—"}
                      </td>

                      <td className="p-4">
                        {money(payment.amount)}
                      </td>

                      <td className="p-4">
                        <StatusPill status={payment.status || "unknown"} />
                      </td>
                    </tr>
                  ))}

                  {payments.length === 0 && (
                    <tr>
                      <td
                        colSpan="5"
                        className="p-8 text-center text-forest-2"
                      >
                        No payments found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function StatCard({ icon, title, value }) {
  return (
    <div className="rounded-xl border border-warm bg-white p-5">
      <div className="flex items-center gap-2 text-forest-2 mb-3">
        {icon}
        <span className="text-sm">{title}</span>
      </div>

      <div className="text-3xl font-black text-forest">
        {value}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 ${
        active
          ? "border-forest text-forest"
          : "border-transparent text-forest-2 hover:text-forest"
      }`}
    >
      {children}
    </button>
  );
}

function StatusPill({ status }) {
  const normalized = String(status || "unknown")
    .toLowerCase()
    .replaceAll("_", " ");

  const className =
    normalized === "approved" ||
    normalized === "active" ||
    normalized === "confirmed" ||
    normalized === "completed"
      ? "pill-approved"
      : normalized === "rejected" ||
        normalized === "disabled" ||
        normalized === "suspended"
      ? "pill-rejected"
      : "pill-pending";

  return (
    <span className={`pill ${className}`}>
      {normalized}
    </span>
  );
}

function EmptyState({ message }) {
  return (
    <div className="rounded-xl border border-dashed border-warm bg-white p-12 text-center text-forest-2">
      {message}
    </div>
  );
}
