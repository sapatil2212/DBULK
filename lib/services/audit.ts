import { prisma } from '@/lib/db';

type AuditAction = 
  | 'LOGIN'
  | 'LOGOUT'
  | 'SIGNUP'
  | 'OTP_SENT'
  | 'OTP_VERIFIED'
  | 'PASSWORD_RESET'
  | 'WHATSAPP_CONNECTED'
  | 'WHATSAPP_DISCONNECTED'
  | 'TEMPLATE_CREATED'
  | 'TEMPLATE_SUBMITTED'
  | 'CAMPAIGN_CREATED'
  | 'CAMPAIGN_STARTED'
  | 'SETTINGS_UPDATED';

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

interface AuditLogParams {
  tenantId: string;
  userId?: string;
  action: AuditAction;
  entityType?: string;
  entityId?: string;
  oldValue?: JsonValue;
  newValue?: JsonValue;
  ipAddress?: string;
  userAgent?: string;
  metadata?: JsonValue;
}

export async function createAuditLog(params: AuditLogParams): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        tenantId: params.tenantId,
        userId: params.userId,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        oldValue: params.oldValue ?? undefined,
        newValue: params.newValue ?? undefined,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        metadata: params.metadata ?? undefined,
      },
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
}
