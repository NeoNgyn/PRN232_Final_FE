# Hướng dẫn sử dụng Student Grading Platform

## Tính năng mới đã hoàn thành

### 1. Admin - Upload File RAR/ZIP chứa bài làm sinh viên

**Các bước thực hiện:**

1. Đăng nhập với tài khoản Admin:
   - Email: `admin@fpt.edu.vn`
   - Password: `admin123`

2. Tạo môn học mới (nếu chưa có):
   - Click "Thêm môn học"
   - Nhập mã môn học (VD: SWD392)
   - Nhập tên môn học

3. Tạo kỳ thi mới:
   - Click "Tạo kỳ thi"
   - Chọn môn học
   - Nhập học kỳ (VD: SU25)
   - Chọn loại thi (PE/FE/TE)
   - Nhập slot (VD: 1, 2, 3)
   - Chọn giáo viên chấm bài

4. Upload tiêu chí chấm điểm:
   - Trong bảng "Danh sách Kỳ thi", click "Tiêu chí"
   - Upload file Excel với các cột:
     - Tiêu chí: Tên tiêu chí
     - Điểm tối đa: Điểm tối đa của tiêu chí
     - Mô tả: Mô tả chi tiết

5. Upload bài làm sinh viên:
   - Click "Upload bài" trong bảng kỳ thi
   - Chọn file RAR hoặc ZIP chứa tất cả bài làm
   - **Format tên file bài làm:** `[MÔN]_[HỌC KỲ]_[LOẠI THI]_[SLOT]_[PASSWORD]_[TÊN SV]_[MSSV].docx`
   - Ví dụ: `SWD392_SU25_PE_1_358715_Vu Trung Tin_SE161572.docx`
   - Hệ thống sẽ tự động parse và lưu thông tin từ tên file

### 2. Teacher - Xem Task được Assign

**Các bước thực hiện:**

1. Đăng nhập với tài khoản Teacher:
   - Email: `teacher1@fpt.edu.vn`
   - Password: `teacher123`

2. Xem danh sách kỳ thi được phân công:
   - Dashboard hiển thị tất cả kỳ thi được assign
   - Mỗi card hiển thị:
     - Môn học, học kỳ, loại thi, slot
     - Số tiêu chí chấm điểm
     - Số bài nộp và số bài đã chấm
     - Tiến độ chấm bài

3. Click "Vào chấm bài" để vào trang chấm điểm

### 3. Teacher - Xem Danh sách Sinh viên và Chấm Bài

**Các bước thực hiện:**

1. Từ Dashboard, click "Vào chấm bài" vào kỳ thi

2. Xem danh sách sinh viên:
   - Danh sách hiển thị tất cả sinh viên đã nộp bài
   - Mỗi card sinh viên hiển thị:
     - Tên sinh viên
     - Mã số sinh viên
     - Tên file bài làm
     - Trạng thái: Đã chấm (hiển thị điểm) hoặc Chưa chấm
   - Sinh viên đã chấm có màu xanh lá

3. Click vào card sinh viên để chấm bài:
   - Bên trái hiển thị:
     - Thông tin chi tiết sinh viên
     - Password giải nén file
     - Tên file bài làm
     - Khu vực xem bài làm (placeholder)
   - Bên phải hiển thị:
     - Danh sách tiêu chí chấm điểm
     - Input điểm cho từng tiêu chí
     - Textarea ghi chú cho từng tiêu chí
     - Tổng điểm tự động tính

4. Chấm điểm:
   - Nhập điểm cho từng tiêu chí (0 đến điểm tối đa)
   - Nhập ghi chú nếu cần
   - Click "Lưu điểm"
   - Hệ thống hiển thị thông báo thành công

5. Điều hướng giữa các sinh viên:
   - Click "Quay lại danh sách" để về danh sách sinh viên
   - Hoặc dùng nút "Sinh viên trước" / "Sinh viên sau"

## Format File Bài Làm

Hệ thống hỗ trợ **2 format** tên file:

### Format 1 - Đầy đủ (Khuyến nghị):
```
[MÔN]_[HỌC KỲ]_[LOẠI THI]_[SLOT]_[PASSWORD]_[TÊN SV]_[MSSV].docx
```

Ví dụ:
- `SWD392_SU25_PE_1_358715_Vu Trung Tin_SE161572.docx`
- `PRN231_FA24_FE_2_123456_Nguyen Van A_SE161234.docx`

### Format 2 - Ngắn gọn:
```
[MÔN]_[LOẠI THI]_[HỌC KỲ]_[MSSV]_[TÊN SV].docx
```

Ví dụ:
- `SWD392_PE_SU25_SE184696_NguyenPhucNhan.docx`
- `SWD392_PE_SU25_SE184557_MaiHaiNam.docx`

**Lưu ý Format 2:**
- Không có slot (mặc định = 1)
- Không có password (mặc định = "000000")
- Thứ tự: Môn → Loại thi → Học kỳ → MSSV → Tên SV

### Giải thích các phần:
- **MÔN**: Mã môn học (VD: SWD392, PRN231)
- **HỌC KỲ**: Học kỳ (VD: SU25, FA24)
- **LOẠI THI**: Loại thi (PE, FE, TE)
- **SLOT**: Số slot (1, 2, 3, ...) - chỉ có trong Format 1
- **PASSWORD**: Mật khẩu giải nén file - chỉ có trong Format 1
- **TÊN SV**: Tên sinh viên (có thể có hoặc không có khoảng trắng)
- **MSSV**: Mã số sinh viên (bắt đầu bằng SE, HE, SS, HS, GD, AI theo sau là số)

## Lưu ý

1. **File RAR/ZIP**: 
   - Hệ thống hiện tại chỉ hỗ trợ file ZIP (do JSZip library)
   - File RAR cần convert sang ZIP trước khi upload
   - Có thể dùng WinRAR/7-Zip để convert

2. **Format tên file**:
   - Hệ thống hỗ trợ 2 format (xem phần "Format File Bài Làm")
   - Format 1 (đầy đủ): Có đầy đủ slot và password
   - Format 2 (ngắn gọn): Không có slot và password (mặc định slot=1, password="000000")
   - Dấu gạch dưới (_) là bắt buộc làm separator
   - MSSV phải bắt đầu bằng SE, HE, SS, HS, GD, hoặc AI theo sau là số

3. **Matching kỳ thi**:
   - File chỉ được import nếu thông tin trong tên file khớp với kỳ thi
   - Môn học, học kỳ, loại thi phải khớp chính xác
   - Slot: Nếu kỳ thi có slot thì phải khớp, nếu không có slot thì bỏ qua

4. **Xem file bài làm**:
   - Hiện tại chỉ hiển thị placeholder
   - Để xem file thực tế, cần tích hợp thêm document viewer (VD: Google Docs Viewer, Office Online)

## Tài khoản Demo

### Admin
- Email: `admin@fpt.edu.vn`
- Password: `admin123`

### Teacher
- Email: `teacher1@fpt.edu.vn`
- Password: `teacher123`

## Chạy ứng dụng

```bash
npm start
```

Ứng dụng sẽ chạy tại: http://localhost:3000
