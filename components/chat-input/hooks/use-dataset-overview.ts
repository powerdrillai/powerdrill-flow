import { useQuery } from "@tanstack/react-query";

import { getDatasetOverview } from "@/services/powerdrill/dataset.service";

export function useDatasetOverview(datasetId?: string) {
  const { data } = useQuery({
    queryKey: ["dataset-overview", datasetId],
    queryFn: () => getDatasetOverview(datasetId!),
    enabled: !!datasetId,
  });

  return data || null;
}
