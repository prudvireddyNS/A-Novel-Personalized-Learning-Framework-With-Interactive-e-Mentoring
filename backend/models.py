from sqlalchemy import Boolean, Column, String, Integer, ForeignKey, DateTime, Text, Float, Enum
from sqlalchemy.orm import relationship
from database import Base
import enum
from datetime import datetime

class UserRole(str, enum.Enum):
    STUDENT = "student"
    ADMIN = "admin"

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=True)  # Nullable for Google OAuth users
    google_id = Column(String, unique=True, nullable=True)
    role = Column(Enum(UserRole), default=UserRole.STUDENT, nullable=False)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    # Relationships
    enrollments = relationship("Enrollment", back_populates="student")
    created_courses = relationship("Course", back_populates="admin")
    submissions = relationship("AssignmentSubmission", back_populates="student")

class Course(Base):
    __tablename__ = "courses"

    id = Column(String, primary_key=True, index=True)
    title = Column(String)
    description = Column(Text)
    image_url = Column(String)
    duration = Column(String)  # e.g., "12 weeks"
    level = Column(String)     # e.g., "Beginner", "Intermediate", "Advanced"
    created_at = Column(DateTime, default=datetime.utcnow)
    admin_id = Column(String, ForeignKey("users.id"))

    # Relationships
    admin = relationship("User", back_populates="created_courses")
    enrollments = relationship("Enrollment", back_populates="course")
    lessons = relationship("Lesson", back_populates="course")
    assignments = relationship("Assignment", back_populates="course")

class Enrollment(Base):
    __tablename__ = "enrollments"

    id = Column(String, primary_key=True, index=True)
    student_id = Column(String, ForeignKey("users.id"))
    course_id = Column(String, ForeignKey("courses.id"))
    enrolled_at = Column(DateTime, default=datetime.utcnow)
    progress = Column(Float, default=0.0)  # Percentage of course completion

    # Relationships
    student = relationship("User", back_populates="enrollments")
    course = relationship("Course", back_populates="enrollments")

class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(String, primary_key=True, index=True)
    course_id = Column(String, ForeignKey("courses.id"))
    title = Column(String)
    content = Column(Text)
    order = Column(Integer)  # For ordering lessons within a course
    scheduled_time = Column(DateTime)

    # Relationships
    course = relationship("Course", back_populates="lessons")

class Assignment(Base):
    __tablename__ = "assignments"

    id = Column(String, primary_key=True, index=True)
    course_id = Column(String, ForeignKey("courses.id"))
    title = Column(String)
    description = Column(Text)
    due_date = Column(DateTime)
    total_points = Column(Integer)

    # Relationships
    course = relationship("Course", back_populates="assignments")
    submissions = relationship("AssignmentSubmission", back_populates="assignment")

class AssignmentSubmission(Base):
    __tablename__ = "assignment_submissions"

    id = Column(String, primary_key=True, index=True)
    assignment_id = Column(String, ForeignKey("assignments.id"))
    student_id = Column(String, ForeignKey("users.id"))
    submitted_at = Column(DateTime, default=datetime.utcnow)
    content = Column(Text)
    grade = Column(Float, nullable=True)
    feedback = Column(Text, nullable=True)

    # Relationships
    assignment = relationship("Assignment", back_populates="submissions")
    student = relationship("User", back_populates="submissions")