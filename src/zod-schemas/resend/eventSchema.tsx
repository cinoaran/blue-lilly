import {z} from "zod";

const eventSchema = z.object({
  id: z.string(),
  type: z.string(),
  data: z.record(z.string(), z.unknown()), // <-- use (keySchema, valueSchema)
  // add fields you expect...
});
export default eventSchema;
