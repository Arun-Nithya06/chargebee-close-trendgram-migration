export const searchBuilder = (
  objectType: string,
  isCustomField: boolean,
  fieldInternalName: string,
  searchValue: string,
  exactMatch: boolean = true
) => {
  // Define fields mapping based on objectType
  const fieldsMapping: Record<string, string[]> = {
    contact: ["id", "lead_id"],
    lead: ["id"],
  };

  const payload = {
    limit: 100,
    query: {
      type: "and",
      queries: [
        {
          type: "object_type",
          object_type: objectType,
        },
        {
          type: "field_condition",
          field: {
            type: isCustomField ? "custom_field" : "regular_field",
            object_type: objectType,
            ...(isCustomField
              ? { custom_field_id: fieldInternalName }
              : { field_name: fieldInternalName }),
          },
          condition: {
            type: "text",
            mode: exactMatch ? "full_words" : "exists",
            value: searchValue,
          },
        },
      ],
    },
    _fields: {
      [objectType]: fieldsMapping[objectType] || [],
    },
  };

  return payload;
};

export const formatDate = (timestamp: number | undefined): string => {
  if (!timestamp) return "";
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const mapSubscriptionStatus = (status: string | undefined): string => {
  const statusMapping: Record<string, string> = {
    future: "Future",
    in_trial: "In Trial",
    active: "Active",
    non_renewing: "Non Renewing",
    paused: "Paused",
    cancelled: "Cancelled",
    transferred: "Transferred",
  };

  return status ? statusMapping[status] || status : "";
};

const planMapping: Record<string, string> = {
  "basic-discount-1-USD-Monthly": "basic-discount-1-monthly",
  "basic-discount-2-USD-Monthly": "basic-discount-2-monthly",
  "basic-discount-2-USD-Weekly": "basic-discount-2-weekly",
  "basic-monthly-USD-Monthly": "basic-monthly",
  "basic-yearly-USD-Yearly": "basic-yearly",
  "pro-discount-1-USD-Monthly": "pro-discount-1-monthly",
  "pro-discount-2-USD-Monthly": "pro-discount-2-monthly",
  "pro-discount-2-USD-Weekly": "pro-discount-2-weekly",
  "pro-monthly-USD-Monthly": "pro-monthly",
  "pro-yearly-USD-Yearly": "pro-yearly",
  "turbo-discount-1-USD-Monthly": "turbo-discount-1-monthly",
  "turbo-discount-2-USD-Monthly": "turbo-discount-2-monthly",
  "turbo-discount-2-USD-Weekly": "turbo-discount-2-weekly",
  "turbo-monthly-USD-Monthly": "turbo-monthly",
  "turbo-yearly-USD-Yearly": "turbo-yearly",
};

export const getMappedPlan = (itemPriceId: string): string => {
  if (!itemPriceId) return null;

  // Check in the predefined mapping
  if (planMapping[itemPriceId]) return planMapping[itemPriceId];

  // Fallback: Clean and format dynamically if not in mapping
  return itemPriceId.replace(/-USD/g, "").toLowerCase();
};
