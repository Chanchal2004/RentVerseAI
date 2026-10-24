import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import {
  Lock,
  Phone,
  Mail,
  Crown,
  CheckCircle,
  Loader2,
} from "lucide-react";

export default function LockedContact({ property }) {
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const contactUnlocked = Boolean(property?.contact_unlocked);
  const phone = property?.contact_phone;
  const email = property?.contact_email;

  const unlockContact = async () => {
    if (!user) {
      window.location.href = "/login";
      return;
    }

    setLoading(true);
    setError("");

    try {
      await api.post(`/payments/unlock/${property.id}`);

      // Reload the current page so the contact data is fetched again.
      window.location.reload();
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          "Unable to unlock contact details. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (contactUnlocked && (phone || email)) {
    return (
      <div className="rounded-xl border border-warm bg-white p-5 space-y-3">
        <h3 className="font-bold text-forest flex items-center gap-2">
          <CheckCircle size={18} />
          Owner Contact
        </h3>

        {phone && (
          <a
            href={`tel:${phone}`}
            className="flex items-center gap-2 text-forest-2 hover:text-forest break-all"
          >
            <Phone size={16} />
            {phone}
          </a>
        )}

        {email && (
          <a
            href={`mailto:${email}`}
            className="flex items-center gap-2 text-forest-2 hover:text-forest break-all"
          >
            <Mail size={16} />
            {email}
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-warm bg-white p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-forest/10 text-forest flex items-center justify-center">
          <Lock size={20} />
        </div>

        <div>
          <h3 className="font-bold text-forest">Owner Contact Details</h3>
          <p className="text-sm text-forest-2">
            Unlock contact details to connect with the owner.
          </p>
        </div>
      </div>

      <div className="rounded-lg bg-gray-50 p-4 space-y-3">
        <div className="flex items-center gap-2 text-gray-400">
          <Phone size={16} />
          <span>Phone number hidden</span>
        </div>

        <div className="flex items-center gap-2 text-gray-400">
          <Mail size={16} />
          <span>Email address hidden</span>
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-600" role="alert">
          {error}
        </div>
      )}

      {user?.role === "owner" || user?.role === "admin" ? (
        <p className="text-sm text-forest-2">
          You are viewing this listing with a property management account.
        </p>
      ) : (
        <button
          type="button"
          onClick={unlockContact}
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Please wait...
            </>
          ) : (
            <>
              <Crown size={16} />
              Unlock Contact
            </>
          )}
        </button>
      )}

      {!user && (
        <p className="text-center text-sm text-forest-2">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-forest underline">
            Log in
          </Link>
        </p>
      )}
    </div>
  );
}
