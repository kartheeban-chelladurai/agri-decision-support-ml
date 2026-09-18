import pathlib, html
from pygments import highlight
from pygments.lexers import PythonLexer
from pygments.formatters import HtmlFormatter

SNIPPETS = {
"code_yield_derivation": '''df = df.dropna(subset=["Area", "Production"])
df = df[(df["Area"] > 0) & (df["Production"] > 0)]

df["Yield"] = df["Production"] / df["Area"]

lo, hi = df["Yield"].quantile([0.01, 0.99])
df = df[(df["Yield"] >= lo) & (df["Yield"] <= hi)].copy()''',

"code_model_selection": '''for name, model in build_models().items():
    model.fit(X_train, y_train)
    comparison.append(evaluate(name, model, X_test, y_test))

best_name = max(comparison, key=lambda r: r["f1_weighted"])["model"]

search = GridSearchCV(base, grid, cv=5, scoring="accuracy", n_jobs=-1)
search.fit(X_train, y_train)
best_model = search.best_estimator_

cv = cross_val_score(best_model, X, y, cv=5, scoring="accuracy")
print(f"5-fold CV accuracy: {cv.mean():.4f} +/- {cv.std():.4f}")''',

"code_validation": '''if crop_clean not in set(le_crop.classes_):
    raise ValueError(
        f"Unknown crop {crop_clean!r}. This crop was not in the "
        f"training data ({len(le_crop.classes_)} crops known, e.g. "
        f"{', '.join(list(le_crop.classes_)[:5])})."
    )''',

"code_parity_test": '''def test_parity_yield_3(client):
    inputs = {"temperature": 36.0, "humidity": 42.0,
              "soil_moisture": 54.0, "area": 1254.0,
              "season": "Kharif", "crop": "Arecanut"}

    api_resp = client.post("/api/v1/predict/yield", json=inputs)
    direct_res = estimate_yield(**inputs)

    assert abs(api_resp.json()["prediction"]["yield_value"]
               - direct_res) < 1e-5''',
}

fmt = HtmlFormatter(noclasses=True, style="friendly", nowrap=True)
CSS = """
html,body{margin:0;padding:0;background:#fff}
.card{display:inline-block;background:#FBFBFC;border:1px solid #DCE0E4;
      border-radius:8px;padding:16px 20px 16px 0;margin:8px}
table{border-collapse:collapse}
td.ln{color:#AEB6BD;text-align:right;padding:0 14px 0 16px;
      border-right:1px solid #E5E9EC;user-select:none;
      font:400 13.5px 'DejaVu Sans Mono',monospace;line-height:1.62;
      vertical-align:top;white-space:pre}
td.code{padding:0 0 0 16px;font:400 13.5px 'DejaVu Sans Mono',monospace;
        line-height:1.62;vertical-align:top;white-space:pre;color:#24292F}
"""
for name, src in SNIPPETS.items():
    lines = src.split("\n")
    rows_n, rows_c = [], []
    for i, ln in enumerate(lines, 1):
        rows_n.append(str(i))
        rows_c.append(highlight(ln, PythonLexer(), fmt).rstrip("\n") or "&nbsp;")
    doc = (f"<meta charset=utf-8><style>{CSS}</style>"
           f"<div class='card'><table><tr>"
           f"<td class='ln'>{chr(10).join(rows_n)}</td>"
           f"<td class='code'>{chr(10).join(rows_c)}</td>"
           f"</tr></table></div>")
    pathlib.Path(f"{name}.html").write_text(doc)
    print("html:", name, f"({len(lines)} lines)")
