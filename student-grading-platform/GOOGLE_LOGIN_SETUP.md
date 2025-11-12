# Google Login Integration Guide

## Tích hợp đăng nhập Google với Backend

### Cấu hình đã thực hiện:

1. **Google Client ID**: `16333097955-590qu6bf56773fj6one2s0pobbactglg.apps.googleusercontent.com`

2. **API Endpoints**:
   - Google Login: `http://localhost:5000/api/v1/auth/google-login`
   - Refresh Token: `http://localhost:5000/api/v1/auth/refresh-token`

3. **Files đã tạo/chỉnh sửa**:
   - `src/config/api.js` - Cấu hình API endpoints và Google Client ID
   - `src/pages/Login.js` - Tích hợp Google OAuth
   - `.env` - Biến môi trường cho API base URL

### Cách hoạt động:

1. Người dùng click nút "Đăng nhập bằng Google"
2. Google OAuth popup hiện ra để người dùng chọn tài khoản
3. Sau khi xác thực, Google trả về `idToken`
4. Frontend gửi `idToken` đến backend API endpoint: `/api/v1/auth/google-login`
5. Backend xác thực token với Google và trả về:
   - `accessToken` - Để xác thực các API calls
   - `refreshToken` - Để refresh access token khi hết hạn
   - Thông tin user: `userId`, `email`, `fullName`, `role`, `profilePicture`
6. Frontend lưu tokens vào localStorage và chuyển user vào hệ thống

### Response từ Backend:

```json
{
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "userId": 123,
    "email": "user@example.com",
    "fullName": "Nguyen Van A",
    "role": "Teacher",
    "profilePicture": "https://..."
  }
}
```

### Lưu ý quan trọng:

1. **Backend Configuration**: Đảm bảo backend đã cấu hình Google Client ID trong `appsettings.json`:
   ```json
   "GoogleSettings": {
     "ClientId": "16333097955-590qu6bf56773fj6one2s0pobbactglg.apps.googleusercontent.com"
   }
   ```

2. **CORS**: Backend cần enable CORS cho frontend (port 3000):
   ```csharp
   builder.Services.AddCors(options =>
   {
       options.AddPolicy("AllowReactApp",
           builder => builder
               .WithOrigins("http://localhost:3000")
               .AllowAnyMethod()
               .AllowAnyHeader());
   });
   ```

3. **Environment Variables**: Có thể thay đổi API URL trong file `.env`:
   ```
   REACT_APP_API_BASE_URL=http://localhost:5000
   ```

### Test Google Login:

1. Chạy backend:
   ```bash
   cd PRN232_Final_BE/IdentityService/IdentityService.API
   dotnet run
   ```

2. Chạy frontend:
   ```bash
   cd student-grading-platform
   npm start
   ```

3. Truy cập: `http://localhost:3000` và click "Đăng nhập bằng Google"

### Troubleshooting:

- **Google OAuth không load**: Kiểm tra Internet connection và Google script đã load
- **API Error 401**: Kiểm tra Google Client ID trong backend config
- **CORS Error**: Đảm bảo backend đã enable CORS cho port 3000
- **API Error 500**: Kiểm tra backend logs và database connection
