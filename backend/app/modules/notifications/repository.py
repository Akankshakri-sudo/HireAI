from sqlalchemy import delete, func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.notifications.models import Notification


class NotificationRepository:
    @staticmethod
    async def create(db: AsyncSession, notification: Notification) -> Notification:
        db.add(notification)
        await db.commit()
        await db.refresh(notification)
        return notification

    @staticmethod
    async def get_by_user(
        db: AsyncSession, user_id: int, limit: int = 30
    ) -> list[Notification]:
        result = await db.execute(
            select(Notification)
            .where(Notification.user_id == user_id)
            .order_by(Notification.created_at.desc())
            .limit(limit)
        )
        return list(result.scalars().all())

    @staticmethod
    async def get_unread_count(db: AsyncSession, user_id: int) -> int:
        result = await db.execute(
            select(func.count(Notification.id)).where(
                Notification.user_id == user_id, Notification.is_read.is_(False)
            )
        )
        return result.scalar() or 0

    @staticmethod
    async def mark_as_read(db: AsyncSession, notification_id: int, user_id: int) -> bool:
        result = await db.execute(
            update(Notification)
            .where(Notification.id == notification_id, Notification.user_id == user_id)
            .values(is_read=True)
        )
        await db.commit()
        return result.rowcount > 0

    @staticmethod
    async def mark_all_as_read(db: AsyncSession, user_id: int) -> int:
        result = await db.execute(
            update(Notification)
            .where(Notification.user_id == user_id, Notification.is_read.is_(False))
            .values(is_read=True)
        )
        await db.commit()
        return result.rowcount

    @staticmethod
    async def delete(db: AsyncSession, notification_id: int, user_id: int) -> bool:
        result = await db.execute(
            delete(Notification).where(
                Notification.id == notification_id, Notification.user_id == user_id
            )
        )
        await db.commit()
        return result.rowcount > 0
