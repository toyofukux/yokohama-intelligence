import { readFile } from "node:fs/promises";
import { data } from "../../../data";
import { dynamics } from "../../../dynamics-data";
import { ages } from "../../../ages-data";
export function getStaticPaths() {
  return [...data.snapshots, ...dynamics.snapshots, ...ages.snapshots].map(
    (s) => ({
      params: { hash: s.id },
      props: { path: s.path },
    }),
  );
}
export async function GET({ props }: { props: { path: string } }) {
  return new Response(await readFile(props.path), {
    headers: { "Content-Type": "text/csv" },
  });
}
