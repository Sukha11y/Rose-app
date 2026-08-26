import { useState, useRef, useEffect, useCallback } from "react";

/* ── a11y: focus-trap hook for modal dialogs ────────────────────────────── */
function useFocusTrap(active: boolean) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active || !ref.current) return;

    const el = ref.current;
    const focusable = el.querySelectorAll<HTMLElement>(
      'a[href],button:not([disabled]),input:not([disabled]),textarea,select,[tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    first?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key !== "Tab") return;
      if (focusable.length === 0) { e.preventDefault(); return; }
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last?.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
    }

    el.addEventListener("keydown", onKey);
    return () => el.removeEventListener("keydown", onKey);
  }, [active]);

  return ref as React.RefObject<HTMLElement>;
}

/* ── Rosé DS — Primary button ───────────────────────────────────────────── */
function PrimaryBtn({
  children,
  onClick,
  disabled = false,
  "aria-label": ariaLabel,
  style: extraStyle,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  "aria-label"?: string;
  style?: React.CSSProperties;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 44,
        minWidth: 44,
        padding: "0 24px",
        borderRadius: "var(--radius)",
        background: disabled ? "var(--gray-200)" : "var(--primary)",
        color: disabled ? "var(--gray-600)" : "var(--primary-foreground)",
        fontFamily: "var(--font-semi)",
        fontWeight: 600,
        fontSize: 14,
        border: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        transition: "background 0.15s",
        ...extraStyle,
      }}
      onMouseEnter={(e) => {
        if (!disabled) (e.currentTarget as HTMLButtonElement).style.background = "var(--primary-hover)";
      }}
      onMouseLeave={(e) => {
        if (!disabled) (e.currentTarget as HTMLButtonElement).style.background = "var(--primary)";
      }}
    >
      {children}
    </button>
  );
}

/* ── Rosé DS — Secondary button ─────────────────────────────────────────── */
function SecondaryBtn({
  children,
  onClick,
  "aria-label": ariaLabel,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  "aria-label"?: string;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 44,
        minWidth: 44,
        padding: "0 24px",
        borderRadius: "var(--radius)",
        background: hovered ? "var(--blush-50)" : "transparent",
        color: hovered ? "var(--classic-700)" : "var(--primary)",
        border: `1px solid ${hovered ? "var(--classic-700)" : "var(--primary)"}`,
        fontFamily: "var(--font-semi)",
        fontWeight: 600,
        fontSize: 14,
        cursor: "pointer",
        transition: "all 0.15s",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </button>
  );
}

/* ── Qty stepper — 44×44 touch targets per toolkit spec ─────────────────── */
function QtyGroup({
  qty,
  onAdd,
  onRemove,
  label,
}: {
  qty: number;
  onAdd: () => void;
  onRemove: () => void;
  label: string;
}) {
  const btnStyle: React.CSSProperties = {
    width: 44, height: 44,
    borderRadius: "50%",
    border: "none",
    background: "transparent",
    color: "var(--secondary-foreground)",
    fontFamily: "var(--font-bold)",
    fontSize: 20,
    cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  };
  return (
    <div
      role="group"
      aria-label={`${label} quantity`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        borderRadius: 24,
        background: "var(--secondary)",
        overflow: "hidden",
      }}
    >
      <button onClick={onRemove} aria-label={`Remove one ${label}`} style={btnStyle}>−</button>
      <span
        aria-live="polite"
        style={{
          minWidth: 24, textAlign: "center",
          fontFamily: "var(--font-bold)", fontSize: 14,
          color: "var(--secondary-foreground)",
        }}
      >{qty}</span>
      <button onClick={onAdd} aria-label={`Add another ${label}`} style={btnStyle}>+</button>
    </div>
  );
}

/* ── Category pill — 44px height ────────────────────────────────────────── */
function CategoryPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      style={{
        height: 44,
        padding: "0 18px",
        borderRadius: 22,
        border: "none",
        background: active ? "var(--primary)" : "var(--secondary)",
        color: active ? "var(--primary-foreground)" : "var(--secondary-foreground)",
        fontFamily: "var(--font-semi)",
        fontWeight: 600,
        fontSize: 13,
        cursor: "pointer",
        transition: "all 0.15s",
      }}
    >{children}</button>
  );
}

/* ── Badge ───────────────────────────────────────────────────────────────── */
function Badge({ children }: { children: string }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: "3px 10px", borderRadius: 6,
      background: "var(--primary)", color: "var(--primary-foreground)",
      fontFamily: "var(--font-bold)", fontSize: 9, fontWeight: 700,
      textTransform: "uppercase", letterSpacing: "0.06em",
    }}>{children}</span>
  );
}

/* ── Product card ────────────────────────────────────────────────────────── */
type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  description: string;
  image: string;
  alt: string;
  badge?: string;
};

function ProductCard({
  product, qty, onAdd, onRemove,
}: {
  product: Product;
  qty: number;
  onAdd: () => void;
  onRemove: () => void;
}) {
  return (
    <article
      aria-label={product.name}
      style={{
        background: "var(--card)",
        border: "1px solid var(--petal-100)",
        borderRadius: 16,
        overflow: "hidden",
        display: "flex", flexDirection: "column",
        position: "relative",
      }}
    >
      <div style={{ position: "relative", background: "var(--muted)", height: 180, flexShrink: 0 }}>
        <img
          src={product.image}
          alt={product.alt}
          loading="lazy"
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
        {product.badge && (
          <span style={{ position: "absolute", top: 12, left: 12 }}>
            <Badge>{product.badge}</Badge>
          </span>
        )}
      </div>

      <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <p style={{
            fontFamily: "var(--font-bold)", fontWeight: 700, fontSize: 12,
            textTransform: "uppercase", letterSpacing: "0.06em",
            color: "var(--classic-700)", margin: 0,
          }}>{product.category}</p>
          <p style={{
            fontFamily: "var(--font-semi)", fontWeight: 600, fontSize: 12,
            color: "var(--teal-deep)", margin: 0,
          }}>${product.price.toFixed(2)}</p>
        </div>

        {/* h3 gives each card a heading — supports screen-reader landmark nav */}
        <h3 style={{
          fontFamily: "var(--font-display)",
          fontSize: 22, lineHeight: 1.2,
          color: "var(--charcoal)", margin: 0,
        }}>{product.name}</h3>

        <p style={{
          fontFamily: "var(--font-body)", fontSize: 13, lineHeight: 1.4,
          color: "var(--gray-600)", margin: 0, flex: 1,
        }}>{product.description}</p>

        <div style={{ paddingTop: 12, borderTop: "1px solid var(--petal-100)" }}>
          {qty === 0 ? (
            <PrimaryBtn
              onClick={onAdd}
              aria-label={`Add ${product.name} to order — $${product.price.toFixed(2)}`}
            >
              Add to Order
            </PrimaryBtn>
          ) : (
            <QtyGroup qty={qty} onAdd={onAdd} onRemove={onRemove} label={product.name} />
          )}
        </div>
      </div>
    </article>
  );
}

/* ── Cart drawer — focus-trapped, Escape to close, focus restored on close ─ */
type CartItem = { product: Product; qty: number };

function CartDrawer({
  items, onClose, onAdd, onRemove, onClear,
}: {
  items: CartItem[];
  onClose: () => void;
  onAdd: (id: number) => void;
  onRemove: (id: number) => void;
  onClear: () => void;
}) {
  const total = items.reduce((s, i) => s + i.product.price * i.qty, 0);
  const trapRef = useFocusTrap(true);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const btnStyle: React.CSSProperties = {
    width: 44, height: 44, borderRadius: "50%",
    border: "none", background: "transparent",
    color: "var(--secondary-foreground)",
    fontFamily: "var(--font-bold)", fontSize: 20,
    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", justifyContent: "flex-end" }}
      role="dialog"
      aria-modal="true"
      aria-label="Your order"
    >
      {/* backdrop */}
      <div
        onClick={onClose}
        aria-hidden="true"
        style={{ position: "absolute", inset: 0, background: "rgba(17,17,17,0.35)", backdropFilter: "blur(4px)" }}
      />

      <aside
        ref={trapRef as React.RefObject<HTMLElement>}
        style={{
          position: "relative",
          width: "100%", maxWidth: 380, height: "100%",
          background: "var(--background)",
          display: "flex", flexDirection: "column",
          boxShadow: "-4px 0 32px rgba(17,17,17,0.12)",
        }}
      >
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 24px",
          borderBottom: "1px solid var(--border)",
        }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 26, margin: 0, color: "var(--charcoal)" }}>
            Your Order
          </h2>
          {/* 44×44 close button */}
          <button
            onClick={onClose}
            aria-label="Close cart"
            style={{
              width: 44, height: 44,
              borderRadius: "50%", border: "none",
              background: "transparent", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--gray-800)",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <ul style={{ flex: 1, overflowY: "auto", padding: "16px 24px", margin: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 16 }}>
          {items.length === 0 && (
            <li style={{ textAlign: "center", padding: "48px 0", color: "var(--gray-400)" }}>
              <p style={{ fontSize: 32, margin: "0 0 8px" }} aria-hidden="true">🌹</p>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 13, margin: 0 }}>Your basket is empty.</p>
            </li>
          )}
          {items.map(({ product, qty }) => (
            <li key={product.id} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <img
                src={product.image} alt={product.alt}
                style={{ width: 56, height: 56, borderRadius: 12, objectFit: "cover", background: "var(--muted)", flexShrink: 0 }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontFamily: "var(--font-semi)", fontWeight: 600, fontSize: 13, margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {product.name}
                </p>
                <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--gray-400)", margin: "0 0 8px" }}>
                  ${product.price.toFixed(2)} each
                </p>
                <div
                  role="group"
                  aria-label={`${product.name} quantity`}
                  style={{ display: "inline-flex", alignItems: "center", borderRadius: 24, background: "var(--secondary)", overflow: "hidden" }}
                >
                  <button onClick={() => onRemove(product.id)} aria-label={`Remove one ${product.name}`} style={btnStyle}>−</button>
                  <span aria-live="polite" style={{ minWidth: 20, textAlign: "center", fontFamily: "var(--font-bold)", fontSize: 13, color: "var(--secondary-foreground)" }}>{qty}</span>
                  <button onClick={() => onAdd(product.id)} aria-label={`Add another ${product.name}`} style={btnStyle}>+</button>
                </div>
              </div>
              <p style={{ fontFamily: "var(--font-semi)", fontWeight: 600, fontSize: 13, flexShrink: 0, margin: 0 }}>
                ${(product.price * qty).toFixed(2)}
              </p>
            </li>
          ))}
        </ul>

        {items.length > 0 && (
          <div style={{ padding: "16px 24px 24px", borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--font-body)", fontSize: 13, color: "var(--gray-600)" }}>
              <span>Subtotal</span>
              <span style={{ fontFamily: "var(--font-semi)", fontWeight: 600, color: "var(--charcoal)" }}>
                ${total.toFixed(2)}
              </span>
            </div>
            <PrimaryBtn style={{ width: "100%" }}>
              Place Order — ${total.toFixed(2)}
            </PrimaryBtn>
            <button
              onClick={onClear}
              style={{
                background: "none", border: "none", cursor: "pointer",
                fontFamily: "var(--font-body)", fontSize: 12,
                color: "var(--gray-400)", textAlign: "center",
                minHeight: 44,
              }}
            >Clear basket</button>
          </div>
        )}
      </aside>
    </div>
  );
}

/* ── Data ────────────────────────────────────────────────────────────────── */
const PRODUCTS: Product[] = [
  // A11Y-SEED 7 (LOW) — redundant alt text: screen readers already announce
  // the element as an image, so the "Image of" prefix is duplicated noise.
  { id: 1, name: "Butter Croissant", category: "Viennoiserie", price: 4.50, description: "72 layers of French butter, shatteringly crisp outside and pillowy within.", image: "https://images.unsplash.com/photo-1450862479751-84eeaf2fcca4?w=600&h=480&fit=crop&auto=format", alt: "Image of seven golden butter croissants on a metal tray", badge: "Best Seller" },
  { id: 2, name: "Sourdough Miche", category: "Breads", price: 12.00, description: "78% hydration country loaf, 24-hour cold ferment. Tangy, open crumb, thick crust.", image: "https://images.unsplash.com/photo-1568254183919-78a4f43a2877?w=600&h=480&fit=crop&auto=format", alt: "Artisan breads displayed on wooden bakery shelves" },
  { id: 3, name: "Raspberry Rose Tart", category: "Pastries", price: 8.50, description: "Almond frangipane, fresh raspberries, rosewater custard in a butter tart shell.", image: "https://images.unsplash.com/photo-1534432182912-63863115e106?w=600&h=480&fit=crop&auto=format", alt: "Pastries with chocolate dollops on display in a bakery", badge: "New" },
  { id: 4, name: "Pain au Chocolat", category: "Viennoiserie", price: 5.00, description: "Two batons of Valrhona 70% dark chocolate folded into laminated dough.", image: "https://images.unsplash.com/photo-1597528662465-55ece5734101?w=600&h=480&fit=crop&auto=format", alt: "Croissants and chocolate pastries on a wooden board" },
  { id: 5, name: "Honey Brioche", category: "Breads", price: 9.00, description: "Enriched dough with local wildflower honey, baked in a Pullman tin.", image: "https://images.unsplash.com/photo-1549413468-cd78edb7e75c?w=600&h=480&fit=crop&auto=format", alt: "View of baked bread on jute cloth" },
  { id: 6, name: "Canelé Bordelais", category: "Pastries", price: 3.75, description: "Rum-and-vanilla custard baked in copper moulds — lacquered crust, custardy heart.", image: "https://images.unsplash.com/photo-1483695028939-5bb13f8648b0?w=600&h=480&fit=crop&auto=format", alt: "Close-up of baked treats arranged on a tray" },
  { id: 7, name: "Seeded Rye Loaf", category: "Breads", price: 11.00, description: "60% rye, sunflower seeds, caraway. Dense moist crumb with earthy depth.", image: "https://images.unsplash.com/photo-1567891026259-c133718572a4?w=600&h=480&fit=crop&auto=format", alt: "Shallow focus photography of rustic seeded bread" },
  { id: 8, name: "Kouign-Amann", category: "Viennoiserie", price: 6.50, description: "Breton caramelised pastry — yeasted dough folded with salted butter and coarse sugar.", image: "https://images.unsplash.com/photo-1712262583546-8caaeb0e4761?w=600&h=480&fit=crop&auto=format", alt: "Croissants on a white marble counter", badge: "Seasonal" },
];

const CATEGORIES = ["All", "Breads", "Viennoiserie", "Pastries"];

/* ── App ─────────────────────────────────────────────────────────────────── */
export default function App() {
  const [category, setCategory] = useState("All");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  // Ref on the cart trigger so focus returns when the drawer closes
  const cartTriggerRef = useRef<HTMLButtonElement>(null);

  const openCart = useCallback(() => setCartOpen(true), []);
  const closeCart = useCallback(() => {
    setCartOpen(false);
    // Return focus to the trigger that opened the drawer
    requestAnimationFrame(() => cartTriggerRef.current?.focus());
  }, []);

  const totalItems = cart.reduce((s, i) => s + i.qty, 0);
  const totalPrice = cart.reduce((s, i) => s + i.product.price * i.qty, 0);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const ex = prev.find((i) => i.product.id === product.id);
      if (ex) return prev.map((i) => i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { product, qty: 1 }];
    });
  };
  const removeFromCart = (id: number) => {
    setCart((prev) => {
      const ex = prev.find((i) => i.product.id === id);
      if (!ex) return prev;
      if (ex.qty === 1) return prev.filter((i) => i.product.id !== id);
      return prev.map((i) => i.product.id === id ? { ...i, qty: i.qty - 1 } : i);
    });
  };
  const getQty = (id: number) => cart.find((i) => i.product.id === id)?.qty ?? 0;
  const filtered = category === "All" ? PRODUCTS : PRODUCTS.filter((p) => p.category === category);

  return (
    <div style={{ minHeight: "100vh", background: "var(--background)" }}>

      {/* ── Skip link — first focusable element (toolkit rule 1) ── */}
      <a href="#main-content" className="skip-link">Skip to main content</a>

      {/* ── Sticky header ── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 40,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 48px", height: 64,
        background: "rgba(255,245,246,0.92)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--petal-100)",
      }}>
        {/* wordmark */}
        <div aria-label="Pétale Boulangerie et Pâtisserie">
          <p style={{ fontFamily: "var(--font-display)", fontSize: 24, color: "var(--rose-200)", margin: 0, lineHeight: 1 }}>Pétale.</p>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--gray-400)", margin: 0 }}>
            Boulangerie &amp; Pâtisserie
          </p>
        </div>

        {/* nav — landmarks per toolkit */}
        <nav aria-label="Site navigation" style={{ display: "flex", gap: 32, alignItems: "center" }}>
          {["Menu", "About", "Visit Us"].map((l) => (
            <a key={l} href="#"
              style={{ fontFamily: "var(--font-semi)", fontWeight: 600, fontSize: 13, color: "var(--charcoal)", textDecoration: "none" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--primary)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--charcoal)")}
            >{l}</a>
          ))}

          {/* Cart trigger — aria-expanded signals drawer state (toolkit rule) */}
          <button
            ref={cartTriggerRef}
            onClick={openCart}
            aria-label={`Open order cart${totalItems > 0 ? `, ${totalItems} item${totalItems !== 1 ? "s" : ""}` : ""}`}
            aria-expanded={cartOpen}
            aria-haspopup="dialog"
            style={{
              position: "relative", background: "none", border: "none",
              cursor: "pointer", padding: 0, color: "var(--charcoal)",
              display: "flex", alignItems: "center", gap: 8,
              minHeight: 44, minWidth: 44,
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            {totalItems > 0 && (
              <>
                <span style={{
                  position: "absolute", top: -2, right: 36,
                  minWidth: 16, height: 16, borderRadius: 8,
                  background: "var(--primary)", color: "var(--primary-foreground)",
                  fontFamily: "var(--font-bold)", fontWeight: 700, fontSize: 9,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  padding: "0 3px",
                }} aria-hidden="true">{totalItems}</span>
                <span style={{ fontFamily: "var(--font-semi)", fontWeight: 600, fontSize: 13, color: "var(--primary)" }}>
                  Order
                </span>
              </>
            )}
          </button>
        </nav>
      </header>

      {/* ── Hero ── */}
      <section aria-label="Hero" style={{ position: "relative", minHeight: 440, overflow: "hidden", background: "var(--charcoal)" }}>
        {/* A11Y-SEED 1 (CRITICAL) — WCAG 1.1.1 Non-text Content:
            informative image with no alt attribute at all. */}
        <img
          src="https://images.unsplash.com/photo-1568254183919-78a4f43a2877?w=1400&h=560&fit=crop&auto=format"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.55 }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(17,17,17,0.7) 0%, rgba(178,26,55,0.2) 100%)" }} aria-hidden="true" />
        <div style={{ position: "relative", zIndex: 1, padding: "80px 48px" }}>
          <p style={{ fontFamily: "var(--font-bold)", fontWeight: 700, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.3em", color: "var(--punch-500)", margin: "0 0 16px" }}>
            Baked fresh daily · Paris, TX
          </p>
          {/* Single h1 per page */}
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(40px, 6vw, 72px)", lineHeight: 1.05, color: "#fff", margin: "0 0 16px", maxWidth: 680 }}>
            The art of<br /><em>slow baking.</em>
          </h1>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 15, lineHeight: 1.6, color: "rgba(255,255,255,0.75)", margin: "0 0 32px", maxWidth: 440 }}>
            Every loaf and pastry is hand-shaped in small batches. Order by 8 pm for next-morning pickup.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <PrimaryBtn onClick={() => document.getElementById("main-content")?.scrollIntoView({ behavior: "smooth" })}>
              Browse the Menu
            </PrimaryBtn>
            <SecondaryBtn>Our Story</SecondaryBtn>
          </div>
        </div>
      </section>

      {/* ── Menu — id matches skip-link target ── */}
      <main id="main-content" tabIndex={-1} style={{ padding: "64px 48px", maxWidth: 1200, margin: "0 auto" }}>

        {/* h2 section header */}
        <div style={{ paddingBottom: 24, borderBottom: "2px solid var(--petal-100)", marginBottom: 32 }}>
          <p style={{ fontFamily: "var(--font-bold)", fontWeight: 700, fontSize: 12, textTransform: "uppercase", color: "var(--classic-700)", margin: "0 0 12px" }}>
            Today's Selection
          </p>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 36, color: "var(--charcoal)", margin: 0, lineHeight: 1.1 }}>
              Order Fresh Bakes
            </h2>
            {/* category filter */}
            <div role="group" aria-label="Filter products by category" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {CATEGORIES.map((c) => (
                <CategoryPill key={c} active={category === c} onClick={() => setCategory(c)}>{c}</CategoryPill>
              ))}
            </div>
          </div>
        </div>

        {/* Live region announces filter result count to screen readers */}
        <p
          aria-live="polite"
          aria-atomic="true"
          style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap" }}
        >
          {filtered.length} product{filtered.length !== 1 ? "s" : ""} shown
        </p>

        <div
          role="list"
          aria-label="Bakery products"
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 }}
        >
          {filtered.map((product) => (
            <div key={product.id} role="listitem">
              <ProductCard
                product={product}
                qty={getQty(product.id)}
                onAdd={() => addToCart(product)}
                onRemove={() => removeFromCart(product.id)}
              />
            </div>
          ))}
        </div>
      </main>

      {/* ── Info strip ── */}
      {/* A11Y-SEED 6 (MODERATE) — WCAG 4.1.2 / ARIA: aria-labelledby points at
          an element id that does not exist anywhere in the document, so the
          landmark ends up with no accessible name. */}
      <section aria-labelledby="bakery-info-heading" style={{ background: "var(--card)", borderTop: "1px solid var(--petal-100)", borderBottom: "1px solid var(--petal-100)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 48px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 32 }}>
          {[
            { icon: "🌅", label: "Hours", value: "Tue–Sun · 7 am – 2 pm" },
            { icon: "📍", label: "Location", value: "14 Rue des Roses, Paris TX 75460" },
            { icon: "📞", label: "Orders", value: "(903) 555-0182 · Order by 8 pm" },
          ].map(({ icon, label, value }) => (
            <div key={label} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <span aria-hidden="true" style={{ fontSize: 20 }}>{icon}</span>
              <div>
                <p style={{ fontFamily: "var(--font-bold)", fontWeight: 700, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--primary)", margin: "0 0 4px" }}>{label}</p>
                <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--gray-600)", margin: 0 }}>{value}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Accessibility commitment — DS SectionAccessibility pattern ── */}
      <section aria-labelledby="a11y-heading" style={{ padding: "64px 48px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ background: "var(--teal-soft)", border: "1px solid var(--teal-deep)", borderRadius: 20, padding: 40, display: "flex", flexDirection: "column", gap: 28 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--teal-deep)" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            {/* A11Y-SEED 5 (MODERATE) — WCAG 1.3.1 Info and Relationships:
                heading level jumps from h2 straight to h5, skipping h3 and h4. */}
            <h5 id="a11y-heading" style={{ fontFamily: "var(--font-display)", fontSize: 28, color: "var(--teal-deep)", margin: 0 }}>
              Our Accessibility Commitment
            </h5>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {[
              { title: "Contrast Threshold Rules", body: "All interactive elements and body copy meet a minimum 4.5:1 contrast ratio on light backgrounds (WCAG 2.1 AA). Light pinks are used decoratively only." },
              { title: "44px Minimum Touch Targets", body: "Every button and interactive element meets the 44×44 px touch target specification from the Rosé Design System, ensuring accessibility on mobile devices." },
              { title: "Color Is Not the Only Signal", body: "Errors include explicit warning icons plus explanatory text. Focus states use a solid 2px charcoal outline visible regardless of color perception." },
            ].map(({ title, body }) => (
              <div key={title} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <p style={{ fontFamily: "var(--font-bold)", fontWeight: 700, fontSize: 13, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--teal-deep)", margin: 0 }}>{title}</p>
                <p style={{ fontFamily: "var(--font-body)", fontSize: 13, lineHeight: 1.5, color: "var(--charcoal)", margin: 0 }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ padding: "24px 48px", borderTop: "1px solid var(--petal-100)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <p style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 14, color: "var(--gray-600)", margin: 0 }}>
          Pétale Boulangerie &amp; Pâtisserie
        </p>

        {/* A11Y-SEED 8 (LOW) — WCAG 2.4.4 Link Purpose: link text conveys no
            destination when read out of context in a links list. */}
        <a href="#" style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--gray-600)" }}>
          Click here
        </a>

        {/* A11Y-SEED 2 (CRITICAL) — WCAG 4.1.2 Name, Role, Value:
            icon-only button with no accessible name (no text, no aria-label,
            and the only child is aria-hidden). */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          style={{
            width: 44, height: 44, borderRadius: "50%", border: "none",
            background: "var(--secondary)", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--secondary-foreground)",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" />
          </svg>
        </button>

        {/* A11Y-SEED 3 (SERIOUS) — WCAG 1.4.3 Contrast (Minimum):
            #ffd9de on the blush background is roughly 1.2:1, far below 4.5:1.
            A11Y-SEED 4 (LOW) — WCAG 4.1.1: duplicate id, "main-content" is
            already used by the <main> element above. */}
        <p
          id="main-content"
          style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "#ffd9de", margin: 0 }}
        >
          © 2026 · All items subject to availability · Rosé Design System
        </p>
      </footer>

      {/* ── Cart drawer ── */}
      {cartOpen && (
        <CartDrawer
          items={cart}
          onClose={closeCart}
          onAdd={(id) => { const p = PRODUCTS.find((p) => p.id === id); if (p) addToCart(p); }}
          onRemove={removeFromCart}
          onClear={() => setCart([])}
        />
      )}

      {/* ── Floating mobile order bar ── */}
      {totalItems > 0 && !cartOpen && (
        <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", zIndex: 40 }}>
          <button
            onClick={openCart}
            aria-label={`View order, ${totalItems} item${totalItems !== 1 ? "s" : ""}, $${totalPrice.toFixed(2)}`}
            aria-haspopup="dialog"
            style={{
              display: "flex", alignItems: "center", gap: 10,
              height: 48, padding: "0 24px", borderRadius: 24,
              background: "var(--primary)", color: "var(--primary-foreground)",
              fontFamily: "var(--font-semi)", fontWeight: 600, fontSize: 14,
              border: "none", cursor: "pointer",
              boxShadow: "0 8px 24px rgba(209,44,75,0.35)",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            View Order · ${totalPrice.toFixed(2)}
          </button>
        </div>
      )}
    </div>
  );
}
