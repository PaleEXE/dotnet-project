import os
from datetime import datetime, timedelta
from typing import Any, Union, Optional
import jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel

# Password Hashing setup (matching BCrypt in C#)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT Setup matching appsettings.json
SECRET_KEY = os.getenv("JWT_KEY", "YourSuperSecretKeyThatIsAtLeast32CharsLong!")
ALGORITHM = "HS256"
ISSUER = os.getenv("JWT_ISSUER", "VolunteeringApp")
AUDIENCE = os.getenv("JWT_AUDIENCE", "VolunteeringApp")
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

security = HTTPBearer()

def _truncate_password(password: str) -> str:
    encoded = password.encode('utf-8')
    if len(encoded) > 72:
        return encoded[:72].decode('utf-8', 'ignore')
    return password

def verify_password(plain_password: str, hashed_password: str) -> bool:
    if not hashed_password:
        return False
    try:
        return pwd_context.verify(_truncate_password(plain_password), hashed_password)
    except Exception:
        return False

def get_password_hash(password: str) -> str:
    return pwd_context.hash(_truncate_password(password))

def create_access_token(
    subject: Union[str, Any], 
    role: str,
    email: str,
    name: str,
    expires_delta: timedelta = None
) -> str:
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # Matching the claims exactly as C# expects
    to_encode = {
        "exp": expire,
        "iss": ISSUER,
        "aud": AUDIENCE,
        "sub": str(subject),
        "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": role,
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress": email,
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name": name
    }
    
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

class TokenData(BaseModel):
    user_id: Optional[str] = None
    role: Optional[str] = None
    email: Optional[str] = None

def get_current_user_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> TokenData:
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM], audience=AUDIENCE, issuer=ISSUER)
        
        user_id = payload.get("sub")
        role = payload.get("http://schemas.microsoft.com/ws/2008/06/identity/claims/role")
        email = payload.get("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress")
        
        if user_id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials")
            
        return TokenData(user_id=user_id, role=role, email=email)
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
