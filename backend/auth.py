from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
import database, models
from authlib.integrations.starlette_client import OAuth
from starlette.config import Config
import httpx
import uuid

import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")  # Get from environment variable
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Google OAuth configuration
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")  # Get from environment variable
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")  # Get from environment variable
GOOGLE_DISCOVERY_URL = "https://accounts.google.com/.well-known/openid-configuration"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Initialize OAuth
config = Config()
config.__setattr__("GOOGLE_CLIENT_ID", GOOGLE_CLIENT_ID)
config.__setattr__("GOOGLE_CLIENT_SECRET", GOOGLE_CLIENT_SECRET)

oauth = OAuth(config)
oauth.register(
    name="google",
    server_metadata_url=GOOGLE_DISCOVERY_URL,
    client_kwargs={
        "scope": "openid email profile",
        "redirect_uri": "http://localhost:5173",  # Update frontend URL (remove trailing slash)
        "response_type": "code",
        "grant_type": "authorization_code"
    }
)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user is None:
        raise credentials_exception
    return user.id

async def verify_google_token(token: str, db: Session):
    """Verify Google ID token and return or create user"""
    try:
        # Verify the token with Google
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://oauth2.googleapis.com/tokeninfo?id_token={token}"
            )
            if response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid Google token"
                )
            
            google_data = response.json()
            email = google_data.get("email")
            google_id = google_data.get("sub")
            
            if not email or not google_id:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid Google token data"
                )
            
            # Check if user exists with this Google ID
            user = db.query(models.User).filter(models.User.google_id == google_id).first()
            
            # If not, check if user exists with this email
            if not user:
                user = db.query(models.User).filter(models.User.email == email).first()
                
                # If user exists with email but no Google ID, update the user
                if user:
                    user.google_id = google_id
                    db.commit()
                # If no user exists at all, create a new one
                else:
                    user = models.User(
                        id=str(uuid.uuid4()),
                        email=email,
                        google_id=google_id,
                        password=None,  # No password for Google users
                        role=models.UserRole.STUDENT,  # Default role for Google users
                        first_name=google_data.get("given_name", ""),
                        last_name=google_data.get("family_name", "")
                    )
                    db.add(user)
                    db.commit()
                    db.refresh(user)
            
            # Create access token
            access_token = create_access_token(
                data={"sub": user.id},
                expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
            )
            
            return {"access_token": access_token, "token_type": "bearer", "role": user.role}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Google authentication failed: {str(e)}"
        )
