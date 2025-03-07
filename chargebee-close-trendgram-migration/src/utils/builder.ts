export const searchBuilder = (
  objectType: string,
  isCustomField: boolean,
  fieldInternalName: string,
  searchValue: string,
  exactMatch: boolean = true
) => {
  const payload = {
    limit: null,
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
