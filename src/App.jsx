import { useEffect, useMemo, useState, useCallback } from "react";

const API = "https://api.freeapi.app/api/v1/public/meals";

// ─────────────────────────────────────────────────────────
// THEME
// ─────────────────────────────────────────────────────────
const THEME = {
  bg: "#050505",
  surface: "#0d0d0d",
  card: "#111111",
  cardHover: "#181818",

  border: "rgba(255,255,255,0.06)",
  borderStrong: "rgba(255,255,255,0.12)",

  text: "#f5f5f5",
  soft: "#b4b4b4",
  muted: "#666",

  gold: "#d4af37",
  goldSoft: "rgba(212,175,55,0.12)",

  green: "#4ade80",
  orange: "#fb923c",
  red: "#f87171",

  shadow: "0 20px 60px rgba(0,0,0,0.45)",
};

// ─────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────
function getIngredients(meal) {
  const out = [];

  for (let i = 1; i <= 20; i++) {
    const ing = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];

    if (ing?.trim()) {
      out.push({
        name: ing,
        measure,
      });
    }
  }

  return out;
}

function getDifficulty(meal) {
  const count = getIngredients(meal).length;

  if (count <= 5) {
    return {
      label: "Easy",
      color: THEME.green,
    };
  }

  if (count <= 10) {
    return {
      label: "Medium",
      color: THEME.orange,
    };
  }

  return {
    label: "Hard",
    color: THEME.red,
  };
}

function getCookingTime(meal) {
  const words =
    meal.strInstructions?.split(" ").length || 0;

  return Math.max(10, Math.floor(words / 18));
}

function getNutrition(meal) {
  const ingredients = getIngredients(meal).length;

  return {
    calories: 180 + ingredients * 45,
    protein: 10 + ingredients * 2,
    carbs: 20 + ingredients * 3,
    fat: 6 + ingredients,
  };
}

function getSteps(instructions) {
  return instructions
    ?.split(".")
    .filter((x) => x.trim().length > 20);
}

function loadFavs() {
  try {
    return JSON.parse(
      localStorage.getItem("aurelia_favs") || "[]"
    );
  } catch {
    return [];
  }
}

function saveFavs(ids) {
  localStorage.setItem(
    "aurelia_favs",
    JSON.stringify(ids)
  );
}

// ─────────────────────────────────────────────────────────
// BACKGROUND
// ─────────────────────────────────────────────────────────
function LuxuryBackground() {
  return (
    <>
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          background: `
          radial-gradient(circle at top left, rgba(212,175,55,0.09), transparent 25%),
          radial-gradient(circle at bottom right, rgba(255,255,255,0.04), transparent 25%),
          #050505
        `,
        }}
      />

      <div
        style={{
          position: "fixed",
          width: 450,
          height: 450,
          top: -150,
          left: -120,
          borderRadius: "50%",
          background: "rgba(212,175,55,0.08)",
          filter: "blur(120px)",
        }}
      />

      <div
        style={{
          position: "fixed",
          width: 450,
          height: 450,
          bottom: -150,
          right: -120,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.04)",
          filter: "blur(120px)",
        }}
      />
    </>
  );
}

// ─────────────────────────────────────────────────────────
// CARD
// ─────────────────────────────────────────────────────────
function MealCard({
  meal,
  onOpen,
  isFav,
  onToggleFav,
}) {
  const difficulty = getDifficulty(meal);
  const time = getCookingTime(meal);

  return (
    <div
      onClick={() => onOpen(meal)}
      style={{
        background: THEME.card,
        borderRadius: 26,
        overflow: "hidden",
        border: `1px solid ${THEME.border}`,
        cursor: "pointer",
        transition: "0.35s",
        boxShadow: THEME.shadow,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform =
          "translateY(-8px)";
        e.currentTarget.style.borderColor =
          "rgba(212,175,55,0.25)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform =
          "translateY(0px)";
        e.currentTarget.style.borderColor =
          THEME.border;
      }}
    >
      {/* IMAGE */}
      <div
        style={{
          position: "relative",
          aspectRatio: "4/3",
        }}
      >
        <img
          src={meal.strMealThumb}
          alt={meal.strMeal}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />

        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(0,0,0,0.9), transparent)",
          }}
        />

        {/* HEART */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFav(meal.idMeal);
          }}
          style={{
            position: "absolute",
            top: 16,
            right: 16,

            width: 40,
            height: 40,

            borderRadius: "50%",
            border: "none",

            background: isFav
              ? THEME.gold
              : "rgba(0,0,0,0.5)",

            color: isFav ? "#000" : "#fff",

            cursor: "pointer",
            fontSize: 16,
          }}
        >
          {isFav ? "♥" : "♡"}
        </button>

        {/* CATEGORY */}
        <div
          style={{
            position: "absolute",
            left: 16,
            bottom: 16,

            padding: "7px 14px",
            borderRadius: 999,

            background: "rgba(0,0,0,0.45)",
            backdropFilter: "blur(10px)",

            color: "#fff",
            fontSize: 11,
            fontWeight: 700,
          }}
        >
          {meal.strCategory}
        </div>
      </div>

      {/* BODY */}
      <div
        style={{
          padding: 22,
        }}
      >
        {/* TOP */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{
              color: THEME.gold,
              fontSize: 12,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              fontWeight: 700,
            }}
          >
            {meal.strArea}
          </span>

          <div
            style={{
              padding: "6px 12px",
              borderRadius: 999,
              background: difficulty.color,

              color: "#fff",
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            {difficulty.label}
          </div>
        </div>

        {/* TITLE */}
        <h2
          style={{
            marginTop: 14,
            color: THEME.text,
            fontSize: 22,
            lineHeight: 1.3,
            fontWeight: 800,
            fontFamily:
              "'Playfair Display', serif",
          }}
        >
          {meal.strMeal}
        </h2>

        {/* DESC */}
        <p
          style={{
            marginTop: 12,
            color: THEME.soft,
            fontSize: 13,
            lineHeight: 1.8,
          }}
        >
          Elegant handcrafted recipe filled with
          delicious flavors and premium ingredients.
        </p>

        {/* INFO */}
        <div
          style={{
            marginTop: 18,
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              padding: "8px 12px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.04)",
              color: THEME.soft,
              fontSize: 12,
            }}
          >
            ⏱️ {time} mins
          </div>

          <div
            style={{
              padding: "8px 12px",
              borderRadius: 999,
              background: THEME.goldSoft,
              color: THEME.gold,
              fontSize: 12,
            }}
          >
            🔥 {getNutrition(meal).calories} kcal
          </div>
        </div>

        {/* BUTTON */}
        <button
          style={{
            marginTop: 22,
            width: "100%",
            height: 50,

            borderRadius: 14,
            border: "none",

            background: THEME.gold,
            color: "#000",

            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          View Recipe
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// MODAL
// ─────────────────────────────────────────────────────────
function MealModal({ meal, onClose }) {
  if (!meal) return null;

  const ingredients = getIngredients(meal);
  const steps = getSteps(meal.strInstructions);
  const nutrition = getNutrition(meal);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,

        background: "rgba(0,0,0,0.82)",
        backdropFilter: "blur(16px)",

        display: "flex",
        justifyContent: "center",
        alignItems: "center",

        padding: 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 1100,
          maxHeight: "92vh",

          overflowY: "auto",

          borderRadius: 30,

          background: THEME.surface,
          border: `1px solid ${THEME.borderStrong}`,

          boxShadow: THEME.shadow,
        }}
      >
        {/* HERO */}
        <div
          style={{
            position: "relative",
            height: 340,
          }}
        >
          <img
            src={meal.strMealThumb}
            alt={meal.strMeal}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />

          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to top,#0d0d0d,transparent)",
            }}
          />

          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: 20,
              right: 20,

              width: 44,
              height: 44,

              borderRadius: "50%",
              border: "none",

              background: "rgba(0,0,0,0.6)",
              color: "#fff",

              fontSize: 18,
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>

        {/* CONTENT */}
        <div
          style={{
            padding: 40,
          }}
        >
          <p
            style={{
              color: THEME.gold,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            {meal.strCategory} • {meal.strArea}
          </p>

          <h1
            style={{
              marginTop: 14,
              color: THEME.text,
              fontSize: 44,
              lineHeight: 1.1,
              fontFamily:
                "'Playfair Display', serif",
            }}
          >
            {meal.strMeal}
          </h1>

          {/* NUTRITION */}
          <div
            style={{
              marginTop: 30,
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(140px,1fr))",
              gap: 16,
            }}
          >
            {[
              {
                label: "Calories",
                value: `${nutrition.calories} kcal`,
              },
              {
                label: "Protein",
                value: `${nutrition.protein}g`,
              },
              {
                label: "Carbs",
                value: `${nutrition.carbs}g`,
              },
              {
                label: "Fat",
                value: `${nutrition.fat}g`,
              },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  padding: 18,
                  borderRadius: 18,
                  background: THEME.card,
                  border: `1px solid ${THEME.border}`,
                }}
              >
                <p
                  style={{
                    color: THEME.muted,
                    fontSize: 12,
                  }}
                >
                  {item.label}
                </p>

                <h3
                  style={{
                    marginTop: 8,
                    color: THEME.gold,
                    fontSize: 22,
                  }}
                >
                  {item.value}
                </h3>
              </div>
            ))}
          </div>

          {/* GRID */}
          <div
            style={{
              marginTop: 40,
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(320px,1fr))",
              gap: 40,
            }}
          >
            {/* INGREDIENTS */}
            <div>
              <h3
                style={{
                  color: THEME.gold,
                  marginBottom: 18,
                  fontSize: 22,
                }}
              >
                Ingredients
              </h3>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                {ingredients.map((item, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "14px 16px",
                      borderRadius: 14,

                      background: THEME.card,
                      border: `1px solid ${THEME.border}`,

                      color: THEME.soft,
                    }}
                  >
                    <strong
                      style={{
                        color: THEME.gold,
                      }}
                    >
                      {item.measure}
                    </strong>{" "}
                    {item.name}
                  </div>
                ))}
              </div>
            </div>

            {/* STEPS */}
            <div>
              <h3
                style={{
                  color: THEME.gold,
                  marginBottom: 18,
                  fontSize: 22,
                }}
              >
                Recipe Steps
              </h3>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                }}
              >
                {steps?.map((step, i) => (
                  <div
                    key={i}
                    style={{
                      padding: 18,
                      borderRadius: 18,

                      background: THEME.card,
                      border: `1px solid ${THEME.border}`,
                    }}
                  >
                    <div
                      style={{
                        color: THEME.gold,
                        fontWeight: 700,
                        marginBottom: 10,
                      }}
                    >
                      Step {i + 1}
                    </div>

                    <p
                      style={{
                        color: THEME.soft,
                        lineHeight: 1.8,
                        fontSize: 14,
                      }}
                    >
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* YOUTUBE */}
          {meal.strYoutube && (
            <a
              href={meal.strYoutube}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "inline-flex",
                marginTop: 40,

                padding: "14px 30px",
                borderRadius: 999,

                background: THEME.gold,
                color: "#000",

                textDecoration: "none",
                fontWeight: 800,
              }}
            >
              ▶ Watch Recipe
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// APP
// ─────────────────────────────────────────────────────────
export default function App() {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [active, setActive] = useState(null);

  const [favIds, setFavIds] = useState(loadFavs);

  const [showFavs, setShowFavs] =
    useState(false);

  async function loadMeals() {
    try {
      setLoading(true);

      let all = [];

      for (let p = 1; p <= 4; p++) {
        const res = await fetch(
          `${API}?page=${p}&limit=12`
        );

        const json = await res.json();

        all = [...all, ...(json?.data?.data || [])];
      }

      const unique = Array.from(
        new Map(all.map((m) => [m.idMeal, m])).values()
      );

      setMeals(unique.slice(0, 48));
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMeals();
  }, []);

  const filtered = useMemo(() => {
    return meals.filter((m) => {
      const search = query.toLowerCase();

      const nameMatch = m.strMeal
        .toLowerCase()
        .includes(search);

      const ingredientMatch = getIngredients(
        m
      ).some((x) =>
        x.name.toLowerCase().includes(search)
      );

      const favMatch = showFavs
        ? favIds.includes(m.idMeal)
        : true;

      return (
        (nameMatch || ingredientMatch) &&
        favMatch
      );
    });
  }, [meals, query, favIds, showFavs]);

  const toggleFav = useCallback((id) => {
    setFavIds((prev) => {
      const next = prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id];

      saveFavs(next);

      return next;
    });
  }, []);

  const randomMeal = () => {
    if (!filtered.length) return;

    const random =
      filtered[
        Math.floor(Math.random() * filtered.length)
      ];

    setActive(random);
  };

  return (
    <>
      <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@600;700;800&display=swap');

      *{
        margin:0;
        padding:0;
        box-sizing:border-box;
      }

      body{
        background:#050505;
        font-family:'Inter',sans-serif;
      }

      ::-webkit-scrollbar{
        width:6px;
      }

      ::-webkit-scrollbar-thumb{
        background:rgba(212,175,55,0.3);
        border-radius:999px;
      }
      `}</style>

      <LuxuryBackground />

      <div
        style={{
          position: "relative",
          zIndex: 2,
          minHeight: "100vh",
        }}
      >
        {/* TOP NAVBAR */}
<div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",

    padding: "24px 32px",

    position: "sticky",
    top: 0,
    zIndex: 50,

    backdropFilter: "blur(18px)",

    background: "rgba(5,5,5,0.65)",

    borderBottom: `1px solid ${THEME.border}`,
  }}
>
  {/* LOGO */}
{/* SYMBOL LOGO */}
<div
  style={{
    width: 54,
    height: 54,

    borderRadius: 18,

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    background:
      "linear-gradient(135deg, rgba(212,175,55,0.22), rgba(255,255,255,0.04))",

    border: `1px solid rgba(212,175,55,0.18)`,

    backdropFilter: "blur(12px)",

    boxShadow:
      "0 10px 30px rgba(212,175,55,0.12)",
  }}
>
  <span
    style={{
      fontSize: 24,
      filter: "drop-shadow(0 0 12px rgba(212,175,55,0.4))",
    }}
  >
    🍽️
  </span>
</div>

  {/* NAV BUTTONS */}
  {/* NAV BUTTONS */}
<div
  style={{
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flex: 1,
    gap: 12,
    flexWrap: "wrap",
  }}
>
  {/* LEFT MENU (desktop + mobile wrap) */}
  <div
    style={{
      display: "flex",
      gap: 10,
      flexWrap: "wrap",
      justifyContent: "center",
      flex: 1,
    }}
  >
    {["Home", "Recipes", "Favorites", "Categories"].map(
      (item, i) => (
        <button
          key={i}
          style={{
            padding: "10px 16px",
            borderRadius: 999,
            border:
              item === "Home"
                ? "1px solid rgba(212,175,55,0.35)"
                : `1px solid ${THEME.border}`,

            background:
              item === "Home"
                ? THEME.goldSoft
                : "rgba(255,255,255,0.03)",

            color:
              item === "Home"
                ? THEME.gold
                : THEME.soft,

            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            whiteSpace: "nowrap",
            flex: "0 0 auto",
          }}
        >
          {item}
        </button>
      )
    )}
  </div>

  {/* RIGHT ACTION BUTTON */}
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      width: "100%",
      maxWidth: 160,
    }}
  >
    <button
      style={{
        padding: "10px 18px",
        borderRadius: 999,
        border: "none",
        background:
          "linear-gradient(135deg,#d4af37,#f5d76e)",
        color: "#000",
        fontWeight: 800,
        fontSize: 13,
        cursor: "pointer",
        width: "100%",
      }}
    >
      Sign Out
    </button>
  </div>
</div>
</div>
        {/* HERO */}
        <section
          style={{
            padding: "70px 24px 30px",
            textAlign: "center",
          }}
        >
          <p
            style={{
              color: THEME.gold,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            Curated Recipe Collection
          </p>

          <h1
            style={{
              marginTop: 18,
              fontSize: "clamp(42px,7vw,82px)",
              lineHeight: 0.95,

              fontWeight: 800,

              fontFamily:
                "'Playfair Display', serif",

              background:
                "linear-gradient(180deg,#ffffff 0%,#d4af37 180%)",

              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Aurelia
            <br />
            Recipes
          </h1>

          <p
            style={{
              maxWidth: 650,
              margin: "22px auto 0",

              color: THEME.soft,
              lineHeight: 1.8,
              fontSize: 14,
            }}
          >
            Discover gourmet meals, elegant
            cuisines, premium recipes, and delicious
            handcrafted dishes from around the world.
          </p>

          {/* SEARCH */}
          <div
            style={{
              margin: "30px auto 0",
              maxWidth: 700,
              display: "flex",
              gap: 14,
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <input
              value={query}
              onChange={(e) =>
                setQuery(e.target.value)
              }
              placeholder="Search meals or ingredients..."
              style={{
                flex: 1,
                minWidth: 260,
                height: 64,

                borderRadius: 999,

                border: `1px solid ${THEME.borderStrong}`,

                background:
                  "rgba(255,255,255,0.04)",

                padding: "0 24px",

                color: "#fff",
                fontSize: 14,

                outline: "none",
              }}
            />

            <button
              onClick={randomMeal}
              style={{
                height: 64,
                padding: "0 26px",

                borderRadius: 999,
                border: "none",

                background: THEME.gold,
                color: "#000",

                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              🎲 Surprise Me
            </button>

            <button
              onClick={() =>
                setShowFavs(!showFavs)
              }
              style={{
                height: 64,
                padding: "0 24px",

                borderRadius: 999,

                border: `1px solid ${THEME.borderStrong}`,

                background: showFavs
                  ? THEME.goldSoft
                  : "rgba(255,255,255,0.03)",

                color: showFavs
                  ? THEME.gold
                  : "#fff",

                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              ❤️ Favorites
            </button>
          </div>
        </section>

        {/* GRID */}
        <section
        
          style={{
            maxWidth: 1450,
            margin: "0 auto",
            padding: "20px 24px 90px",
          }}
        >
          {loading ? (
            <div
              style={{
                textAlign: "center",
                color: THEME.soft,
              }}
            >
              Loading recipes...
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fill,minmax(320px,1fr))",
                gap: 28,
              }}
            >
              {filtered.map((meal) => (
                <MealCard
                  key={meal.idMeal}
                  meal={meal}
                  onOpen={setActive}
                  isFav={favIds.includes(
                    meal.idMeal
                  )}
                  onToggleFav={toggleFav}
                />
              ))}
            </div>
          )}
        </section>

        {/* FOOTER */}
        <footer
          style={{
            borderTop: `1px solid ${THEME.border}`,
            padding: "34px 24px",
            textAlign: "center",
          }}
        >
          <h2
            style={{
              color: THEME.gold,
              fontFamily:
                "'Playfair Display', serif",
              fontSize: 30,
            }}
          >
            Aurelia Recipes
          </h2>

          <p
            style={{
              marginTop: 12,
              color: THEME.muted,
              fontSize: 13,
            }}
          >
            Gourmet Recipes • Elegant Cuisine •
            Premium Taste
          </p>
        </footer>
      </div>

      <MealModal
        meal={active}
        onClose={() => setActive(null)}
      />
    </>
  );
}
