# open.yokohama を Cloudflare に接続する

確認日: 2026-09-05。これは設定手順書であり、購入・DNS変更・独自ドメイン公開は未実施。
購入・更新はPorkbun、DNSとサイト配信はCloudflareで管理する。登録会社の移管は不要。

## 1. 準備

- Porkbunで `open.yokohama` を取得済みにする。購入時に空き状況と更新料金を確認する。
- [Cloudflare](https://dash.cloudflare.com/)へログインし、既存の `yokohama-intelligence` Workerがあるアカウントを選ぶ。
- 現在メールやサイトを使用中なら、PorkbunのDNSレコードを控える。MX・TXT等は後で引き継ぐ。

## 2. Cloudflareへドメインを追加する

1. **Domains → Onboard a domain**（画面によっては「ドメインを追加」）を選ぶ。
2. `open.yokohama` を入力する。`https://` やパスは付けない。
3. DNSのスキャンを選び、プランは **Free** を選ぶ。
4. 既存のDNSレコードを確認する。スキャンだけで全レコードが引き継がれるとは限らない。
5. Cloudflareが指定するネームサーバー２件を控える。値はアカウント・ドメインごとに異なる。

手順の根拠: [Cloudflare公式のドメイン追加手順](https://developers.cloudflare.com/fundamentals/manage-domains/add-site/)。

## 3. Porkbunでネームサーバーを変更する

1. **Domain Management** で `open.yokohama` の **Details** を開く。
2. DNSSECが有効なら、ネームサーバー切替前に登録会社側で無効化する。古いDS情報を残すと名前解決が失敗する。
3. **Nameservers** の編集を開く。DNSレコード編集欄のNSレコード追加とは異なる。
4. 現在のネームサーバーを、手順2で控えたCloudflare指定の２件に置き換えて保存する。
5. Cloudflareへ戻り、ネームサーバーの確認を実行する。ドメインの状態が **Active** になるまで待つ。

反映は即時とは限らず、Porkbunの案内では全世界への反映に最大48時間かかる。
Activeになった後のDNSレコード編集はCloudflareで行う。Porkbunには更新・契約管理が残る。
必要ならActive確認後にCloudflareでDNSSECを有効化し、そのDS情報をPorkbunへ登録する。
[Porkbun公式の変更手順](https://kb.porkbun.com/article/22-how-to-change-nameservers)。

## 4. Webサイトに接続する

1. Cloudflareの **Workers & Pages → yokohama-intelligence** を開く。
2. **Settings → Domains & Routes → Add → Custom Domain** を選ぶ。
3. `open.yokohama` を入力し **Add Custom Domain** を実行する。
4. 証明書の発行と有効化を待ち、`https://open.yokohama/` を開く。

Custom DomainがDNSと証明書を作る。`workers.dev` 宛てのCNAMEを手動で作る必要はない。
既存の同名CNAMEがあると追加できない。新規購入時の駐車ページ用と確認できたものだけ除去する。
既存メールのMX・TXTは削除しない。
[Workers公式の独自ドメイン手順](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)。

## 5. アプリ側の公開URLを更新する

DNSが通っても、canonical・サイトマップはビルド時のURLのままなので更新する。
作業ディレクトリはこのリポジトリのルート。

```sh
SITE_URL=https://open.yokohama pnpm deploy
TEST_BASE_URL=https://open.yokohama pnpm test:e2e
```

次回デプロイでも戻らないよう、`apps/web/astro.config.mjs` の既定 `site` を新URLに変更するか、
すべての公開ビルドで `SITE_URL` を設定する。README・開発者向け案内のURLも更新する。
画面で設定した接続は、ルートの `wrangler.jsonc` に以下の項目を追記して管理する。
既存の `assets` や `name` は維持する。設定を記録してから再デプロイする。

```json
"routes": [{ "pattern": "open.yokohama", "custom_domain": true }]
```

## 6. サブドメインを追加する場合

| ホスト | 接続するWorker | 利用先 |
| --- | --- | --- |
| `open.yokohama` | `yokohama-intelligence` | 市民向けサイト |
| `mcp.open.yokohama`（任意） | `yokohama-intelligence-mcp` | `/mcp` |

MCPも手順4と同様に対象Workerへ追加する。入力するのはホスト名だけで、`/mcp` は付けない。
設定を `apps/mcp/wrangler.jsonc` の `routes` に記録する。
公開後は `MCP_URL=https://mcp.open.yokohama/mcp pnpm test:mcp` で確認する。
ブラウザで開いた結果だけではMCP接続の合否は判定できない。

`www` も使う場合はCloudflareの「wwwからルートへリダイレクト」ルールを作り、
パス・クエリを保ったまま `https://open.yokohama` に301転送する。
転送元 `www` にはプロキシ有効のDNSレコードが必要。詳細は上記Workers公式手順のリダイレクト節を参照する。
ワイルドカードの購入は不要。Workers Custom Domainsはホスト名を個別登録する。

## 7. 完了確認

- [ ] CloudflareでドメインがActive。
- [ ] `https://open.yokohama/` で正しいサイトが表示され、証明書エラーがない。
- [ ] 18区の比較・検索・CSVダウンロードが動作する。
- [ ] HTMLのcanonicalと `/sitemap.xml`・`/robots.txt` が新URLを参照する。
- [ ] 公開先を指定したE2Eが合格する。MCP追加時はMCPの実接続検査も合格する。
- [ ] 接続設定・公開URLをリポジトリへ記録し、版と確認結果を `docs/STATUS.md` に残す。

## 困った場合

- **Pending**: PorkbunのNameserversが指定の２件と完全一致するか確認する。
- **SERVFAIL**: 古いDNSSECのDS情報が残っていないか確認する。
- **別のページが出る**: Custom Domainの接続先Workerと、同名の駐車ページ用DNSを確認する。
- **証明書が未発行**: Cloudflareの証明書状態とエラーを確認する。HTTPSの警告を無視して完了扱いにしない。
- **切替が未完了**: 既存の `workers.dev` URLを案内先に維持する。新ドメインだけの障害なら、正常なWebビルドを巻き戻す必要はない。
