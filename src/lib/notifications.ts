import { prisma } from "@/lib/prisma";

type NotificationType =
  | "FOLLOW"
  | "LIKE"
  | "COMMENT"
  | "REPLY"
  | "MENTION"
  | "MESSAGE"
  | "ANSWER_ACCEPTED"
  | "JOB_UPDATE"
  | "COLLABORATION"
  | "COMMUNITY_INVITE"
  | "SYSTEM";

type CreateNotificationInput = {
  userId: string;
  type: NotificationType;
  title: string;
  body?: string;
  data?: Record<string, unknown>;
  actorId?: string;
};

export async function createNotification(input: CreateNotificationInput) {
  if (input.actorId && input.actorId === input.userId) {
    return null;
  }

  try {
    return await prisma.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        title: input.title,
        body: input.body,
        data: input.data ?? undefined,
      },
    });
  } catch (error) {
    console.error("[CREATE_NOTIFICATION]", error);
    return null;
  }
}

export async function notifyPostLike(params: {
  postAuthorId: string;
  actorId: string;
  postId: string;
  actorName: string;
}) {
  return createNotification({
    userId: params.postAuthorId,
    actorId: params.actorId,
    type: "LIKE",
    title: "لایک جدید",
    body: `${params.actorName} پست شما را پسندید`,
    data: { postId: params.postId, actorId: params.actorId },
  });
}

export async function notifyPostComment(params: {
  postAuthorId: string;
  actorId: string;
  postId: string;
  commentId: string;
  actorName: string;
  preview: string;
}) {
  return createNotification({
    userId: params.postAuthorId,
    actorId: params.actorId,
    type: "COMMENT",
    title: "کامنت جدید",
    body: `${params.actorName}: ${params.preview.slice(0, 80)}`,
    data: {
      postId: params.postId,
      commentId: params.commentId,
      actorId: params.actorId,
    },
  });
}

export async function notifyFollow(params: {
  targetUserId: string;
  actorId: string;
  actorName: string;
  actorUsername?: string | null;
}) {
  return createNotification({
    userId: params.targetUserId,
    actorId: params.actorId,
    type: "FOLLOW",
    title: "دنبال‌کننده جدید",
    body: `${params.actorName} شما را دنبال کرد`,
    data: {
      followerId: params.actorId,
      username: params.actorUsername,
    },
  });
}
