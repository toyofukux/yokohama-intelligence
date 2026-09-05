# MCP利用手順

起動: `pnpm mcp:dev`。ローカル接続先: `http://127.0.0.1:8789/mcp`。
公開接続先: `https://open-yokohama-mcp.toyofukux.workers.dev/mcp`。

Streamable HTTP、セッションなし、公開データ読み取りのみです。
MCPのバージョン交渉は公式TypeScript SDKに委ねています。初期構想にある日付を実装済みの仕様としてハードコードしません。

ツール: `search`, `get_metric`, `get_metric_series`, `compare_geographies`, `get_source`。
リソース: `yokohama://city`, `yokohama://wards/kohoku` 等。

例: `get_metric({"geography":"141097","metric":"population"})`。
`compare_geographies({"metric":"population","period":"2026-08-01"})`。
自治体コード・指標は `yokohama://city` で取得できます。

返答の観測値には単位の定義、時点、原典ID、行、列を付けます。原典URL・取得日時はsourcesで解決します。
引用付きの統計取得ができても、AIによる任意の因果分析が検証済みになるわけではありません。

ブラウザOriginは同一originのみ許可。通常のMCPクライアントはOriginなしで接続できます。
入力は8KBまで。外部URLの取得、書き込み、サーバー側LLM呼び出しを持ちません。
