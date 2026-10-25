# PREVENT 心腎代謝風險變數模擬器

以繁體中文呈現的單頁互動式工具：實作 AHA **PREVENT 方程式**（Khan SS, et al. *Circulation* 2024;149:430–449），計算 10 年與 30 年總心血管疾病（CVD）、ASCVD 與心衰竭風險，並以「同一位病人只改變 SDI」的方式呈現社會剝奪指數的影響，同時依 AHA 2023 CKM advisory 判定心血管－腎臟－代謝分期。

[開啟線上版本](https://yht5582-source.github.io/prevent/)

> [!IMPORTANT]
> 係數取自 PREVENT 原始發表，並以 R 套件 [preventr](https://github.com/martingmayer/preventr) 0.12.1 的 300 組隨機病例（涵蓋 base / UACR / HbA1c / SDI / full 五種模型）逐項驗證到小數第三位。本頁為教學與臨床輔助用途，不取代醫師判斷；正式評估請以 [AHA PREVENT Calculator](https://professional.heart.org/en/guidelines-and-statements/prevent-calculator) 為準。

## 功能

- **PREVENT 五種模型自動切換**：只填必要變數用 base model；啟用 UACR、HbA1c 或 SDI 時依 preventr 的規則切換到對應模型或 full model（缺項以 missing 指標處理）。
- **10 年與 30 年風險**：總 CVD、ASCVD、心衰竭；>59 歲的 30 年估計標示為可信度低。
- **SDI 對照**：同一位病人在 SDI 1–3 / 4–6 / 7–10 / 未知時的 10 年總 CVD，並計算倍數與絕對差。
- **CKM 分期 0–4**：過度脂肪（亞洲 BMI ≥23 / 腰圍切點）、糖尿病前期、高血壓、高 TG、代謝症候群、KDIGO CKD 風險、亞臨床/臨床 CVD、PREVENT ≥20%。
- **臨床對照**：10 年 ASCVD 依 2026 ACC/AHA 血脂指引分層（<3%、3–<5%、5–<10%、≥10%）；第 1 期高血壓依 2025 AHA/ACC 指引以 PREVENT 總 CVD ≥7.5% 作為用藥門檻。
- 身高體重換算 BMI、肌酸酐以 CKD-EPI 2021（不含種族）換算 eGFR、範例病例、複製摘要、手機底部即時風險列。

## 輸入項目與有效範圍（同 preventr）

| 變數 | 範圍 |
| --- | --- |
| 年齡 | 30–79 歲 |
| 總膽固醇 / HDL-C | 130–320 / 20–100 mg/dL |
| 收縮壓 | 90–180 mmHg |
| BMI | 18.5–39.9 kg/m² |
| eGFR | 15–140 mL/min/1.73m² |
| UACR（選填） | 0.1–25000 mg/g |
| HbA1c（選填） | 4.5–15 % |
| SDI（選填） | 1–10 十分位 |
| 性別、降壓藥、statin、糖尿病、吸菸 | 是／否 |

超出範圍時不計算並標示紅字。已有臨床 CVD 者 PREVENT 不適用（頁面會提示）。

## 限制

- SDI 是美國 ZIP code 對應的社會剝奪指數十分位，台灣沒有對應的官方資料，SDI 對照僅供教學。
- PREVENT 於美國族群建立，未在台灣族群校準。
- CKM 分期依輸入資料推定；CKD 需持續 >3 個月，高血壓需重複測量確認。

## 使用方式

### 線上使用

直接前往：<https://yht5582-source.github.io/prevent/>

### 本機使用

本專案不需要安裝套件或建置工具。下載 repository 後，可直接開啟 `index.html`；它會導向主要模擬器頁面。

若瀏覽器限制本機檔案載入，也可以在專案目錄啟動簡易靜態伺服器：

```bash
python3 -m http.server 8000
```

接著開啟 <http://localhost:8000/>。

## 專案結構

```text
.
├── index.html                   # 重新導向到主頁
├── prevent_simulatorSDI.html    # 介面、樣式與 PREVENT 引擎（/*ENGINE-START*/…/*ENGINE-END*/）
├── tests.cjs                    # node tests.cjs：引擎 vs preventr 參考值、KDIGO、CKM
├── tests-reference.json         # preventr 0.12.1 產生的 300 組參考病例
└── README.md
```

## 參考資料

- Khan SS, et al. Development and validation of the American Heart Association's PREVENT equations. *Circulation* 2024;149:430–449.
- Ndumele CE, et al. Cardiovascular-Kidney-Metabolic Health: A Presidential Advisory From the AHA. *Circulation* 2023;148:1606–1635.
- KDIGO 2024 CKD guideline（GFR × 白蛋白尿風險矩陣）。
- 2025 AHA/ACC High Blood Pressure Guideline；2026 ACC/AHA Dyslipidemia Guideline。
- [preventr](https://github.com/martingmayer/preventr)（R 實作，用於交叉驗證）。

## 授權

此 repository 目前未提供 `LICENSE` 檔案。除非另有明確授權，原始碼的使用、修改與散布權利均由著作權人保留。
