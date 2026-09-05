# 横浜を知る · Yokohama Intelligence

横浜の暮らしを、身近な数字から。18区の人口と世帯の変化を、公式統計と原典付きで調べる市民向けの公共情報基盤。
Cloudflareの静的配信を中心に、閲覧時のDB・AI実行をなくして運用費を抑える。

[公開サイト](https://yokohama-intelligence.toyofukux.workers.dev) · [公開MCP](https://yokohama-intelligence-mcp.toyofukux.workers.dev/mcp)

**公開β**。現在は2024年1月〜2026年8月の32か月、横浜市と18区、9指標・5,472観測値。
人口・世帯・密度の3つの問い、18区ページ、比較・検索、CSV/JSON、公開MCPを実装した。
予算・政策の効果・年齢別人口・都市比較は未提供。市民利用テストも未実施。

[開発計画](docs/PLAN.md) · [実装・検証・公開状態](docs/STATUS.md) · [設計判断](docs/adr/0001-static-public-data-core.md)

## 動かす

Node.js 24 と pnpm 10.32.1。アプリのローカル起動・ビルドに外部アカウントやAIキーは不要。

```sh
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

`http://127.0.0.1:4321` を開く。

```sh
pnpm verify                         # lint・型・データ/検証ゲートのテスト・原本照合・静的ビルド
pnpm exec playwright install chromium
pnpm test:e2e                       # PC/スマホ・アクセシビリティ・出典導線
pnpm preview                        # Cloudflareのローカル配信 :8788
pnpm mcp:dev                        # 公開データMCP :8789/mcp
pnpm test:mcp                       # 別ターミナルから実MCP接続を検証
pnpm data:refresh                   # 市公式のCSVを取得・検査。過去値変更では停止
```

## 構造

```text
apps/web/         Astro静的サイト。公開済みデータだけを取り込む
apps/mcp/         MCP Streamable HTTP。公開データ読取専用の別Worker
packages/core/    指標・地理・データ契約・問い合わせ・文章検証契約
packages/ingestion/ 厳格なCSVパーサー
scripts/          取得・原本照合・MCP実接続検査
data/raw/         不変の原本CSV（ハッシュ名）
data/manifests/   取得記録の版
data/published/   検証済み公開データ
```

数値はLLMを通さず原本から抽出する。市と18区の合計・男女計・時点・単位・欠測・重複を検査し、失敗で公開ビルドを止める。
出典URLだけで主張が正しいとは判定しない。文章の検証は主張ID・引用ID・本文ハッシュを照合する契約を用意しているが、AI生成フロー自体はまだ接続していない。

## 公開と運用

[Cloudflare公開手順](docs/runbooks/deploy.md) · [データ更新](docs/runbooks/data.md) · [MCP](docs/runbooks/mcp.md)

公開WebはCloudflare Static Assetsのみで配信でき、アクセスごとのAI料金は発生しない。
MCPは動的Workerの料金・制限が別に適用される。ドメイン・CI・将来のAIバッチ費用は別。
料金は[Cloudflare公式](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/)を確認する。

週次Actionsが公式CSVの更新を検査し、更新候補・形式変更・取得失敗を可視化する。候補を自動で本番公開しない。
コード変更のCIは認証なしで再現する。デプロイは運営者のCloudflare認証で実行する。

## 参加・権利

[参加方法](CONTRIBUTING.md) · [セキュリティ](SECURITY.md) · [MIT（コード）](LICENSE) · [CC BY 4.0（市由来データ）](data/LICENSE.md)

深津貴之さんの[japan-todo](https://github.com/fladdict/japan-todo)の出典付き課題整理から着想を得た。
非公開の研究プロジェクトからは段階的検証の設計上の知見のみを参照し、コード・業務資料・認証情報を転載していない。
横浜市や同プロジェクトによる公式提供・承認を示すものではない。
