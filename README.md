# PREVENT 心腎代謝風險變數模擬器

以繁體中文呈現的單頁互動式教學工具，用於觀察年齡、血壓、BMI、糖尿病、吸菸、腎功能、蛋白尿與社會剝奪程度等因素，如何影響模擬的 10 年心血管事件風險與心血管－腎臟－代謝（CKM）分期。

[開啟線上版本](https://yht5582-source.github.io/prevent/)

> [!IMPORTANT]
> 本專案是概念展示與教學用模擬器。程式使用自訂的簡化加權邏輯，**並未實作或驗證美國心臟學會（AHA）正式 PREVENT 方程式**，輸出的風險百分比與 CKM 分期不得用於診斷、治療、用藥或其他臨床決策。需要正式風險評估時，請使用 [AHA PREVENT Calculator](https://professional.heart.org/en/guidelines-and-statements/prevent-calculator) 或經驗證的正式實作。

## 專案功能

- 即時調整臨床與社會環境變數，無須重新整理頁面。
- 顯示模擬的 10 年總心血管事件風險，涵蓋心肌梗塞、中風與心臟衰竭的概念性呈現。
- 依模擬結果區分低、中度／臨界及高風險。
- 以簡化規則顯示 CKM Stage 0 至 Stage 3。
- 在高 SDI 情境下顯示社會環境風險提醒。
- 採響應式雙欄版面，可於桌面與行動裝置使用。

## 輸入項目

| 類別 | 變數 | 頁面可調範圍 |
| --- | --- | --- |
| 基本資料 | 年齡 | 30–79 歲 |
| 心血管 | 收縮壓 | 90–200 mmHg |
| 代謝 | BMI | 18.0–40.0 kg/m² |
| 共病與行為 | 糖尿病、吸菸 | 是／否 |
| 腎臟 | eGFR | 15–120 mL/min |
| 腎臟 | uACR | 0–1000 mg/g |
| 社會健康決定因素 | SDI | 1–10 分 |

所有輸入都在瀏覽器端處理；本專案沒有後端服務、資料庫或病人資料上傳功能。

## 模擬邏輯

目前實作會以年齡作為基礎值，再依收縮壓、BMI、糖尿病、吸菸、eGFR 與 uACR 加上不同權重。當基礎風險高於 5% 時，SDI 會套用下列示範性倍率：

| SDI | 類別 | 模擬倍率 |
| --- | --- | --- |
| 1–3 | 低度剝奪 | 0.90 |
| 4–6 | 中度剝奪 | 1.00 |
| 7–10 | 高度剝奪 | 1.25 |

風險結果會限制在 0.1% 至 99.9%，並依下列門檻顯示：

| 模擬風險 | 顯示分類 |
| --- | --- |
| < 7.5% | 低風險 |
| 7.5%–< 20% | 中度／臨界風險 |
| ≥ 20% | 高風險 |

這些權重與門檻僅描述目前程式的行為，不代表正式 PREVENT 係數或完整 CKM 臨床定義。正式 PREVENT 模型另包含此頁面未收集的必要變數，例如生理性別、總膽固醇、HDL-C 與降壓治療狀態，並有不同結局與時間範圍的專屬方程式。

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
├── .github/workflows/pages.yml  # GitHub Pages 部署流程
├── .nojekyll                    # 停用 Jekyll 處理
├── index.html                   # GitHub Pages 入口與重新導向
├── prevent_simulatorSDI.html    # 介面、樣式與模擬邏輯
└── README.md                    # 專案說明
```

## 技術說明

- HTML5、CSS3 與原生 JavaScript。
- 無 npm、套件管理器或外部 JavaScript 相依套件。
- 推送至 `main` 後，由 GitHub Actions 工作流程部署至 GitHub Pages。

## 臨床與研究限制

- 未使用 AHA 授權的 PREVENT 原始碼或正式模型係數。
- 未經外部驗證、校準、區辨度分析或特定族群驗證。
- 缺少正式 PREVENT 計算所需的部分核心輸入。
- SDI 以 1–10 的教學尺度表示，不是由正式地理資料或 ZIP code 推算。
- CKM 分期為簡化規則，未涵蓋完整病史、症狀、心血管疾病與亞臨床疾病判定。
- 不儲存資料不等同於符合醫療資訊安全或個資法規要求；請勿輸入可識別個人的資料。

## 參考資料

- [AHA PREVENT Calculator 官方介紹](https://professional.heart.org/en/guidelines-and-statements/about-prevent-calculator)
- [AHA PREVENT 線上計算器](https://professional.heart.org/en/guidelines-and-statements/prevent-calculator)
- [PREVENT Equations Quickstart Guide](https://professional.heart.org/-/media/PHD-Files/Guidelines-and-Statements/PREVENT/PREVENT-Equations-Quickstart-Guide.pdf)

## 授權

此 repository 目前未提供 `LICENSE` 檔案。除非另有明確授權，原始碼的使用、修改與散布權利均由著作權人保留。
