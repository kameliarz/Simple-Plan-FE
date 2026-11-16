import type { NotificationApi, NotificationTarget } from "../types/notification.types";

function resolveTargetUrl(target?: NotificationTarget | null): string | null {
  if (!target || target.resource_id == null) {
    return null;
  }

  const id = encodeURIComponent(String(target.resource_id));

  if (target.feature === "inventory" && target.subfeature === "maintenance") {
    return `/maintenance/${id}`;
  }

  return null;
}

export function resolveNotificationUrl(notification: NotificationApi): string | null {
  // Prioritaskan target dari backend
  const targetUrl = resolveTargetUrl(notification.target);

  if (targetUrl) {
    return targetUrl;
  }

  const url = notification.url;

  if (!url) {
    return null;
  }

  // Fallback untuk format URL maintenance lama
  const maintenanceMatch = url.match(/^\/inventory\/asset-maintenances\/([^/?#]+)\/?(?:[?#].*)?$/);

  if (maintenanceMatch) {
    return `/maintenance/${encodeURIComponent(decodeURIComponent(maintenanceMatch[1]))}`;
  }

  // Hanya izinkan path internal, bukan URL eksternal
  if (url.startsWith("/") && !url.startsWith("//")) {
    return url;
  }

  return null;
}
