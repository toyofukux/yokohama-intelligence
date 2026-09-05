# 実装・公開状態

更新: 2026-09-06。現在は**人口・世帯の公開β版**です。[長期構想](VISION.md)のv1全体と市民利用目標は未達です。

## 公開先

- Web: https://open.yokohama
- MCP: https://open-yokohama-mcp.toyofukux.workers.dev/mcp
- OSS: https://github.com/toyofukux/open-yokohama

以下の過去の記録には変更前の名称・URLが含まれます。現在の接続状態は末尾の最新記録をご確認ください。

## 実装済み

- 計画・設計判断、段階別の受入条件、費用抑制方針。
- 公式人口CSVの32か月、9指標、横浜市+18区の5,472観測値。
- 原本不変保存、取得履歴、原典の行・列、参照日、改定番号、公開JSON/CSV。
- 欠測・重複・男女計・市区合計・密度・日付・原本ハッシュを検査するビルドゲート。
- 29の静的HTMLページ。トップ、18区詳細、比較、3つの解説、検索、出典、404等。
- 端末内検索、詳しさ切り替え、キーボード操作、スマホ表示、原本取得。
- MCP: 5つの読取ツール、都市/区リソース。公開JSONのみ参照し、LLM実行0。
- GitHub CI、週次更新検査ワークフロー、訂正テンプレート、MITとデータ帰属。

## 確認結果

- `pnpm verify`: lint、型、12件のテスト、原本照合、静的ビルドが合格。
- `pnpm test:e2e`: PC/スマホ計12件合格。主要4ページのWCAG A/AA自動検査で違反0。
- 内部リンク・アンカー1,319件の参照先を検査済み。
- `pnpm test:mcp`: ローカルworkerdと公開WorkerへSDKで実接続し、初期化・数値・時系列・18区・原典・Origin/サイズ制限を検証。
- 公式CSVの再取得: 同一内容は公開データを更新せず `unchanged` を返す。
- `pnpm audit`: 既知の脆弱性0（確認時点）。秘密パターン検査で検出0。
- スクリーンショットでPCとスマホの表示を確認。実装者による検証であり、独立レビューではありません。

- 公開Webでも12件のE2Eが合格。低速回線で比較選択が先行する不具合を修正し、回帰テストを追加しました。
- 公開MCPでもSDK接続検証に合格。
- GitHubをPUBLICに変更し、初期実装commit `d48e5fa2a06fee011b679ed78b9761b97b8f6682` をmainへpush済み。
- Web version: `e24a0a72-85f2-480f-9def-8254f99525e1`。
- MCP version: `b8830f57-3017-4f40-a54e-dac30c500dd2`。
- CI: https://github.com/toyofukux/yokohama-intelligence/actions/runs/33951787795 （初期実装commitで全ジョブ合格）。

## 残る開発・運用

1. 出生・死亡・転出入・年齢構成を取り込み、人口の理由を検証できるようにします。
2. 予算・決算・事業・成果を正しい会計/年度/政策単位で接続します。
3. 子育て・交通・防災等の課題を拡充。町丁・生活圏へ解像度を上げています。
4. AI文章生成→独立検証→人間承認の実フローを実装。現在あるのは契約と異常系テスト。
5. 市民10人の操作・理解テスト。8人以上が主要タスクを2分以内に完了し、重大な誤解0件が公開拡大条件。
6. 週次更新の実運用確認、訂正の担当体制、継続利用の測定、主要50指標・30課題への拡充。
7. 神戸・福岡との定義をそろえた比較と、公開基盤の長期構想の残項目。

人間の独立レビュー・市民利用テスト・WAU/再訪率は未実施です。実利用の成果を架空で計上しません。
公開Webは検証済みの公開データのみを参照します。

## 再開

正本: `docs/PLAN.md`。次の収集先と検証条件: `docs/DATA-ROADMAP.md`。数値更新: `docs/runbooks/data.md`。
外部参照repoは読み取りのみで変更していません。長期構想は[VISION.md](VISION.md)に整理しています。

## ローカル処理

実装中に使用した開発サーバーは作業終了時に停止します。再開はREADMEのコマンドを使います。

## 2026-09-05: 横浜の青と期間限定テーマ

- 基本配色を海の青・白・紺に変更。`packages/core/theme.ts`で通常配色・手動固定・期間を設定します。
- GREEN×EXPO 2027の開催期間だけ緑へ切り替え、終了時に青へ戻ります。静的配信のまま端末で判定します。
- URLの `?theme=yokohama` / `?theme=green-expo` でプレビューできます。
- `pnpm verify`合格（15件の単体テスト）。PC/スマホのE2Eは両配色・日時境界を含む18件で合格。
- Web version: `18af32de-f0d8-429a-8ed4-14dd92a27fc4`。
- 配色と運用手順: `docs/THEMES.md`。ドメイン10案: `docs/DOMAIN-CANDIDATES.md`。ドメインの選定・取得・DNS設定は未実施です。

## 2026-09-05: ドメイン手順と港の夜景

- ドメイン候補はユーザーが `open.yokohama` を優先。取得・DNS変更は未実施です。
- `docs/runbooks/domain.md` にPorkbun、Cloudflare Free、既存Workerへの接続、URL更新、MCP、確認・障害対応を記載しました。READMEからリンク済み。
- 横浜の座標で日の出・日没を端末内計算し、日没後から翌日の出まで港の夜景を適用。
- 濃紺の背景・金色の窓明かり・水面反射を追加。夜間のカード・フォーム・表・グラフも配色を統一。
- GREEN×EXPOは保留。期間設定を残し `enabled: false` に変更。公式素材は未使用です。
- `pnpm verify` 合格。その後追加した冬の照合・海外タイムゾーン検証も単体18件とE2E20件で合格。
- 公開環境でもPC/スマホ20件合格。夜景の実画面を両サイズで目視確認。
- 国立天文台の5日分との誤差3分未満を確認。演出用近似で、全日程の精度保証ではありません。
- Web version: `3cdbe1aa-9bc2-4a22-a1cd-2ed87d185092`。
- 追加の外部API通信・位置情報取得・サーバー処理なし。設定と制約は `docs/THEMES.md`。

## 2026-09-05: open.yokohama 接続準備（DNS競合で保留）

- Cloudflare APIでゾーンが正しいアカウントに属し `active` と確認。公開NSも指定値と一致。
- `wrangler.jsonc` に `open.yokohama` のCustom Domainを追加。接続はGitを正本に管理します。
- Astroの既定URL、サイトマップ、READMEを新URLに更新。旧 `workers.dev` は維持。
- `pnpm verify` 合格。更新後の旧公開URLでPC/スマホ20件のE2E合格。
- デプロイでWeb本体は更新されたが、Custom Domainはエラー100117で未接続です。新ドメインでのE2Eは未実施です。
- ユーザー確認の既存Aレコード2件（207.207.210.107 / 207.207.210.229）が接続に競合。
- 現在のWrangler認証はDNS一覧の取得が権限エラー。こちらからDNS削除はしていません。
- 再開: ユーザーが上記Aレコードを削除後、`pnpm exec wrangler deploy --config wrangler.jsonc`。
- 接続後は `TEST_BASE_URL=https://open.yokohama pnpm test:e2e`、canonical・sitemap・robots・HTTPSを確認してください。
- `www` とワイルドカードはPorkbun向けのまま。MCPの接続先も従来URLのまま。

## 2026-09-06: 独自ドメイン接続とOpen Yokohamaへの名称統一

- ユーザーによる旧Aレコード削除後、Gitの設定からCustom Domainを登録できました。
- WebのWorker名を `open-yokohama`、MCPを `open-yokohama-mcp` に変更しました。
- Cloudflare APIで `open.yokohama` の接続先が `open-yokohama` であることを確認しました。
- GitHubを `toyofukux/open-yokohama` に改名し、origin・リンク・プロジェクト説明・ホームページを更新しました。公開状態を維持しています。
- パッケージ名、MCPサーバー名、収集時のUser-Agent、画面・タイトルの表示名を統一しました。
- README・参加案内・セキュリティ・設計書・運用手順・Issueテンプレートを丁寧語に整えました。継続方針をCONTRIBUTING.mdに記載しました。
- 原資料は原文を保持しています。ローカル作業ディレクトリは既存のワークスペースパスを維持しています。
- `pnpm verify` が合格しました。新Workerによる `https://open.yokohama` でもPC/スマホ20件のE2Eが合格しました。
- 新MCPのSDK実接続検査も合格しました。HTTPS、ブランド、canonical、GitHubリンク、サイトマップ・robotsの新URLを確認しました。
- Web version: `3e61bcff-0267-4a27-860a-4132ca6c2195`。
- MCP version: `3b2db0d2-f015-493d-becb-487355dac104`。
- 旧Web・MCPのWorkerは旧URLの互換用として残しています。今後のデプロイ先は新Workerです。
- `www`・ワイルドカードのPorkbun向けCNAMEと、MCPの独自サブドメイン追加は今回変更していません。

## 2026-09-06: 公開基盤の構想整理

- 初期構想のうちOpen Yokohamaに関係する目的・設計原則・データモデル・公開Web/MCP・品質・長期目標を `docs/VISION.md` に整理しました。
- README・開発計画・現在の残作業・参加案内・セキュリティ・設計判断・MCP手順を公開基盤の範囲にそろえました。
- 初期構想の原文と公開基盤の対象外の記述をGit履歴から削除します。公開基盤の構想は `docs/VISION.md` を参照してください。
- 履歴の書き換えにより過去のcommit IDは変わります。上記の旧ID・CIリンクは当時の検証記録であり、書き換え後のcommitに対する再検証結果ではありません。

- 今回の文書整理では `pnpm verify`（単体18件・原本照合・ビルド）、`pnpm test:e2e`（20件）、文書内のローカルリンク22件の検査が合格しました。

## 2026-09-06: TOPページの左右端をヘッダに統一

- TOPページの801px以上の表示で、メインの最大幅を1160pxからヘッダと同じ1240pxに変更しました。スマホの左右20pxの余白は維持しています。
- 実装commit: `b492595`（`small-fix`ブランチ）。ユーザーの本番反映許可を受け、`https://open.yokohama` に公開しました。
- Web version: `8fc059a1-b23d-4587-a38d-6fc281482aa9`。直前の版: `3e61bcff-0267-4a27-860a-4132ca6c2195`。
- `pnpm verify`、ローカルと公開環境のE2E各20件が合格しました。公開環境では375・390・800・801・1024・1280・1440・1920pxの幅でヘッダとメインの左右端の一致、横溢れなしを確認しました。
- 公開コマンドは `SITE_URL=https://open.yokohama pnpm run deploy` です。`pnpm deploy` はpnpm自身のサブコマンドと競合するため、`run`が必要でした。
