import { readFile } from "node:fs/promises";
import { data } from "../../../data";
export function getStaticPaths() {
  return data.snapshots.map((s) => ({
    params: { hash: s.id },
    props: { path: s.path },
  }));
}
export async function GET({ props }: { props: { path: string } }) {
  return new Response(await readFile(props.path), {
    headers: { "Content-Type": "text/csv" },
  });
}
