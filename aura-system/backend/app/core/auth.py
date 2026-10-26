"""
Authentication and Role-Based Access Control (RBAC) Module for AURA.
Enforces capability-based access control separating Officer and Student actions.
"""

from typing import Optional, Set
from fastapi import Header, HTTPException, status, Depends
from pydantic import BaseModel


class AuthenticatedUser(BaseModel):
    user_id: str
    email: str
    role: str  # "officer" | "user"
    capabilities: Set[str]


# Predefined Role-to-Capability Mappings
ROLE_CAPABILITIES = {
    "officer": {
        "manage_knowledge_base",
        "sync_knowledge_base",
        "delete_ground_truth",
        "audit_documents",
        "view_audit_history",
        "view_telemetry",
        "export_reports",
    },
    "user": {
        "audit_documents",
        "export_reports",
        "view_own_history",
    },
}


def get_current_user(
    x_aura_role: Optional[str] = Header(default=None, alias="X-AURA-Role"),
    authorization: Optional[str] = Header(default=None),
) -> AuthenticatedUser:
    """
    Resolves the authenticated user identity and associated capabilities.
    Checks authorization headers, falling back to role header or default demo user.
    """
    # 1. Check Bearer Token if present
    role = "user"
    email = "student@university.edu"
    user_id = "user_student_demo"

    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1].lower()
        if "officer" in token or "admin" in token or "registrar" in token:
            role = "officer"
            email = "registrar@university.edu"
            user_id = "user_officer_demo"

    # 2. Check X-AURA-Role header
    elif x_aura_role:
        role = x_aura_role.lower().strip()
        if role == "officer":
            email = "registrar@university.edu"
            user_id = "user_officer_demo"
        else:
            role = "user"
            email = "student@university.edu"
            user_id = "user_student_demo"

    capabilities = ROLE_CAPABILITIES.get(role, ROLE_CAPABILITIES["user"])

    return AuthenticatedUser(
        user_id=user_id,
        email=email,
        role=role,
        capabilities=capabilities,
    )


def require_capability(capability: str):
    """
    FastAPI dependency factory enforcing a specific capability.
    Rejects with 403 Forbidden if user lacks the capability.
    """
    def _dependency(user: AuthenticatedUser = Depends(get_current_user)) -> AuthenticatedUser:
        if capability not in user.capabilities:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Forbidden: Account role '{user.role}' lacks the required capability '{capability}'. "
                       f"Ground truth modification is strictly restricted to Academic Officers.",
            )
        return user

    return _dependency


# Standard capability dependencies
require_knowledge_admin = require_capability("manage_knowledge_base")
require_document_auditor = require_capability("audit_documents")
require_telemetry_viewer = require_capability("view_telemetry")
