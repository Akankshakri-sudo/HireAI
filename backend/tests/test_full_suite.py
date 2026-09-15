import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from app.main import app
from app.database.session import engine


@pytest_asyncio.fixture
async def client():
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        yield ac


@pytest.mark.asyncio
async def test_root_and_health(client):
    res = await client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "Healthy"


@pytest.mark.asyncio
async def test_auth_login_all_roles(client):
    # Candidate
    cand_login = await client.post(
        "/auth/login",
        data={"username": "candidate@test.com", "password": "password123"},
    )
    assert cand_login.status_code == 200
    assert "access_token" in cand_login.json()
    cand_token = cand_login.json()["access_token"]

    # Recruiter
    rec_login = await client.post(
        "/auth/login",
        data={"username": "recruiter@test.com", "password": "password123"},
    )
    assert rec_login.status_code == 200
    rec_token = rec_login.json()["access_token"]

    # Admin
    admin_login = await client.post(
        "/auth/login",
        data={"username": "admin@test.com", "password": "password123"},
    )
    assert admin_login.status_code == 200
    admin_token = admin_login.json()["access_token"]

    # Check /auth/me
    me_res = await client.get(
        "/auth/me", headers={"Authorization": f"Bearer {cand_token}"}
    )
    assert me_res.status_code == 200
    assert me_res.json()["role"] == "candidate"


@pytest.mark.asyncio
async def test_jobs_and_search(client):
    # Get all jobs
    res = await client.get("/jobs")
    assert res.status_code == 200
    jobs = res.json()
    assert len(jobs) >= 1

    # Search jobs
    search_res = await client.get("/jobs?search=Python")
    assert search_res.status_code == 200
    assert len(search_res.json()) >= 1


@pytest.mark.asyncio
async def test_saved_jobs_flow(client):
    cand_login = await client.post(
        "/auth/login",
        data={"username": "candidate@test.com", "password": "password123"},
    )
    token = cand_login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # List saved jobs
    saved_res = await client.get("/saved-jobs", headers=headers)
    assert saved_res.status_code == 200
    assert isinstance(saved_res.json(), list)


@pytest.mark.asyncio
async def test_notifications_flow(client):
    cand_login = await client.post(
        "/auth/login",
        data={"username": "candidate@test.com", "password": "password123"},
    )
    token = cand_login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Get unread count
    count_res = await client.get("/notifications/unread-count", headers=headers)
    assert count_res.status_code == 200
    assert "unread_count" in count_res.json()

    # List notifications
    notif_res = await client.get("/notifications", headers=headers)
    assert notif_res.status_code == 200
    assert isinstance(notif_res.json(), list)


@pytest.mark.asyncio
async def test_interviews_flow(client):
    cand_login = await client.post(
        "/auth/login",
        data={"username": "candidate@test.com", "password": "password123"},
    )
    cand_token = cand_login.json()["access_token"]

    # Candidate interviews
    iv_res = await client.get(
        "/interviews/candidate",
        headers={"Authorization": f"Bearer {cand_token}"},
    )
    assert iv_res.status_code == 200
    assert isinstance(iv_res.json(), list)


@pytest.mark.asyncio
async def test_admin_console_flow(client):
    admin_login = await client.post(
        "/auth/login",
        data={"username": "admin@test.com", "password": "password123"},
    )
    admin_token = admin_login.json()["access_token"]
    headers = {"Authorization": f"Bearer {admin_token}"}

    # Platform Stats
    stats_res = await client.get("/admin/stats", headers=headers)
    assert stats_res.status_code == 200
    data = stats_res.json()
    assert data["total_users"] >= 3
    assert data["total_jobs"] >= 1

    # Users list
    users_res = await client.get("/admin/users", headers=headers)
    assert users_res.status_code == 200
    assert len(users_res.json()) >= 3

    # Jobs list
    jobs_res = await client.get("/admin/jobs", headers=headers)
    assert jobs_res.status_code == 200

    # Applications list
    apps_res = await client.get("/admin/applications", headers=headers)
    assert apps_res.status_code == 200
