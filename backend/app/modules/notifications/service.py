from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.notifications.models import Notification
from app.modules.notifications.repository import NotificationRepository
from app.modules.notifications.schemas import NotificationCreate


class NotificationService:
    @staticmethod
    async def create_notification(
        db: AsyncSession, data: NotificationCreate
    ) -> Notification:
        notif = Notification(
            user_id=data.user_id,
            title=data.title,
            message=data.message,
            type=data.type,
            link=data.link,
        )
        return await NotificationRepository.create(db, notif)

    @staticmethod
    async def get_user_notifications(
        db: AsyncSession, user_id: int, limit: int = 30
    ) -> list[Notification]:
        return await NotificationRepository.get_by_user(db, user_id, limit)

    @staticmethod
    async def get_unread_count(db: AsyncSession, user_id: int) -> int:
        return await NotificationRepository.get_unread_count(db, user_id)

    @staticmethod
    async def mark_read(db: AsyncSession, notification_id: int, user_id: int) -> bool:
        return await NotificationRepository.mark_as_read(db, notification_id, user_id)

    @staticmethod
    async def mark_all_read(db: AsyncSession, user_id: int) -> int:
        return await NotificationRepository.mark_all_as_read(db, user_id)

    @staticmethod
    async def delete_notification(
        db: AsyncSession, notification_id: int, user_id: int
    ) -> bool:
        return await NotificationRepository.delete(db, notification_id, user_id)
