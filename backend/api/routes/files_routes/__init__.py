from api.routes.files_routes.router import router

# Import endpoint modules for route registration side effects on `router`.
from api.routes.files_routes import delete_source as _delete_source  
from api.routes.files_routes import list_documents as _list_documents 
from api.routes.files_routes import upload_file as _upload_file  

__all__ = ["router"]
