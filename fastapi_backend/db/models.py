from datetime import datetime
from typing import List, Optional
from sqlalchemy import String, Boolean, DateTime, ForeignKey, Float
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

class Base(DeclarativeBase):
    pass

class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    full_name: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(String(150), unique=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    phone_number: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    role: Mapped[str] = mapped_column(String(20), default="student")
    university_id: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    taking_volunteering_course: Mapped[bool] = mapped_column(Boolean, default=False)
    profile_picture_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    is_blocked: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    organization_reviews: Mapped[List["OrganizationReview"]] = relationship(back_populates="user")
    task_volunteers: Mapped[List["TaskVolunteer"]] = relationship(back_populates="user")
    volunteer_hours: Mapped[List["VolunteerHour"]] = relationship(back_populates="user")

class Organization(Base):
    __tablename__ = "organizations"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(150))
    email: Mapped[str] = mapped_column(String(150), unique=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    phone_number: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    logo_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    banner_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    description: Mapped[Optional[str]] = mapped_column(String(1000), nullable=True)
    is_approved: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    tasks: Mapped[List["Task"]] = relationship(back_populates="organization")
    reviews: Mapped[List["OrganizationReview"]] = relationship(back_populates="organization")

class Task(Base):
    __tablename__ = "tasks"
    id: Mapped[int] = mapped_column(primary_key=True)
    organization_id: Mapped[int] = mapped_column(ForeignKey("organizations.id"))
    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[Optional[str]] = mapped_column(nullable=True)
    max_volunteers: Mapped[Optional[int]] = mapped_column(nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="open")
    start_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    end_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    organization: Mapped["Organization"] = relationship(back_populates="tasks")
    task_volunteers: Mapped[List["TaskVolunteer"]] = relationship(back_populates="task", cascade="all, delete")
    volunteer_hours: Mapped[List["VolunteerHour"]] = relationship(back_populates="task", cascade="all, delete")
    task_images: Mapped[List["TaskImage"]] = relationship(back_populates="task", cascade="all, delete")
    task_tags: Mapped[List["TaskTag"]] = relationship(back_populates="task", cascade="all, delete")

class TaskVolunteer(Base):
    __tablename__ = "task_volunteers"
    id: Mapped[int] = mapped_column(primary_key=True)
    task_id: Mapped[int] = mapped_column(ForeignKey("tasks.id"))
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    status: Mapped[str] = mapped_column(String(20), default="pending")
    joined_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped["User"] = relationship(back_populates="task_volunteers")
    task: Mapped["Task"] = relationship(back_populates="task_volunteers")

class VolunteerHour(Base):
    __tablename__ = "volunteer_hours"
    id: Mapped[int] = mapped_column(primary_key=True)
    task_id: Mapped[int] = mapped_column(ForeignKey("tasks.id"))
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    hours_worked: Mapped[float] = mapped_column(Float)
    notes: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    recorded_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped["User"] = relationship(back_populates="volunteer_hours")
    task: Mapped["Task"] = relationship(back_populates="volunteer_hours")

class TaskImage(Base):
    __tablename__ = "task_images"
    id: Mapped[int] = mapped_column(primary_key=True)
    task_id: Mapped[int] = mapped_column(ForeignKey("tasks.id"))
    image_url: Mapped[str] = mapped_column(String(500))
    uploaded_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    task: Mapped["Task"] = relationship(back_populates="task_images")

class Tag(Base):
    __tablename__ = "tags"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(50), unique=True)
    
    task_tags: Mapped[List["TaskTag"]] = relationship(back_populates="tag", cascade="all, delete")

class TaskTag(Base):
    __tablename__ = "task_tags"
    task_id: Mapped[int] = mapped_column(ForeignKey("tasks.id"), primary_key=True)
    tag_id: Mapped[int] = mapped_column(ForeignKey("tags.id"), primary_key=True)

    task: Mapped["Task"] = relationship(back_populates="task_tags")
    tag: Mapped["Tag"] = relationship(back_populates="task_tags")

class OrganizationReview(Base):
    __tablename__ = "organization_reviews"
    id: Mapped[int] = mapped_column(primary_key=True)
    organization_id: Mapped[int] = mapped_column(ForeignKey("organizations.id"))
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    rating: Mapped[int] = mapped_column()
    comment: Mapped[Optional[str]] = mapped_column(String(1000), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped["User"] = relationship(back_populates="organization_reviews")
    organization: Mapped["Organization"] = relationship(back_populates="reviews")
