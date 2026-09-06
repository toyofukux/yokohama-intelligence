# データの利用条件

`raw/` のCSVは横浜市「男女別人口及び世帯数－行政区」のオープンデータ。
提供者: 横浜市。ライセンス: Creative Commons Attribution 4.0 International（CC BY 4.0）。
出典: https://www.city.yokohama.lg.jp/city-info/yokohamashi/tokei-chosa/portal/opendata/suikei01.html
ライセンス: https://creativecommons.org/licenses/by/4.0/

`published/population.json` は上記CSVを構造化・検証して加工したものです。数値・地域・時点と原典の行列を対応付けました。
原本の値を推測で補完していません。横浜市がこの製品を承認したことを示しません。
`manifests/` は各原本の取得日時・URL・SHA-256を記録します。

再利用時は横浜市の出典・ライセンスと加工の事実を明示してください。
リポジトリ全体のMITライセンスは第三者データのライセンスを置き換えません。

## 文章検証の資料

`editorial/evidence.json` は横浜市の統計値・表・定義の確認に用いる抜粋と、各資料のURL・取得日・ハッシュを保持します。原稿、検証結果、内部実装コードと第三者の引用を区別します。各引用の出典は台帳の対応するURLと提供者を参照してください。

公式ページ全体のHTMLは `editorial/raw/` のローカルキャッシュであり、Git管理・静的サイト配信の対象にしません。新しいクローンでは検証用に取得します。横浜市の文章・ページ全体をMITライセンスとして扱いません。[横浜市サイトポリシー](https://www.city.yokohama.lg.jp/aboutweb/sitepolicy.html)と、各オープンデータの個別条件を参照してください。
