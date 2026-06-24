from fastapi import FastAPI, Request
from fastapi.responses import RedirectResponse
from authlib.integrations.starlette_client import OAuth
from starlette.middleware.sessions import SessionMiddleware

app = FastAPI()

# BẮT BUỘC: Thêm SessionMiddleware để Authlib lưu trữ trạng thái (state) chống tấn công CSRF
# Thay 'your-super-secret-key' bằng một chuỗi ngẫu nhiên bảo mật của bạn
app.add_middleware(SessionMiddleware, secret_key="your-super-secret-key")

# Cấu hình OAuth với Google
oauth = OAuth()
oauth.register(
    name='google',
    client_id='910465307189-vqb0cpkn3i8hiu99rttncac494g83tr4.apps.googleusercontent.com',
    client_secret='910465307189-vqb0cpkn3i8hiu99rttncac494g83tr4',
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={
        'scope': 'openid email profile'
    }
)

@app.get("/")
def home():
    return {"message": "Chào mừng bạn đến với FastAPI! Truy cập /login để đăng nhập Google."}

# 1. Đường dẫn hướng người dùng đến trang đăng nhập Google
@app.get("/login")
async def login(request: Request):
    # Đường dẫn mà Google sẽ điều hướng về sau khi user đăng nhập thành công
    redirect_uri = "http://localhost:8000/auth/callback"
    return await oauth.google.authorize_redirect(request, redirect_uri)

# 2. Đường dẫn tiếp nhận phản hồi (Callback) từ Google
@app.get("/auth/callback")
async def auth_callback(request: Request):
    try:
        # Đổi mã code lấy Token từ Google
        token = await oauth.google.authorize_access_token(request)
        
        # Lấy thông tin user từ ID Token (Google trả về dạng JWT mã hóa)
        user_info = token.get('userinfo')
        
        if user_info:
            email = user_info.get("email")
            name = user_info.get("name")
            avatar = user_info.get("picture")

            # -------------------------------------------------------
            # 3. XỬ LÝ DATABASE CỦA BẠN TẠI ĐÂY
            # - Bước 1: Tìm trong DB xem `email` này đã tồn tại chưa.
            # - Bước 2: Nếu chưa, chạy câu lệnh INSERT để tạo user mới.
            # - Bước 3: Tạo JWT riêng của hệ thống bạn (Access Token) để trả về cho Frontend.
            # -------------------------------------------------------

            return {
                "status": "Đăng ký/Đăng nhập thành công",
                "user": {
                    "name": name,
                    "email": email,
                    "avatar": avatar
                },
                "note": "Hãy dùng thông tin này để tạo JWT hoặc Session cho DB của bạn."
            }
            
    except Exception as e:
        return {"error": f"Xác thực thất bại: {str(e)}"}