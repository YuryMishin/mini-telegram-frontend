import { z } from 'zod';

// ========================
// Base Types & Utilities
// ========================

// Pagination schema
export const PaginationSchema = z.object({
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
  after: z.string().optional(),
  before: z.string().optional(),
});

export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    data: z.array(itemSchema),
    pagination: z.object({
      total: z.number(),
      limit: z.number(),
      offset: z.number(),
      hasMore: z.boolean(),
      nextCursor: z.string().optional(),
      prevCursor: z.string().optional(),
    }),
  });

// API Response wrapper
export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema,
    message: z.string().optional(),
    timestamp: z.string().datetime(),
    requestId: z.string().uuid().optional(),
  });

export const ApiErrorSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.record(z.any()).optional(),
    field: z.string().optional(), // For validation errors
  }),
  timestamp: z.string().datetime(),
  requestId: z.string().uuid().optional(),
});

// ========================
// User Schemas
// ========================

export const UserStatusSchema = z.enum(['online', 'offline', 'away', 'busy']);

export const UserSchema = z.object({
  id: z.string().uuid(),
  username: z.string().min(3).max(50),
  email: z.string().email(),
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  displayName: z.string().min(1).max(100).optional(),
  avatar: z.string().url().optional(),
  bio: z.string().max(500).optional(),
  status: UserStatusSchema.default('offline'),
  isOnline: z.boolean().default(false),
  lastSeen: z.string().datetime().optional(),
  isVerified: z.boolean().default(false),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const PublicUserSchema = UserSchema.omit({
  email: true,
});

export const CurrentUserSchema = UserSchema.extend({
  settings: z.object({
    theme: z.enum(['light', 'dark', 'system']).default('system'),
    language: z.string().default('en'),
    notifications: z.object({
      messages: z.boolean().default(true),
      mentions: z.boolean().default(true),
      sounds: z.boolean().default(true),
      desktop: z.boolean().default(true),
      mobile: z.boolean().default(true),
    }).default({}),
    privacy: z.object({
      lastSeen: z.enum(['everyone', 'contacts', 'nobody']).default('everyone'),
      profilePhoto: z.enum(['everyone', 'contacts', 'nobody']).default('everyone'),
      status: z.enum(['everyone', 'contacts', 'nobody']).default('everyone'),
    }).default({}),
  }).default({}),
});

// ========================
// Authentication Schemas
// ========================

export const LoginRequestSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().default(false),
});

export const RegisterRequestSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be less than 50 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers and underscores'),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter and one number'),
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
});

export const AuthTokensSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number(),
  tokenType: z.string().default('Bearer'),
});

export const AuthResponseSchema = z.object({
  user: CurrentUserSchema,
  tokens: AuthTokensSchema,
});

export const RefreshTokenRequestSchema = z.object({
  refreshToken: z.string(),
});

export const RefreshTokenResponseSchema = z.object({
  accessToken: z.string(),
  expiresIn: z.number(),
});

// ========================
// Dialog Schemas
// ========================

export const DialogTypeSchema = z.enum(['private', 'group', 'channel']);

export const DialogSchema = z.object({
  id: z.string().uuid(),
  type: DialogTypeSchema,
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  avatar: z.string().url().optional(),
  participants: z.array(PublicUserSchema),
  participantCount: z.number().min(1),
  ownerId: z.string().uuid().optional(), // For groups/channels
  lastMessage: z.object({
    id: z.string().uuid(),
    content: z.string(),
    type: z.enum(['text', 'image', 'file', 'voice', 'video']),
    senderId: z.string().uuid(),
    senderName: z.string(),
    createdAt: z.string().datetime(),
    isRead: z.boolean(),
  }).optional(),
  unreadCount: z.number().min(0).default(0),
  isPinned: z.boolean().default(false),
  isMuted: z.boolean().default(false),
  permissions: z.object({
    canSendMessages: z.boolean().default(true),
    canSendMedia: z.boolean().default(true),
    canAddMembers: z.boolean().default(false),
    canEditInfo: z.boolean().default(false),
    canDeleteMessages: z.boolean().default(false),
  }).default({}),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const CreateDialogRequestSchema = z.object({
  type: DialogTypeSchema,
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  participantIds: z.array(z.string().uuid()).min(1),
});

// ========================
// Message Schemas
// ========================

export const MessageTypeSchema = z.enum([
  'text',
  'image',
  'file',
  'voice',
  'video',
  'sticker',
  'location',
  'contact',
  'system'
]);

export const MessageStatusSchema = z.enum([
  'sending',
  'sent',
  'delivered',
  'read',
  'failed'
]);

export const MessageAttachmentSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(['image', 'file', 'voice', 'video']),
  url: z.string().url(),
  filename: z.string().optional(),
  size: z.number().min(0).optional(),
  mimeType: z.string().optional(),
  duration: z.number().min(0).optional(), // For voice/video
  dimensions: z.object({
    width: z.number().min(1),
    height: z.number().min(1),
  }).optional(), // For images/videos
  thumbnail: z.string().url().optional(),
});

export const MessageSchema = z.object({
  id: z.string().uuid(),
  dialogId: z.string().uuid(),
  senderId: z.string().uuid(),
  senderName: z.string(),
  senderAvatar: z.string().url().optional(),
  type: MessageTypeSchema.default('text'),
  content: z.string().max(4096),
  attachments: z.array(MessageAttachmentSchema).default([]),
  replyTo: z.string().uuid().optional(),
  forwardFrom: z.object({
    messageId: z.string().uuid(),
    dialogId: z.string().uuid(),
    senderName: z.string(),
  }).optional(),
  reactions: z.array(z.object({
    emoji: z.string(),
    userIds: z.array(z.string().uuid()),
    count: z.number().min(1),
  })).default([]),
  status: MessageStatusSchema.default('sent'),
  isEdited: z.boolean().default(false),
  isPinned: z.boolean().default(false),
  readBy: z.array(z.object({
    userId: z.string().uuid(),
    readAt: z.string().datetime(),
  })).default([]),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional(),
  editedAt: z.string().datetime().optional(),
});

export const SendMessageRequestSchema = z.object({
  dialogId: z.string().uuid(),
  type: MessageTypeSchema.default('text'),
  content: z.string().min(1).max(4096),
  attachments: z.array(z.string().uuid()).optional(), // File IDs
  replyTo: z.string().uuid().optional(),
  forwardFrom: z.string().uuid().optional(),
});

export const EditMessageRequestSchema = z.object({
  content: z.string().min(1).max(4096),
});

// ========================
// File Upload Schemas
// ========================

export const FileUploadResponseSchema = z.object({
  id: z.string().uuid(),
  url: z.string().url(),
  filename: z.string(),
  size: z.number().min(0),
  mimeType: z.string(),
  thumbnail: z.string().url().optional(),
});

// ========================
// Search Schemas
// ========================

export const SearchRequestSchema = z.object({
  query: z.string().min(1).max(200),
  type: z.enum(['all', 'dialogs', 'messages', 'users']).default('all'),
  dialogId: z.string().uuid().optional(), // Search within specific dialog
  limit: z.number().min(1).max(50).default(20),
  offset: z.number().min(0).default(0),
});

export const SearchResultSchema = z.object({
  dialogs: z.array(DialogSchema),
  messages: z.array(MessageSchema),
  users: z.array(PublicUserSchema),
  total: z.object({
    dialogs: z.number(),
    messages: z.number(),
    users: z.number(),
  }),
});

// ========================
// WebSocket Event Schemas
// ========================

export const WSEventTypeSchema = z.enum([
  'message:new',
  'message:edit',
  'message:delete',
  'message:read',
  'typing:start',
  'typing:stop',
  'presence:update',
  'dialog:new',
  'dialog:update',
  'dialog:delete',
  'user:update',
  'notification:new',
  'connection:status',
  'error'
]);

export const WSMessageNewEventSchema = z.object({
  type: z.literal('message:new'),
  data: MessageSchema,
  timestamp: z.string().datetime(),
});

export const WSMessageEditEventSchema = z.object({
  type: z.literal('message:edit'),
  data: MessageSchema,
  timestamp: z.string().datetime(),
});

export const WSMessageDeleteEventSchema = z.object({
  type: z.literal('message:delete'),
  data: z.object({
    messageId: z.string().uuid(),
    dialogId: z.string().uuid(),
  }),
  timestamp: z.string().datetime(),
});

export const WSMessageReadEventSchema = z.object({
  type: z.literal('message:read'),
  data: z.object({
    messageId: z.string().uuid(),
    dialogId: z.string().uuid(),
    userId: z.string().uuid(),
    readAt: z.string().datetime(),
  }),
  timestamp: z.string().datetime(),
});

export const WSTypingEventSchema = z.object({
  type: z.enum(['typing:start', 'typing:stop']),
  data: z.object({
    userId: z.string().uuid(),
    userName: z.string(),
    dialogId: z.string().uuid(),
  }),
  timestamp: z.string().datetime(),
});

export const WSPresenceEventSchema = z.object({
  type: z.literal('presence:update'),
  data: z.object({
    userId: z.string().uuid(),
    status: UserStatusSchema,
    isOnline: z.boolean(),
    lastSeen: z.string().datetime().optional(),
  }),
  timestamp: z.string().datetime(),
});

export const WSDialogEventSchema = z.object({
  type: z.enum(['dialog:new', 'dialog:update', 'dialog:delete']),
  data: DialogSchema,
  timestamp: z.string().datetime(),
});

export const WSUserUpdateEventSchema = z.object({
  type: z.literal('user:update'),
  data: PublicUserSchema,
  timestamp: z.string().datetime(),
});

export const WSNotificationEventSchema = z.object({
  type: z.literal('notification:new'),
  data: z.object({
    id: z.string().uuid(),
    title: z.string(),
    body: z.string(),
    icon: z.string().url().optional(),
    dialogId: z.string().uuid().optional(),
    messageId: z.string().uuid().optional(),
  }),
  timestamp: z.string().datetime(),
});

export const WSConnectionEventSchema = z.object({
  type: z.literal('connection:status'),
  data: z.object({
    status: z.enum(['connecting', 'connected', 'disconnected', 'reconnecting']),
    reason: z.string().optional(),
  }),
  timestamp: z.string().datetime(),
});

export const WSErrorEventSchema = z.object({
  type: z.literal('error'),
  data: z.object({
    code: z.string(),
    message: z.string(),
    details: z.record(z.any()).optional(),
  }),
  timestamp: z.string().datetime(),
});

// Union of all WebSocket events
export const WSEventSchema = z.discriminatedUnion('type', [
  WSMessageNewEventSchema,
  WSMessageEditEventSchema,
  WSMessageDeleteEventSchema,
  WSMessageReadEventSchema,
  WSTypingEventSchema,
  WSPresenceEventSchema,
  WSDialogEventSchema,
  WSUserUpdateEventSchema,
  WSNotificationEventSchema,
  WSConnectionEventSchema,
  WSErrorEventSchema,
]);

// ========================
// Type Exports
// ========================

export type Pagination = z.infer<typeof PaginationSchema>;
export type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
    nextCursor?: string;
    prevCursor?: string;
  };
};

export type ApiResponse<T> = z.infer<ReturnType<typeof ApiResponseSchema>>;
export type ApiError = z.infer<typeof ApiErrorSchema>;

// User types
export type User = z.infer<typeof UserSchema>;
export type PublicUser = z.infer<typeof PublicUserSchema>;
export type CurrentUser = z.infer<typeof CurrentUserSchema>;
export type UserStatus = z.infer<typeof UserStatusSchema>;

// Auth types
export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;
export type AuthTokens = z.infer<typeof AuthTokensSchema>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;
export type RefreshTokenRequest = z.infer<typeof RefreshTokenRequestSchema>;
export type RefreshTokenResponse = z.infer<typeof RefreshTokenResponseSchema>;

// Dialog types
export type Dialog = z.infer<typeof DialogSchema>;
export type DialogType = z.infer<typeof DialogTypeSchema>;
export type CreateDialogRequest = z.infer<typeof CreateDialogRequestSchema>;

// Message types
export type Message = z.infer<typeof MessageSchema>;
export type MessageType = z.infer<typeof MessageTypeSchema>;
export type MessageStatus = z.infer<typeof MessageStatusSchema>;
export type MessageAttachment = z.infer<typeof MessageAttachmentSchema>;
export type SendMessageRequest = z.infer<typeof SendMessageRequestSchema>;
export type EditMessageRequest = z.infer<typeof EditMessageRequestSchema>;

// File types
export type FileUploadResponse = z.infer<typeof FileUploadResponseSchema>;

// Search types
export type SearchRequest = z.infer<typeof SearchRequestSchema>;
export type SearchResult = z.infer<typeof SearchResultSchema>;

// WebSocket types
export type WSEventType = z.infer<typeof WSEventTypeSchema>;
export type WSEvent = z.infer<typeof WSEventSchema>;
export type WSMessageNewEvent = z.infer<typeof WSMessageNewEventSchema>;
export type WSMessageEditEvent = z.infer<typeof WSMessageEditEventSchema>;
export type WSMessageDeleteEvent = z.infer<typeof WSMessageDeleteEventSchema>;
export type WSMessageReadEvent = z.infer<typeof WSMessageReadEventSchema>;
export type WSTypingEvent = z.infer<typeof WSTypingEventSchema>;
export type WSPresenceEvent = z.infer<typeof WSPresenceEventSchema>;
export type WSDialogEvent = z.infer<typeof WSDialogEventSchema>;
export type WSUserUpdateEvent = z.infer<typeof WSUserUpdateEventSchema>;
export type WSNotificationEvent = z.infer<typeof WSNotificationEventSchema>;
export type WSConnectionEvent = z.infer<typeof WSConnectionEventSchema>;
export type WSErrorEvent = z.infer<typeof WSErrorEventSchema>;

// ========================
// Utility Types
// ========================

// Optimistic message type (for UI)
export type OptimisticMessage = Omit<Message, 'id' | 'createdAt' | 'updatedAt'> & {
  id: string; // Temporary ID
  status: 'sending' | 'failed';
  createdAt: string;
  tempId?: string;
};

// Connection state
export type ConnectionState = {
  status: 'connecting' | 'connected' | 'disconnected' | 'reconnecting';
  lastConnected?: Date;
  reconnectAttempts: number;
  error?: string;
};

// Typing state
export type TypingState = {
  [dialogId: string]: {
    [userId: string]: {
      userName: string;
      timestamp: number;
    };
  };
};

// Online users map
export type OnlineUsersMap = Map<string, {
  status: UserStatus;
  lastSeen?: Date;
}>;
