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
  const [stats, setStats] = useState(null);
  const [props, setProps] = useState([]);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [kycs, setKycs] = useState([]);
  const [users, setUsers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [preview, setPreview] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const loadStats = async () => {
    try {
      const { data } = await api.get("/admin/stats");
      setStats(data);
    } catch {
      toast.error("Unable to load admin statistics");
    }
  };

  const loadProps = async (status = statusFilter) => {
    try {
      const { data } = await api.get("/admin/properties", {
        params: { status },
      });
      setProps(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Unable to load properties");
    }
  };

  const loadKyc = async () => {
    try {
      const { data } = await api.get("/admin/kyc");
      setKycs(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Unable to load KYC submissions");
    }
  };

  const loadUsers = async () => {
    try {
      const { data } = await api.get("/admin/users");
      setUsers(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Unable to load users");
    }
  };

  const loadPayments = async () => {
    try {
      const { data } = await api.get("/admin/payments");
      setPayments(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Unable to load payments");
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    if (tab === "properties") loadProps(statusFilter);
    if (tab === "kyc") loadKyc();
    if (tab === "users") loadUsers();
    if (tab === "payments") loadPayments();
  }, [tab, statusFilter]);

  const propAction = async (id, action, note = "") => {
    setBusyId(id);

    try {
      await api.post(`/admin/properties/${id}/action`, {
        action,
        note,
      });

      toast.success(`Property ${action.replace("_", " ")} successful`);
      await Promise.all([loadProps(statusFilter), loadStats()]);
    } catch (error) {
      toast.error(
        error?.response?.data?.detail ||
          `Unable to ${action.replace("_", " ")} property`
      );
    } finally {
      setBusyId(null);
    }
  };

  const deleteProperty = async (property) => {
    const confirmed = window.confirm(
      `Permanently delete "${property.title}"? This cannot be undone.`
    );

    if (!confirmed) return;

    setBusyId(property.id);

    try {
      await api.delete(`/admin/properties/${property.id}`);

      setProps((current) =>
        current.filter((item) => item.id !== property.id)
      );

      if (preview?.id === property.id) {
        setPreview(null);
      }

      toast.success("Property deleted successfully");

      await loadStats();
      await loadProps(statusFilter);
    } catch (error) {
      toast.error(
        error?.response?.data?.detail ||
          "Could not delete property. Check admin permissions and backend API."
      );
    } finally {
      setBusyId(null);
    }
  };

  const kycAction = async (id, action, note = "") => {
    setBusyId(id);

    try {
      await api.post(`/admin/kyc/${id}/action`, {
        action,
        note,
      });

      toast.success(`KYC ${action} successful`);

      await Promise.all([loadKyc(), loadStats()]);
    } catch (error) {
      toast.error(
        error?.response?.data?.detail || "Unable to update KYC"
      );
    } finally {
      setBusyId(null);
    }
  };

  const askReason = (message) => {
    const value = window.prompt(message);
    return value === null ? null : value.trim();
  };

  const getImage = (path) => {
    if (!path) return "";
    return fileUrl(path);
  };

  const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    return Number.isNaN(date.getTime())
      ? "—"
      : date.toLocaleDateString("en-IN");
  };

  const formatMoney = (value) =>
    Number(value || 0).toLocaleString("en-IN");

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <h1 className="text-4xl font-black text-forest">
        RentVerse AI — Admin Control Room
      </h1>

      <p className="text-forest-2 mb-6">
        Manage property listings, KYC verification, users and payments.
      </p>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          <StatCard
            icon={<Home size={16} />}
            label="Pending"
            value={stats.properties?.pending ?? 0}
          />

          <StatCard
            icon={<Home size={16} />}
            label="Approved"
            value={stats.properties?.approved ?? 0}
          />

          <StatCard
            icon={<ShieldCheck size={16} />}
            label="KYC Pending"
            value={stats.kyc_pending ?? 0}
          />

          <StatCard
            icon={<Users size={16} />}
            label="Users"
            value={stats.users ?? 0}
          />

          <StatCard
            icon={<IndianRupee size={16} />}
            label="Revenue"
            value={`₹${formatMoney(
              Number(stats.revenue_paise ?? 0) / 100
            )}`}
          />
        </div>
      )}

      <div className="flex gap-1 border-b border-warm mb-6 overflow-x-auto">
        {["properties", "kyc", "users", "payments"].map((item) => (
          <button
            key={item}
            data-testid={`admin-tab-${item}`}
            onClick={() => setTab(item)}
            className={`px-4 py-2 font-semibold capitalize whitespace-nowrap ${
              tab === item
                ? "border-b-2 border-terra text-forest"
                : "text-forest-2"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      {/* PROPERTIES */}
      {tab === "properties" && (
        <div>
          <div className="flex flex-wrap gap-2 mb-4">
            {[
              "pending",
              "approved",
              "rejected",
              "suspended",
              "needs_info",
            ].map((status) => (
              <button
                key={status}
                data-testid={`filter-${status}`}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-full text-sm border ${
                  statusFilter === status
                    ? "bg-forest text-white border-forest"
                    : "bg-white text-forest-2 border-warm"
                }`}
              >
                {status.replace("_", " ")}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {props.map((property) => (
              <div
                key={property.id}
                className="rounded-xl border border-warm bg-white p-4 flex flex-col md:flex-row gap-4"
                data-testid={`admin-prop-${property.id}`}
              >
                <img
                  src={getImage(property.photos?.[0])}
                  alt={property.title || "Property"}
                  className="w-full md:w-32 h-40 md:h-24 object-cover rounded-lg bg-gray-100"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span
                      className={`pill pill-${
                        property.status === "approved"
                          ? "approved"
                          : property.status === "rejected"
                          ? "rejected"
                          : "pending"
                      }`}
                    >
                      {property.status}
                    </span>

                    <span className="text-xs text-forest-2">
                      By {property.owner_name || "Unknown owner"}
                    </span>

                    {property.owner_kyc_status === "approved" && (
                      <span className="pill pill-approved">
                        KYC Verified
                      </span>
                    )}
                  </div>

                  <div className="font-semibold text-forest">
                    {property.title}
                  </div>

                  <div className="text-sm text-forest-2">
                    {property.city} · ₹
                    {formatMoney(property.monthly_rent)}/month ·{" "}
                    {property.rooms} BHK · {property.furnishing}
                  </div>

                  {property.ai_verdict && (
                    <div className="text-xs text-forest-2 mt-2">
                      AI Verdict:{" "}
                      <b>{property.ai_verdict.verdict}</b>

                      {typeof property.ai_verdict.confidence ===
                        "number" &&
                        ` (${(
                          property.ai_verdict.confidence * 100
                        ).toFixed(0)}%)`}

                      {property.ai_verdict.reasons?.length > 0 &&
                        ` — ${property.ai_verdict.reasons.join("; ")}`}
                    </div>
                  )}
                </div>

                <div className="flex flex-row md:flex-col flex-wrap gap-2 md:w-28">
                  <button
                    onClick={() => setPreview(property)}
                    className="btn-secondary text-sm py-1.5"
                    data-testid={`admin-view-${property.id}`}
                  >
                    View
                  </button>

                  <button
                    disabled={busyId === property.id}
                    onClick={() =>
                      propAction(property.id, "approve")
                    }
                    className="btn-primary text-sm py-1.5 disabled:opacity-50"
                    data-testid={`admin-approve-${property.id}`}
                  >
                    Approve
                  </button>

                  <button
                    disabled={busyId === property.id}
                    onClick={() => {
                      const note = askReason("Rejection reason?");
                      if (note !== null) {
                        propAction(property.id, "reject", note);
                      }
                    }}
                    className="btn-secondary text-sm py-1.5 !text-danger !border-danger/40 disabled:opacity-50"
                    data-testid={`admin-reject-${property.id}`}
                  >
                    Reject
                  </button>

                  <button
                    disabled={busyId === property.id}
                    onClick={() => {
                      const note = askReason("Suspension reason?");
                      if (note !== null) {
                        propAction(property.id, "suspend", note);
                      }
                    }}
                    className="btn-secondary text-sm py-1.5 disabled:opacity-50"
                    data-testid={`admin-suspend-${property.id}`}
                  >
                    Suspend
                  </button>

                  <button
                    disabled={busyId === property.id}
                    onClick={() => {
                      const note = askReason("What additional information is needed?");
                      if (note !== null) {
                        propAction(property.id, "request_info", note);
                      }
                    }}
                    className="btn-secondary text-sm py-1.5 disabled:opacity-50"
                    data-testid={`admin-info-${property.id}`}
                  >
                    Ask info
                  </button>

                  <button
                    disabled={busyId === property.id}
                    onClick={() => deleteProperty(property)}
                    className="btn-secondary text-sm py-1.5 !text-danger !border-danger/40 inline-flex items-center justify-center gap-1 disabled:opacity-50"
                    data-testid={`admin-delete-${property.id}`}
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </div>
            ))}

            {props.length === 0 && (
              <div className="text-forest-2 text-center py-10">
                No listings found for this status.
              </div>
            )}
          </div>
        </div>
      )}

      {/* KYC */}
      {tab === "kyc" && (
        <div className="space-y-3">
          {kycs.map((kyc) => (
            <div
              key={kyc.id}
              className="rounded-xl border border-warm bg-white p-4 flex flex-col md:flex-row gap-4"
              data-testid={`admin-kyc-${kyc.id}`}
            >
              {kyc.id_document_url && (
                <img
                  src={getImage(kyc.id_document_url)}
                  alt="Identity document"
                  className="w-32 h-24 object-cover rounded-lg bg-gray-100"
                />
              )}

              {kyc.selfie_url && (
                <img
                  src={getImage(kyc.selfie_url)}
                  alt="User selfie"
                  className="w-24 h-24 object-cover rounded-lg bg-gray-100"
                />
              )}

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className={`pill pill-${kyc.status}`}>
                    {kyc.status}
                  </span>

                  <span className="text-xs text-forest-2">
                    {kyc.document_type}
                  </span>
                </div>

                <div className="font-semibold text-forest">
                  {kyc.full_name_on_document}
                </div>

                <div className="text-sm text-forest-2">
                  {kyc.user_email}
                </div>
              </div>

              {kyc.status === "pending" && (
                <div className="flex flex-row md:flex-col gap-2">
                  <button
                    disabled={busyId === kyc.id}
                    onClick={() => kycAction(kyc.id, "approve")}
                    className="btn-primary text-sm py-1.5 disabled:opacity-50"
                    data-testid={`kyc-approve-${kyc.id}`}
                  >
                    Approve
                  </button>

                  <button
                    disabled={busyId === kyc.id}
                    onClick={() => {
                      const note = askReason("KYC rejection reason?");
                      if (note !== null) {
                        kycAction(kyc.id, "reject", note);
                      }
                    }}
                    className="btn-secondary text-sm py-1.5 disabled:opacity-50"
                    data-testid={`kyc-reject-${kyc.id}`}
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}

          {kycs.length === 0 && (
            <div className="text-forest-2 text-center py-10">
              No KYC submissions found.
            </div>
          )}
        </div>
      )}

      {/* USERS */}
      {tab === "users" && (
        <div className="rounded-xl border border-warm bg-white overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-bone">
              <tr className="text-left">
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">KYC</th>
                <th className="p-3">Premium</th>
                <th className="p-3">Joined</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t border-warm">
                  <td className="p-3">{user.name}</td>
                  <td className="p-3 text-forest-2">{user.email}</td>
                  <td className="p-3">
                    <span className="pill pill-info">{user.role}</span>
                  </td>
                  <td className="p-3">
                    <span
                      className={`pill pill-${
                        user.kyc_status === "approved"
                          ? "approved"
                          : "pending"
                      }`}
                    >
                      {user.kyc_status || "Not submitted"}
                    </span>
                  </td>
                  <td className="p-3">
                    {user.is_premium ? "Yes" : "—"}
                  </td>
                  <td className="p-3 text-forest-2">
                    {formatDate(user.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {users.length === 0 && (
            <div className="text-forest-2 text-center py-8">
              No users found.
            </div>
          )}
        </div>
      )}

      {/* PAYMENTS */}
      {tab === "payments" && (
        <div className="rounded-xl border border-warm bg-white overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-bone">
              <tr className="text-left">
                <th className="p-3">Purpose</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Status</th>
                <th className="p-3">Order ID</th>
                <th className="p-3">User</th>
                <th className="p-3">Date</th>
              </tr>
            </thead>

            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id} className="border-t border-warm">
                  <td className="p-3">
                    {payment.purpose}
                    {payment.plan ? ` (${payment.plan})` : ""}
                  </td>

                  <td className="p-3">
                    ₹{formatMoney(Number(payment.amount || 0) / 100)}
                  </td>

                  <td className="p-3">
                    <span
                      className={`pill pill-${
                        payment.status === "paid"
                          ? "approved"
                          : "pending"
                      }`}
                    >
                      {payment.status}
                    </span>
                  </td>

                  <td className="p-3 text-xs font-mono text-forest-2">
                    {payment.razorpay_order_id || "—"}
                  </td>

                  <td className="p-3 text-forest-2">
                    {payment.user_id
                      ? payment.user_id.slice(0, 8)
                      : "—"}
                  </td>

                  <td className="p-3 text-forest-2">
                    {payment.created_at
                      ? new Date(payment.created_at).toLocaleString("en-IN")
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {payments.length === 0 && (
            <div className="text-forest-2 text-center py-8">
              No payment records found.
            </div>
          )}
        </div>
      )}

      {/* PROPERTY PREVIEW */}
      {preview && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setPreview(null)}
        >
          <div
            className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex justify-between items-center gap-4 mb-4">
              <h3 className="text-2xl font-bold text-forest">
                {preview.title}
              </h3>

              <button
                onClick={() => setPreview(null)}
                aria-label="Close property preview"
              >
                <X />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
              {(preview.photos || []).map((photo, index) => (
                <img
                  key={`${photo}-${index}`}
                  src={getImage(photo)}
                  alt={`Property ${index + 1}`}
                  className="w-full h-24 object-cover rounded bg-gray-100"
                />
              ))}
            </div>

            <p className="text-forest-2 whitespace-pre-line mb-4">
              {preview.description || "No description provided."}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <b>Type:</b> {preview.property_type || "—"}
              </div>

              <div>
                <b>City:</b> {preview.city || "—"}
              </div>

              <div>
                <b>Rent:</b> ₹{formatMoney(preview.monthly_rent)}
              </div>

              <div>
                <b>Deposit:</b> ₹{formatMoney(preview.security_deposit)}
              </div>

              <div>
                <b>Rooms:</b> {preview.rooms ?? "—"}
              </div>

              <div>
                <b>Furnishing:</b> {preview.furnishing || "—"}
              </div>

              <div className="sm:col-span-2">
                <b>Address:</b> {preview.address || "—"}
              </div>

              <div className="sm:col-span-2 break-words">
                <b>Contact:</b>{" "}
                {preview.contact_phone || "—"} ·{" "}
                {preview.contact_email || "—"}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="rounded-xl border border-warm bg-white p-4">
      <div className="text-xs uppercase tracking-wider font-bold text-forest-2 flex items-center gap-1">
        {icon}
        {label}
      </div>

      <div className="text-2xl font-black text-forest mt-1">
        {value}
      </div>
    </div>
  );
}
