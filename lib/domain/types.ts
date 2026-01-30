import { z } from "zod";

// Drone Status Enum
export const DroneStatusSchema = z.enum(["online", "offline", "charging", "in-mission"]);
export type DroneStatus = z.infer<typeof DroneStatusSchema>;

// Position Schema
export const PositionSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  alt: z.number().min(0),
  speed: z.number().min(0),
});
export type Position = z.infer<typeof PositionSchema>;

// Drone Schema
export const DroneSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  status: DroneStatusSchema,
  batteryPct: z.number().min(0).max(100),
  flightHours: z.number().min(0),
  lastMission: z.string().uuid().nullable(),
  updatedAt: z.string().datetime(),
  position: PositionSchema,
  health: z.object({
    signalStrength: z.number().min(0).max(100),
    gpsQuality: z.number().min(0).max(100),
    motorHealth: z.number().min(0).max(100),
    overall: z.number().min(0).max(100),
  }),
});
export type Drone = z.infer<typeof DroneSchema>;

// Mission Status Enum
export const MissionStatusSchema = z.enum([
  "pending",
  "in-progress",
  "completed",
  "failed",
  "cancelled",
]);
export type MissionStatus = z.infer<typeof MissionStatusSchema>;

// Waypoint Action Enum
export const WaypointActionSchema = z.enum([
  "TAKE_PHOTO",
  "LOITER",
  "SCAN",
  "DELIVER_PAYLOAD",
  "NONE",
]);
export type WaypointAction = z.infer<typeof WaypointActionSchema>;

// Mission Failure Reason Enum
export const MissionFailureReasonSchema = z.enum([
  "LOW_BATTERY",
  "LOW_GPS",
  "OFFLINE_TIMEOUT",
  "CANCELLED_BY_USER",
  "RTL_CANCELLED",
]);
export type MissionFailureReason = z.infer<typeof MissionFailureReasonSchema>;

// Waypoint Schema (for existing missions)
export const WaypointSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  alt: z.number().min(0),
  order: z.number().int().min(0),
  speed: z.number().min(1).max(25).optional(), // Optional speed from mission planning
  action: WaypointActionSchema.optional(), // Optional action from mission planning
});
export type Waypoint = z.infer<typeof WaypointSchema>;

// Mission Waypoint Schema (for planning - includes action, speed)
export const MissionWaypointSchema = z.object({
  id: z.string().uuid(), // Temporary ID for client-side management
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  alt: z.number().min(5).max(120), // 5-120m altitude constraint
  speed: z.number().min(1).max(25), // 1-25 m/s speed constraint
  action: WaypointActionSchema,
  order: z.number().int().min(0),
});
export type MissionWaypoint = z.infer<typeof MissionWaypointSchema>;

// Mission Draft Schema (for creating new missions)
export const MissionDraftSchema = z.object({
  droneId: z.string().uuid(),
  waypoints: z.array(MissionWaypointSchema).min(5, "At least 5 waypoints required"),
});
export type MissionDraft = z.infer<typeof MissionDraftSchema>;

// Mission Schema
export const MissionSchema = z.object({
  id: z.string().uuid(),
  droneId: z.string().uuid(),
  status: MissionStatusSchema,
  startTime: z.string().datetime().nullable(),
  endTime: z.string().datetime().nullable(),
  success: z.boolean(),
  waypoints: z.array(WaypointSchema),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  // Execution fields
  startedAt: z.string().datetime().nullable().optional(),
  completedAt: z.string().datetime().nullable().optional(),
  currentWaypointIndex: z.number().int().min(0).optional(),
  // Cancellation and failure fields
  cancelledAt: z.string().datetime().nullable().optional(),
  failedAt: z.string().datetime().nullable().optional(),
  failureReason: MissionFailureReasonSchema.optional(),
});
export type Mission = z.infer<typeof MissionSchema>;

// Mission Event Schema (for action logging)
export const MissionEventSchema = z.object({
  timestamp: z.string().datetime(),
  type: z.enum(["WAYPOINT_REACHED", "ACTION_EXECUTED", "MISSION_STARTED", "MISSION_COMPLETED", "MISSION_FAILED", "MISSION_CANCELLED"]),
  waypointIndex: z.number().int().min(0).optional(),
  action: WaypointActionSchema.optional(),
  message: z.string(),
});
export type MissionEvent = z.infer<typeof MissionEventSchema>;

// Telemetry Schema
export const TelemetrySchema = z.object({
  droneId: z.string().uuid(),
  timestamp: z.string(), // ISO 8601 datetime string (relaxed validation)
  position: PositionSchema,
  batteryPct: z.number().min(0).max(100),
  gpsQuality: z.number().min(0).max(100),
  speed: z.number().min(0),
  altitude: z.number().min(0),
  // Optional fields for map scope (mission transition detection)
  activeMissionId: z.string().uuid().nullable().optional(),
  activeMissionStatus: MissionStatusSchema.optional(),
});
export type Telemetry = z.infer<typeof TelemetrySchema>;

// API Response Envelopes
export const ApiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.unknown().optional(),
});
export type ApiError = z.infer<typeof ApiErrorSchema>;

export const ApiMetaSchema = z.object({
  total: z.number().int().min(0).optional(),
  page: z.number().int().min(1).optional(),
  pageSize: z.number().int().min(1).optional(),
  hasMore: z.boolean().optional(),
});
export type ApiMeta = z.infer<typeof ApiMetaSchema>;

export const ApiResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    data: dataSchema,
    meta: ApiMetaSchema.optional(),
    error: ApiErrorSchema.optional(),
  });
export type ApiResponse<T> = {
  data: T;
  meta?: ApiMeta;
  error?: ApiError;
};

// Query Parameters
export const DronesQueryParamsSchema = z.object({
  search: z.string().optional(),
  status: DroneStatusSchema.optional(),
  sort: z.enum(["name", "status", "batteryPct", "updatedAt"]).optional(),
  scope: z.enum(["map"]).optional(), // Lightweight profiles for map
});
export type DronesQueryParams = z.infer<typeof DronesQueryParamsSchema>;

export const MissionsQueryParamsSchema = z.object({
  droneId: z.string().uuid().optional(),
  search: z.string().optional(),
  status: MissionStatusSchema.optional(),
  sort: z.enum(["startDate", "status", "createdAt"]).optional(),
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
});
export type MissionsQueryParams = z.infer<typeof MissionsQueryParamsSchema>;

export const TelemetryQueryParamsSchema = z.object({
  droneId: z.string().uuid().optional(),
  scope: z.enum(["fleet", "drone", "map"]).optional(),
});
export type TelemetryQueryParams = z.infer<typeof TelemetryQueryParamsSchema>;
