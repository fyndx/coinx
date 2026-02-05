import { View } from "react-native";
import { Text } from "@/src/Components/ui/Text";
import { Button } from "@/src/Components/ui/Button";
import { useSync } from "@/src/hooks/useSync";
import { RefreshCw, Check, AlertCircle, Cloud } from "lucide-react-native";

/**
 * Format relative time for last synced timestamp.
 */
function formatLastSynced(isoString: string | null): string {
	if (!isoString) return "Never";

	const date = new Date(isoString);
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffSec = Math.floor(diffMs / 1000);
	const diffMin = Math.floor(diffSec / 60);
	const diffHr = Math.floor(diffMin / 60);
	const diffDays = Math.floor(diffHr / 24);

	if (diffSec < 60) return "Just now";
	if (diffMin < 60) return `${diffMin}m ago`;
	if (diffHr < 24) return `${diffHr}h ago`;
	if (diffDays === 1) return "Yesterday";
	if (diffDays < 7) return `${diffDays}d ago`;

	return date.toLocaleDateString();
}

/**
 * Get status display text and color.
 */
function getStatusDisplay(status: string): { text: string; color: string } {
	switch (status) {
		case "pushing":
			return { text: "Uploading...", color: "#3b82f6" }; // blue
		case "pulling":
			return { text: "Downloading...", color: "#3b82f6" }; // blue
		case "success":
			return { text: "Synced", color: "#22c55e" }; // green
		case "error":
			return { text: "Sync failed", color: "#ef4444" }; // red
		default:
			return { text: "Ready", color: "#6b7280" }; // gray
	}
}

/**
 * Sync status section for Settings screen.
 * Shows last synced time, status, and Sync Now button.
 */
export function SyncSection() {
	const { status, lastSyncedAt, error, isSyncing, sync, lastPushCount, lastPullCount } = useSync();
	const statusDisplay = getStatusDisplay(status);

	return (
		<View className="bg-card rounded-lg p-4 mb-1">
			{/* Header */}
			<View className="flex-row items-center mb-3">
				<Cloud size={20} color="gray" />
				<Text className="text-lg ml-2">Sync</Text>
			</View>

			{/* Status row */}
			<View className="flex-row items-center justify-between mb-3">
				<View className="flex-row items-center">
					{isSyncing ? (
						<RefreshCw size={16} color={statusDisplay.color} className="animate-spin" />
					) : status === "success" ? (
						<Check size={16} color={statusDisplay.color} />
					) : status === "error" ? (
						<AlertCircle size={16} color={statusDisplay.color} />
					) : (
						<View className="w-4" />
					)}
					<Text className="text-sm ml-2" style={{ color: statusDisplay.color }}>
						{statusDisplay.text}
					</Text>
				</View>
				<Text className="text-muted-foreground text-sm">
					{formatLastSynced(lastSyncedAt)}
				</Text>
			</View>

			{/* Error message */}
			{status === "error" && error && (
				<View className="bg-destructive/10 rounded-md p-2 mb-3">
					<Text className="text-destructive text-xs">{error}</Text>
				</View>
			)}

			{/* Last sync counts (only show after successful sync) */}
			{status === "success" && (lastPushCount > 0 || lastPullCount > 0) && (
				<Text className="text-muted-foreground text-xs mb-3">
					↑ {lastPushCount} uploaded · ↓ {lastPullCount} downloaded
				</Text>
			)}

			{/* Sync Now button */}
			<Button
				variant="outline"
				size="sm"
				onPress={sync}
				disabled={isSyncing}
			>
				{isSyncing ? "Syncing..." : "Sync Now"}
			</Button>
		</View>
	);
}
