import { useState, useEffect, useCallback } from "react";
import type { SuperAdminDashboardData } from "../types/dashboard.types";
import { dashboardService } from "../services/dashboardService";

export function useDashboardData(role: string, initialData?: SuperAdminDashboardData) {
  const [data, setData] = useState<SuperAdminDashboardData>(() => {
    return initialData || dashboardService.getDefaultMockByRole(role);
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const result = await dashboardService.getDashboardData(role);
      setData(result);
    } catch {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, [role]);

  useEffect(() => {
    let isMounted = true;

    dashboardService
      .getDashboardData(role)
      .then((result) => {
        if (isMounted) {
          setData(result);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setIsError(true);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [role]);

  return {
    data,
    isLoading,
    isError,
    refresh: fetchData,
  };
}
