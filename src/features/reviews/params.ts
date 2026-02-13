import { parseAsInteger, parseAsStringEnum } from "nuqs/server";

export const reviewsParams = {
  page: parseAsInteger
    .withDefault(1)
    .withOptions({ clearOnDefault: true }),
  rating: parseAsInteger,
  response: parseAsStringEnum(["all", "responded", "unresponded"])
    .withDefault("all")
    .withOptions({ clearOnDefault: true }),
  sort: parseAsStringEnum(["newest", "oldest", "lowest", "highest"])
    .withDefault("newest")
    .withOptions({ clearOnDefault: true }),
};
