import type { MetricId } from './schema';
export const issues: {
  slug: string;
  category: string;
  title: string;
  summary: string;
  metric: MetricId;
  question: string;
  limits: string;
  next: string;
}[] = [
  {
    slug: 'population',
    category: '人口・まちの変化',
    title: '横浜の人口は、どこで変わっている？',
    summary: '市全体の数字から一歩進んで、自分の区の増減と推移を確かめます。',
    metric: 'population',
    question: '人口の動きを、区ごとに見てみよう。',
    limits:
      '人口の増減だけでは、出生・死亡・転入・転出のどれが原因かは分かりません。国勢調査を基にした推計の改定も、数字の変化に含まれる場合があります。',
    next: '年齢別人口、出生・死亡、転入・転出を同じ時点で照合する必要があります。これらの内訳と政策の効果は、現在の掲載データでは検証していません。',
  },
  {
    slug: 'households',
    category: '住まい・暮らし',
    title: '人口と世帯数は、同じように動く？',
    summary: '人口と世帯数を分けて見ると、暮らしの変化を考える手がかりになります。',
    metric: 'households',
    question: '「何人」と「何世帯」を分けて見よう。',
    limits:
      '1世帯あたりの人数は平均です。この値だけで、単身世帯の割合や高齢者の孤立、住宅不足を判断することはできません。',
    next: '世帯構成、住宅の空き状況、家賃などを追加し、世帯数の変化が暮らしにどう関係するかを検証する必要があります。',
  },
  {
    slug: 'density',
    category: 'まち・地域',
    title: '人口の密度は、区によってどう違う？',
    summary: '同じ横浜でも区の面積と人口は違います。人数と密度を見比べます。',
    metric: 'density',
    question: '人数が多い区と、人口が密集する区は同じ？',
    limits:
      '区の平均密度は、駅周辺や住宅地ごとの混雑を表しません。通勤・通学による昼間の人口や、住みやすさの評価とも異なります。',
    next: '町丁別人口、土地利用、交通や施設の分布を重ねる必要があります。現在は区単位の比較で、徒歩圏や町単位の評価には対応していません。',
  },
];
