import base64

from app.api.rpc.params import (
    ApplicationListParams,
    BookingListParams,
    FeedUploadParams,
    LotIdParams,
    LotSetIdParams,
)
from app.api.rpc.registry import RpcContext, rpc_method
from app.schemas.application import ApplicationCreate, ApplicationRead
from app.schemas.auth import LoginRequest, TokenResponse
from app.schemas.booking import BookingCreate, BookingRead
from app.schemas.common import Page
from app.schemas.lot import FeedUploadResult, LotListParams, LotRead, LotSetRead, FeedUploadUrlRequest
from app.services import applications as applications_service
from app.services import auth as auth_service
from app.services import bookings as bookings_service
from app.services import feed_import as feed_import_service
from app.services import lots as lots_service
from app.services.errors import NotFoundError


@rpc_method("lots.list", params_model=LotListParams)
async def lots_list(params: LotListParams, ctx: RpcContext) -> Page[LotRead]:
    return await lots_service.list_lots(ctx.session, params)


@rpc_method("lots.get", params_model=LotIdParams)
async def lots_get(params: LotIdParams, ctx: RpcContext) -> LotRead:
    lot = await lots_service.get_lot(ctx.session, params.lot_id)
    if lot is None:
        raise NotFoundError(f"lot {params.lot_id} not found")
    return lot


@rpc_method("bookings.create", params_model=BookingCreate)
async def bookings_create(params: BookingCreate, ctx: RpcContext) -> BookingRead:
    return await bookings_service.create_booking(ctx.session, params)


@rpc_method("applications.create", params_model=ApplicationCreate)
async def applications_create(params: ApplicationCreate, ctx: RpcContext) -> ApplicationRead:
    return await applications_service.create_application(ctx.session, params)


@rpc_method("admin.login", params_model=LoginRequest)
async def admin_login(params: LoginRequest, ctx: RpcContext) -> TokenResponse:
    return auth_service.authenticate(params, ctx.settings)


@rpc_method("admin.feeds.upload", params_model=FeedUploadParams, requires_admin=True)
async def admin_feeds_upload(params: FeedUploadParams, ctx: RpcContext) -> FeedUploadResult:
    content = base64.b64decode(params.content_base64)
    lot_set, skipped_count = await feed_import_service.import_feed(
        content, filename=params.filename, session=ctx.session
    )
    return FeedUploadResult(
        lot_set=LotSetRead.model_validate(lot_set), skipped_count=skipped_count
    )


@rpc_method("admin.feeds.list", requires_admin=True)
async def admin_feeds_list(params: None, ctx: RpcContext) -> list[LotSetRead]:
    return await lots_service.list_lot_sets(ctx.session)


@rpc_method("admin.feeds.activate", params_model=LotSetIdParams, requires_admin=True)
async def admin_feeds_activate(params: LotSetIdParams, ctx: RpcContext) -> LotSetRead:
    return await lots_service.activate_lot_set(ctx.session, params.lot_set_id)


@rpc_method("admin.bookings.list", params_model=BookingListParams, requires_admin=True)
async def admin_bookings_list(params: BookingListParams, ctx: RpcContext) -> list[BookingRead]:
    return await bookings_service.list_bookings(ctx.session, params.status)


@rpc_method(
    "admin.applications.list", params_model=ApplicationListParams, requires_admin=True
)
async def admin_applications_list(
    params: ApplicationListParams, ctx: RpcContext
) -> list[ApplicationRead]:
    return await applications_service.list_applications(ctx.session, params.status)

@rpc_method("lots.projects")
async def lots_projects(params: None, ctx: RpcContext) -> list[str]:
    return await lots_service.list_project_names(ctx.session)

@rpc_method("admin.feeds.upload_from_url", params_model=FeedUploadUrlRequest, requires_admin=True)
async def admin_feeds_upload_from_url(
    params: FeedUploadUrlRequest, ctx: RpcContext
) -> FeedUploadResult:
    lot_set, skipped_count = await feed_import_service.import_feed_from_url(
        str(params.url), session=ctx.session
    )
    return FeedUploadResult(
        lot_set=LotSetRead.model_validate(lot_set), skipped_count=skipped_count
    )