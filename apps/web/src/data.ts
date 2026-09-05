import raw from "../../../data/published/population.json";
import { datasetSchema } from "../../../packages/core/schema";
export const data = datasetSchema.parse(raw);
export { geographies, wards, metrics } from "../../../packages/core/schema";
export {
  latest,
  series,
  compare,
  number,
  fact,
} from "../../../packages/core/query";
