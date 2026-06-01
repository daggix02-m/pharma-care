export interface ManagerFlagAppeal {
  id: string;
  type: "manager_flag";
  managerId: string;
  managerName: string;
  managerEmail: string;
  pharmacyId: string;
  pharmacyName: string;
  ownerId: string;
  ownerName: string;
  flaggedBy: string;
  flaggedAt: number;
  flagReason: string;
  ownerResponse: string;
  ownerRespondedAt: number | undefined;
  status: string;
}

export interface AdminActionAppeal {
  id: string;
  type: "admin_action";
  targetUserId: string;
  targetUserName: string;
  targetUserEmail: string;
  pharmacyId: string;
  pharmacyName: string;
  ownerId: string;
  ownerName: string;
  performedBy: string;
  actionType: string;
  reason: string;
  timestamp: number;
  ownerNotifiedAt: number;
  actionStatus: string;
}

export type AppealUnion = ManagerFlagAppeal | AdminActionAppeal;
