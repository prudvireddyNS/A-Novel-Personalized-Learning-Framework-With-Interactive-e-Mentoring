from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
# from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import models, database, auth
from typing import List
import uuid
from datetime import datetime, timedelta

# Create database tables
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5175", "https://a-novel-personalized-learning-git-5db0d2-vemu-project-b4a5aba8.vercel.app"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Authentication endpoints
@app.post("/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = auth.create_access_token(data={"sub": user.id})
    return {"access_token": access_token, "token_type": "bearer", "role": user.role}

@app.post("/google-login")
async def google_login(token: str, db: Session = Depends(database.get_db)):
    return await auth.verify_google_token(token, db)

# User management endpoints
from pydantic import BaseModel

class UserCreate(BaseModel):
    email: str
    password: str
    role: models.UserRole
    first_name: str
    last_name: str

class UserResponse(BaseModel):
    id: str
    email: str
    role: models.UserRole
    first_name: str
    last_name: str
    created_at: datetime

@app.post("/users/", response_model=UserResponse)
async def create_user(user: UserCreate, db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    if user.role not in [models.UserRole.STUDENT, models.UserRole.ADMIN]:
        raise HTTPException(status_code=400, detail="Invalid role")
    
    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(
        id=str(uuid.uuid4()),
        email=user.email,
        password=hashed_password,
        role=user.role,
        first_name=user.first_name,
        last_name=user.last_name
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.get("/users/me")
async def get_current_user(current_user: str = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.id == current_user).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# Course management endpoints (Admin only)
@app.post("/courses/")
async def create_course(
    title: str,
    description: str,
    image_url: str,
    duration: str,
    level: str,
    current_user: str = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    user = db.query(models.User).filter(models.User.id == current_user).first()
    if user.role != models.UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    course = models.Course(
        id=str(uuid.uuid4()),
        title=title,
        description=description,
        image_url=image_url,
        duration=duration,
        level=level,
        admin_id=current_user
    )
    db.add(course)
    db.commit()
    db.refresh(course)
    return course

@app.get("/courses/")
async def get_courses(db: Session = Depends(database.get_db)):
    return db.query(models.Course).all()

@app.get("/courses/{course_id}")
async def get_course(course_id: str, db: Session = Depends(database.get_db)):
    if not course_id or course_id == "undefined":
        raise HTTPException(status_code=400, detail="Course ID is required and cannot be undefined")
    if not isinstance(course_id, str) or not course_id.strip():
        raise HTTPException(status_code=400, detail="Invalid course ID format")
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course

@app.get("/assignments/admin")
async def get_admin_assignments(
    current_user: str = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    user = db.query(models.User).filter(models.User.id == current_user).first()
    if user.role != models.UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    assignments = db.query(models.Assignment).all()
    assignments_with_stats = []
    
    for assignment in assignments:
        submissions = db.query(models.AssignmentSubmission).filter(
            models.AssignmentSubmission.assignment_id == assignment.id
        ).all()
        
        total_submissions = len(submissions)
        graded_submissions = len([s for s in submissions if s.grade is not None])
        average_grade = sum([s.grade for s in submissions if s.grade is not None]) / graded_submissions if graded_submissions > 0 else 0
        
        assignment_dict = {
            "id": assignment.id,
            "title": assignment.title,
            "description": assignment.description,
            "due_date": assignment.due_date,
            "total_points": assignment.total_points,
            "course_id": assignment.course_id,
            "course_title": assignment.course.title,
            "total_submissions": total_submissions,
            "graded_submissions": graded_submissions,
            "average_grade": round(average_grade, 2)
        }
        assignments_with_stats.append(assignment_dict)
    
    return assignments_with_stats

@app.put("/courses/{course_id}")
async def update_course(
    course_id: str,
    title: str = None,
    description: str = None,
    image_url: str = None,
    duration: str = None,
    level: str = None,
    current_user: str = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    user = db.query(models.User).filter(models.User.id == current_user).first()
    if user.role != models.UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    if title is not None:
        course.title = title
    if description is not None:
        course.description = description
    if image_url is not None:
        course.image_url = image_url
    if duration is not None:
        course.duration = duration
    if level is not None:
        course.level = level
    
    db.commit()
    db.refresh(course)
    return course

@app.delete("/courses/{course_id}")
async def delete_course(
    course_id: str,
    current_user: str = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    user = db.query(models.User).filter(models.User.id == current_user).first()
    if user.role != models.UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Check if there are enrollments for this course
    enrollments = db.query(models.Enrollment).filter(models.Enrollment.course_id == course_id).all()
    if enrollments:
        raise HTTPException(status_code=400, detail="Cannot delete course with active enrollments")
    
    # Delete associated assignments
    assignments = db.query(models.Assignment).filter(models.Assignment.course_id == course_id).all()
    for assignment in assignments:
        # Delete submissions for each assignment
        submissions = db.query(models.AssignmentSubmission).filter(
            models.AssignmentSubmission.assignment_id == assignment.id
        ).all()
        for submission in submissions:
            db.delete(submission)
        db.delete(assignment)
    
    # Delete lessons
    lessons = db.query(models.Lesson).filter(models.Lesson.course_id == course_id).all()
    for lesson in lessons:
        db.delete(lesson)
    
    db.delete(course)
    db.commit()
    return {"message": "Course deleted successfully"}

# Enrollment endpoints (Student)
# Add this with your other Pydantic models at the top
class EnrollmentCreate(BaseModel):
    course_id: str

# Update the enrollment endpoint
@app.post("/enrollments/")
async def create_enrollment(
    enrollment: EnrollmentCreate,
    current_user: str = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    user = db.query(models.User).filter(models.User.id == current_user).first()
    if user.role != models.UserRole.STUDENT:
        raise HTTPException(status_code=403, detail="Only students can enroll in courses")
    
    existing_enrollment = db.query(models.Enrollment).filter(
        models.Enrollment.student_id == current_user,
        models.Enrollment.course_id == enrollment.course_id
    ).first()
    
    if existing_enrollment:
        raise HTTPException(status_code=400, detail="Already enrolled in this course")
    
    new_enrollment = models.Enrollment(
        id=str(uuid.uuid4()),
        student_id=current_user,
        course_id=enrollment.course_id
    )
    db.add(new_enrollment)
    db.commit()
    db.refresh(new_enrollment)
    return new_enrollment

# Assignment endpoints
@app.post("/assignments/")
async def create_assignment(
    course_id: str,
    title: str,
    description: str,
    due_date: datetime,
    total_points: int,
    current_user: str = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    user = db.query(models.User).filter(models.User.id == current_user).first()
    if user.role != models.UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Only admins can create assignments")
    
    assignment = models.Assignment(
        id=str(uuid.uuid4()),
        course_id=course_id,
        title=title,
        description=description,
        due_date=due_date,
        total_points=total_points
    )
    db.add(assignment)
    db.commit()
    db.refresh(assignment)
    return assignment

@app.post("/assignments/{assignment_id}/submit")
async def submit_assignment(
    assignment_id: str,
    content: str,
    current_user: str = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    user = db.query(models.User).filter(models.User.id == current_user).first()
    if user.role != models.UserRole.STUDENT:
        raise HTTPException(status_code=403, detail="Only students can submit assignments")
    
    submission = models.AssignmentSubmission(
        id=str(uuid.uuid4()),
        assignment_id=assignment_id,
        student_id=current_user,
        content=content
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)
    return submission

@app.post("/assignments/{assignment_id}/grade")
async def grade_assignment(
    assignment_id: str,
    submission_id: str,
    grade: float,
    feedback: str,
    current_user: str = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    user = db.query(models.User).filter(models.User.id == current_user).first()
    if user.role != models.UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Only admins can grade assignments")
    
    submission = db.query(models.AssignmentSubmission).filter(
        models.AssignmentSubmission.id == submission_id,
        models.AssignmentSubmission.assignment_id == assignment_id
    ).first()
    
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    submission.grade = grade
    submission.feedback = feedback
    db.commit()
    db.refresh(submission)
    return submission

@app.get("/enrollments/student")
async def get_student_enrollments(
    current_user: str = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    user = db.query(models.User).filter(models.User.id == current_user).first()
    if user.role != models.UserRole.STUDENT:
        raise HTTPException(status_code=403, detail="Only students can view their enrollments")
    
    enrollments = db.query(models.Enrollment).filter(
        models.Enrollment.student_id == current_user
    ).all()
    
    # Get the course details for each enrollment
    enrolled_courses = []
    for enrollment in enrollments:
        course = db.query(models.Course).filter(models.Course.id == enrollment.course_id).first()
        if course:
            enrolled_courses.append({
                "enrollment_id": enrollment.id,
                "course_id": course.id,
                "title": course.title,
                "description": course.description,
                "image_url": course.image_url,
                "duration": course.duration,
                "level": course.level,
                "enrolled_at": enrollment.enrolled_at
            })
    
    return enrolled_courses

@app.get("/assignments/student")
async def get_student_assignments(
    current_user: str = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    user = db.query(models.User).filter(models.User.id == current_user).first()
    if user.role != models.UserRole.STUDENT:
        raise HTTPException(status_code=403, detail="Only students can view their assignments")
    
    # Get student's enrolled courses
    enrollments = db.query(models.Enrollment).filter(
        models.Enrollment.student_id == current_user
    ).all()
    
    enrolled_course_ids = [enrollment.course_id for enrollment in enrollments]
    
    # Get all assignments from enrolled courses
    assignments = db.query(models.Assignment).filter(
        models.Assignment.course_id.in_(enrolled_course_ids)
    ).all()
    
    # Format response with additional course information
    assignments_with_details = []
    for assignment in assignments:
        course = db.query(models.Course).filter(models.Course.id == assignment.course_id).first()
        submission = db.query(models.AssignmentSubmission).filter(
            models.AssignmentSubmission.assignment_id == assignment.id,
            models.AssignmentSubmission.student_id == current_user
        ).first()
        
        assignments_with_details.append({
            "assignment_id": assignment.id,
            "title": assignment.title,
            "description": assignment.description,
            "due_date": assignment.due_date,
            "total_points": assignment.total_points,
            "course_id": course.id,
            "course_title": course.title,
            "status": "overdue" if assignment.due_date < datetime.utcnow() and not submission else
                     "submitted" if submission else
                     "upcoming",
            "submitted": submission is not None,
            "submission_id": submission.id if submission else None,
            "grade": submission.grade if submission and submission.grade is not None else None,
            "feedback": submission.feedback if submission and submission.feedback is not None else None
        })
    
    return sorted(assignments_with_details, key=lambda x: x["due_date"])

@app.get("/assignments/student/upcoming")
async def get_student_upcoming_assignments(
    current_user: str = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    user = db.query(models.User).filter(models.User.id == current_user).first()
    if user.role != models.UserRole.STUDENT:
        raise HTTPException(status_code=403, detail="Only students can view their assignments")
    
    # Get student's enrolled courses
    enrollments = db.query(models.Enrollment).filter(
        models.Enrollment.student_id == current_user
    ).all()
    
    enrolled_course_ids = [enrollment.course_id for enrollment in enrollments]
    
    # Get upcoming assignments from enrolled courses
    upcoming_assignments = db.query(models.Assignment).filter(
        models.Assignment.course_id.in_(enrolled_course_ids),
        models.Assignment.due_date > datetime.utcnow()
    ).all()
    
    # Format response with additional course information
    assignments_with_details = []
    for assignment in upcoming_assignments:
        course = db.query(models.Course).filter(models.Course.id == assignment.course_id).first()
        # Check if the student has already submitted this assignment
        submission = db.query(models.AssignmentSubmission).filter(
            models.AssignmentSubmission.assignment_id == assignment.id,
            models.AssignmentSubmission.student_id == current_user
        ).first()
        
        assignments_with_details.append({
            "assignment_id": assignment.id,
            "title": assignment.title,
            "description": assignment.description,
            "due_date": assignment.due_date,
            "total_points": assignment.total_points,
            "course_id": course.id,
            "course_title": course.title,
            "submitted": submission is not None,
            "submission_id": submission.id if submission else None,
            "grade": submission.grade if submission and submission.grade is not None else None
        })
    
    return sorted(assignments_with_details, key=lambda x: x["due_date"])


@app.get("/assignments/{assignment_id}")
async def get_assignment_details(
    assignment_id: str,
    current_user: str = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    user = db.query(models.User).filter(models.User.id == current_user).first()
    
    # Get the assignment
    assignment = db.query(models.Assignment).filter(
        models.Assignment.id == assignment_id
    ).first()
    
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    
    # Get the course
    course = db.query(models.Course).filter(models.Course.id == assignment.course_id).first()
    
    # For students, check if they're enrolled in the course
    if user.role == models.UserRole.STUDENT:
        enrollment = db.query(models.Enrollment).filter(
            models.Enrollment.student_id == current_user,
            models.Enrollment.course_id == course.id
        ).first()
        if not enrollment:
            raise HTTPException(status_code=403, detail="Not enrolled in this course")
    
    # Get submission if it exists (for students)
    submission = None
    if user.role == models.UserRole.STUDENT:
        submission = db.query(models.AssignmentSubmission).filter(
            models.AssignmentSubmission.assignment_id == assignment_id,
            models.AssignmentSubmission.student_id == current_user
        ).first()
    
    return {
        "assignment_id": assignment.id,
        "title": assignment.title,
        "description": assignment.description,
        "due_date": assignment.due_date,
        "total_points": assignment.total_points,
        "course_id": course.id,
        "course_title": course.title,
        "status": "overdue" if assignment.due_date < datetime.utcnow() and not submission else
                 "submitted" if submission else
                 "upcoming",
        "submitted": submission is not None if user.role == models.UserRole.STUDENT else None,
        "submission_id": submission.id if submission else None,
        "grade": submission.grade if submission and submission.grade is not None else None,
        "feedback": submission.feedback if submission and submission.feedback is not None else None
    }

@app.get("/assignments/admin")
async def get_admin_assignments(
    current_user: str = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    user = db.query(models.User).filter(models.User.id == current_user).first()
    if user.role != models.UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Get all assignments
    assignments = db.query(models.Assignment).all()
    
    # Format response with additional course information
    assignments_with_details = []
    for assignment in assignments:
        course = db.query(models.Course).filter(models.Course.id == assignment.course_id).first()
        # Count submissions for this assignment
        submission_count = db.query(models.AssignmentSubmission).filter(
            models.AssignmentSubmission.assignment_id == assignment.id
        ).count()
        
        # Count graded submissions
        graded_count = db.query(models.AssignmentSubmission).filter(
            models.AssignmentSubmission.assignment_id == assignment.id,
            models.AssignmentSubmission.grade != None
        ).count()
        
        assignments_with_details.append({
            "assignment_id": assignment.id,
            "title": assignment.title,
            "description": assignment.description,
            "due_date": assignment.due_date,
            "total_points": assignment.total_points,
            "course_id": course.id,
            "course_title": course.title,
            "submission_count": submission_count,
            "graded_count": graded_count,
            "status": "past" if assignment.due_date < datetime.utcnow() else "upcoming"
        })
    
    return sorted(assignments_with_details, key=lambda x: x["due_date"])

@app.get("/assignments/{assignment_id}/submissions")
async def get_assignment_submissions(
    assignment_id: str,
    current_user: str = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    user = db.query(models.User).filter(models.User.id == current_user).first()
    if user.role != models.UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Get the assignment
    assignment = db.query(models.Assignment).filter(
        models.Assignment.id == assignment_id
    ).first()
    
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    
    # Get all submissions for this assignment
    submissions = db.query(models.AssignmentSubmission).filter(
        models.AssignmentSubmission.assignment_id == assignment_id
    ).all()
    
    # Format response with student information
    submissions_with_details = []
    for submission in submissions:
        student = db.query(models.User).filter(models.User.id == submission.student_id).first()
        
        submissions_with_details.append({
            "submission_id": submission.id,
            "student_id": student.id,
            "student_name": f"{student.first_name} {student.last_name}",
            "student_email": student.email,
            "submitted_at": submission.submitted_at,
            "content": submission.content,
            "grade": submission.grade,
            "feedback": submission.feedback,
            "graded": submission.grade is not None
        })
    
    return sorted(submissions_with_details, key=lambda x: x["submitted_at"], reverse=True)

@app.get("/assignments/{assignment_id}/submission")
async def get_student_submission(
    assignment_id: str,
    current_user: str = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    user = db.query(models.User).filter(models.User.id == current_user).first()
    if user.role != models.UserRole.STUDENT:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Get the assignment
    assignment = db.query(models.Assignment).filter(
        models.Assignment.id == assignment_id
    ).first()
    
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    
    # Check if student is enrolled in the course
    course = db.query(models.Course).filter(models.Course.id == assignment.course_id).first()
    enrollment = db.query(models.Enrollment).filter(
        models.Enrollment.student_id == current_user,
        models.Enrollment.course_id == course.id
    ).first()
    
    if not enrollment:
        raise HTTPException(status_code=403, detail="Not enrolled in this course")
    
    # Get student's submission
    submission = db.query(models.AssignmentSubmission).filter(
        models.AssignmentSubmission.assignment_id == assignment_id,
        models.AssignmentSubmission.student_id == current_user
    ).first()
    
    if not submission:
        return {
            "assignment_id": assignment_id,
            "submitted": False,
            "course_title": course.title,
            "assignment_title": assignment.title,
            "due_date": assignment.due_date,
            "total_points": assignment.total_points,
            "overdue": assignment.due_date < datetime.utcnow()
        }
    
    return {
        "submission_id": submission.id,
        "assignment_id": assignment_id,
        "submitted": True,
        "submitted_at": submission.submitted_at,
        "content": submission.content,
        "grade": submission.grade,
        "feedback": submission.feedback,
        "graded": submission.grade is not None,
        "course_title": course.title,
        "assignment_title": assignment.title,
        "due_date": assignment.due_date,
        "total_points": assignment.total_points
    }

@app.get("/admin/dashboard/stats")
async def get_admin_dashboard_stats(
    current_user: str = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    user = db.query(models.User).filter(models.User.id == current_user).first()
    if user.role != models.UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Get counts
    total_students = db.query(models.User).filter(models.User.role == models.UserRole.STUDENT).count()
    total_courses = db.query(models.Course).count()
    total_enrollments = db.query(models.Enrollment).count()
    total_assignments = db.query(models.Assignment).count()
    total_submissions = db.query(models.AssignmentSubmission).count()
    
    # Get pending submissions (submitted but not graded)
    pending_submissions = db.query(models.AssignmentSubmission).filter(
        models.AssignmentSubmission.grade == None
    ).count()
    
    # Get upcoming assignments
    upcoming_assignments = db.query(models.Assignment).filter(
        models.Assignment.due_date > datetime.utcnow()
    ).count()
    
    # Get recent enrollments (last 30 days)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    recent_enrollments = db.query(models.Enrollment).filter(
        models.Enrollment.enrolled_at > thirty_days_ago
    ).count()
    
    # Get course enrollment distribution
    course_enrollments = []
    courses = db.query(models.Course).all()
    for course in courses:
        enrollment_count = db.query(models.Enrollment).filter(
            models.Enrollment.course_id == course.id
        ).count()
        course_enrollments.append({
            "course_id": course.id,
            "course_title": course.title,
            "enrollment_count": enrollment_count
        })
    
    return {
        "total_students": total_students,
        "total_courses": total_courses,
        "total_enrollments": total_enrollments,
        "total_assignments": total_assignments,
        "total_submissions": total_submissions,
        "pending_submissions": pending_submissions,
        "upcoming_assignments": upcoming_assignments,
        "recent_enrollments": recent_enrollments,
        "course_enrollments": sorted(course_enrollments, key=lambda x: x["enrollment_count"], reverse=True)
    }
