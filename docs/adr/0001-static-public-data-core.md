# ADR 0001: 公開版は静的配信と更新時処理から始める

状態: 採用、2026-09-05。今回の「サーバー代を極小化」をDRAFTの技術候補より優先します。

japan-todoの出典付き課題カード、要約→本文→出典の階層、Git経由の編集を参考にします。
横浜版では18区の同一時点比較、時系列の機械抽出、原本の固定、数字の定義、欠測の明示を中核に追加します。
Astroの静的HTMLにより初回表示でクライアントJSやAPIに依存しません。選択・比較だけ小さなブラウザスクリプトで動かします。

starter-full-stack-saasの現行構成・方針を確認しました。SaaSの認証・課金・DBを公開閲覧の前提にはしません。
データアクセス境界、CI、Cloudflare構成、アプリ単独で再構築する方針を採用します。公開WebはAstroで作ります。

kadai.aiはローカルの設計とfact-check.ts / factcheckCitations.tsを参照しました。ソースコード・業務データ・非公開プロンプトは転載しません。
採用するのは生成→別検証→修正→出典連結の段階分離、検証失敗を成功にしない原則。
改善する点は、数値をLLMに再解釈させないこと、出典URLだけで支持を判断しないこと、修正後の再検証、未知ラベルの拒否。
同repoの設計書と実コードで説明が異なる箇所もあり、稼働品質の保証として引用しません。

初期の構造化正本は型検証されたJSONと不変CSVをGitで管理します。規模が小さい公開データに常時DBは不要です。
D1を将来追加しても公開読取モデルはJSONへ書き出します。R2に原本を移してもハッシュ・参照IDを変えません。
PostGIS/pgvector/フルテキスト専用検索/Graph DBは実需要が生じるまで延期します。

代償: 更新はデプロイ時。Git内原本の上限を10MB程度で見直します。任意のリアルタイムAI回答は初期公開しません。
再検討条件: 原本容量増、編集者同時作業、更新頻度増、静的検索性能の悪化。

外部参照:
- https://github.com/fladdict/japan-todo
- https://raw.githubusercontent.com/fladdict/japan-todo/main/CONTENT_GUIDE.md
- https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/
- https://docs.astro.build/en/guides/deploy/cloudflare/
