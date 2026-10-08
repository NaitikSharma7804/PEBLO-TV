"""
Authentication and role-based access control dependencies.
Simulates role verification using the X-User-Role HTTP header.
"""

from fastapi import Header, HTTPException, status

# Simple dependency to simulate role-based authentication via headers for this take-home
# In production, this would be JWT-based.
def get_current_user_role(x_user_role: str = Header(default="editor", description="Pass 'editor' or 'admin'")):
    """Extracts and verifies that the provided role header is valid (editor or admin)."""
    if x_user_role not in ["editor", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing user role. Pass 'editor' or 'admin' in the X-User-Role header."
        )
    return x_user_role

def require_admin(x_user_role: str = Header(default="editor")):
    """Dependency guard ensuring the requesting user has administrator privileges."""
    role = get_current_user_role(x_user_role)
    if role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required for this action."
        )
    return role