# open.yokohama を Cloudflare に接続する

確認日: 2026-09-05。実際の公開状態と検証結果は `docs/STATUS.md` を参照してください。
購入・更新はPorkbun、DNSとサイト配信はCloudflareで管理します。登録会社の移管は不要です。

## 1. 準備

- Porkbunで `open.yokohama` を取得済みにします。購入時に空き状況と更新料金を確認してください。
- [Cloudflare](https://dash.cloudflare.com/)へログインし、既存の `open-yokohama` Workerがあるアカウントを選びます。
- 現在メールやサイトを使用中なら、PorkbunのDNSレコードを控えてください。MX・TXT等は後で引き継いでください。

## 2. Cloudflareへドメインを追加する

1. **Domains → Onboard a domain**（画面によっては「ドメインを追加」）を選びます。
2. `open.yokohama` を入力します。`https://` やパスは付けないでください。
3. DNSのスキャンを選び、プランは **Free** を選びます。
4. 既存のDNSレコードを確認してください。スキャンだけで全レコードが引き継がれるとは限りません。
5. Cloudflareが指定するネームサーバー２件を控えてください。値はアカウント・ドメインごとに異なります。

手順の根拠: [Cloudflare公式のドメイン追加手順](https://developers.cloudflare.com/fundamentals/manage-domains/add-site/)。

## 3. Porkbunでネームサーバーを変更する

1. **Domain Management** で `open.yokohama` の **Details** を開いてください。
2. DNSSECが有効なら、ネームサーバー切替前に登録会社側で無効化します。古いDS情報を残すと名前解決が失敗します。
3. **Nameservers** の編集を開いてください。DNSレコード編集欄のNSレコード追加とは異なります。
4. 現在のネームサーバーを、手順2で控えたCloudflare指定の２件に置き換えて保存します。
5. Cloudflareへ戻り、ネームサーバーの確認を実行してください。ドメインの状態が **Active** になるまでお待ちください。

反映は即時とは限らず、Porkbunの案内では全世界への反映に最大48時間かかります。
Activeになった後のDNSレコード編集はCloudflareで行います。Porkbunには更新・契約管理が残ります。
必要ならActive確認後にCloudflareでDNSSECを有効化し、そのDS情報をPorkbunへ登録します。
[Porkbun公式の変更手順](https://kb.porkbun.com/article/22-how-to-change-nameservers)。

## 4. Webサイトに接続する

接続設定はGitの `wrangler.jsonc` を正本にします。現在は以下の設定を登録済みです。

```json
"routes": [{ "pattern": "open.yokohama", "custom_domain": true }]
```

1. ドメインがActiveであることを確認してください。
2. `pnpm verify` で検証します。
3. 次節のコマンドでビルド・デプロイします。WranglerがCustom Domainを作成します。
4. 証明書の発行と有効化を待ち、`https://open.yokohama/` を開いてください。

コンソールの **Workers & Pages → open-yokohama → Settings → Domains & Routes** は確認用に使います。
先に画面で接続した場合も、同じ設定をGitへ反映してから次のデプロイを行います。

Custom DomainがDNSと証明書を作ります。`workers.dev` 宛てのCNAMEを手動で作る必要はありません。
既存の同名CNAMEがあると追加できません。新規購入時の駐車ページ用と確認できたものだけ除去します。
既存メールのMX・TXTは削除しません。
[Workers公式の独自ドメイン手順](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)。

## 5. アプリ側の公開URLを更新する

DNSが通っても、canonical・サイトマップはビルド時のURLのままなので更新します。
作業ディレクトリはこのリポジトリのルートです。

```sh
SITE_URL=https://open.yokohama pnpm deploy
TEST_BASE_URL=https://open.yokohama pnpm test:e2e
```

`apps/web/astro.config.mjs` の既定 `site` とサイトマップのフォールバックは新URLへ更新済みです。
通常の `pnpm deploy` でも新URLを使います。別ホストへ複製する場合だけ `SITE_URL` を上書きし、
`wrangler.jsonc` のWorker名・ドメインも複製先に合わせてください。
`workers_dev: true` により `open-yokohama.toyofukux.workers.dev` も疎通確認用に維持します。canonicalは `open.yokohama` を参照します。

## 6. サブドメインを追加する場合

| ホスト | 接続するWorker | 利用先 |
| --- | --- | --- |
| `open.yokohama` | `open-yokohama` | 市民向けサイト |
| `mcp.open.yokohama`（任意） | `open-yokohama-mcp` | `/mcp` |

MCPも手順4と同様に対象Workerへ追加します。入力するのはホスト名だけで、`/mcp` は付けないでください。
設定を `apps/mcp/wrangler.jsonc` の `routes` に記録します。
公開後は `MCP_URL=https://mcp.open.yokohama/mcp pnpm test:mcp` で確認してください。
ブラウザで開いた結果だけではMCP接続の合否は判定できません。

`www` も使う場合はCloudflareの「wwwからルートへリダイレクト」ルールを作り、
パス・クエリを保ったまま `https://open.yokohama` に301転送します。
転送元 `www` にはプロキシ有効のDNSレコードが必要です。詳細は上記Workers公式手順のリダイレクト節を参照してください。
ワイルドカードの購入は不要です。Workers Custom Domainsはホスト名を個別登録します。

## 7. 完了確認

- [ ] CloudflareでドメインがActive。
- [ ] `https://open.yokohama/` で正しいサイトが表示され、証明書エラーがありません。
- [ ] 18区の比較・検索・CSVダウンロードが動作します。
- [ ] HTMLのcanonicalと `/sitemap.xml`・`/robots.txt` が新URLを参照していることを確認してください。
- [ ] 公開先を指定したE2Eが合格します。MCP追加時はMCPの実接続検査も合格します。
- [ ] 接続設定・公開URLをリポジトリへ記録し、版と確認結果を `docs/STATUS.md` に残します。

## 困った場合

- **Pending**: PorkbunのNameserversが指定の２件と完全一致するか確認してください。
- **SERVFAIL**: 古いDNSSECのDS情報が残っていないか確認してください。
- **別のページが出る**: Custom Domainの接続先Workerと、同名の駐車ページ用DNSを確認してください。
- **証明書が未発行**: Cloudflareの証明書状態とエラーを確認してください。HTTPSの警告を無視して完了扱いにしません。
- **切替が未完了**: 既存の `workers.dev` URLを案内先に維持します。新ドメインだけの障害なら、正常なWebビルドを巻き戻す必要はありません。
