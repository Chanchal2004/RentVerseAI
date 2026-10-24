import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Crown, Check, Loader2 } from "lucide-react";

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";

    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
}

const PLAN_META = {
  monthly: {
    title: "Monthly",
    price: 99,
    sub: "Billed monthly",
    best: false,
  },
  quarterly: {
    title: "Quarterly",
    price: 249,
    sub: "3 months · Save 16%",
    best: true,
  },
  yearly: {
    title: "Yearly",
    price: 799,
    sub: "12 months · Save 33%",
    best: false,
  },
};

export default function Pricing() {
  const { user, refresh } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [config, setConfig] = useState(null);

  useEffect(() => {
    let cancelled = false;

    api
      .get("/payments/config")
      .then(({ data }) => {
        if (!cancelled) setConfig(data);
      })
      .catch(() => {
        if (!cancelled) setConfig({ configured: false });
      });

    if (user) {
      api
        .get("/payments/subscription")
        .then(({ data }) => {
          if (!cancelled) setSubscription(data);
        })
        .catch(() => {
          if (!cancelled) setSubscription(null);
        });
    } else {
      setSubscription(null);
    }

    return () => {
      cancelled = true;
    };
  }, [user]);

  const buy = async (plan) => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!PLAN_META[plan]) {
      toast.error("Invalid plan selected");
      return;
    }

    setLoading(plan);

    try {
      const { data: order } = await api.post("/payments/order", {
        purpose: "premium",
        plan,
      });

      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded) {
        throw new Error("Unable to load Razorpay checkout");
      }

      if (!order?.key_id || !order?.order_id || !order?.amount) {
        throw new Error("Payment configuration is incomplete");
      }

      const checkout = new window.Razorpay({
        key: order.key_id,
        amount: order.amount,
        currency: order.currency || "INR",
        order_id: order.order_id,
        name: "RentVerse AI",
        description: `${PLAN_META[plan].title} Premium Plan`,
        prefill: {
          name: user.name || "",
          email: user.email || "",
          contact: user.phone || "",
        },
        theme: {
          color: "#D26955",
        },
        handler: async (response) => {
          try {
            await api.post("/payments/verify", {
              ...response,
              purpose: "premium",
              plan,
            });

            toast.success("Welcome to RentVerse AI Premium!");

            await refresh();
            navigate("/dashboard/tenant");
          } catch (error) {
            toast.error(
              error?.response?.data?.detail ||
                "Payment verification failed. Please contact support if money was deducted."
            );
          } finally {
            setLoading(null);
          }
        },
        modal: {
          ondismiss: () => setLoading(null),
        },
      });

      checkout.on("payment.failed", (response) => {
        toast.error(
          response?.error?.description || "Payment failed. Please try again."
        );
        setLoading(null);
      });

      checkout.open();
    } catch (error) {
      if (error?.response?.status === 503) {
        toast.error("Payments are not configured yet.");
      } else {
        toast.error(
          error?.response?.data?.detail ||
            error.message ||
            "Unable to start checkout."
        );
      }

      setLoading(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <div className="text-center mb-12">
        <div className="label-overline mb-3">RentVerse AI Premium</div>

        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-forest">
          Find your home.
          <br />
          Skip the broker.
        </h1>

        <p className="text-forest-2 mt-4 max-w-xl mx-auto">
          Choose a plan to unlock property contacts and connect directly with
          owners.
        </p>
      </div>

      {config && !config.configured && (
        <div className="mb-8 rounded-xl border border-warm bg-white p-4 text-forest-2 text-sm text-center">
          Razorpay payments are not configured yet. Premium checkout will be
          available once the payment settings are configured.
        </div>
      )}

      {subscription?.active && (
        <div
          className="mb-8 rounded-xl border border-warm bg-olive-bg p-5 text-center"
          data-testid="active-sub-banner"
        >
          <Crown className="inline text-olive mr-2" />
          You are a Premium member until{" "}
          <b>
            {subscription.premium_until
              ? new Date(subscription.premium_until).toLocaleDateString("en-IN")
              : "your subscription expiry"}
          </b>
          .
        </div>
      )}

      <div
        className="rounded-2xl border border-warm bg-forest text-white p-8 mb-6 flex flex-col md:flex-row items-center justify-between gap-6"
        data-testid="plan-yearly-card"
      >
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-terra">
            Best value
          </div>

          <div className="text-4xl font-black mt-1">Yearly · ₹799</div>

          <div className="opacity-80 mt-1">
            12 months of Premium access.
          </div>
        </div>

        <button
          data-testid="buy-yearly"
          onClick={() => buy("yearly")}
          disabled={Boolean(loading)}
          className="btn-primary text-lg px-8 py-4 disabled:opacity-60"
        >
          {loading === "yearly" ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <Crown size={16} />
          )}
          Go Premium Yearly
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {["monthly", "quarterly"].map((plan) => {
          const meta = PLAN_META[plan];

          return (
            <div
              key={plan}
              className={`rounded-2xl border p-8 bg-white ${
                meta.best ? "border-terra" : "border-warm"
              }`}
              data-testid={`plan-${plan}-card`}
            >
              <div className="flex items-baseline justify-between gap-3">
                <div className="text-2xl font-bold text-forest">
                  {meta.title}
                </div>

                {meta.best && (
                  <span className="pill pill-approved">Popular</span>
                )}
              </div>

              <div className="text-4xl font-black text-forest mt-2">
                ₹{meta.price}
              </div>

              <div className="text-forest-2 text-sm">{meta.sub}</div>

              <ul className="mt-6 space-y-3 text-sm text-forest-2">
                <li className="flex gap-2">
                  <Check size={16} className="text-olive shrink-0" />
                  Property contact unlocks
                </li>

                <li className="flex gap-2">
                  <Check size={16} className="text-olive shrink-0" />
                  Direct owner connections
                </li>

                <li className="flex gap-2">
                  <Check size={16} className="text-olive shrink-0" />
                  Premium membership access
                </li>
              </ul>

              <button
                data-testid={`buy-${plan}`}
                onClick={() => buy(plan)}
                disabled={Boolean(loading)}
                className="btn-primary w-full justify-center mt-6 disabled:opacity-60"
              >
                {loading === plan && (
                  <Loader2 className="animate-spin" size={16} />
                )}
                Get {meta.title}
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-16 text-center text-forest-2 text-sm">
        Or unlock a single property for{" "}
        <b className="text-forest">₹29</b>, where available.
      </div>
    </div>
  );
}
